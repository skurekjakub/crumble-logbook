import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { CONFIDENCE } from "../enums";

/** A game mechanic writeup with an assigned confidence level. */
export const mechanics = sqliteTable("mechanics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  confidence: text("confidence", { enum: CONFIDENCE }).notNull(),
});

/** A source of run-to-run randomness and how to mitigate it. */
export const rngFactors = sqliteTable("rng_factors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  factor: text("factor").notNull(),
  effect: text("effect").notNull(),
  mitigation: text("mitigation"),
});

/** A dated event on the meta's timeline. */
export const timeline = sqliteTable("timeline", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  event: text("event").notNull(),
});

/** A ranked, one-line takeaway from a research record. */
export const takeaways = sqliteTable("takeaways", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  position: integer("position").notNull(),
  text: text("text").notNull(),
  detail: text("detail"),
});
