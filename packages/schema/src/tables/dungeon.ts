import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  DUNGEON_BOARD,
  EXCLUSION_CLASS,
  EXCLUSION_STATUS,
  RUN_EVIDENCE,
  RUN_STANDING,
} from "../enums";
import { recordSlugColumn } from "./columns";
import { decks } from "./decks";

/*
 * The Crumble Dungeon tables: documented scores, the published lineups
 * (the first 40 and what each leaves out) and the cookies players keep
 * out of the first 40. Every row is a research finding a record owns.
 */

/**
 * One documented Crumble Dungeon score: `scoreG` is the damage dealt, in
 * billions (G), and `totalPowerG` the power the screen shows, which is the
 * whole collection's, not a team's. `board` says what showed the score,
 * `serverRank` its place on that server's board, `timeLeftS` and
 * `cookiesLeft` what the result screen shows when the run ended, and
 * `standing` whether a screenshot or video shows it (read from `evidence`,
 * never given). `atkOrder`, `perks` and `preset` are as the post states
 * them; `slug` is the run's curated id.
 */
export const dungeonRuns = sqliteTable("dungeon_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  date: text("date").notNull(),
  player: text("player"),
  server: text("server"),
  scoreG: real("score_g").notNull(),
  totalPowerG: real("total_power_g"),
  board: text("board", { enum: DUNGEON_BOARD }).notNull(),
  serverRank: integer("server_rank"),
  timeLeftS: real("time_left_s"),
  cookiesLeft: integer("cookies_left"),
  evidence: text("evidence", { enum: RUN_EVIDENCE }).notNull(),
  standing: text("standing", { enum: RUN_STANDING }).notNull(),
  deckId: text("deck_id").references(() => decks.id, { onDelete: "set null" }),
  atkOrder: text("atk_order"),
  perks: text("perks"),
  preset: text("preset"),
  note: text("note"),
  recordSlug: recordSlugColumn(),
});

/**
 * One published Crumble Dungeon lineup: the cookies its author puts in the
 * first 40 (`first40`, in the author's order), the ones the author keeps
 * out (`excluded`), the ATK order from the top (`atkOrder`), all as Korean
 * names, and the rule the levels follow (`levelRule`). `complete` says the
 * author names every cookie of the first 40; `slug` is the lineup's
 * curated id; `deckId` the deck it documents, when there is one.
 */
export const dungeonLineups = sqliteTable("dungeon_lineups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  author: text("author").notNull(),
  date: text("date").notNull(),
  deckId: text("deck_id").references(() => decks.id, { onDelete: "set null" }),
  complete: integer("complete", { mode: "boolean" }).notNull(),
  first40: text("first40", { mode: "json" }).$type<string[]>().notNull(),
  excluded: text("excluded", { mode: "json" }).$type<string[]>().notNull(),
  atkOrder: text("atk_order", { mode: "json" }).$type<string[]>().notNull(),
  levelRule: text("level_rule").notNull(),
  recordSlug: recordSlugColumn(),
});

/**
 * A cookie players keep out of Crumble Dungeon's first 40 (`cookieKr`),
 * the kind of reason (`kind`), the reason itself (`why`) and where the
 * exclusion stands (`status`).
 */
export const dungeonExclusions = sqliteTable("dungeon_exclusions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cookieKr: text("cookie_kr").notNull(),
  kind: text("kind", { enum: EXCLUSION_CLASS }).notNull(),
  why: text("why").notNull(),
  status: text("status", { enum: EXCLUSION_STATUS }).notNull(),
  recordSlug: recordSlugColumn(),
});
