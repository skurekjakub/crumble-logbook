/**
 * The content-type registry: every durable table, in foreign-key-safe
 * insert order, with what the server layers derive from it. The repos, the
 * services, the snapshot's tables, its restore order and counts, and the
 * importer's replace-clear order all come from this one declaration.
 *
 * Adding a cited content type is a table, its input schemas and its
 * `CITED_ENTITY` value in `@crumble/schema`, an entry here, a `.route()`
 * line in `app.ts` (kept explicit so the typed client keeps every route's
 * types) and a view. `test/registry.test.ts` fails if the route or the
 * entity is missing, or if a declared list filter doesn't narrow its list.
 * A table with a `mode` column gets the `?mode=` list filter without
 * declaring it.
 *
 * This module is layer-neutral: it holds declarations only, and imports no
 * repo, service, route or drizzle query builder.
 *
 * @module
 */
import type { CitedEntity, GameMode, Values } from "@crumble/schema";
import {
  CLEAR_RESULT,
  GAME_MODE,
  SOURCE_SITE,
  USAGE_KIND,
  buffValueInput,
  buffValuePatch,
  buffValues,
  captures,
  citations,
  counterInput,
  counterPatch,
  counters,
  deckCookies,
  deckInput,
  deckNotes,
  deckPatch,
  deckPets,
  decks,
  deckSlug,
  factClaims,
  fightEventInput,
  fightEventPatch,
  fightEvents,
  gearRecInput,
  gearRecPatch,
  gearRecs,
  glossary,
  mechanicInput,
  mechanicPatch,
  mechanics,
  powerBracketInput,
  powerBracketPatch,
  powerBrackets,
  rankings,
  recommendationInput,
  recommendationPatch,
  recommendations,
  recordModes,
  researchRecords,
  riftBossInput,
  riftBossPatch,
  riftBosses,
  riftLevelInput,
  riftLevelPatch,
  riftLevels,
  riftSeasonInput,
  riftSeasonPatch,
  riftSeasons,
  rngFactorInput,
  rngFactorPatch,
  rngFactors,
  runeBuildDecks,
  runeBuildInput,
  runeBuildPatch,
  runeBuilds,
  scoreInput,
  scorePatch,
  scores,
  sources,
  stageChapterInput,
  stageChapterPatch,
  stageChapters,
  stageClearInput,
  stageClearPatch,
  stageClears,
  stageZoneSlotInput,
  stageZoneSlotPatch,
  stageZoneSlots,
  takeawayInput,
  takeawayPatch,
  takeaways,
  timeline,
  timelineEventInput,
  timelineEventPatch,
  usageStatInput,
  usageStatPatch,
  usageStats,
} from "@crumble/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { z } from "zod";

/** A column of `Row`, named by its JS key. */
export type ColumnOf<Row> = Extract<keyof Row, string>;

/**
 * One key of a list order: a column, ascending, or a column with its
 * direction and whether `null`s sort after every value.
 */
export type OrderKey<Row> =
  ColumnOf<Row> | { column: ColumnOf<Row>; desc?: boolean; nullsLast?: boolean };

/**
 * How a list filter matches a view:
 * - `equals`: the view's column equals the value;
 * - `anyOf`: at least one of the view's columns equals the value;
 * - `sameName`: the view's column names the same thing as the value, as a
 *   stored name, a glossary shorthand or the English gloss (case- and
 *   whitespace-insensitive);
 * - `includes`: the view's array field (e.g. a rune build's `decks`)
 *   contains the value.
 */
export type FilterMatch<Row> =
  | { equals: ColumnOf<Row> }
  | { anyOf: readonly ColumnOf<Row>[] }
  | { sameName: ColumnOf<Row> }
  | { includes: string };

/** A declared list filter: the query param's schema, and how its value matches a view. */
export interface ListFilter<Row> {
  /** Validates the `?name=` query value; an omitted param doesn't filter. */
  schema: z.ZodType<string>;
  /** How a validated value selects views. */
  match: FilterMatch<Row>;
}

/**
 * A list filter of any row shape, for code that reads filters generically.
 * Every {@link ListFilter} is one.
 */
export interface AnyListFilter {
  /** Validates the query value. */
  schema: z.ZodType<string>;
  /** How a validated value selects views. */
  match:
    { equals: string } | { anyOf: readonly string[] } | { sameName: string } | { includes: string };
}

