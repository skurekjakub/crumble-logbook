import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { GLOSSARY_KIND } from "../enums";

/** A Korean term (cookie, pet, stat, gear slot, or general term) and its English gloss. */
export const glossary = sqliteTable("glossary", {
  kr: text("kr").primaryKey(),
  shorthand: text("shorthand", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []),
  en: text("en"),
  kind: text("kind", { enum: GLOSSARY_KIND }).notNull(),
  element: text("element"),
  class: text("class"),
  rarity: text("rarity"),
  extra: text("extra", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .$defaultFn(() => ({})),
});
