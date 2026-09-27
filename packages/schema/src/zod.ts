import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";
import * as t from "./tables";

/**
 * ISO calendar date, `YYYY-MM-DD`. Rejects anything else, including a full
 * timestamp.
 */
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

/** A citable source id: `<site>:<key>`, e.g. `dc:76135`. */
export const sourceId = z.string().regex(/^(dc|nv|web):.+$/, "expected <site>:<key>");

/** A deck id: a lowercase, hyphen-separated slug. */
export const deckSlug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "expected a lowercase slug");

/** A non-empty list of non-empty strings, used for json string-array columns. */
const nameList = z.array(z.string().min(1));

/**
 * Insert schema for `sources`. `id` must be `<site>:<key>`; `date`, when
 * present, must be `YYYY-MM-DD`; `relevance`, when present, is an integer
 * 0-3.
 */
export const sourceInsert = createInsertSchema(t.sources, {
  id: () => sourceId,
  url: (s) => s.min(1),
  date: () => isoDate.nullish(),
  relevance: (s) => s.int().min(0).max(3).nullish(),
});
/** Select schema for `sources`, mirroring the stored row shape. */
export const sourceSelect = createSelectSchema(t.sources);
/** A row selected from `sources`. */
export type SourceRow = typeof t.sources.$inferSelect;

/** Insert schema for `research_records`. */
export const researchRecordInsert = createInsertSchema(t.researchRecords);
/** Select schema for `research_records`, mirroring the stored row shape. */
export const researchRecordSelect = createSelectSchema(t.researchRecords);
/** A row selected from `research_records`. */
export type ResearchRecordRow = typeof t.researchRecords.$inferSelect;

/**
 * Insert schema for `glossary`. `kr` must be non-empty; `shorthand` and
 * `extra` are optional on insert (both have a runtime default).
 */
export const glossaryInsert = createInsertSchema(t.glossary, {
  kr: (s) => s.min(1),
  shorthand: () => nameList.optional(),
  extra: () => z.record(z.string(), z.unknown()).optional(),
});
/** Select schema for `glossary`, with `shorthand`/`extra` typed precisely. */
export const glossarySelect = createSelectSchema(t.glossary, {
  shorthand: () => nameList,
  extra: () => z.record(z.string(), z.unknown()),
});
/** A row selected from `glossary`. */
export type GlossaryRow = typeof t.glossary.$inferSelect;

/**
 * Insert schema for `decks`. `id` must be a lowercase slug; `nameEn` must be
 * non-empty; `atkOrder`, when present, may be `null` or a name list.
 */
export const deckInsert = createInsertSchema(t.decks, {
  id: () => deckSlug,
  nameEn: (s) => s.min(1),
  atkOrder: () => nameList.nullish(),
});
/** Select schema for `decks`, with `atkOrder` typed precisely. */
export const deckSelect = createSelectSchema(t.decks, {
  atkOrder: () => nameList.nullable(),
});
/** A row selected from `decks`. */
export type DeckRow = typeof t.decks.$inferSelect;

/** Insert schema for `deck_cookies`. `cookieKr` and `why` must be non-empty. */
export const deckCookieInsert = createInsertSchema(t.deckCookies, {
  cookieKr: (s) => s.min(1),
  why: (s) => s.min(1),
});
/** Select schema for `deck_cookies`, mirroring the stored row shape. */
export const deckCookieSelect = createSelectSchema(t.deckCookies);
/** A row selected from `deck_cookies`. */
export type DeckCookieRow = typeof t.deckCookies.$inferSelect;

/** Insert schema for `deck_pets`. */
export const deckPetInsert = createInsertSchema(t.deckPets);
/** Select schema for `deck_pets`, mirroring the stored row shape. */
export const deckPetSelect = createSelectSchema(t.deckPets);
/** A row selected from `deck_pets`. */
export type DeckPetRow = typeof t.deckPets.$inferSelect;

/** Insert schema for `deck_notes`. */
export const deckNoteInsert = createInsertSchema(t.deckNotes);
/** Select schema for `deck_notes`, mirroring the stored row shape. */
export const deckNoteSelect = createSelectSchema(t.deckNotes);
/** A row selected from `deck_notes`. */
export type DeckNoteRow = typeof t.deckNotes.$inferSelect;

/** Insert schema for `rune_builds`. */
export const runeBuildInsert = createInsertSchema(t.runeBuilds);
/** Select schema for `rune_builds`, mirroring the stored row shape. */
export const runeBuildSelect = createSelectSchema(t.runeBuilds);
/** A row selected from `rune_builds`. */
export type RuneBuildRow = typeof t.runeBuilds.$inferSelect;

