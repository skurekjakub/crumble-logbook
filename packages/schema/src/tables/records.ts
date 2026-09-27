import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { RECORD_STATUS } from "../enums";

/** A research record: one investigated question and the findings tied to it. */
export const researchRecords = sqliteTable("research_records", {
  slug: text("slug").primaryKey(),
  question: text("question").notNull(),
  status: text("status", { enum: RECORD_STATUS }).notNull(),
  startedAt: text("started_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  seasonLabel: text("season_label"),
  lede: text("lede"),
  caveat: text("caveat"),
});
