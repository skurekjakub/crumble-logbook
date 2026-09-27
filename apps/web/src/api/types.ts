/**
 * Response row types, inferred from the server's routes through the typed
 * client, so they track the API without a hand-written copy.
 */
import type { InferResponseType } from "hono/client";
import type { api } from "./client";

/** A research record: slug, question, status, dates, season label, lede, caveat. */
export type ResearchRecord = InferResponseType<(typeof api.records)[":slug"]["$get"], 200>;

/** A source: id, site, url, title, titleEn, date, relevance, note, summaryEn, capturePath. */
export type Source = InferResponseType<typeof api.sources.$get, 200>[number];

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