/** Declared list filters of any row shape, by query param name. */
export type AnyFilters = Readonly<Record<string, AnyListFilter>>;

/** The request schemas of a type served by the generic CRUD router. */
export interface ApiSpec {
  /** The `:id` path parameter. */
  id: z.ZodType;
  /** The `POST /` body, `sources` included. */
  input: z.ZodType;
  /** The `PATCH /:id` body, `sources` included. */
  patch: z.ZodType;
}

/** How the generic repo and content service handle a cited table with an integer `id`. */
export interface ContentSpec<Row> {
  /** List order; defaults to ascending `id`. */
  order?: readonly OrderKey<Row>[];
  /** Columns holding the id of another aggregate, checked to exist before every write. */
  refs?: { readonly [C in ColumnOf<Row>]?: "decks" };
  /** A Korean-name column whose English gloss every view carries as `en`. */
  gloss?: ColumnOf<Row>;
  /**
   * The game mode every row is about, for a table with no `mode` column
   * that belongs to one mode: a deck its reference columns name must be of
   * this mode.
   */
  mode?: GameMode;
}

/** One registered table. */
export interface TableSpec<T extends SQLiteTable = SQLiteTable> {
  /** The drizzle table. */
  table: T;
  /** The route the table is served under, relative to `/api`, when it has one. */
  path?: `/${string}`;
  /** The citation entity its rows are cited under, when they carry citations. */
  entity?: CitedEntity;
  /** The list filters `GET <path>` accepts, by query param name. */
  filters?: Readonly<Record<string, ListFilter<InferSelectModel<T>>>>;
  /** Request schemas, when the generic CRUD router serves it. */
  api?: ApiSpec;
  /** Present when the generic table repo and content service handle it. */
  content?: ContentSpec<InferSelectModel<T>>;
  /**
   * The column naming the research record that owns a row, when it isn't
   * `recordSlug` (see {@link recordColumnOf}).
   */
  record?: ColumnOf<InferSelectModel<T>>;
}

/** The `?mode=` filter every table with a `mode` column gets: the column equals a `GAME_MODE`. */
const modeFilter = { schema: z.enum(GAME_MODE), match: { equals: "mode" } } as const;

/**
 * A registry entry: the declared spec and its table, plus the derived
 * `mode` filter when the table has a `mode` column.
 */
type Entry<T extends SQLiteTable, S> = S & { table: T } & ("mode" extends ColumnOf<
    InferSelectModel<T>
  >
    ? { filters: { mode: typeof modeFilter } }
    : unknown);

/**
 * Declares one registry entry, keeping its literal types (the route path
 * above all) for the typed client. A table with a `mode` column gets the
 * `mode` list filter without declaring it.
 *
 * @param table - the drizzle table
 * @param spec - everything else about it; a `filters.mode` it declares is
 *   replaced by the derived one
 * @returns the entry
 */
function entry<T extends SQLiteTable, const S extends Omit<TableSpec<T>, "table">>(
  table: T,
  spec: S,
): Entry<T, S> {
  const hasMode = (table as unknown as Record<string, unknown>).mode !== undefined;
  const filters = hasMode ? { ...spec.filters, mode: modeFilter } : spec.filters;
  return { ...spec, table, ...(filters ? { filters } : {}) } as Entry<T, S>;
}

/** A positive integer `:id` path parameter, coerced from its string form. */
export const rowId = z.coerce.number().int().positive();

/** A non-empty free-text query value. */
const nonEmpty = z.string().min(1);

/**
 * Every durable table, keyed by its snapshot name, in foreign-key-safe
 * insert order: a table only references tables above it.
 */
