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
 * A table with a `mode` column gets the `?mode=` list filter, and a table
 * with the obsolete lifecycle (an `obsoleteSince` column) the `?current=`
 * filter, without declaring them.
 *
 * This module is layer-neutral: it holds declarations only, and imports no
 * repo, service, route or drizzle query builder.
 *
 * @module
 */
import type { CitedEntity, GainPoint, GameMode, Values } from "@crumble/schema";
import {
  CLEAR_RESULT,
  CLEAR_STANDING,
  COST_TYPE,
  DATA_POINT_KIND,
  DUNGEON_BOARD,
  EXCLUSION_CLASS,
  EXCLUSION_STATUS,
  GAME_MODE,
  PACKAGE_TIER,
  POWER_PLACE,
  RUN_EVIDENCE,
  RUN_STANDING,
  SOURCE_SITE,
  SPENDING_ORDER_KIND,
  SPEND_ROUTE,
  STEP_BASIS,
  USAGE_KIND,
  growthCurveInput,
  growthCurvePatch,
  growthCurveProblem,
  growthCurves,
  packageInput,
  packagePatch,
  packages,
  plannerStepInput,
  plannerStepPatch,
  plannerStepProblem,
  plannerSteps,
  powerDataPointInput,
  powerDataPointPatch,
  powerDataPoints,
  powerSourceInput,
  powerSourcePatch,
  powerSources,
  priceTierInput,
  priceTierPatch,
  priceTiers,
  spendingOrderInput,
  spendingOrderPatch,
  spendingOrders,
  spendingStepInput,
  spendingStepPatch,
  spendingStepProblem,
  spendingSteps,
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
  dungeonExclusionInput,
  dungeonExclusionPatch,
  dungeonExclusions,
  dungeonLineupInput,
  dungeonLineupPatch,
  dungeonLineups,
  dungeonRunInput,
  dungeonRunPatch,
  dungeonRuns,
  factClaims,
  fightEventInput,
  fightEventPatch,
  fightEvents,
  gearRecInput,
  gearRecPatch,
  gearRecs,
  glossary,
  lineupProblem,
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
  riftUnlockInput,
  riftUnlockPatch,
  riftUnlocks,
  rngFactorInput,
  rngFactorPatch,
  rngFactors,
  runStanding,
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
 * direction, whether `null`s sort after every value, and `rank`, the
 * column's values in the order they sort (a value it doesn't list sorts
 * after them all).
 */
export type OrderKey<Row> =
  | ColumnOf<Row>
  | { column: ColumnOf<Row>; desc?: boolean; nullsLast?: boolean; rank?: readonly string[] };

/**
 * How a list filter matches a view:
 * - `equals`: the view's column equals the value;
 * - `anyOf`: at least one of the view's columns equals the value;
 * - `sameName`: the view's column names the same thing as the value, as a
 *   stored name, a glossary shorthand or the English gloss (case- and
 *   whitespace-insensitive);
 * - `includes`: the view's array field (e.g. a rune build's `decks`)
 *   contains the value;
 * - `isNull`: the value `true` keeps the views whose column is null, and
 *   `false` those whose column isn't.
 */
export type FilterMatch<Row> =
  | { equals: ColumnOf<Row> }
  | { anyOf: readonly ColumnOf<Row>[] }
  | { sameName: ColumnOf<Row> }
  | { includes: string }
  | { isNull: ColumnOf<Row> };

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
    | { equals: string }
    | { anyOf: readonly string[] }
    | { sameName: string }
    | { includes: string }
    | { isNull: string };
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

/** The content types other rows name by their `slug` column (see {@link ContentSpec.links}). */
export type LinkTarget = "powerSources" | "powerDataPoints" | "packages" | "spendingOrders";

/**
 * Finds the row of a content type other rows name by its `slug`.
 *
 * @param target - the content type
 * @param slug - the row's slug
 * @returns the row, or `undefined` when none has that slug
 */
export type LinkedRow = (
  target: LinkTarget,
  slug: string,
) => Readonly<Record<string, unknown>> | undefined;

