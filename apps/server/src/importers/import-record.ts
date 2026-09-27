import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { z } from "zod";
import { ImportError } from "../errors";
import type { Repos, Store } from "../repos";
import type { GlossaryInsert } from "../repos/glossary";
import type { RankingInsert } from "../repos/rankings";
import type { SourceInsert } from "../repos/sources";
import { normalizeName } from "../services/names";
import { readBuffValues, readFightEvents } from "./boss";
import { findCapture } from "./captures";
import { loadSummaries } from "./extractions";
import { parseFile, readJson } from "./files";
import type { ImportManifest } from "./manifest";
import { formatIssues, mapRankingRow, readManifest } from "./manifest";
import { mapDeck, mapGearSlot, mapGlossary, mapMeta, mapScore, mapSource } from "./seed/map";
import { parseTsv } from "./tsv";
import type {
  SeedDeck,
  SeedGear,
  SeedGlossaryEntry,
  SeedMechanic,
  SeedMeta,
  SeedRng,
  SeedRune,
  SeedScore,
  SeedSources,
  SeedTakeaway,
  SeedTimeline,
} from "./seed/schema";
import {
  seedDeck,
  seedGear,
  seedGlossaryEntry,
  seedManifest,
  seedMechanic,
  seedMeta,
  seedRng,
  seedRune,
  seedScore,
  seedSources,
  seedTakeaway,
  seedTimeline,
} from "./seed/schema";

/** Rows written per table, keyed like the snapshot's tables. */
export type ImportCounts = Record<string, number>;

/** What {@link importRecord} wrote, plus anything worth a human's attention. */
export interface ImportResult {
  /** Rows written per table. */
  counts: ImportCounts;
  /**
   * Non-fatal findings, such as glossary lookup keys that more than one
   * entry claims (the name resolver lets the last entry, by `kr`, win).
   */
  warnings: string[];
}

/** Options for {@link importRecord}. */
export interface ImportOptions {
  /** Clear every content table first, instead of refusing a non-empty database. */
  replace?: boolean;
}

/** The validated curated dataset of a record. */
interface Curated {
  meta: SeedMeta;
  takeaways: SeedTakeaway[];
  decks: SeedDeck[];
  runes: SeedRune[];
  gear: SeedGear[];
  scores: SeedScore[];
  rng: SeedRng[];
  mechanics: SeedMechanic[];
  timeline: SeedTimeline[];
  sources: SeedSources;
  glossary: SeedGlossaryEntry[];
}

/** A curated collection's record-relative file path, for error messages. */
type CuratedFiles = Record<keyof Curated, string>;

/** One manifest ranking file's mapped rows. */
interface RankingBatch {
  file: string;
  rows: RankingInsert[];
}

/**
 * Validates every row of an array file with `schema`.
 * @throws {ImportError} naming `file` if it isn't an array, or naming
 *   `file`, the row index and every issue's path for the first bad row
 */
function parseRows<S extends z.ZodType>(file: string, raw: unknown, schema: S): Array<z.output<S>> {
  if (!Array.isArray(raw)) throw new ImportError(file, null, "expected an array");
  return raw.map((row, index) => {
    const result = schema.safeParse(row);
    if (!result.success) throw new ImportError(file, index, formatIssues(result.error));
    return result.data;
  });
}

/**
 * Reads and validates every collection listed in the curated directory's
 * `manifest.json`.
 * @throws {ImportError} naming the file (and row) of the first failure
 */
function readCurated(
  recordDir: string,
  manifest: ImportManifest,
): { data: Curated; files: CuratedFiles } {
  const dir = manifest.curated;
  const { collections } = parseFile(
    `${dir}/manifest.json`,
    readJson(recordDir, `${dir}/manifest.json`),
    seedManifest,
  );
  const files = Object.fromEntries(
    Object.entries(collections).map(([name, file]) => [name, `${dir}/${file}`]),
  ) as CuratedFiles;
  const read = (name: keyof Curated) => readJson(recordDir, files[name]);
  const data: Curated = {
    meta: parseFile(files.meta, read("meta"), seedMeta),
    takeaways: parseRows(files.takeaways, read("takeaways"), seedTakeaway),
    decks: parseRows(files.decks, read("decks"), seedDeck),
    runes: parseRows(files.runes, read("runes"), seedRune),
    gear: parseRows(files.gear, read("gear"), seedGear),
    scores: parseRows(files.scores, read("scores"), seedScore),
    rng: parseRows(files.rng, read("rng"), seedRng),
    mechanics: parseRows(files.mechanics, read("mechanics"), seedMechanic),
    timeline: parseRows(files.timeline, read("timeline"), seedTimeline),
    sources: parseFile(files.sources, read("sources"), seedSources),
    glossary: parseRows(files.glossary, read("glossary"), seedGlossaryEntry),
  };
  return { data, files };
}

