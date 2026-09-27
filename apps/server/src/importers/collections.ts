/**
 * The curated collections an import reads: how each collection file is
 * validated, what its rows reference, and how its rows are mapped into
 * write steps. A new curated collection is an entry here plus its file in
 * the record's `curated/manifest.json`; the reader and the writer need no
 * edits.
 *
 * @module
 */
import { z } from "zod";
import { ImportError } from "../errors";
import type { ContentKey, ValuesOf } from "../registry";
import type { GlossaryInsert } from "../repos/glossary";
import type { SourceInsert } from "../repos/sources";
import { lookupKeys } from "../services/names";
import { findCapture } from "./captures";
import { parseFile } from "./files";
import type { ImportManifest } from "./manifest";
import { formatIssues } from "./manifest";
import { mapDeck, mapGearSlot, mapGlossary, mapMeta, mapScore, mapSource } from "./seed/map";
import {
  seedDeck,
  seedGear,
  seedGlossaryEntry,
  seedMechanic,
  seedMeta,
  seedRng,
  seedRune,
  seedScore,
  seedSources,
  seedTakeaway,
  seedTimeline,
} from "./seed/schema";
import type { WriteStep } from "./steps";
import { insertCited } from "./steps";

/** What one row of a collection references, checked before anything is written. */
export interface RowRefs {
  /** The row, as an error names it: its index, or a field name. */
  row: string | number;
  /** The source ids the row cites. */
  sources?: readonly string[];
  /** The deck ids the row links to. */
  decks?: readonly string[];
}

/** What a collection's rows are mapped with, besides the rows themselves. */
export interface PrepareContext {
  /** Absolute path to the record directory. */
  recordDir: string;
  /** The record's validated `import.json`. */
  manifest: ImportManifest;
  /** English summaries by source id, from the record's extractions. */
  summaries: Map<string, string>;
}

/**
 * One curated collection.
 *
 * @typeParam Parsed - the validated content of the collection's file
 */
export interface Collection<Parsed> {
  /** When true, a record's curated manifest may leave the collection out. */
  optional?: boolean;
  /**
   * Validates the collection's file.
   * @param file - the file's record-relative path, as errors name it
   * @param raw - the parsed JSON
   * @throws {ImportError} naming the file (and the row) of the first failure
   */
  parse(file: string, raw: unknown): Parsed;
  /** Lists every row's source and deck references. */
  refs(parsed: Parsed): RowRefs[];
  /**
   * Checks what the reference checks don't, after they pass.
   * @throws {ImportError} naming the file and the row
   */
  check?(file: string, parsed: Parsed): void;
  /** Lists non-fatal findings worth a human's attention. */
  warnings?(parsed: Parsed): string[];
  /**
   * Maps the rows into write steps, doing any file lookups now, so the
   * write phase only writes.
   */
  prepare(parsed: Parsed, context: PrepareContext): WriteStep[];
}

/**
 * Declares a collection, inferring its parsed type.
 * @param collection - the collection
 * @returns the same collection
 */
