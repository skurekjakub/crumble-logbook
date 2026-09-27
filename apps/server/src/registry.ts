/**
 * The content-type registry: every durable table, in foreign-key-safe
 * insert order, with what the server layers derive from it. The repos, the
 * services, the snapshot's tables, its restore order and counts, and the
 * importer's replace-clear order all come from this one declaration.
 *
 * Adding a cited content type is a table and its input schemas in
 * `@crumble/schema`, an entry here, a `.route()` line in `app.ts` (kept
 * explicit so the typed client keeps every route's types) and a view.
 *
 * This module is layer-neutral: it holds declarations only, and imports no
 * repo, service, route or drizzle query builder.
 *
 * @module
 */
import type { CitedEntity, Values } from "@crumble/schema";
import {
  buffValueInput,
  buffValuePatch,
  buffValues,
  citations,
  deckCookies,
  deckInput,
  deckNotes,
  deckPatch,
  deckPets,
  decks,
  deckSlug,
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
  rankings,
  recommendationInput,
  recommendationPatch,
  recommendations,
  researchRecords,
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
  takeawayInput,
  takeawayPatch,
  takeaways,
  timeline,
  timelineEventInput,
  timelineEventPatch,
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
 * - `sameName`: the view's column names the same thing as the value, as a
 *   stored name, a glossary shorthand or the English gloss (case- and
 *   whitespace-insensitive);
 * - `includes`: the view's array field (e.g. a rune build's `decks`)
 *   contains the value.
 */
export type FilterMatch<Row> =
  { equals: ColumnOf<Row> } | { sameName: ColumnOf<Row> } | { includes: string };

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
  match: { equals: string } | { sameName: string } | { includes: string };
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
}

/**
 * Declares one registry entry, keeping its literal types (the route path
 * above all) for the typed client.
 *
 * @param table - the drizzle table
 * @param spec - everything else about it
 * @returns the entry
 */
function entry<T extends SQLiteTable, const S extends Omit<TableSpec<T>, "table">>(
  table: T,
  spec: S,
): S & { table: T } {
  return { ...spec, table };
}

/** A positive integer `:id` path parameter, coerced from its string form. */
export const rowId = z.coerce.number().int().positive();

/** A non-empty free-text query value. */
const nonEmpty = z.string().min(1);

/**
 * Every durable table, keyed by its snapshot name, in foreign-key-safe
 * insert order: a table only references tables above it. `jobs` holds
 * transient job state and isn't registered.
 */
export const REGISTRY = {
  sources: entry(sources, { path: "/sources" }),
  researchRecords: entry(researchRecords, { path: "/records" }),
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
  citations: entry(citations, {}),
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

/** A table served under a route. */
export type MountedKey = {
  [K in TableKey]: Registry[K] extends { path: string } ? K : never;
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
  return REGISTRY[key] as TableSpec;
}
