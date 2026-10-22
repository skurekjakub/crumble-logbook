import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { GearBoardSlot } from "../enums";
import { CONFIDENCE, GEAR_CONTEXT, GEAR_SLOT } from "../enums";
import { modeColumn, obsoleteColumns, recordSlugColumn } from "./columns";
import { decks } from "./decks";

/**
 * A gear substat recommendation for a slot. `context` is the in-game gear
 * preset it's for; `mode` is the game mode whose research recommends it.
 */
export const gearRecs = sqliteTable("gear_recs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slot: text("slot", { enum: GEAR_SLOT }).notNull(),
  substats: text("substats").notNull(),
  context: text("context", { enum: GEAR_CONTEXT }).notNull(),
  why: text("why").notNull(),
  mode: modeColumn(),
  recordSlug: recordSlugColumn(),
  ...obsoleteColumns(),
});

/** How many Skill Haste lines a gear build runs across the board: a range, and why it moves. */
export interface HasteLines {
  /** The fewest lines, a whole number. */
  min: number;
  /** The most lines, a whole number, `min` or more. */
  max: number;
  /** What moves the count within the range, or `null`. */
  note: string | null;
}

/** The substats a gear build aims for, per board slot: one entry per line, a stat repeated per line. */
export type GearBuildSlots = Record<GearBoardSlot, string[]>;

/**
 * A gear build: what to aim for when rolling a mode's gear, for one boss or
 * situation (`variant`) or the mode's default (`variant` `null`), and for
 * one deck when `deckId` names it. `position` orders a mode's builds, the
 * default first. `accuracy` and `focus` are target totals, `null` when the
 * mode has no gate; main stats are fixed per item, so a build names only
 * substats. `slug` is the build's curated id.
 */
export const gearBuilds = sqliteTable("gear_builds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  mode: modeColumn(),
  variant: text("variant"),
  deckId: text("deck_id").references(() => decks.id, { onDelete: "set null" }),
  position: integer("position").notNull(),
  confidence: text("confidence", { enum: CONFIDENCE }).notNull(),
  hasteLines: text("haste_lines", { mode: "json" }).$type<HasteLines>().notNull(),
  accuracy: integer("accuracy"),
  focus: integer("focus"),
  slots: text("slots", { mode: "json" }).$type<GearBuildSlots>().notNull(),
  avoid: text("avoid", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []),
  why: text("why").notNull(),
  recordSlug: recordSlugColumn(),
  ...obsoleteColumns(),
});
