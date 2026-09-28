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

/**
 * Builds a list query key's scope part.
 *
 * @param scope - the mode scope, when the list has one
 * @returns `{ mode }`, with `null` for every mode
 */
function scopeKey(scope: ModeScope | undefined) {
  return { mode: scope?.mode ?? null };
}

/**
 * All research records, by slug.
 *
 * @returns the query options
 */
export const recordsQuery = () =>
  queryOptions({
    queryKey: ["records"],
    queryFn: () => parseResponse(api.records.$get({ query: {} })),
  });

/**
 * One research record: the header's lede, caveat, season label and update date.
 *
 * @param slug - the record's slug, e.g. `001-guild-conquest-meta`
 * @returns the query options
 */
export const recordQuery = (slug: string) =>
  queryOptions({
    queryKey: ["records", slug],
    queryFn: () => parseResponse(api.records[":slug"].$get({ param: { slug } })),
  });

/**
 * Sources, newest first, each with the records it belongs to. Feed the
 * unfiltered list to `useSourceIndex` for chips.
 *
 * @param filter - restrict to one site, and/or to the sources one research
 *   record (by slug) owns or cites
 * @returns the query options
 */
export const sourcesQuery = (filter: { site?: SourceSiteFilter; record?: string } = {}) =>
  queryOptions({
    queryKey: ["sources", { site: filter.site ?? null, record: filter.record ?? null }],
    queryFn: () =>
      parseResponse(api.sources.$get({ query: { site: filter.site, record: filter.record } })),
  });

/**
 * One research record's capture ledger, ordered by path.
 *
 * @param record - the record's slug
 * @returns the query options
 */
export const capturesQuery = (record: string) =>
  queryOptions({
    queryKey: ["captures", { record }],
    queryFn: () => parseResponse(api.captures.$get({ query: { record } })),
  });

/**
 * Glossary entries, ordered by Korean name.
 *
 * @param kind - restrict to one kind
 * @returns the query options
 */
export const glossaryQuery = (kind?: GlossaryKindFilter) =>
  queryOptions({
    queryKey: ["glossary", { kind: kind ?? null }],
    queryFn: () => parseResponse(api.glossary.$get({ query: { kind } })),
  });

/**
 * Decks in display order, with cookies, pets and ATK order resolved to English.
 *
 * @param scope - the mode to list, when given
 * @returns the query options
 */
export const decksQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["decks", scopeKey(scope)],
    queryFn: () => parseResponse(api.decks.$get({ query: { mode: scope?.mode } })),
  });

/**
 * One deck.
 *
 * @param id - the deck's slug, e.g. `cherry`
 * @returns the query options
 */
export const deckQuery = (id: string) =>
  queryOptions({
    queryKey: ["decks", id],
    queryFn: () => parseResponse(api.decks[":id"].$get({ param: { id } })),
  });

/**
 * Scores sorted by damage, highest first, each with its 배 `ratio`. Scores
 * carry no mode, so the scope only keys the cache.
 *
 * @param scope - the mode the list is shown in, when given
 * @param deck - restrict to one deck's slug
 * @returns the query options
 */
export const scoresQuery = (scope?: ModeScope, deck?: string) =>
  queryOptions({
    queryKey: ["scores", { ...scopeKey(scope), deck: deck ?? null }],
    queryFn: () => parseResponse(api.scores.$get({ query: { deck } })),
  });

/**
 * Rune builds, with each cookie resolved to English and the decks it applies to.
 *
 * @param scope - the mode to list, when given
 * @param deck - restrict to builds linked to one deck's slug
 * @returns the query options
 */
export const runeBuildsQuery = (scope?: ModeScope, deck?: string) =>
  queryOptions({
    queryKey: ["rune-builds", { ...scopeKey(scope), deck: deck ?? null }],
    queryFn: () => parseResponse(api["rune-builds"].$get({ query: { mode: scope?.mode, deck } })),
  });

/**
 * Gear substat recommendations.
 *
 * @param scope - the mode to list, when given
 * @returns the query options
 */