export const REGISTRY = {
  sources: entry(sources, {
    path: "/sources",
    filters: {
      site: { schema: z.enum(SOURCE_SITE), match: { equals: "site" } },
      record: { schema: nonEmpty, match: { includes: "records" } },
    },
  }),
  researchRecords: entry(researchRecords, { path: "/records", record: "slug" }),
  recordModes: entry(recordModes, {}),
  captures: entry(captures, {
    path: "/captures",
    filters: {
      record: { schema: nonEmpty, match: { equals: "recordSlug" } },
      path: { schema: nonEmpty, match: { equals: "path" } },
    },
  }),
  glossary: entry(glossary, { path: "/glossary" }),
  decks: entry(decks, {
    path: "/decks",
    entity: "deck",
    api: { id: deckSlug, input: deckInput, patch: deckPatch },
  }),
  deckCookies: entry(deckCookies, {}),
  deckPets: entry(deckPets, {}),
  deckNotes: entry(deckNotes, {}),
  runeBuilds: entry(runeBuilds, {
    path: "/rune-builds",
    entity: "rune_build",
    filters: { deck: { schema: deckSlug, match: { includes: "decks" } } },
    api: { id: rowId, input: runeBuildInput, patch: runeBuildPatch },
  }),
  runeBuildDecks: entry(runeBuildDecks, {}),
  gearRecs: entry(gearRecs, {
    path: "/gear-recs",
    entity: "gear_rec",
    api: { id: rowId, input: gearRecInput, patch: gearRecPatch },
    content: {},
  }),
  scores: entry(scores, {
    path: "/scores",
    entity: "score",
    filters: { deck: { schema: deckSlug, match: { equals: "deckId" } } },
    api: { id: rowId, input: scoreInput, patch: scorePatch },
    content: { order: [{ column: "damageG", desc: true }, "id"], refs: { deckId: "decks" } },
  }),
  rankings: entry(rankings, { path: "/rankings" }),
  mechanics: entry(mechanics, {
    path: "/mechanics",
    entity: "mechanic",
    filters: { topic: { schema: nonEmpty, match: { equals: "topic" } } },
    api: { id: rowId, input: mechanicInput, patch: mechanicPatch },
    content: {},
  }),
  rngFactors: entry(rngFactors, {
    path: "/rng-factors",
    entity: "rng_factor",
    api: { id: rowId, input: rngFactorInput, patch: rngFactorPatch },
    content: {},
  }),
  timeline: entry(timeline, {
    path: "/timeline",
    entity: "timeline_event",
    api: { id: rowId, input: timelineEventInput, patch: timelineEventPatch },
    content: { order: ["date", "id"] },
  }),
  takeaways: entry(takeaways, {
    path: "/takeaways",
    entity: "takeaway",
    api: { id: rowId, input: takeawayInput, patch: takeawayPatch },
    content: { order: ["position", "id"] },
  }),
  recommendations: entry(recommendations, {
    path: "/recommendations",
    entity: "recommendation",
    filters: { record: { schema: nonEmpty, match: { equals: "recordSlug" } } },
    api: { id: rowId, input: recommendationInput, patch: recommendationPatch },
    content: {},
  }),
  fightEvents: entry(fightEvents, {
    path: "/fight-events",
    entity: "fight_event",
    filters: { boss: { schema: nonEmpty, match: { equals: "boss" } } },
    api: { id: rowId, input: fightEventInput, patch: fightEventPatch },
    content: { order: [{ column: "tElapsed", nullsLast: true }, "id"] },
  }),
  buffValues: entry(buffValues, {
    path: "/buff-values",
    entity: "buff_value",
    filters: { cookie: { schema: nonEmpty, match: { sameName: "cookieKr" } } },
    api: { id: rowId, input: buffValueInput, patch: buffValuePatch },
    content: { order: ["cookieKr", "effectType", "skillGrade", "id"], gloss: "cookieKr" },
  }),
  counters: entry(counters, {
    path: "/counters",
    entity: "counter",
    filters: { deck: { schema: deckSlug, match: { anyOf: ["teamDeckId", "beatenByDeckId"] } } },
    api: { id: rowId, input: counterInput, patch: counterPatch },
    content: { refs: { teamDeckId: "decks", beatenByDeckId: "decks" } },
  }),
  usageStats: entry(usageStats, {
    path: "/usage",
    entity: "usage_stat",
    filters: { kind: { schema: z.enum(USAGE_KIND), match: { equals: "kind" } } },
    api: { id: rowId, input: usageStatInput, patch: usageStatPatch },
    content: { order: [{ column: "usagePct", desc: true }, "id"], gloss: "subject" },
  }),
  powerBrackets: entry(powerBrackets, {
    path: "/power-brackets",
    entity: "power_bracket",
    api: { id: rowId, input: powerBracketInput, patch: powerBracketPatch },
    content: { order: ["minRatioPct"] },
  }),
  stageChapters: entry(stageChapters, {
    path: "/stage-chapters",
    entity: "stage_chapter",
    api: { id: rowId, input: stageChapterInput, patch: stageChapterPatch },
    content: { order: ["chapter"] },
  }),
  riftLevels: entry(riftLevels, {
    path: "/rift-levels",
    entity: "rift_level",
    api: { id: rowId, input: riftLevelInput, patch: riftLevelPatch },
    content: { order: ["level"] },
  }),
  riftSeasons: entry(riftSeasons, {
    path: "/rift-seasons",
    entity: "rift_season",
    api: { id: rowId, input: riftSeasonInput, patch: riftSeasonPatch },
    content: { order: ["season"] },
  }),
  stageZoneSlots: entry(stageZoneSlots, {
    path: "/stage-zone-slots",
    entity: "stage_zone_slot",
    filters: { deck: { schema: deckSlug, match: { equals: "deckId" } } },
    api: { id: rowId, input: stageZoneSlotInput, patch: stageZoneSlotPatch },
    content: { order: ["zoneIndex", "position", "id"], refs: { deckId: "decks" }, mode: "stage" },
  }),
  stageClears: entry(stageClears, {
    path: "/stage-clears",
    entity: "stage_clear",
    filters: {
      result: { schema: z.enum(CLEAR_RESULT), match: { equals: "result" } },
      deck: { schema: deckSlug, match: { equals: "deckId" } },
    },
    api: { id: rowId, input: stageClearInput, patch: stageClearPatch },
    content: {
      order: [
        { column: "chapter", desc: true },
        { column: "stageNo", desc: true },
        { column: "powerG", nullsLast: true },
        "id",
      ],
      refs: { deckId: "decks" },
      gloss: "bossKr",
      mode: "stage",
    },
  }),
  riftBosses: entry(riftBosses, {
    path: "/rift-bosses",
    entity: "rift_boss",
    api: { id: rowId, input: riftBossInput, patch: riftBossPatch },
    content: { order: ["level", "id"] },
  }),
  citations: entry(citations, {}),
  factClaims: entry(factClaims, {}),
};