/** Insert schema for `rune_build_decks`. */
export const runeBuildDeckInsert = createInsertSchema(t.runeBuildDecks);
/** Select schema for `rune_build_decks`, mirroring the stored row shape. */
export const runeBuildDeckSelect = createSelectSchema(t.runeBuildDecks);
/** A row selected from `rune_build_decks`. */
export type RuneBuildDeckRow = typeof t.runeBuildDecks.$inferSelect;

/** Insert schema for `gear_recs`. */
export const gearRecInsert = createInsertSchema(t.gearRecs);
/** Select schema for `gear_recs`, mirroring the stored row shape. */
export const gearRecSelect = createSelectSchema(t.gearRecs);
/** A row selected from `gear_recs`. */
export type GearRecRow = typeof t.gearRecs.$inferSelect;

/**
 * Insert schema for `scores`. `damageG` must be positive; `powerG`, when
 * present, must be positive; `date`, when present, must be `YYYY-MM-DD`;
 * `season`, when present, must be a positive integer.
 */
export const scoreInsert = createInsertSchema(t.scores, {
  damageG: (s) => s.positive(),
  powerG: (s) => s.positive().nullish(),
  date: () => isoDate.nullish(),
  season: (s) => s.int().positive().nullish(),
});
/** Select schema for `scores`, mirroring the stored row shape. */
export const scoreSelect = createSelectSchema(t.scores);
/** A row selected from `scores`. */
export type ScoreRow = typeof t.scores.$inferSelect;

/** Insert schema for `rankings`. `capturedAt` must be non-empty. */
export const rankingInsert = createInsertSchema(t.rankings, {
  capturedAt: (s) => s.min(1),
});
/** Select schema for `rankings`, mirroring the stored row shape. */
export const rankingSelect = createSelectSchema(t.rankings);
/** A row selected from `rankings`. */
export type RankingRow = typeof t.rankings.$inferSelect;

/** Insert schema for `mechanics`. */
export const mechanicInsert = createInsertSchema(t.mechanics);
/** Select schema for `mechanics`, mirroring the stored row shape. */
export const mechanicSelect = createSelectSchema(t.mechanics);
/** A row selected from `mechanics`. */
export type MechanicRow = typeof t.mechanics.$inferSelect;

/** Insert schema for `rng_factors`. */
export const rngFactorInsert = createInsertSchema(t.rngFactors);
/** Select schema for `rng_factors`, mirroring the stored row shape. */
export const rngFactorSelect = createSelectSchema(t.rngFactors);
/** A row selected from `rng_factors`. */
export type RngFactorRow = typeof t.rngFactors.$inferSelect;

/** Insert schema for `timeline`. `date` must be `YYYY-MM-DD`. */
export const timelineEventInsert = createInsertSchema(t.timeline, {
  date: () => isoDate,
});
/** Select schema for `timeline`, mirroring the stored row shape. */
export const timelineEventSelect = createSelectSchema(t.timeline);
/** A row selected from `timeline`. */
export type TimelineEventRow = typeof t.timeline.$inferSelect;

/** Insert schema for `takeaways`. */
export const takeawayInsert = createInsertSchema(t.takeaways);
/** Select schema for `takeaways`, mirroring the stored row shape. */
export const takeawaySelect = createSelectSchema(t.takeaways);
/** A row selected from `takeaways`. */
export type TakeawayRow = typeof t.takeaways.$inferSelect;

/** Insert schema for `recommendations`. `changes` must have at least one entry. */
export const recommendationInsert = createInsertSchema(t.recommendations, {
  changes: () => nameList.min(1),
});
/** Select schema for `recommendations`, with `changes` typed precisely. */
export const recommendationSelect = createSelectSchema(t.recommendations, {
  changes: () => nameList.min(1),
});
/** A row selected from `recommendations`. */
export type RecommendationRow = typeof t.recommendations.$inferSelect;

/** Insert schema for `citations`. */
export const citationInsert = createInsertSchema(t.citations);
/** Select schema for `citations`, mirroring the stored row shape. */
export const citationSelect = createSelectSchema(t.citations);
/** A row selected from `citations`. */
export type CitationRow = typeof t.citations.$inferSelect;

/**
 * Insert schema for `jobs`. `params` accepts any JSON-serializable value;
 * `log` is optional on insert (it has a runtime default).
 */
export const jobInsert = createInsertSchema(t.jobs, {
  params: () => z.unknown(),
  log: () => z.array(z.string()).optional(),
});
/** Select schema for `jobs`, with `params`/`log` typed precisely. */
export const jobSelect = createSelectSchema(t.jobs, {
  params: () => z.unknown(),
  log: () => z.array(z.string()),
});
/** A row selected from `jobs`. */
export type JobRow = typeof t.jobs.$inferSelect;
