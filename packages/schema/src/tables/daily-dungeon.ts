import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { DUNGEON_AUTO, RUN_EVIDENCE } from "../enums";
import { recordSlugColumn } from "./columns";
import { decks } from "./decks";

/*
 * The daily dungeon tables (일일던전): each dungeon's entry, boss and top
 * stage, a daily dungeon deck's run facts, and the documented clears.
 * Every row is a research finding a record owns; a deck's run facts are
 * its child rows.
 */

/**
 * One daily dungeon, by its curated id (`slug`, e.g. `exp`): its names,
 * what it drops, how entry works (`entryKeys` as the record words it,
 * `ticketBackOnLoss` whether a lost run returns its ticket, `quickClear`
 * whether a cleared stage can be swept, `entryNote` what the record adds),
 * its boss (`bossElement`, `bossWeakness`, `bossRotates` whether the boss
 * or its element changes, `bossRotation` how), the highest stage the
 * record found cleared (`topStage`, on `topStageDate`, shown by the source
 * `topStageSource`), and short `notes`. Every boolean is `null` when the
 * record doesn't know. `position` is the dungeon's place in the record's
 * list.
 */
export const dailyDungeons = sqliteTable("daily_dungeons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  position: integer("position").notNull(),
  nameEn: text("name_en").notNull(),
  nameKr: text("name_kr"),
  drops: text("drops", { mode: "json" }).$type<string[]>().notNull(),
  entryKeys: text("entry_keys"),
  ticketBackOnLoss: integer("ticket_back_on_loss", { mode: "boolean" }),
  quickClear: integer("quick_clear", { mode: "boolean" }),
  entryNote: text("entry_note"),
  bossKr: text("boss_kr"),
  bossEn: text("boss_en"),
  bossElement: text("boss_element"),
  bossWeakness: text("boss_weakness"),
  bossRotates: integer("boss_rotates", { mode: "boolean" }),
  bossRotation: text("boss_rotation"),
  topStage: integer("top_stage"),
  topStageDate: text("top_stage_date"),
  topStageSource: text("top_stage_source"),
  notes: text("notes", { mode: "json" }).$type<string[]>().notNull(),
  recordSlug: recordSlugColumn(),
});

/**
 * A daily dungeon deck's run facts, one row per deck: the dungeon it runs
 * (`dungeon`, a daily dungeon's slug), how far it plays itself (`auto`),
 * the stage it reached, the team power as posted (`power`, verbatim) and
 * read as billions (`powerG`, `null` when the post gives no figure), the
 * stage's recommended power the same way (`recommendedPower`,
 * `recommendedPowerG`), the gear preset it runs (`gearPreset`), and its
 * captain (`captainKr`, one of its cookies). The deck's own row holds
 * everything else, its mercenary perks (복지) as `perks` among it.
 */
export const deckDailyDungeons = sqliteTable("deck_daily_dungeons", {
  deckId: text("deck_id")
    .primaryKey()
    .references(() => decks.id, { onDelete: "cascade" }),
  dungeon: text("dungeon").notNull(),
  auto: text("auto", { enum: DUNGEON_AUTO }).notNull(),
  stage: integer("stage"),
  power: text("power"),
  powerG: real("power_g"),
  recommendedPower: text("recommended_power"),
  recommendedPowerG: real("recommended_power_g"),
  gearPreset: text("gear_preset"),
  captainKr: text("captain_kr"),
});

/**
 * One documented daily dungeon clear: the dungeon (a daily dungeon's
 * slug), the stage cleared, the team power as posted (`power`, verbatim)
 * and read as billions (`powerG`), the deck when the lineup matches one,
 * how far it played itself (`null` when the post doesn't say), when, who,
 * and what backs it.
 */
export const dailyDungeonClears = sqliteTable("daily_dungeon_clears", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dungeon: text("dungeon").notNull(),
  stage: integer("stage").notNull(),
  power: text("power"),
  powerG: real("power_g"),
  deckId: text("deck_id").references(() => decks.id, { onDelete: "set null" }),
  auto: text("auto", { enum: DUNGEON_AUTO }),
  date: text("date").notNull(),
  player: text("player"),
  evidence: text("evidence", { enum: RUN_EVIDENCE }).notNull(),
  note: text("note"),
  recordSlug: recordSlugColumn(),
});
