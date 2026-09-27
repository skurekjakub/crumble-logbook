import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { GEAR_CONTEXT, GEAR_SLOT } from "../enums";

/** A gear substat recommendation for a slot in a given game mode. */
export const gearRecs = sqliteTable("gear_recs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slot: text("slot", { enum: GEAR_SLOT }).notNull(),
  substats: text("substats").notNull(),
  context: text("context", { enum: GEAR_CONTEXT }).notNull(),
  why: text("why").notNull(),
});
