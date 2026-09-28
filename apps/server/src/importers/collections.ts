/**
 * The curated collections an import reads: how each collection file is
 * validated, what its rows reference, and how its rows are mapped into
 * write steps. A new curated collection is an entry here plus its file in
 * the record's `curated/manifest.json`; the reader and the writer need no
 * edits.
 *
 * @module
 */
import type { GameMode } from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import type { ContentKey, ValuesOf } from "../registry";
import type { GlossaryInsert } from "../repos/glossary";
import type { SourceInsert } from "../repos/sources";
import { deckModeMismatch } from "../services/deck-modes";
import { findCapture } from "./captures";
import { formatIssues, parseFile } from "./files";
import type { ImportManifest } from "./manifest";
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
import type { Moded } from "./seed/schema";
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
import {
  GLOSSARY_FIELDS,
  SOURCE_FIELDS,
  assertUnclaimed,
  crossRecordGlossaryWarnings,
  glossaryWarnings,
  writeShared,
} from "./shared";
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

/** What a collection's file is validated with, besides the file itself. */
export interface ParseContext {
  /**
   * The record's game mode, from `import.json`'s `record.mode`: a row that
   * states no mode is filed under it. `undefined` when the record states none.
   */
  mode: GameMode | undefined;
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
   *
   * @param file - the file's record-relative path, as errors name it
   * @param raw - the parsed JSON
   * @param context - the record's mode, for rows that state none
   * @throws {ImportError} naming the file (and the row) of the first failure
   */
  parse(file: string, raw: unknown, context: ParseContext): Parsed;
  /** Lists every row's source and deck references. */
  refs(parsed: Parsed): RowRefs[];
  /**
   * Checks what the reference checks don't, after they pass.
   *
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
 *
 * @param collection - the collection
 * @returns the same collection
 */
function collection<Parsed>(collection: Collection<Parsed>): Collection<Parsed> {
  return collection;
}

/**
 * Validates every row of an array file with `schema`.
 *
 * @param file - the file's record-relative path, as errors name it
 * @param raw - the parsed JSON
 * @param schema - the schema of one row
 * @returns the validated rows, in file order
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
 * Validates every row of an array file whose rows may state a game mode,
 * filing a row that states none under the record's mode.
 *
 * @param file - the file's record-relative path, as errors name it
 * @param raw - the parsed JSON
 * @param schema - the schema of one row
 * @param mode - the record's mode, or `undefined` when the record states none
 * @returns the validated rows, in file order, each with its mode
 * @throws {ImportError} as {@link parseRows} does, or naming `file` and the
 *   index of the first row that states no mode when the record states none
 */
function parseModedRows<S extends z.ZodType<{ mode?: GameMode | undefined }>>(
  file: string,
  raw: unknown,
  schema: S,
  mode: GameMode | undefined,
): Array<Moded<z.output<S>>> {
  return parseRows(file, raw, schema).map((row, index) => {
    const resolved = row.mode ?? mode;
    if (resolved === undefined) {
      throw new ImportError(
        file,
        index,
        "the row states no mode, and import.json's record has none to file it under",
      );
    }
    return { ...row, mode: resolved };
  });
}

/**
 * A collection's `parse` for an array file of rows that may state a game mode.
 *
 * @param schema - the schema of one row
 * @returns the parse function: see {@link parseModedRows}
 */
function modedRows<S extends z.ZodType<{ mode?: GameMode | undefined }>>(schema: S) {
  return (file: string, raw: unknown, { mode }: ParseContext) =>
    parseModedRows(file, raw, schema, mode);
}

/**
 * Declares an array collection of a registered content type whose rows
 * each cite their own `sources` and map onto one row of the type.
 *
 * @param key - the content type's registry key
 * @param parse - validates the file into its rows (see {@link modedRows})
 * @param map - maps a validated row, and its index, onto the type's column values
 * @param decks - the deck ids a row links to, when rows reference decks
 * @returns the collection
 */
function citedRows<K extends ContentKey, Row extends { sources: string[] }>(
  key: K,
  parse: (file: string, raw: unknown, context: ParseContext) => Row[],
  map: (row: Row, index: number) => ValuesOf<K>,
  decks?: (row: Row) => readonly string[],
): Collection<Row[]> {
  return collection({
    parse,
    /** @inheritdoc */
    refs: (rows) =>
      rows.map((row, index) => ({ row: index, sources: row.sources, decks: decks?.(row) })),
    /** @inheritdoc */
    prepare: (rows) => [
      insertCited(
        key,
        rows.map((row, index) => ({ values: map(row, index), sources: row.sources })),
      ),
    ],
  });
}

/** The counters collection's plain cited-row behaviour, before its own checks. */
const counterRows = citedRows("counters", modedRows(seedCounter), mapCounter, (edge) => [
  edge.team,
  edge.beaten_by,
]);

/**
 * Every curated collection, by its key in the curated manifest, in write
 * order: a collection's rows only reference rows written before them.
 */
export const COLLECTIONS = {
  sources: collection({
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedSources),
    /** @inheritdoc */
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
            /**
             * Stores the source, warning when a dc or nv source has no capture.
             *
             * @param owned - the source, owned by the record
             */
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
    /** @inheritdoc */
    parse: (file, raw) => parseRows(file, raw, seedGlossaryEntry),
    /** @inheritdoc */
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
            /**
             * Upserts the entry.
             *
             * @param owned - the entry, owned by the record
             */
            const write = (owned: GlossaryInsert) => {
              repos.glossary.upsert(owned);
            };
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
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedMeta),
    /** @inheritdoc */
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
    parse: (file, raw, { mode }) => parseModedRows(file, raw, seedDeck, mode),
    /** @inheritdoc */
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
    parse: (file, raw, { mode }) => parseModedRows(file, raw, seedRune, mode),
    /** @inheritdoc */
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
  gear: citedRows("gearRecs", modedRows(seedGear), (gear) => ({
    slot: mapGearSlot(gear.slot),
    substats: gear.substats,
    context: gear.context,
    why: gear.why,
    mode: gear.mode,
  })),
  scores: {
    ...citedRows(
      "scores",
      (file, raw) => parseRows(file, raw, seedScore),
      mapScore,
      (score) => (score.deck === null ? [] : [score.deck]),
    ),
    optional: true,
  },
  mechanics: citedRows(
    "mechanics",
    modedRows(seedMechanic),
    ({ sources: _sources, ...values }) => values,
  ),
  rng: citedRows("rngFactors", modedRows(seedRng), (factor) => ({
    factor: factor.factor,
    effect: factor.effect,
    mitigation: factor.mitigation ?? null,
    mode: factor.mode,
  })),
  timeline: citedRows("timeline", modedRows(seedTimeline), (event) => ({
    date: event.date,
    event: event.event,
    mode: event.mode,
  })),
  takeaways: citedRows("takeaways", modedRows(seedTakeaway), (takeaway, position) => ({
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
          const mismatch = deckModeMismatch("counter", edge.mode, deck, deckModes.get(deck));
          if (mismatch) throw new ImportError(file, index, mismatch);
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
  usage: { ...citedRows("usageStats", modedRows(seedUsage), mapUsage), optional: true },
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
