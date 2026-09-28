/**
 * The curated collections an import reads: how each collection file is
 * validated, what its rows reference, and how its rows are mapped into
 * write steps. A new curated collection is an entry here (or in a file
 * whose collections this one spreads in, such as `stage-collections.ts`
 * or `dungeon-collections.ts`)
 * plus its file in the record's `curated/manifest.json`; the reader and
 * the writer need no edits.
 *
 * @module
 */
import { z } from "zod";
import { ImportError } from "../errors";
import type { GlossaryInsert } from "../repos/glossary";
import type { SourceInsert } from "../repos/sources";
import { deckModeMismatch } from "../services/deck-modes";
import { findCapture } from "./captures";
import { DUNGEON_COLLECTIONS } from "./dungeon-collections";
import type { Collection } from "./collection-kit";
import { citedRows, collection, modedRows, parseModedRows, parseRows } from "./collection-kit";
import { parseFile } from "./files";
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
import {
  GLOSSARY_FIELDS,
  SOURCE_FIELDS,
  assertUnclaimed,
  crossRecordGlossaryWarnings,
  glossaryWarnings,
  writeShared,
} from "./shared";
import { STAGE_COLLECTIONS } from "./stage-collections";
import { insertCited } from "./steps";

export type {
  CheckContext,
  Collection,
  ParseContext,
  PrepareContext,
  RowRefs,
} from "./collection-kit";

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
    /** @inheritdoc */
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
    /** @inheritdoc */
    check: (file, entries) => {
      const seen = new Set<string>();
      entries.forEach((entry, index) => {
        if (seen.has(entry.kr)) throw new ImportError(file, index, `duplicate kr "${entry.kr}"`);
        seen.add(entry.kr);
      });
    },
    /** @inheritdoc */
    warnings: (entries) => glossaryWarnings(entries.map(mapGlossary)),
    /** @inheritdoc */
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
    /** @inheritdoc */
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
    /** @inheritdoc */
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
    /** @inheritdoc */
    parse: (file, raw, { mode }) => parseModedRows(file, raw, seedDeck, mode),
    /** @inheritdoc */
    refs: (decks) => decks.map((deck, index) => ({ row: index, sources: deck.sources })),
    /** @inheritdoc */
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
    /** @inheritdoc */
    parse: (file, raw, { mode }) => parseModedRows(file, raw, seedRune, mode),
    /** @inheritdoc */
    refs: (runes) =>
      runes.map((rune, index) => ({ row: index, sources: rune.sources, decks: rune.decks })),
    /** @inheritdoc */
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
    ({ sources: _sources, also_topics: alsoTopics, ...values }) => ({
      ...values,
      alsoTopics: alsoTopics ?? [],
    }),
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
  ...STAGE_COLLECTIONS,
  ...DUNGEON_COLLECTIONS,
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
