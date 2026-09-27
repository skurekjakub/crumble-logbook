/**
 * The curated collections an import reads: how each collection file is
 * validated, what its rows reference, and how its rows are mapped into
 * write steps. A new curated collection is an entry here plus its file in
 * the record's `curated/manifest.json`; the reader and the writer need no
 * edits.
 *
 * @module
 */
import type { GameMode, GlossaryRow } from "@crumble/schema";
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
import {
  mapCounter,
  mapDeck,
  mapGearSlot,
  mapGlossary,
  mapMeta,
  mapScore,
  mapSource,
  mapUsage,
} from "./seed/map";
import {
  seedCounter,
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
  seedUsage,
} from "./seed/schema";
import type { WriteContext, WriteStep } from "./steps";
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

/** What a collection's own checks can see of the record's other collections. */
export interface CheckContext {
  /** Each curated deck's game mode, by deck id. */
  deckModes: ReadonlyMap<string, GameMode>;
}

/** What a collection's rows are mapped with, besides the rows themselves. */
export interface PrepareContext {
  /** The collection file's record-relative path, as errors name it. */
  file: string;
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
   * @param file - the file's record-relative path, as errors name it
   * @param parsed - the validated content
   * @param context - what the check can see of the other collections
   * @throws {ImportError} naming the file and the row
   */
  check?(file: string, parsed: Parsed, context: CheckContext): void;
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
 * Names the fields in which two versions of a shared row differ.
 * @param kept - the row already in the database
 * @param incoming - the row this import would have written
 * @param fields - the fields to compare, by value
 * @returns the differing field names, in `fields` order
 */
function differences<T>(kept: T, incoming: T, fields: readonly (keyof T)[]): string[] {
  return fields
    .filter(
      (field) => JSON.stringify(kept[field] ?? null) !== JSON.stringify(incoming[field] ?? null),
    )
    .map(String);
}

/**
 * Writes a row several records can share, keyed by its natural id: inserts
 * it when absent, rewrites it when the record being written owns it, and
 * otherwise keeps the row already there (the first record to load it
 * wins), warning when this record's version differs.
 *
 * @param existing - the row already stored under the same id, if any
 * @param incoming - this record's version, without an owner
 * @param context - the write context: the record, and where warnings go
 * @param write - stores `incoming` owned by the record, as an insert or an
 *   overwrite
 * @param label - how a warning names the row, e.g. `source dc:1`
 * @param fields - the fields a warning compares
 */
function writeShared<T extends { recordSlug?: string | null }>(
  existing: T | undefined,
  incoming: T,
  context: WriteContext,
  write: (row: T) => void,
  label: string,
  fields: readonly (keyof T)[],
): void {
  if (!existing || existing.recordSlug === context.record) {
    write({ ...incoming, recordSlug: context.record });
    return;
  }
  const changed = differences(existing, incoming, fields);
  if (changed.length === 0) return;
  context.warn(
    `${label} is already loaded by record ${existing.recordSlug ?? "(none)"}; keeping that row (this record's differs in ${changed.join(", ")})`,
  );
}

/** The source fields a shared-source warning compares. */
const SOURCE_FIELDS = [
  "url",
  "title",
  "titleEn",
  "date",
  "relevance",
  "note",
  "summaryEn",
  "capturePath",
] as const satisfies readonly (keyof SourceInsert)[];

/** The glossary fields a shared-entry warning compares. */
const GLOSSARY_FIELDS = [
  "shorthand",
  "en",
  "kind",
  "element",
  "class",
  "rarity",
  "extra",
] as const satisfies readonly (keyof GlossaryInsert)[];

/**
 * Lists the lookup keys of `record`'s glossary entries that another
 * record's entries also claim, once both are stored.
 * @param entries - every stored glossary row
 * @param record - the record whose entries to check
 * @returns one warning per contested key and other entry
 */
function crossRecordGlossaryWarnings(entries: readonly GlossaryRow[], record: string): string[] {
  const others = new Map<string, GlossaryRow[]>();
  for (const entry of entries) {
    if (entry.recordSlug === record) continue;
    for (const key of lookupKeys(entry)) others.set(key, [...(others.get(key) ?? []), entry]);
  }
  return entries
    .filter((entry) => entry.recordSlug === record)
    .flatMap((entry) =>
      lookupKeys(entry).flatMap((key) =>
        (others.get(key) ?? []).map(
          (other) =>
            `glossary key "${key}" of "${entry.kr}" (${entry.en ?? "no en"}) is also claimed by "${other.kr}" (${other.en ?? "no en"}) of record ${other.recordSlug ?? "(none)"}; each record's rows resolve it with their own record's entry`,
        ),
      ),
    );
}

/**
 * Throws if an id this record is about to write is already held by a row
 * another record loaded. Called from a write step, after a replace has
 * cleared the record's own rows, so any row still holding the id is
 * another record's (or no record's).
 *
 * @param file - the collection file's record-relative path, as errors name it
 * @param label - how the error names the id, e.g. `deck id`
 * @param ids - the ids about to be written, in file order
 * @param holderOf - the slug of the record owning the row that holds an
 *   id, `null` for a row no record owns, or `undefined` if no row holds it
 * @throws {ImportError} naming `file`, the id's row index and the holding
 *   record, for the first held id
 */
function assertUnclaimed(
  file: string,
  label: string,
  ids: readonly string[],
  holderOf: (id: string) => string | null | undefined,
): void {
  ids.forEach((id, index) => {
    const holder = holderOf(id);
    if (holder === undefined) return;
    throw new ImportError(
      file,
      index,
      `${label} "${id}" is already loaded by record ${holder ?? "(none)"}`,
    );
  });
}

/** The counters collection's plain cited-row behaviour, before its own checks. */
const counterRows = citedRows("counters", seedCounter, mapCounter, (edge) => [
  edge.team,
  edge.beaten_by,
]);

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
        (repos, context) => {
          for (const row of rows) {
            const existing = repos.sources.get(row.id);
            const write = (owned: SourceInsert) => {
              if (existing) repos.sources.update(row.id, owned);
              else repos.sources.insert(owned);
              if (owned.site !== "web" && owned.capturePath === null) {
                context.warn(`source ${row.id} has no capture under this record's capture rules`);
              }
            };
            writeShared(existing, row, context, write, `source ${row.id}`, SOURCE_FIELDS);
          }
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
        (repos, context) => {
          for (const row of rows) {
            const write = (owned: GlossaryInsert) => void repos.glossary.upsert(owned);
            const label = `glossary entry "${row.kr}"`;
            writeShared(repos.glossary.get(row.kr), row, context, write, label, GLOSSARY_FIELDS);
          }
          for (const warning of crossRecordGlossaryWarnings(
            repos.glossary.list(),
            context.record,
          )) {
            context.warn(warning);
          }
        },
      ];
    },
  }),
  meta: collection({
    parse: (file, raw) => parseFile(file, raw, seedMeta),
    refs: (meta) => [
      { row: "you", sources: meta.you.sources },
      ...Object.entries(meta.modes ?? {}).flatMap(([mode, block]) =>
        block.rules.map((rule, index) => ({
          row: `modes.${mode}.rules ${index}`,
          sources: rule.sources,
        })),
      ),
    ],
    check: (file, meta) => {
      for (const [mode, block] of Object.entries(meta.modes ?? {})) {
        block.rules.forEach((rule, index) => {
          if (rule.mode !== undefined && rule.mode !== mode) {
            throw new ImportError(
              file,
              `modes.${mode}.rules ${index}`,
              `a rule in the ${mode} block has mode ${rule.mode}`,
            );
          }
        });
      }
    },
    prepare: (meta, { manifest }) => {
      const { record, modes, recommendation, rules } = mapMeta(meta, manifest.record);
      const { sources, ...values } = recommendation;
      return [
        (repos) => {
          repos.records.upsert(record);
          repos.records.replaceModes(record.slug, modes);
        },
        insertCited("recommendations", [{ values, sources }]),
        insertCited("mechanics", rules),
      ];
    },
  }),
  decks: collection({
    parse: (file, raw) => parseRows(file, raw, seedDeck),
    refs: (decks) => decks.map((deck, index) => ({ row: index, sources: deck.sources })),
    prepare: (decks, { file }) => {
      const mapped = decks.map((seed, position) => ({ ...mapDeck(seed, position), seed }));
      return [
        (repos, { record }) => {
          assertUnclaimed(
            file,
            "deck id",
            decks.map((deck) => deck.id),
            (id) => repos.decks.get(id)?.recordSlug,
          );
          for (const { deck, cookies, pets, notes, seed } of mapped) {
            repos.decks.insert({ ...deck, recordSlug: record });
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
      (repos, { record }) => {
        for (const rune of runes) {
          const row = repos.runeBuilds.insert({
            cookieKr: rune.cookie,
            lines: rune.lines,
            why: rune.why,
            disputed: rune.disputed ?? null,
            mode: rune.mode,
            recordSlug: record,
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
    mode: gear.mode,
  })),
  scores: {
    ...citedRows("scores", seedScore, mapScore, (score) =>
      score.deck === null ? [] : [score.deck],
    ),
    optional: true,
  },
  mechanics: citedRows("mechanics", seedMechanic, ({ sources: _sources, ...values }) => values),
  rng: citedRows("rngFactors", seedRng, (factor) => ({
    factor: factor.factor,
    effect: factor.effect,
    mitigation: factor.mitigation ?? null,
    mode: factor.mode,
  })),
  timeline: citedRows("timeline", seedTimeline, (event) => ({
    date: event.date,
    event: event.event,
    mode: event.mode,
  })),
  takeaways: citedRows("takeaways", seedTakeaway, (takeaway, position) => ({
    position,
    text: takeaway.text,
    detail: takeaway.detail ?? null,
    mode: takeaway.mode,
  })),
  counters: collection({
    ...counterRows,
    optional: true,
    check: (file, edges, { deckModes }) => {
      edges.forEach((edge, index) => {
        for (const deck of [edge.team, edge.beaten_by]) {
          const deckMode = deckModes.get(deck);
          if (deckMode === undefined || deckMode === edge.mode) continue;
          throw new ImportError(
            file,
            index,
            `counter mode ${edge.mode} doesn't match deck ${deck}'s mode ${deckMode}`,
          );
        }
      });
    },
    prepare: (edges, context) => [
      (repos) => {
        const holders = new Map(repos.counters.list().map((row) => [row.slug, row.recordSlug]));
        assertUnclaimed(
          context.file,
          "counter slug",
          edges.map((edge) => edge.id),
          (slug) => holders.get(slug),
        );
      },
      ...counterRows.prepare(edges, context),
    ],
  }),
  usage: { ...citedRows("usageStats", seedUsage, mapUsage), optional: true },
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