export const gearRecsQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["gear-recs", scopeKey(scope)],
    queryFn: () => parseResponse(api["gear-recs"].$get({ query: { mode: scope?.mode } })),
  });

/**
 * A boss's fight events in elapsed-time order; events with no time come last.
 *
 * @param boss - the boss id, e.g. `pinata`
 * @returns the query options
 */
export const fightEventsQuery = (boss: string) =>
  queryOptions({
    queryKey: ["fight-events", { boss }],
    queryFn: () => parseResponse(api["fight-events"].$get({ query: { boss } })),
  });

/**
 * Skill buff and debuff values per cookie and skill grade, ordered by cookie,
 * effect type, then grade.
 *
 * @param cookie - restrict to one cookie (Korean name, shorthand or English)
 * @returns the query options
 */
export const buffValuesQuery = (cookie?: string) =>
  queryOptions({
    queryKey: ["buff-values", { cookie: cookie ?? null }],
    queryFn: () => parseResponse(api["buff-values"].$get({ query: { cookie } })),
  });

/**
 * Mechanics, each with a confidence level.
 *
 * @param scope - the mode to list, when given
 * @returns the query options
 */
export const mechanicsQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["mechanics", scopeKey(scope)],
    queryFn: () => parseResponse(api.mechanics.$get({ query: { mode: scope?.mode } })),
  });

/** The mechanics `topic` that marks a mode's rules (format, team size, seasons, buffs…). */
export const RULES_TOPIC = "rules";

/**
 * A mode's rules: its mechanics filed under {@link RULES_TOPIC}.
 *
 * @param scope - the mode whose rules to list
 * @returns the query options
 */
export const rulesQuery = (scope: ModeScope) =>
  queryOptions({
    queryKey: ["mechanics", { ...scopeKey(scope), topic: RULES_TOPIC }],
    queryFn: () =>
      parseResponse(api.mechanics.$get({ query: { mode: scope.mode, topic: RULES_TOPIC } })),
  });

/**
 * Directed counter edges: each says which team is beaten by which, under
 * what conditions, why, and how confidently.
 *
 * @param scope - the mode to list, when given
 * @returns the query options
 */
export const countersQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["counters", scopeKey(scope)],
    queryFn: () => parseResponse(api.counters.$get({ query: { mode: scope?.mode } })),
  });

/**
 * Usage figures, highest share first, each with its sample and capture date.
 *
 * @param scope - the mode to list, when given
 * @returns the query options
 */
export const usageQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["usage", scopeKey(scope)],
    queryFn: () => parseResponse(api.usage.$get({ query: { mode: scope?.mode } })),
  });

/**
 * RNG factors and their mitigations.
 *
 * @param scope - the mode to list, when given
 * @returns the query options
 */
export const rngFactorsQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["rng-factors", scopeKey(scope)],
    queryFn: () => parseResponse(api["rng-factors"].$get({ query: { mode: scope?.mode } })),
  });

/**
 * Dated meta events.
 *
 * @param scope - the mode to list, when given
 * @returns the query options
 */
export const timelineQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["timeline", scopeKey(scope)],
    queryFn: () => parseResponse(api.timeline.$get({ query: { mode: scope?.mode } })),
  });

/**
 * The overview's load-bearing takeaways.
 *
 * @param scope - the mode to list, when given
 * @returns the query options
 */
export const takeawaysQuery = (scope?: ModeScope) =>
  queryOptions({
    queryKey: ["takeaways", scopeKey(scope)],
    queryFn: () => parseResponse(api.takeaways.$get({ query: { mode: scope?.mode } })),
  });

/**
 * "For your account" recommendations, which belong to a research record
 * rather than a mode.
 *
 * @param record - the record whose recommendations to list; null or
 *   omitted for every record's
 * @returns the query options
 */
export const recommendationsQuery = (record?: string | null) =>
  queryOptions({
    queryKey: ["recommendations", { record: record ?? null }],
    queryFn: () =>
      parseResponse(api.recommendations.$get({ query: { record: record ?? undefined } })),
  });

