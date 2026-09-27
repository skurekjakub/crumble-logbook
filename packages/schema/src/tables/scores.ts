import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { decks } from "./decks";

/** A recorded raid/arena/stage score, optionally tied to the deck that produced it. */
export const scores = sqliteTable("scores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  damageG: real("damage_g").notNull(),
  powerG: real("power_g"),
  deckId: text("deck_id").references(() => decks.id, { onDelete: "set null" }),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  date: text("date"),
  season: integer("season"),
  player: text("player"),
  note: text("note"),
});
