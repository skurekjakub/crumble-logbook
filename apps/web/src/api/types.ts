/**
 * Response row types, inferred from the server's routes through the typed
 * client, so they track the API without a hand-written copy.
 */
import type { InferResponseType } from "hono/client";
import type { api } from "./client";

/**
 * A research record: slug, question, status, dates, season label, lede,
 * caveat, the mode it's filed under, and the modes it covers.
 */
export type ResearchRecord = InferResponseType<(typeof api.records)[":slug"]["$get"], 200>;

/**
 * A source: id, site, url, title, titleEn, date, relevance, note, summaryEn,
 * capturePath, the records it belongs to, and its capture's ledger stamp.
 */
export type Source = InferResponseType<typeof api.sources.$get, 200>[number];

/** One capture-ledger line of a loaded record: path, URL, time, tool, approximation and hash. */
export type Capture = InferResponseType<typeof api.captures.$get, 200>[number];

/** A glossary entry: kr, shorthand, en, kind and game attributes. */
export type GlossaryEntry = InferResponseType<typeof api.glossary.$get, 200>[number];

/** A deck with cookies (`en` resolved), pets and `atkOrder` as name refs, notes and sources. */
export type Deck = InferResponseType<typeof api.decks.$get, 200>[number];

/** One cookie slot of a {@link Deck}. */
export type DeckCookie = Deck["cookies"][number];

/** A Korean name with its English gloss, or `en: null` when unresolved. */
export type NameRef = Deck["pets"][number];

/** A score with its sources and 배 `ratio`. */
export type Score = InferResponseType<typeof api.scores.$get, 200>[number];

/** A rune build with the cookie's `en`, the decks it applies to, and sources. */
export type RuneBuild = InferResponseType<(typeof api)["rune-builds"]["$get"], 200>[number];

/** A gear substat recommendation. */
export type GearRec = InferResponseType<(typeof api)["gear-recs"]["$get"], 200>[number];

/** A boss fight event: `tElapsed` in seconds since the fight began (null when off the clock), its confidence and sources. */
export type FightEvent = InferResponseType<(typeof api)["fight-events"]["$get"], 200>[number];

/** One skill grade's buff (or debuff chance) value for a cookie, with the cookie's `en` and sources. */
export type BuffValue = InferResponseType<(typeof api)["buff-values"]["$get"], 200>[number];

/** A mechanic with its confidence. */
export type Mechanic = InferResponseType<typeof api.mechanics.$get, 200>[number];

/** An RNG factor with its mitigation. */
export type RngFactor = InferResponseType<(typeof api)["rng-factors"]["$get"], 200>[number];

/** A dated timeline event. */
export type TimelineEvent = InferResponseType<typeof api.timeline.$get, 200>[number];

/** A takeaway for the overview. */
export type Takeaway = InferResponseType<typeof api.takeaways.$get, 200>[number];

/** A "for your account" recommendation. */
export type Recommendation = InferResponseType<typeof api.recommendations.$get, 200>[number];

/** A leaderboard row. */
export type Ranking = InferResponseType<typeof api.rankings.$get, 200>[number];

/** One game mode a {@link ResearchRecord} covers, with its lede and caveat. */
export type RecordMode = ResearchRecord["modes"][number];

/**
 * A directed counter edge: `teamDeckId` is beaten by `beatenByDeckId`, under
 * `conditions`, because of `why`, with a confidence and sources.
 */
export type Counter = InferResponseType<typeof api.counters.$get, 200>[number];

/** A usage figure: a subject's share of a dated sample, with its `en` gloss and sources. */
export type UsageStat = InferResponseType<typeof api.usage.$get, 200>[number];

/** A power-gate bracket: `minRatioPct`% of recommended power keeps `damagePct`% of damage; with sources. */
export type PowerBracket = InferResponseType<(typeof api)["power-brackets"]["$get"], 200>[number];

/** A main-stage chapter, by its last stage: boss, recommended power, requirements and sources. */
export type StageChapter = InferResponseType<(typeof api)["stage-chapters"]["$get"], 200>[number];

/** A Dimensional Rift level with its recommended power and sources. */
export type RiftLevel = InferResponseType<(typeof api)["rift-levels"]["$get"], 200>[number];

/** A Dimensional Rift season: the levels it runs, its dates and sources. */
export type RiftSeason = InferResponseType<(typeof api)["rift-seasons"]["$get"], 200>[number];

/** The main stage whose clear opens the Dimensional Rift, with its sources. */
export type RiftUnlock = InferResponseType<(typeof api)["rift-unlocks"]["$get"], 200>[number];

/** The boss players report at a Rift level, with a note and sources. */
export type RiftBoss = InferResponseType<(typeof api)["rift-bosses"]["$get"], 200>[number];

/** One boss slot of a zone layout: the plan, its deck, how low a bracket it was cleared at, and sources. */
export type StageZoneSlot = InferResponseType<
  (typeof api)["stage-zone-slots"]["$get"],
  200
>[number];

/** A documented stage attempt, with the boss's `en` gloss and sources. */
export type StageClear = InferResponseType<(typeof api)["stage-clears"]["$get"], 200>[number];

/**
 * A documented Crumble Dungeon score: score and total power in G, what
 * showed it, what backs it and whether that shows it (`standing`), with sources.
 */
export type DungeonRun = InferResponseType<(typeof api)["dungeon-runs"]["$get"], 200>[number];

/** A published Crumble Dungeon lineup: its first wave, exclusions, ATK order and level rule, with sources. */
export type DungeonLineup = InferResponseType<(typeof api)["dungeon-lineups"]["$get"], 200>[number];

/**
 * A system that raises displayed team power: what it raises, where it
 * counts, its materials and cost type, cap, posted gains, efficiency by
 * account stage and sources.
 */
export type PowerSource = InferResponseType<(typeof api)["power-sources"]["$get"], 200>[number];

/** A team-power figure: how it is known, the power before and after, the change, cost and sources. */
export type PowerDataPoint = InferResponseType<
  (typeof api)["power-data-points"]["$get"],
  200
>[number];

/** A shop package: its prices, what it feeds, its Crystal value, verdict, spender tier and sources. */
export type ShopPackage = InferResponseType<typeof api.packages.$get, 200>[number];

/** A KRW price and the USD price the stores pair it with. */
export type PriceTier = InferResponseType<(typeof api)["price-tiers"]["$get"], 200>[number];

/** A spending order: an account stage's or a ranked one, with its label, note and sources. */
export type SpendingOrder = InferResponseType<(typeof api)["spending-orders"]["$get"], 200>[number];

/** A step of a spending order: its route, place, target, basis, why and sources. */
export type SpendingStep = InferResponseType<(typeof api)["spending-steps"]["$get"], 200>[number];

/** A power source's cost or return curve, as a table with its sources. */
export type GrowthCurve = InferResponseType<(typeof api)["growth-curves"]["$get"], 200>[number];

/** A step the power planner weighs: its power source, the data point of its gain, and its basis. */
export type PlannerStep = InferResponseType<(typeof api)["planner-steps"]["$get"], 200>[number];

/** A cookie kept out of Crumble Dungeon's first wave, with its `en` gloss, reason, status and sources. */
export type DungeonExclusion = InferResponseType<
  (typeof api)["dungeon-exclusions"]["$get"],
  200
>[number];
