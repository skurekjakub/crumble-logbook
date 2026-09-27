import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { modeColumn, recordSlugColumn } from "./columns";
import { decks } from "./decks";

/** A rune line recommendation for a cookie in one game mode, independent of any single deck. */
export const runeBuilds = sqliteTable("rune_builds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cookieKr: text("cookie_kr").notNull(),
  lines: text("lines").notNull(),
  why: text("why").notNull(),
  disputed: text("disputed"),
  mode: modeColumn(),
  recordSlug: recordSlugColumn(),
});

/** Join table linking a rune build to the decks it applies to. */
export const runeBuildDecks = sqliteTable(
  "rune_build_decks",
  {
    runeBuildId: integer("rune_build_id")
      .notNull()
      .references(() => runeBuilds.id, { onDelete: "cascade" }),
    deckId: text("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.runeBuildId, t.deckId] })],
);
