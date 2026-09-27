import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { GEAR_CONTEXT, GEAR_SLOT } from "../enums";
import { modeColumn, recordSlugColumn } from "./columns";

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
});
