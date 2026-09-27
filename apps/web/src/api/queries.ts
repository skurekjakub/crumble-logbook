/**
 * One TanStack Query options factory per API resource. Use them with
 * `useQuery(decksQuery(mode.scope))` in components, or
 * `context.queryClient.ensureQueryData(decksQuery())` in route loaders.
 *
 * Every `queryFn` goes through hono's `parseResponse`: it resolves to the
 * route's success body, typed from the server, and throws a `DetailedError`
 * (status plus error body) for any non-2xx response, which `ErrorBox`
 * describes.
 *
 * A list that holds research content takes an optional {@link ModeScope}:
 * its mode goes on the request as `?mode=` (where the endpoint has one) and
 * in the query key, so each mode's lists are cached apart. Without a scope
 * the list covers every mode.
 */
import { queryOptions } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { parseResponse } from "hono/client";
import { api } from "./client";

/** Glossary kinds accepted by `/api/glossary?kind=`. */
export type GlossaryKindFilter = NonNullable<
  InferRequestType<typeof api.glossary.$get>["query"]["kind"]
>;

/** Source sites accepted by `/api/sources?site=`. */
export type SourceSiteFilter = NonNullable<
  InferRequestType<typeof api.sources.$get>["query"]["site"]
>;

/** Ranking boards accepted by `/api/rankings?board=`. */
export type RankingBoardFilter = NonNullable<
  InferRequestType<typeof api.rankings.$get>["query"]["board"]
>;

/**
 * A game mode, as research content is tagged with it: the values the
 * server's `?mode=` list filter accepts.
 */
export type GameMode = NonNullable<InferRequestType<typeof api.mechanics.$get>["query"]["mode"]>;

/** How one mode's views scope their list requests. */
export interface ModeScope {
  /** The mode: each list request sends it as `?mode=`, and it keys the mode's cached lists. */
  mode: GameMode;
}

/** A list query key's scope part: the mode, or `null` for every mode. */
function scopeKey(scope: ModeScope | undefined) {
  return { mode: scope?.mode ?? null };
}

/** All research records, by slug. */
export const recordsQuery = () =>
  queryOptions({
    queryKey: ["records"],
    queryFn: () => parseResponse(api.records.$get({ query: {} })),
  });

/**
 * One research record: the header's lede, caveat, season label and update date.
 * @param slug - the record's slug, e.g. `001-guild-conquest-meta`
 */
export const recordQuery = (slug: string) =>
  queryOptions({
    queryKey: ["records", slug],
    queryFn: () => parseResponse(api.records[":slug"].$get({ param: { slug } })),
  });

/**
 * Sources, newest first. Feed the unfiltered list to `useSourceIndex` for chips.
 * @param site - restrict to one site
 */
export const sourcesQuery = (site?: SourceSiteFilter) =>
  queryOptions({
    queryKey: ["sources", { site: site ?? null }],
    queryFn: () => parseResponse(api.sources.$get({ query: { site } })),
  });

/**
 * Glossary entries, ordered by Korean name.
 * @param kind - restrict to one kind
 */
export const glossaryQuery = (kind?: GlossaryKindFilter) =>
  queryOptions({
    queryKey: ["glossary", { kind: kind ?? null }],
    queryFn: () => parseResponse(api.glossary.$get({ query: { kind } })),
  });

/**
 * Decks in display order, with cookies, pets and ATK order resolved to English.
 * @param scope - the mode to list, when given
 */
export const decksQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["decks", scopeKey(scope)],
    queryFn: () => parseResponse(api.decks.$get({ query: { mode: scope?.mode } })),
  });

/**
 * One deck.
 * @param id - the deck's slug, e.g. `cherry`
 */
export const deckQuery = (id: string) =>
  queryOptions({
    queryKey: ["decks", id],
    queryFn: () => parseResponse(api.decks[":id"].$get({ param: { id } })),
  });

/**
 * Scores sorted by damage, highest first, each with its 배 `ratio`. Scores
 * carry no mode, so the scope only keys the cache.
 * @param scope - the mode the list is shown in, when given
 * @param deck - restrict to one deck's slug
 */
