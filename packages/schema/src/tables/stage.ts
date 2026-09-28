import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { CLEAR_EVIDENCE, CLEAR_PLAY, CLEAR_RESULT, CLEAR_STANDING, STAGE_ERA } from "../enums";
import { recordSlugColumn } from "./columns";
import { decks } from "./decks";

/*
 * The stage-pushing tables. Power brackets, stage chapters, Rift levels and
 * Rift seasons are game facts: no research record owns them (they have no
 * `record_slug`), so a record's re-import never clears them, and a record
 * that loads a fact already stored must agree with it. Zone slots, clears
 * and Rift bosses are research findings a record owns.
 */

/**
 * One step of the power gate: a team whose power is at least
 * `minRatioPct`% of a stage's recommended power keeps `damagePct`% of its
 * final damage, up to the next step. `label` is the game's own wording.
 */
export const powerBrackets = sqliteTable(
  "power_brackets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    minRatioPct: integer("min_ratio_pct").notNull(),
    damagePct: integer("damage_pct").notNull(),
    label: text("label").notNull(),
  },
  (t) => [uniqueIndex("power_brackets_min_ratio_pct_uq").on(t.minRatioPct)],
);

/**
 * One main-stage chapter, by its last stage (`<chapter>-30`): that stage's
 * boss, recommended team power, and accuracy and focus requirements.
 * `zoneIndex` is the zone layout the chapter repeats, 1-8.
 */
export const stageChapters = sqliteTable(
  "stage_chapters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    chapter: integer("chapter").notNull(),
    zoneIndex: integer("zone_index").notNull(),
    zone: text("zone").notNull(),
    lastStage: text("last_stage").notNull(),
    bossKr: text("boss_kr").notNull(),
    bossEn: text("boss_en"),
    recommendedPower: integer("recommended_power").notNull(),
    accuracyReq: real("accuracy_req").notNull(),
    focusReq: real("focus_req").notNull(),
  },
  (t) => [uniqueIndex("stage_chapters_chapter_uq").on(t.chapter)],
);

/** One Dimensional Rift level and its recommended team power. */
export const riftLevels = sqliteTable(
  "rift_levels",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    level: integer("level").notNull(),
    recommendedPower: integer("recommended_power").notNull(),
  },
  (t) => [uniqueIndex("rift_levels_level_uq").on(t.level)],
);

/**
 * One Dimensional Rift season: the levels it runs, `firstLevel` to
 * `lastLevel`, from `startsAt` to `endsAt` (ISO 8601 instants).
 */
export const riftSeasons = sqliteTable(
  "rift_seasons",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    season: integer("season").notNull(),
    firstLevel: integer("first_level").notNull(),
    lastLevel: integer("last_level").notNull(),
    startsAt: text("starts_at").notNull(),
    endsAt: text("ends_at").notNull(),
  },
  (t) => [uniqueIndex("rift_seasons_season_uq").on(t.season)],
);

/**
 * What to bring to one boss slot of a zone layout: `stage` names the slot
 * within a chapter (`-10`, `-20/-30`, `mob stages`), `plan` the swaps and
 * play, `deckId` the deck the plan starts from, and `bracketNote` how low a
 * bracket the slot has been cleared at. `position` orders a zone's slots.
 */
export const stageZoneSlots = sqliteTable("stage_zone_slots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  zoneIndex: integer("zone_index").notNull(),
  zoneKr: text("zone_kr").notNull(),
  zoneEn: text("zone_en").notNull(),
  position: integer("position").notNull(),
  stage: text("stage").notNull(),
  bossKr: text("boss_kr").notNull(),
  bossEn: text("boss_en"),
  plan: text("plan").notNull(),
  deckId: text("deck_id").references(() => decks.id, { onDelete: "set null" }),
  bracketNote: text("bracket_note"),
  recordSlug: recordSlugColumn(),
});

/**
 * One documented stage attempt at `<chapter>-<stageNo>`, against `bossKr`
 * (`bossEn` when the record names it in English): the team power as
 * posted (`teamPower`, verbatim) and read as billions (`powerG`, `null`
 * when the post gives no figure), the stage's recommended power when the
 * post is from after the easing, the damage bracket (`bracket`, the kept
 * damage %), how it ended, how it was played (`null` when unknown), what
 * backs it, whether the record accepts it (`standing`; a row written
 * through the API starts `unverified`), and the deck when the lineup
 * matches one.
 */
export const stageClears = sqliteTable("stage_clears", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chapter: integer("chapter").notNull(),
  stageNo: integer("stage_no").notNull(),
  bossKr: text("boss_kr").notNull(),
  bossEn: text("boss_en"),
  era: text("era", { enum: STAGE_ERA }).notNull(),
  teamPower: text("team_power").notNull(),
  powerG: real("power_g"),
  recommendedPower: integer("recommended_power"),
  bracket: integer("bracket").notNull(),
  result: text("result", { enum: CLEAR_RESULT }).notNull(),
  play: text("play", { enum: CLEAR_PLAY }),
  evidence: text("evidence", { enum: CLEAR_EVIDENCE }).notNull(),
  standing: text("standing", { enum: CLEAR_STANDING }).notNull().default("unverified"),
  deckId: text("deck_id").references(() => decks.id, { onDelete: "set null" }),
  note: text("note"),
  recordSlug: recordSlugColumn(),
});

/** The boss players report at one Dimensional Rift level, with what they said about it. */
export const riftBosses = sqliteTable("rift_bosses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  level: integer("level").notNull(),
  bossKr: text("boss_kr").notNull(),
  bossEn: text("boss_en"),
  note: text("note"),
  recordSlug: recordSlugColumn(),
});
