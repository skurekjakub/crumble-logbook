/**
 * One TanStack Query options factory per API resource. Use them with
 * `useQuery(decksQuery())` in components, or
 * `context.queryClient.ensureQueryData(decksQuery())` in route loaders.
 *
 * Every `queryFn` goes through hono's `parseResponse`: it resolves to the
 * route's success body, typed from the server, and throws a `DetailedError`
 * (status plus error body) for any non-2xx response, which `ErrorBox`
 * describes.
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

/** All research records, by slug. */
export const recordsQuery = () =>
  queryOptions({
    queryKey: ["records"],
    queryFn: () => parseResponse(api.records.$get()),
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

/** Decks in display order, with cookies, pets and ATK order resolved to English. */
export const decksQuery = () =>
  queryOptions({
    queryKey: ["decks"],
    queryFn: () => parseResponse(api.decks.$get({ query: {} })),
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
 * Scores sorted by damage, highest first, each with its 배 `ratio`.
 * @param deck - restrict to one deck's slug
 */
export const scoresQuery = (deck?: string) =>
  queryOptions({
    queryKey: ["scores", { deck: deck ?? null }],
    queryFn: () => parseResponse(api.scores.$get({ query: { deck } })),
  });

/**
 * Rune builds, with each cookie resolved to English and the decks it applies to.
 * @param deck - restrict to builds linked to one deck's slug
 */
export const runeBuildsQuery = (deck?: string) =>
  queryOptions({
    queryKey: ["rune-builds", { deck: deck ?? null }],
    queryFn: () => parseResponse(api["rune-builds"].$get({ query: { deck } })),
  });

/** Gear substat recommendations. */
export const gearRecsQuery = () =>
  queryOptions({
    queryKey: ["gear-recs"],
    queryFn: () => parseResponse(api["gear-recs"].$get({ query: {} })),
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

/** Mechanics, each with a confidence level. */
export const mechanicsQuery = () =>
  queryOptions({
    queryKey: ["mechanics"],
    queryFn: () => parseResponse(api.mechanics.$get({ query: {} })),
  });

/** RNG factors and their mitigations. */
export const rngFactorsQuery = () =>
  queryOptions({
    queryKey: ["rng-factors"],
    queryFn: () => parseResponse(api["rng-factors"].$get({ query: {} })),
  });

/** Dated meta events. */
export const timelineQuery = () =>
  queryOptions({
    queryKey: ["timeline"],
    queryFn: () => parseResponse(api.timeline.$get({ query: {} })),
  });

/** The overview's load-bearing takeaways. */
export const takeawaysQuery = () =>
  queryOptions({
    queryKey: ["takeaways"],
    queryFn: () => parseResponse(api.takeaways.$get({ query: {} })),
  });

/** "For your account" recommendations. */
export const recommendationsQuery = () =>
  queryOptions({
    queryKey: ["recommendations"],
    queryFn: () => parseResponse(api.recommendations.$get({ query: {} })),
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
