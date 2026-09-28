import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { CONFIDENCE } from "../enums";
import { modeColumn, obsoleteColumns, recordSlugColumn } from "./columns";
import { decks } from "./decks";

/**
 * A directed counter edge: the team deck `teamDeckId` is beaten by the deck
 * `beatenByDeckId`, under `conditions`, because of `why`. Never symmetric:
 * the reverse matchup is its own edge, if any. `slug` is the edge's curated
 * id. A deck can't be deleted while an edge references it.
 */
export const counters = sqliteTable("counters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  mode: modeColumn(),
  teamDeckId: text("team_deck_id")
    .notNull()
    .references(() => decks.id),
  beatenByDeckId: text("beaten_by_deck_id")
    .notNull()
    .references(() => decks.id),
  conditions: text("conditions"),
  why: text("why").notNull(),
  confidence: text("confidence", { enum: CONFIDENCE }).notNull(),
  recordSlug: recordSlugColumn(),
  ...obsoleteColumns(),
});