export const scoresQuery = (scope?: ModeScope, deck?: string) =>
  queryOptions({
    queryKey: ["scores", { ...scopeKey(scope), deck: deck ?? null }],
    queryFn: () => parseResponse(api.scores.$get({ query: { deck } })),
  });

/**
 * Rune builds, with each cookie resolved to English and the decks it applies to.
 * @param scope - the mode to list, when given
 * @param deck - restrict to builds linked to one deck's slug
 */
export const runeBuildsQuery = (scope?: ModeScope, deck?: string) =>
  queryOptions({
    queryKey: ["rune-builds", { ...scopeKey(scope), deck: deck ?? null }],
    queryFn: () => parseResponse(api["rune-builds"].$get({ query: { mode: scope?.mode, deck } })),
  });

/**
 * Gear substat recommendations.
 * @param scope - the mode to list, when given
 */
export const gearRecsQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["gear-recs", scopeKey(scope)],
    queryFn: () => parseResponse(api["gear-recs"].$get({ query: { mode: scope?.mode } })),
  });

/**
 * A boss's fight events in elapsed-time order; events with no time come last.
 * @param boss - the boss id, e.g. `pinata`
 */
export const fightEventsQuery = (boss: string) =>
  queryOptions({
    queryKey: ["fight-events", { boss }],
    queryFn: () => parseResponse(api["fight-events"].$get({ query: { boss } })),
  });

/**
 * Skill buff and debuff values per cookie and skill grade, ordered by cookie,
 * effect type, then grade.
 * @param cookie - restrict to one cookie (Korean name, shorthand or English)
 */
export const buffValuesQuery = (cookie?: string) =>
  queryOptions({
    queryKey: ["buff-values", { cookie: cookie ?? null }],
    queryFn: () => parseResponse(api["buff-values"].$get({ query: { cookie } })),
  });

/**
 * Mechanics, each with a confidence level.
 * @param scope - the mode to list, when given
 */
export const mechanicsQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["mechanics", scopeKey(scope)],
    queryFn: () => parseResponse(api.mechanics.$get({ query: { mode: scope?.mode } })),
  });

/**
 * RNG factors and their mitigations.
 * @param scope - the mode to list, when given
 */
export const rngFactorsQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["rng-factors", scopeKey(scope)],
    queryFn: () => parseResponse(api["rng-factors"].$get({ query: { mode: scope?.mode } })),
  });

/**
 * Dated meta events.
 * @param scope - the mode to list, when given
 */
export const timelineQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["timeline", scopeKey(scope)],
    queryFn: () => parseResponse(api.timeline.$get({ query: { mode: scope?.mode } })),
  });

/**
 * The overview's load-bearing takeaways.
 * @param scope - the mode to list, when given
 */
export const takeawaysQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["takeaways", scopeKey(scope)],
    queryFn: () => parseResponse(api.takeaways.$get({ query: { mode: scope?.mode } })),
  });

/**
 * "For your account" recommendations, which belong to a research record
 * rather than a mode.
 * @param record - the record whose recommendations to list; null or
 *   omitted for every record's
 */
export const recommendationsQuery = (record?: string | null) =>
  queryOptions({
    queryKey: ["recommendations", { record: record ?? null }],
    queryFn: () =>
      parseResponse(api.recommendations.$get({ query: { record: record ?? undefined } })),
  });

/**
 * Leaderboard rows in rank order.
 * @param filter - restrict to one season and/or board
 */
export const rankingsQuery = (filter: { season?: number; board?: RankingBoardFilter } = {}) =>
  queryOptions({
    queryKey: ["rankings", { season: filter.season ?? null, board: filter.board ?? null }],
    queryFn: () =>
      parseResponse(
        api.rankings.$get({
          query: {
            season: filter.season == null ? undefined : String(filter.season),
            board: filter.board,
          },
        }),
      ),
  });

/** Each board and season's latest leaderboard capture. */
export const rankingSeasonsQuery = () =>
  queryOptions({
    queryKey: ["rankings", "seasons"],
    queryFn: () => parseResponse(api.rankings.seasons.$get()),
  });