/**
 * The power gate's brackets, lowest first: a team with `minRatioPct`% of
 * recommended power keeps `damagePct`% of its damage.
 *
 * @returns the query options
 */
export const powerBracketsQuery = () =>
  queryOptions({
    queryKey: ["power-brackets"],
    queryFn: () => parseResponse(api["power-brackets"].$get({ query: {} })),
  });

/**
 * Main-stage chapters in order, each by its last stage: boss, recommended
 * power, and accuracy and focus requirements.
 *
 * @returns the query options
 */
export const stageChaptersQuery = () =>
  queryOptions({
    queryKey: ["stage-chapters"],
    queryFn: () => parseResponse(api["stage-chapters"].$get({ query: {} })),
  });

/**
 * Dimensional Rift levels in order, each with its recommended power.
 *
 * @returns the query options
 */
export const riftLevelsQuery = () =>
  queryOptions({
    queryKey: ["rift-levels"],
    queryFn: () => parseResponse(api["rift-levels"].$get({ query: {} })),
  });

/**
 * Dimensional Rift seasons in order, each with the levels it runs and its dates.
 *
 * @returns the query options
 */
export const riftSeasonsQuery = () =>
  queryOptions({
    queryKey: ["rift-seasons"],
    queryFn: () => parseResponse(api["rift-seasons"].$get({ query: {} })),
  });

/**
 * What opens the Dimensional Rift: the main stage whose clear unlocks it,
 * with its sources; empty when no record states it.
 *
 * @returns the query options
 */
export const riftUnlocksQuery = () =>
  queryOptions({
    queryKey: ["rift-unlocks"],
    queryFn: () => parseResponse(api["rift-unlocks"].$get({ query: {} })),
  });

/**
 * The boss players report per Rift level, lowest level first.
 *
 * @returns the query options
 */
export const riftBossesQuery = () =>
  queryOptions({
    queryKey: ["rift-bosses"],
    queryFn: () => parseResponse(api["rift-bosses"].$get({ query: {} })),
  });

/**
 * What to bring per boss slot of each zone layout, in zone then slot order.
 *
 * @returns the query options
 */
export const stageZoneSlotsQuery = () =>
  queryOptions({
    queryKey: ["stage-zone-slots"],
    queryFn: () => parseResponse(api["stage-zone-slots"].$get({ query: {} })),
  });

/**
 * Documented stage attempts, furthest stage first, then lowest power first.
 *
 * @returns the query options
 */
export const stageClearsQuery = () =>
  queryOptions({
    queryKey: ["stage-clears"],
    queryFn: () => parseResponse(api["stage-clears"].$get({ query: {} })),
  });

/**
 * Documented Crumble Dungeon scores: the ones a screenshot or video shows,
 * highest score first, then the text-only claims in the same order.
 *
 * @returns the query options
 */
export const dungeonRunsQuery = () =>
  queryOptions({
    queryKey: ["dungeon-runs"],
    queryFn: () => parseResponse(api["dungeon-runs"].$get({ query: {} })),
  });

/**
 * Published Crumble Dungeon lineups, newest first.
 *
 * @returns the query options
 */
export const dungeonLineupsQuery = () =>
  queryOptions({
    queryKey: ["dungeon-lineups"],
    queryFn: () => parseResponse(api["dungeon-lineups"].$get({ query: {} })),
  });

/**
 * The cookies kept out of Crumble Dungeon's first wave, each with its
 * glossary English, reason and status.
 *
 * @returns the query options
 */
export const dungeonExclusionsQuery = () =>
  queryOptions({
    queryKey: ["dungeon-exclusions"],
    queryFn: () => parseResponse(api["dungeon-exclusions"].$get({ query: {} })),
  });

/**
 * Leaderboard rows in rank order.
 *
 * @param filter - restrict to one season and/or board
 * @returns the query options
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

/**
 * Each board and season's latest leaderboard capture.
 *
 * @returns the query options
 */
export const rankingSeasonsQuery = () =>
  queryOptions({
    queryKey: ["rankings", "seasons"],
    queryFn: () => parseResponse(api.rankings.seasons.$get()),
  });