/** How the generic repo and content service handle a cited table with an integer `id`. */
export interface ContentSpec<Row> {
  /** List order; defaults to ascending `id`. */
  order?: readonly OrderKey<Row>[];
  /** Columns holding the id of another aggregate, checked to exist before every write. */
  refs?: { readonly [C in ColumnOf<Row>]?: "decks" };
  /**
   * Columns naming rows of another content type by its `slug`, as one slug
   * or a list of them: every slug named must exist before a write, and a
   * row that another row names can't be deleted or change its slug.
   */
  links?: { readonly [C in ColumnOf<Row>]?: LinkTarget };
  /**
   * The source ids a row names inside its columns (a posted gain's
   * sources, say): they must exist before a write, and the row is cited
   * to them as to its own sources, so a source it names can't be deleted.
   *
   * @param values - the values being written; a patch's may lack the columns
   * @returns the source ids
   */
  innerSources?(values: Partial<Row>): string[];
  /** A Korean-name column whose English gloss every view carries as `en`. */
  gloss?: ColumnOf<Row>;
  /**
   * The game mode every row is about, for a table with no `mode` column
   * that belongs to one mode: a deck its reference columns name must be of
   * this mode.
   */
  mode?: GameMode;
  /**
   * Columns no two rows may share, `null` counting as a value: a write
   * that would repeat another row's values in all of them is refused.
   */
  unique?: readonly ColumnOf<Row>[];
  /**
   * Checks a row as written (a patch merged in) against rules its columns
   * and the rows it links to must keep. It runs again when a row it links
   * to is updated.
   *
   * @param row - the written row
   * @param linked - finds a row the written row names by slug
   * @returns what is wrong with it, or `undefined` when it keeps them
   */
  check?(row: Row, linked: LinkedRow): string | undefined;
  /**
   * Columns read from a row's other columns: after every write the row
   * is updated to the values this returns.
   *
   * @param row - the written row
   * @returns the derived columns' values
   */
  derive?(row: Row): Partial<Row>;
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
 * The `?current=` filter every table with the obsolete lifecycle gets:
 * `true` keeps the current rows, `false` the obsolete ones.
 */
const currentFilter = {
  schema: z.enum(["true", "false"]),
  match: { isNull: "obsoleteSince" },
} as const;

/** A column of the rows of `T`. */
type Columns<T extends SQLiteTable> = ColumnOf<InferSelectModel<T>>;

/**
 * A registry entry: the declared spec and its table, plus the derived
 * `mode` filter when the table has a `mode` column and the derived
 * `current` filter when it has the obsolete lifecycle.
 */
type Entry<T extends SQLiteTable, S> = S & { table: T } & ("mode" extends Columns<T>
    ? { filters: { mode: typeof modeFilter } }
    : unknown) &
  ("obsoleteSince" extends Columns<T> ? { filters: { current: typeof currentFilter } } : unknown);

/**
 * Declares one registry entry, keeping its literal types (the route path
 * above all) for the typed client. A table with a `mode` column gets the
 * `mode` list filter, and one with an `obsoleteSince` column the `current`
 * filter, without declaring them.
 *
 * @param table - the drizzle table
 * @param spec - everything else about it; a `filters.mode` or
 *   `filters.current` it declares is replaced by the derived one
 * @returns the entry
 */
function entry<T extends SQLiteTable, const S extends Omit<TableSpec<T>, "table">>(
  table: T,
  spec: S,
): Entry<T, S> {
  const columns = table as unknown as Record<string, unknown>;
  const derived = {
    ...(columns.mode !== undefined ? { mode: modeFilter } : {}),
    ...(columns.obsoleteSince !== undefined ? { current: currentFilter } : {}),
  };
  const filters = Object.keys(derived).length > 0 ? { ...spec.filters, ...derived } : spec.filters;
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
  riftUnlocks: entry(riftUnlocks, {
    path: "/rift-unlocks",
    entity: "rift_unlock",
    api: { id: rowId, input: riftUnlockInput, patch: riftUnlockPatch },
    content: {},
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
      // The ranked list first: accepted clears, furthest stage first, then
      // lowest power; then accepted failures, then unverified and rejected
      // attempts, each in the same order.
      order: [
        { column: "standing", rank: CLEAR_STANDING },
        { column: "result", rank: CLEAR_RESULT },
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
  dungeonRuns: entry(dungeonRuns, {
    path: "/dungeon-runs",
    entity: "dungeon_run",
    filters: {
      board: { schema: z.enum(DUNGEON_BOARD), match: { equals: "board" } },
      evidence: { schema: z.enum(RUN_EVIDENCE), match: { equals: "evidence" } },
      deck: { schema: deckSlug, match: { equals: "deckId" } },
    },
    api: { id: rowId, input: dungeonRunInput, patch: dungeonRunPatch },
    content: {
      // Scores a screenshot or video shows first, highest score first; then
      // the claims, in the same order. Never by score ÷ power.
      order: [{ column: "standing", rank: RUN_STANDING }, { column: "scoreG", desc: true }, "id"],
      refs: { deckId: "decks" },
      mode: "crumble_dungeon",
      derive: (run) => ({ standing: runStanding(run) }),
    },
  }),
  dungeonLineups: entry(dungeonLineups, {
    path: "/dungeon-lineups",
    entity: "dungeon_lineup",
    filters: { deck: { schema: deckSlug, match: { equals: "deckId" } } },
    api: { id: rowId, input: dungeonLineupInput, patch: dungeonLineupPatch },
    content: {
      order: [{ column: "date", desc: true }, "id"],
      refs: { deckId: "decks" },
      mode: "crumble_dungeon",
      check: lineupProblem,
    },
  }),
  dungeonExclusions: entry(dungeonExclusions, {
    path: "/dungeon-exclusions",
    entity: "dungeon_exclusion",
    filters: {
      kind: { schema: z.enum(EXCLUSION_CLASS), match: { equals: "kind" } },
      status: { schema: z.enum(EXCLUSION_STATUS), match: { equals: "status" } },
    },
    api: { id: rowId, input: dungeonExclusionInput, patch: dungeonExclusionPatch },
    // One exclusion per cookie within a record; rows no record owns share `null`.
    content: { gloss: "cookieKr", unique: ["cookieKr", "recordSlug"] },
  }),
  powerSources: entry(powerSources, {
    path: "/power-sources",
    entity: "power_source",
    filters: {
      cost: { schema: z.enum(COST_TYPE), match: { equals: "costType" } },
      place: { schema: z.enum(POWER_PLACE), match: { includes: "appliesIn" } },
    },
    api: { id: rowId, input: powerSourceInput, patch: powerSourcePatch },
    content: {
      innerSources: (row) => row.postedGains?.flatMap((gain) => gain.sources) ?? [],
    },
  }),
  powerDataPoints: entry(powerDataPoints, {
    path: "/power-data-points",
    entity: "power_data_point",
    filters: {
      kind: { schema: z.enum(DATA_POINT_KIND), match: { equals: "kind" } },
      powerSource: { schema: nonEmpty, match: { equals: "powerSource" } },
    },
    api: { id: rowId, input: powerDataPointInput, patch: powerDataPointPatch },
    content: { links: { powerSource: "powerSources" } },
  }),
  packages: entry(packages, {
    path: "/packages",
    entity: "package",
    filters: {
      tier: { schema: z.enum(PACKAGE_TIER), match: { equals: "tier" } },
      feeds: { schema: nonEmpty, match: { includes: "feeds" } },
    },
    api: { id: rowId, input: packageInput, patch: packagePatch },
    content: { links: { feeds: "powerSources" } },
  }),
  priceTiers: entry(priceTiers, {
    path: "/price-tiers",
    entity: "price_tier",
    api: { id: rowId, input: priceTierInput, patch: priceTierPatch },
    content: { order: ["krw", "id"] },
  }),
  spendingOrders: entry(spendingOrders, {
    path: "/spending-orders",
    entity: "spending_order",
    filters: { kind: { schema: z.enum(SPENDING_ORDER_KIND), match: { equals: "kind" } } },
    api: { id: rowId, input: spendingOrderInput, patch: spendingOrderPatch },
    content: { order: ["position", "id"] },
  }),
  spendingSteps: entry(spendingSteps, {
    path: "/spending-steps",
    entity: "spending_step",
    filters: {
      order: { schema: nonEmpty, match: { equals: "orderSlug" } },
      route: { schema: z.enum(SPEND_ROUTE), match: { equals: "route" } },
      basis: { schema: z.enum(STEP_BASIS), match: { equals: "basis" } },
    },
    api: { id: rowId, input: spendingStepInput, patch: spendingStepPatch },
    content: {
      order: [{ column: "route", rank: SPEND_ROUTE }, "position", "id"],
      links: { orderSlug: "spendingOrders", powerSource: "powerSources", packageSlug: "packages" },
      check: spendingStepProblem,
    },
  }),
  growthCurves: entry(growthCurves, {
    path: "/growth-curves",
    entity: "growth_curve",
    filters: { powerSource: { schema: nonEmpty, match: { equals: "powerSource" } } },
    api: { id: rowId, input: growthCurveInput, patch: growthCurvePatch },
    content: {
      links: { powerSource: "powerSources" },
      innerSources: (row) => row.rowSources?.flat() ?? [],
      check: growthCurveProblem,
    },
  }),
  plannerSteps: entry(plannerSteps, {
    path: "/planner-steps",
    entity: "planner_step",
    filters: { basis: { schema: z.enum(STEP_BASIS), match: { equals: "basis" } } },
    api: { id: rowId, input: plannerStepInput, patch: plannerStepPatch },
    content: {
      order: ["position", "id"],
      links: { powerSource: "powerSources", dataPoint: "powerDataPoints" },
      check: (step, linked) =>
        plannerStepProblem(
          step,
          step.dataPoint === null
            ? undefined
            : (linked("powerDataPoints", step.dataPoint) as GainPoint | undefined),
        ),
    },
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
