import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";
import { captureTool, evidencePath, isoDateTime, sha256Hex } from "./ledger";
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
export const nameList = z.array(z.string().min(1));

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

/** Insert schema for `record_modes`. */
export const recordModeInsert = createInsertSchema(t.recordModes);
/** Select schema for `record_modes`, mirroring the stored row shape. */
export const recordModeSelect = createSelectSchema(t.recordModes);
/** A row selected from `record_modes`. */
export type RecordModeRow = typeof t.recordModes.$inferSelect;

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

/** Insert schema for `mechanics`. `alsoTopics`, when given, is a list of non-empty topics. */
export const mechanicInsert = createInsertSchema(t.mechanics, {
  alsoTopics: () => nameList.optional(),
});
/** Select schema for `mechanics`, with `alsoTopics` typed precisely. */
export const mechanicSelect = createSelectSchema(t.mechanics, { alsoTopics: () => nameList });
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

/**
 * Insert schema for `fight_events`. `boss`, `event` and `detail` must be
 * non-empty; `tElapsed`, when present, must be non-negative.
 */
export const fightEventInsert = createInsertSchema(t.fightEvents, {
  boss: (s) => s.min(1),
  tElapsed: (s) => s.nonnegative().nullish(),
  event: (s) => s.min(1),
  detail: (s) => s.min(1),
});
/** Select schema for `fight_events`, mirroring the stored row shape. */
export const fightEventSelect = createSelectSchema(t.fightEvents);
/** A row selected from `fight_events`. */
export type FightEventRow = typeof t.fightEvents.$inferSelect;

/**
 * Insert schema for `buff_values`. `cookieKr` and `effectType` must be
 * non-empty; `skillGrade` and `fromStar` are integers 0-10; `maxStack`,
 * when present, is a positive integer.
 */
export const buffValueInsert = createInsertSchema(t.buffValues, {
  cookieKr: (s) => s.min(1),
  effectType: (s) => s.min(1),
  skillGrade: (s) => s.int().min(0).max(10),
  fromStar: (s) => s.int().min(0).max(10),
  maxStack: (s) => s.int().positive().nullish(),
});
/** Select schema for `buff_values`, mirroring the stored row shape. */
export const buffValueSelect = createSelectSchema(t.buffValues);
/** A row selected from `buff_values`. */
export type BuffValueRow = typeof t.buffValues.$inferSelect;

/**
 * Insert schema for `counters`. `slug` and both deck ids must be lowercase
 * slugs; `why` must be non-empty.
 */
export const counterInsert = createInsertSchema(t.counters, {
  slug: () => deckSlug,
  teamDeckId: () => deckSlug,
  beatenByDeckId: () => deckSlug,
  why: (s) => s.min(1),
});
/** Select schema for `counters`, mirroring the stored row shape. */
export const counterSelect = createSelectSchema(t.counters);
/** A row selected from `counters`. */
export type CounterRow = typeof t.counters.$inferSelect;

/** A percentage, 0-100. */
const percent = z.number().min(0).max(100);

/**
 * Insert schema for `usage_stats`. `subject` and `sample` must be
 * non-empty; `usagePct` and `confirmedPct` (when present) are 0-100;
 * `capturedAt` must be `YYYY-MM-DD`; `members`, when present, may be `null`
 * or a name list.
 */
export const usageStatInsert = createInsertSchema(t.usageStats, {
  subject: (s) => s.min(1),
  members: () => nameList.nullish(),
  usagePct: () => percent,
  confirmedPct: () => percent.nullish(),
  sample: (s) => s.min(1),
  capturedAt: () => isoDate,
});
/** Select schema for `usage_stats`, with `members` typed precisely. */
export const usageStatSelect = createSelectSchema(t.usageStats, {
  members: () => nameList.nullable(),
});
/** A row selected from `usage_stats`. */
export type UsageStatRow = typeof t.usageStats.$inferSelect;

/** A positive whole number, for chapters, levels and team power. */
const positiveInt = z.number().int().positive();

/**
 * Insert schema for `power_brackets`. `minRatioPct` is a non-negative
 * integer percent; `damagePct` a positive one; `label` non-empty.
 */
export const powerBracketInsert = createInsertSchema(t.powerBrackets, {
  minRatioPct: (s) => s.int().nonnegative(),
  damagePct: (s) => s.int().positive(),
  label: (s) => s.min(1),
});
/** Select schema for `power_brackets`, mirroring the stored row shape. */
export const powerBracketSelect = createSelectSchema(t.powerBrackets);
/** A row selected from `power_brackets`. */
export type PowerBracketRow = typeof t.powerBrackets.$inferSelect;

/**
 * Insert schema for `stage_chapters`. `chapter` and `recommendedPower` are
 * positive integers; `zoneIndex` is 1-8; the names are non-empty; the
 * accuracy and focus requirements are positive.
 */
export const stageChapterInsert = createInsertSchema(t.stageChapters, {
  chapter: () => positiveInt,
  zoneIndex: (s) => s.int().min(1).max(8),
  zone: (s) => s.min(1),
  lastStage: (s) => s.regex(/^\d+-\d+$/, "expected <chapter>-<stage>"),
  bossKr: (s) => s.min(1),
  recommendedPower: () => positiveInt,
  accuracyReq: (s) => s.positive(),
  focusReq: (s) => s.positive(),
});
/** Select schema for `stage_chapters`, mirroring the stored row shape. */
export const stageChapterSelect = createSelectSchema(t.stageChapters);
/** A row selected from `stage_chapters`. */
export type StageChapterRow = typeof t.stageChapters.$inferSelect;