/** The registry's type. */
export type Registry = typeof REGISTRY;

/** A registered table's snapshot name. */
export type TableKey = keyof Registry;

/** A selected row of the registered table `K`. */
export type RowOf<K extends TableKey> = InferSelectModel<Registry[K]["table"]>;

/** An insert payload for the registered table `K`. */
export type InsertOf<K extends TableKey> = InferInsertModel<Registry[K]["table"]>;

/** A table the generic repo and content service handle. */
export type ContentKey = {
  [K in TableKey]: Registry[K] extends { content: object } ? K : never;
}[TableKey];

/** The column values a content type's create accepts: its input without `sources`. */
export type ValuesOf<K extends ContentKey> = Registry[K] extends {
  api: { input: infer I extends z.ZodType };
}
  ? Values<z.output<I>>
  : never;

/** The list filters of `K`, by name, each optional; empty when it declares none. */
export type FiltersOf<K extends TableKey> = Registry[K] extends { filters: infer F }
  ? { [N in keyof F]?: string }
  : Record<never, never>;

/** Every table's snapshot name, in registry (insert) order. */
export const TABLE_KEYS = Object.keys(REGISTRY) as TableKey[];

/** Every table the generic repo and content service handle, in registry order. */
export const CONTENT_KEYS = TABLE_KEYS.filter(
  (key): key is ContentKey => "content" in REGISTRY[key],
);

/**
 * The registry entry of `key`, widened to {@link TableSpec} for code that
 * reads any entry generically.
 *
 * @param key - a table's snapshot name
 * @returns its entry
 */
export function specOf(key: TableKey): TableSpec {
  return REGISTRY[key];
}

/**
 * The column naming the research record that owns a row of `key`: the
 * entry's declared `record` column, else `recordSlug` when the table has
 * one. A record's re-import clears the rows it owns.
 *
 * @param key - a table's snapshot name
 * @returns the column's JS name, or `undefined` for a table whose rows no
 *   record owns directly (child rows, citations)
 */
export function recordColumnOf(key: TableKey): string | undefined {
  const { record, table } = specOf(key);
  if (record) return record;
  return (table as unknown as Record<string, unknown>).recordSlug !== undefined
    ? "recordSlug"
    : undefined;
}
