import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { CONFIDENCE } from "../enums";
import { modeColumn, recordSlugColumn } from "./columns";

/**
 * A game mechanic writeup with an assigned confidence level. `topic` groups
 * writeups of one kind, e.g. `rules` for a mode's rules; `null` for none.
 * `alsoTopics` files it under further topics it bears on, e.g. a power-gate
 * point that holds in the Rift too.
 */
export const mechanics = sqliteTable("mechanics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  confidence: text("confidence", { enum: CONFIDENCE }).notNull(),
  mode: modeColumn(),
  topic: text("topic"),
  alsoTopics: text("also_topics", { mode: "json" }).$type<string[]>().notNull().default([]),
  recordSlug: recordSlugColumn(),
});

/** A source of run-to-run randomness and how to mitigate it. */
export const rngFactors = sqliteTable("rng_factors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  factor: text("factor").notNull(),
  effect: text("effect").notNull(),
  mitigation: text("mitigation"),
  mode: modeColumn(),
  recordSlug: recordSlugColumn(),
});

/** A dated event on the meta's timeline. */
export const timeline = sqliteTable("timeline", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  event: text("event").notNull(),
  mode: modeColumn(),
  recordSlug: recordSlugColumn(),
});

/** A ranked, one-line takeaway from a research record. */
export const takeaways = sqliteTable("takeaways", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  position: integer("position").notNull(),
  text: text("text").notNull(),
  detail: text("detail"),
  mode: modeColumn(),
  recordSlug: recordSlugColumn(),
});