function collection<Parsed>(collection: Collection<Parsed>): Collection<Parsed> {
  return collection;
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
 * Declares an array collection of a registered content type whose rows
 * each cite their own `sources` and map onto one row of the type.
 *
 * @param key - the content type's registry key
 * @param schema - the schema of one row of the file
 * @param map - maps a validated row, and its index, onto the type's column values
 * @param decks - the deck ids a row links to, when rows reference decks
 * @returns the collection
 */
function citedRows<K extends ContentKey, S extends z.ZodType<{ sources: string[] }>>(
  key: K,
  schema: S,
  map: (row: z.output<S>, index: number) => ValuesOf<K>,
  decks?: (row: z.output<S>) => readonly string[],
): Collection<Array<z.output<S>>> {
  return collection({
    parse: (file, raw) => parseRows(file, raw, schema),
    refs: (rows) =>
      rows.map((row, index) => ({ row: index, sources: row.sources, decks: decks?.(row) })),
    prepare: (rows) => [
      insertCited(
        key,
        rows.map((row, index) => ({ values: map(row, index), sources: row.sources })),
      ),
    ],
  });
}

/**
 * Lists every normalized glossary lookup key (see `lookupKeys`) that more
 * than one entry claims, and which entry's gloss the name resolver ends up
 * using for it (the last claimant in `kr` order).
 * @param entries - the glossary rows about to be written
 * @returns one human-readable warning per contested key; `[]` if none
 */
export function glossaryWarnings(entries: readonly GlossaryInsert[]): string[] {
  const sorted = [...entries].sort((a, b) => (a.kr < b.kr ? -1 : a.kr > b.kr ? 1 : 0));
  const claims = new Map<string, GlossaryInsert[]>();
  for (const entry of sorted) {
    for (const key of lookupKeys(entry)) {
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
 * Every curated collection, by its key in the curated manifest, in write
 * order: a collection's rows only reference rows written before them.
 */
export const COLLECTIONS = {
  sources: collection({
    parse: (file, raw) => parseFile(file, raw, seedSources),
    refs: () => [],
    prepare: (sources, { recordDir, manifest, summaries }) => {
      const rows: SourceInsert[] = Object.entries(sources).map(([id, entry]) => {
        const row = mapSource(id, entry);
        return {
          ...row,
          summaryEn: summaries.get(id) ?? null,
          capturePath: row.site === "web" ? null : findCapture(recordDir, manifest.captures, id),
        };
      });
      return [
        (repos) => {
          for (const row of rows) repos.sources.insert(row);
        },
      ];
    },
  }),
  glossary: collection({
    parse: (file, raw) => parseRows(file, raw, seedGlossaryEntry),
    refs: () => [],
    check: (file, entries) => {
      const seen = new Set<string>();
      entries.forEach((entry, index) => {
        if (seen.has(entry.kr)) throw new ImportError(file, index, `duplicate kr "${entry.kr}"`);
        seen.add(entry.kr);
      });
    },
    warnings: (entries) => glossaryWarnings(entries.map(mapGlossary)),
    prepare: (entries) => {
      const rows = entries.map(mapGlossary);
      return [
        (repos) => {
          for (const row of rows) repos.glossary.upsert(row);
        },
      ];
    },
  }),
  meta: collection({
    parse: (file, raw) => parseFile(file, raw, seedMeta),
    refs: (meta) => [{ row: "you", sources: meta.you.sources }],
    prepare: (meta, { manifest }) => {
      const { record, recommendation } = mapMeta(meta, manifest.record);
      const { sources, ...values } = recommendation;
      return [
        (repos) => void repos.records.upsert(record),
        insertCited("recommendations", [{ values, sources }]),
      ];
    },
  }),
  decks: collection({
    parse: (file, raw) => parseRows(file, raw, seedDeck),
    refs: (decks) => decks.map((deck, index) => ({ row: index, sources: deck.sources })),
    prepare: (decks) => {
      const mapped = decks.map((seed, position) => ({ ...mapDeck(seed, position), seed }));
      return [
        (repos) => {
          for (const { deck, cookies, pets, notes, seed } of mapped) {
            repos.decks.insert(deck);
            repos.decks.replaceCookies(deck.id, cookies);
            repos.decks.replacePets(deck.id, pets);
            repos.decks.replaceNotes(deck.id, notes);
            repos.citations.replace("deck", deck.id, seed.sources);
          }
        },
      ];
    },
  }),
  runes: collection({
    parse: (file, raw) => parseRows(file, raw, seedRune),
    refs: (runes) =>
      runes.map((rune, index) => ({ row: index, sources: rune.sources, decks: rune.decks })),
    prepare: (runes) => [
      (repos) => {
        for (const rune of runes) {
          const row = repos.runeBuilds.insert({
            cookieKr: rune.cookie,
            lines: rune.lines,
            why: rune.why,
            disputed: rune.disputed ?? null,
          });
          repos.runeBuilds.replaceDecks(row.id, rune.decks);
          repos.citations.replace("rune_build", String(row.id), rune.sources);
        }
      },
    ],
  }),
  gear: citedRows("gearRecs", seedGear, (gear) => ({
    slot: mapGearSlot(gear.slot),
    substats: gear.substats,
    context: gear.context,
    why: gear.why,
  })),
  scores: citedRows("scores", seedScore, mapScore, (score) =>
    score.deck === null ? [] : [score.deck],
  ),
  mechanics: citedRows("mechanics", seedMechanic, ({ sources: _sources, ...values }) => values),
  rng: citedRows("rngFactors", seedRng, (factor) => ({
    factor: factor.factor,
    effect: factor.effect,
    mitigation: factor.mitigation ?? null,
  })),
  timeline: citedRows("timeline", seedTimeline, (event) => ({
    date: event.date,
    event: event.event,
  })),
  takeaways: citedRows("takeaways", seedTakeaway, (takeaway, position) => ({
    position,
    text: takeaway.text,
    detail: takeaway.detail ?? null,
  })),
};

/** The curated collections by manifest key. */
export type Collections = typeof COLLECTIONS;

/** A curated collection's manifest key. */
export type CollectionName = keyof Collections;

/** The validated content of every collection, by manifest key. */
export type ParsedCollections = {
  [N in CollectionName]: Collections[N] extends Collection<infer P> ? P : never;
};

/**
 * `curated/manifest.json`: which file holds each collection, relative to
 * the curated directory. A collection marked `optional` may be left out.
 */
export const curatedManifest = z.object({
  collections: z.object(
    Object.fromEntries(
      Object.entries(COLLECTIONS).map(([name, c]) => [
        name,
        (c as Collection<unknown>).optional ? z.string().optional() : z.string(),
      ]),
    ) as unknown as Record<CollectionName, z.ZodType<string | undefined>>,
  ),
});
