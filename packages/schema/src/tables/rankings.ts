import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { RANKING_BOARD } from "../enums";
import { sources } from "./sources";

/** A single leaderboard entry captured at a point in time. */
export const rankings = sqliteTable(
  "rankings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    season: integer("season"),
    board: text("board", { enum: RANKING_BOARD }).notNull(),
    rank: integer("rank").notNull(),
    name: text("name").notNull(),
    guild: text("guild"),
    valueG: real("value_g").notNull(),
    powerG: real("power_g"),
    ref: text("ref"),
    capturedAt: text("captured_at").notNull(),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id),
  },
  (t) => [
    uniqueIndex("rankings_board_season_rank_captured_at_uq").on(
      t.board,
      t.season,
      t.rank,
      t.capturedAt,
    ),
  ],
);
