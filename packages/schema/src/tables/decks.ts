import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { DECK_NOTE_KIND, DECK_STATUS } from "../enums";
import { modeColumn, recordSlugColumn } from "./columns";

/** A deck: a named cookie/pet lineup for one game mode, with a meta tier and formation notes. */
export const decks = sqliteTable("decks", {
  id: text("id").primaryKey(),
  position: integer("position").notNull(),
  nameEn: text("name_en").notNull(),
  nameKr: text("name_kr"),
  status: text("status", { enum: DECK_STATUS }).notNull(),
  ceilingText: text("ceiling_text"),
  summary: text("summary"),
  formation: text("formation"),
  perks: text("perks"),
  rng: text("rng"),
  atkOrder: text("atk_order", { mode: "json" }).$type<string[]>(),
  atkOrderNote: text("atk_order_note"),
  mode: modeColumn(),
  recordSlug: recordSlugColumn(),
});

/**
 * A single cookie slot within a deck's lineup, in placement order. Every
 * cookie carries a `level` or a `levelRule` (or both) — enforced with a
 * CHECK constraint since it's a cross-field invariant. `slot` is the
 * formation position as displayed (free text, e.g. `row1-3`), when known.
 */
export const deckCookies = sqliteTable(
  "deck_cookies",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    deckId: text("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    cookieKr: text("cookie_kr").notNull(),
    level: text("level"),
    levelRule: text("level_rule"),
    stars: text("stars"),
    why: text("why").notNull(),
    slot: text("slot"),
  },
  (t) => [
    check("deck_cookies_level_or_rule", sql`${t.level} is not null or ${t.levelRule} is not null`),
  ],
);

/** A pet slot within a deck's lineup, in placement order. */
export const deckPets = sqliteTable("deck_pets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  deckId: text("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  petKr: text("pet_kr").notNull(),
});

/** A free-text note (substitution or unorthodox choice) attached to a deck. */
export const deckNotes = sqliteTable("deck_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  deckId: text("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  kind: text("kind", { enum: DECK_NOTE_KIND }).notNull(),
  text: text("text").notNull(),
});