/**
 * Checks, before anything is written, that every cited source id is a
 * curated source, that every score and rune deck is a curated deck, and
 * that no two glossary entries share a `kr`.
 * @throws {ImportError} naming the file and row of the first bad reference
 */
function checkRefs(data: Curated, files: CuratedFiles): void {
  const sourceIds = new Set(Object.keys(data.sources));
  const deckIds = new Set(data.decks.map((d) => d.id));

  const assertKnown = (
    known: Set<string>,
    kind: "source" | "deck",
    file: string,
    row: string | number,
    ids: string[],
  ) => {
    const unknown = [...new Set(ids.filter((id) => !known.has(id)))];
    if (unknown.length > 0)
      throw new ImportError(file, row, `unknown ${kind} ids: ${unknown.join(", ")}`);
  };

  const cited: Array<[keyof Curated, Array<{ sources: string[] }>]> = [
    ["takeaways", data.takeaways],
    ["decks", data.decks],
    ["runes", data.runes],
    ["gear", data.gear],
    ["scores", data.scores],
    ["rng", data.rng],
    ["mechanics", data.mechanics],
    ["timeline", data.timeline],
  ];
  for (const [name, rows] of cited) {
    rows.forEach((row, index) => assertKnown(sourceIds, "source", files[name], index, row.sources));
  }
  assertKnown(sourceIds, "source", files.meta, "you", data.meta.you.sources);

  data.scores.forEach((score, index) => {
    if (score.deck !== null) assertKnown(deckIds, "deck", files.scores, index, [score.deck]);
  });
  data.runes.forEach((rune, index) => assertKnown(deckIds, "deck", files.runes, index, rune.decks));

  const seen = new Set<string>();
  data.glossary.forEach((entry, index) => {
    if (seen.has(entry.kr))
      throw new ImportError(files.glossary, index, `duplicate kr "${entry.kr}"`);
    seen.add(entry.kr);
  });
}

/**
 * Parses and maps every ranking TSV the manifest lists, checking each row's
 * source id against the curated sources, and that no two rows, across every
 * TSV, share a `(board, season, rank, capturedAt)` key. A `null` season
 * counts as a value here, unlike in the table's unique index, where two
 * `null`s never collide.
 * @throws {ImportError} naming the TSV (and line) of the first failure
 */
function readRankings(
  recordDir: string,
  manifest: ImportManifest,
  sourceIds: Set<string>,
): RankingBatch[] {
  const seen = new Map<string, string>();
  return manifest.rankings.map((spec) => {
    const path = join(recordDir, spec.file);
    if (!existsSync(path)) throw new ImportError(spec.file, null, "file not found");
    let parsed: Array<Record<string, string>>;
    try {
      parsed = parseTsv(readFileSync(path, "utf-8"));
    } catch (err) {
      throw new ImportError(spec.file, null, (err as Error).message);
    }
    const rows = parsed.map((raw, index) => {
      const line = `line ${index + 2}`;
      let row: RankingInsert;
      try {
        row = mapRankingRow(raw, spec);
      } catch (err) {
        throw new ImportError(spec.file, line, (err as Error).message);
      }
      if (!sourceIds.has(row.sourceId)) {
        throw new ImportError(spec.file, line, `unknown source ids: ${row.sourceId}`);
      }
      const key = `board ${row.board}, season ${row.season ?? "null"}, rank ${row.rank}, captured ${row.capturedAt}`;
      const first = seen.get(key);
      if (first !== undefined) {
        throw new ImportError(
          spec.file,
          line,
          `duplicate ranking (${key}), first seen at ${first}`,
        );
      }
      seen.set(key, `${spec.file} ${line}`);
      return row;
    });
    return { file: spec.file, rows };
  });
}

/**
 * Lists every normalized glossary lookup key (a `kr`, shorthand or `en`)
 * that more than one entry claims, and which entry's gloss the name
 * resolver ends up using for it (the last claimant in `kr` order).
 * @param entries - the glossary rows about to be written
 * @returns one human-readable warning per contested key; `[]` if none
 */