/** Insert schema for `rift_levels`. `level` and `recommendedPower` are positive integers. */
export const riftLevelInsert = createInsertSchema(t.riftLevels, {
  level: () => positiveInt,
  recommendedPower: () => positiveInt,
});
/** Select schema for `rift_levels`, mirroring the stored row shape. */
export const riftLevelSelect = createSelectSchema(t.riftLevels);
/** A row selected from `rift_levels`. */
export type RiftLevelRow = typeof t.riftLevels.$inferSelect;

/**
 * Insert schema for `rift_seasons`. `season` and both levels are positive
 * integers; both instants are ISO 8601 date-times.
 */
export const riftSeasonInsert = createInsertSchema(t.riftSeasons, {
  season: () => positiveInt,
  firstLevel: () => positiveInt,
  lastLevel: () => positiveInt,
  startsAt: () => z.iso.datetime(),
  endsAt: () => z.iso.datetime(),
});
/** Select schema for `rift_seasons`, mirroring the stored row shape. */
export const riftSeasonSelect = createSelectSchema(t.riftSeasons);
/** A row selected from `rift_seasons`. */
export type RiftSeasonRow = typeof t.riftSeasons.$inferSelect;

/** Insert schema for `rift_unlocks`. `stage` is a `<chapter>-<stage>` label. */
export const riftUnlockInsert = createInsertSchema(t.riftUnlocks, {
  stage: (s) => s.regex(/^\d+-\d+$/, "expected <chapter>-<stage>"),
});
/** Select schema for `rift_unlocks`, mirroring the stored row shape. */
export const riftUnlockSelect = createSelectSchema(t.riftUnlocks);
/** A row selected from `rift_unlocks`. */
export type RiftUnlockRow = typeof t.riftUnlocks.$inferSelect;

/**
 * Insert schema for `stage_zone_slots`. `zoneIndex` is 1-8; `position` a
 * non-negative integer; the names, `stage` and `plan` are non-empty;
 * `deckId`, when present, is a lowercase slug.
 */
export const stageZoneSlotInsert = createInsertSchema(t.stageZoneSlots, {
  zoneIndex: (s) => s.int().min(1).max(8),
  zoneKr: (s) => s.min(1),
  zoneEn: (s) => s.min(1),
  position: (s) => s.int().nonnegative(),
  stage: (s) => s.min(1),
  bossKr: (s) => s.min(1),
  plan: (s) => s.min(1),
  deckId: () => deckSlug.nullish(),
});
/** Select schema for `stage_zone_slots`, mirroring the stored row shape. */
export const stageZoneSlotSelect = createSelectSchema(t.stageZoneSlots);
/** A row selected from `stage_zone_slots`. */
export type StageZoneSlotRow = typeof t.stageZoneSlots.$inferSelect;

/**
 * Insert schema for `stage_clears`. `chapter`, `stageNo` and `bracket` are
 * positive integers; `teamPower` is non-empty; `powerG`, when present, is
 * positive; `recommendedPower`, when present, a positive integer;
 * `deckId`, when present, a lowercase slug.
 */
export const stageClearInsert = createInsertSchema(t.stageClears, {
  chapter: () => positiveInt,
  stageNo: () => positiveInt,
  bossKr: (s) => s.min(1),
  teamPower: (s) => s.min(1),
  powerG: (s) => s.positive().nullish(),
  recommendedPower: () => positiveInt.nullish(),
  bracket: (s) => s.int().positive(),
  deckId: () => deckSlug.nullish(),
});
/** Select schema for `stage_clears`, mirroring the stored row shape. */
export const stageClearSelect = createSelectSchema(t.stageClears);
/** A row selected from `stage_clears`. */
export type StageClearRow = typeof t.stageClears.$inferSelect;

/** Insert schema for `rift_bosses`. `level` is a positive integer; `bossKr` non-empty. */
export const riftBossInsert = createInsertSchema(t.riftBosses, {
  level: () => positiveInt,
  bossKr: (s) => s.min(1),
});
/** Select schema for `rift_bosses`, mirroring the stored row shape. */
export const riftBossSelect = createSelectSchema(t.riftBosses);
/** A row selected from `rift_bosses`. */
export type RiftBossRow = typeof t.riftBosses.$inferSelect;

/** Insert schema for `citations`. */
export const citationInsert = createInsertSchema(t.citations);
/** Select schema for `citations`, mirroring the stored row shape. */
export const citationSelect = createSelectSchema(t.citations);
/** A row selected from `citations`. */
export type CitationRow = typeof t.citations.$inferSelect;

/** A row selected from `fact_claims`. */
export type FactClaimRow = typeof t.factClaims.$inferSelect;

/**
 * Insert schema for `captures`. `path` is record-relative under
 * `evidence/`; `capturedAt` is ISO 8601 with an offset; `tool` is a
 * {@link captureTool}; `sha256` is a lowercase hex digest.
 */
export const captureInsert = createInsertSchema(t.captures, {
  recordSlug: (s) => s.min(1),
  path: () => evidencePath,
  url: (s) => s.min(1).nullish(),
  capturedAt: () => isoDateTime,
  tool: () => captureTool,
  sha256: () => sha256Hex,
});
/** Select schema for `captures`, mirroring the stored row shape. */
export const captureSelect = createSelectSchema(t.captures);
/** A row selected from `captures`. */
export type CaptureRow = typeof t.captures.$inferSelect;
