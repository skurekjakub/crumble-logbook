import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { GAME_MODE, RECORD_STATUS } from "../enums";
import { modeColumn } from "./columns";

/**
 * A research record: one investigated question and the findings tied to it.
 * `mode` is the game mode it's filed under; a record covering several modes
 * lists each in `record_modes`.
 */
export const researchRecords = sqliteTable("research_records", {
  slug: text("slug").primaryKey(),
  question: text("question").notNull(),
  status: text("status", { enum: RECORD_STATUS }).notNull(),
  startedAt: text("started_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  seasonLabel: text("season_label"),
  lede: text("lede"),
  caveat: text("caveat"),
  mode: modeColumn(),
});

/** One game mode a research record covers, with that mode's own lede and caveat. */
export const recordModes = sqliteTable(
  "record_modes",
  {
    recordSlug: text("record_slug")
      .notNull()
      .references(() => researchRecords.slug, { onDelete: "cascade" }),
    mode: text("mode", { enum: GAME_MODE }).notNull(),
    lede: text("lede"),
    caveat: text("caveat"),
  },
  (t) => [primaryKey({ columns: [t.recordSlug, t.mode] })],
);