function glossaryWarnings(entries: GlossaryInsert[]): string[] {
  const sorted = [...entries].sort((a, b) => (a.kr < b.kr ? -1 : a.kr > b.kr ? 1 : 0));
  const claims = new Map<string, GlossaryInsert[]>();
  for (const entry of sorted) {
    const keys = new Set(
      [entry.kr, ...(entry.shorthand ?? []), ...(entry.en ? [entry.en] : [])].map(normalizeName),
    );
    for (const key of keys) {
      const list = claims.get(key);
      if (list) list.push(entry);
      else claims.set(key, [entry]);
    }
  }
  const warnings: string[] = [];
  for (const [key, claimants] of claims) {
    if (claimants.length < 2) continue;
    const who = claimants.map((e) => `"${e.kr}" (${e.en ?? "no en"})`).join(", ");
    const winner = claimants[claimants.length - 1]!;
    warnings.push(`glossary key "${key}" is claimed by ${who}; it resolves to "${winner.kr}"`);
  }
  return warnings;
}

/**
 * Every content table's repo, children before parents, so clearing them in
 * this order never trips a foreign key. `jobs` isn't content and is left
 * alone; deck children and rune deck links cascade with their parents.
 */
function contentRepos(repos: Repos): Array<{ count(): number; clear(): void }> {
  return [
    repos.citations,
    repos.fightEvents,
    repos.buffValues,
    repos.rankings,
    repos.runeBuilds,
    repos.scores,
    repos.gearRecs,
    repos.mechanics,
    repos.rngFactors,
    repos.timeline,
    repos.takeaways,
    repos.recommendations,
    repos.decks,
    repos.glossary,
    repos.records,
    repos.sources,
  ];
}

/**
 * Loads a research record into the database: its curated dataset (sources,
 * glossary, the record row and its recommendation, decks, rune builds,
 * gear, scores, mechanics, RNG factors, timeline and takeaways, each with
 * its citations), its ranking TSVs, and, when the manifest names them, its
 * fight timeline and buff capture. Sources get their English summary from
 * the record's extractions and, for `dc`/`nv` ids, the path of their
 * evidence capture.
 *
 * Everything is read and checked before anything is written, and every
 * write happens in one transaction: a failure leaves the database as it
 * was.
 *
 * @param store - the store to load into
 * @param recordDir - absolute path to the record directory (the one
 *   holding `import.json`)
 * @param opts - `replace: true` clears every content table first and
 *   resets its id counter, so the result matches a fresh import, ids
 *   included
 * @returns rows written per table, and non-fatal warnings
 * @throws {ImportError} naming the file and row, if a file is missing or
 *   malformed, a row fails its schema, a row cites an unknown source or
 *   deck, or two ranking rows share a key
 * @throws {ImportError} `"database already has content; pass --replace to
 *   load record <slug> over it"` if any content table has rows and
 *   `replace` isn't set
 */
export function importRecord(
  store: Store,
  recordDir: string,
  opts: ImportOptions = {},
): ImportResult {
  const manifest = readManifest(recordDir);
  const { data, files } = readCurated(recordDir, manifest);
  checkRefs(data, files);
  const sourceIds = new Set(Object.keys(data.sources));
  const rankings = readRankings(recordDir, manifest, sourceIds);
  const summaries = loadSummaries(join(recordDir, manifest.extractions));

  const sources: SourceInsert[] = Object.entries(data.sources).map(([id, entry]) => {
    const row = mapSource(id, entry);
    return {
      ...row,
      summaryEn: summaries.get(id) ?? null,
      capturePath: row.site === "web" ? null : findCapture(recordDir, manifest.captures, id),
    };
  });
  const glossary = data.glossary.map(mapGlossary);
  const { record, recommendation } = mapMeta(data.meta, manifest.record);
  const warnings = glossaryWarnings(glossary);
  const fightEvents = manifest.fightEvents
    ? readFightEvents(recordDir, manifest.fightEvents, sourceIds)
    : [];
  const buffValues = manifest.buffValues
    ? readBuffValues(
        recordDir,
        manifest.buffValues,
        sourceIds,
        new Set(glossary.map((entry) => entry.kr)),
      )
    : [];

  // See `DeckService.create`'s implementation for why the inner return is
  // cast `as never` and the outer call `as ImportCounts`.
  const counts = store.transaction((repos) => {
    const tables = contentRepos(repos);
    if (tables.some((table) => table.count() > 0)) {
      if (!opts.replace) {
        throw new ImportError(
          "<db>",
          null,
          `database already has content; pass --replace to load record ${manifest.record.slug} over it`,
        );
      }
      for (const table of tables) table.clear();
    }

    const n = {
      sources: 0,
      researchRecords: 0,
      glossary: 0,
      decks: 0,
      deckCookies: 0,
      deckPets: 0,
      deckNotes: 0,
      runeBuilds: 0,
      runeBuildDecks: 0,
      gearRecs: 0,
      scores: 0,
      rankings: 0,
      mechanics: 0,
      rngFactors: 0,
      timeline: 0,
      takeaways: 0,
      recommendations: 0,
      fightEvents: 0,
      buffValues: 0,
      citations: 0,
    };

    for (const row of sources) repos.sources.insert(row);
    n.sources = sources.length;
    for (const row of glossary) repos.glossary.upsert(row);
    n.glossary = glossary.length;

    repos.records.upsert(record);
    n.researchRecords = 1;
    const rec = repos.recommendations.insert({
      summary: recommendation.summary,
      changes: recommendation.changes,
    });
    repos.citations.replace("recommendation", String(rec.id), recommendation.sources);
    n.recommendations = 1;

    data.decks.forEach((seed, position) => {
      const { deck, cookies, pets, notes } = mapDeck(seed, position);
      repos.decks.insert(deck);
      repos.decks.replaceCookies(deck.id, cookies);
      repos.decks.replacePets(deck.id, pets);
      repos.decks.replaceNotes(deck.id, notes);
      repos.citations.replace("deck", deck.id, seed.sources);
      n.deckCookies += cookies.length;
      n.deckPets += pets.length;
      n.deckNotes += notes.length;
    });
    n.decks = data.decks.length;

    for (const rune of data.runes) {
      const row = repos.runeBuilds.insert({
        cookieKr: rune.cookie,
        lines: rune.lines,
        why: rune.why,
        disputed: rune.disputed ?? null,
      });
      repos.runeBuilds.replaceDecks(row.id, rune.decks);
      repos.citations.replace("rune_build", String(row.id), rune.sources);
      n.runeBuildDecks += new Set(rune.decks).size;
    }
    n.runeBuilds = data.runes.length;

    for (const gear of data.gear) {
      const row = repos.gearRecs.insert({
        slot: mapGearSlot(gear.slot),
        substats: gear.substats,
        context: gear.context,
        why: gear.why,
      });
      repos.citations.replace("gear_rec", String(row.id), gear.sources);
    }
    n.gearRecs = data.gear.length;

    for (const score of data.scores) {
      const row = repos.scores.insert(mapScore(score));
      repos.citations.replace("score", String(row.id), score.sources);
    }
    n.scores = data.scores.length;

    for (const mechanic of data.mechanics) {
      const { sources: cited, ...values } = mechanic;
      const row = repos.mechanics.insert(values);
      repos.citations.replace("mechanic", String(row.id), cited);
    }
    n.mechanics = data.mechanics.length;

    for (const factor of data.rng) {
      const row = repos.rngFactors.insert({
        factor: factor.factor,
        effect: factor.effect,
        mitigation: factor.mitigation ?? null,
      });
      repos.citations.replace("rng_factor", String(row.id), factor.sources);
    }
    n.rngFactors = data.rng.length;

    for (const event of data.timeline) {
      const row = repos.timeline.insert({ date: event.date, event: event.event });
      repos.citations.replace("timeline_event", String(row.id), event.sources);
    }
    n.timeline = data.timeline.length;

    data.takeaways.forEach((takeaway, position) => {
      const row = repos.takeaways.insert({
        position,
        text: takeaway.text,
        detail: takeaway.detail ?? null,
      });
      repos.citations.replace("takeaway", String(row.id), takeaway.sources);
    });
    n.takeaways = data.takeaways.length;

    for (const batch of rankings) repos.rankings.insertMany(batch.rows);
    n.rankings = rankings.reduce((total, batch) => total + batch.rows.length, 0);

    for (const { values, sources: cited } of fightEvents) {
      const row = repos.fightEvents.insert(values);
      repos.citations.replace("fight_event", String(row.id), cited);
    }
    n.fightEvents = fightEvents.length;

    for (const { values, sources: cited } of buffValues) {
      const row = repos.buffValues.insert(values);
      repos.citations.replace("buff_value", String(row.id), cited);
    }
    n.buffValues = buffValues.length;

    n.citations = repos.citations.count();
    return n as never;
  }) as ImportCounts;

  return { counts, warnings };
}
