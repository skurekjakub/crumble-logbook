import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { SOURCE_SITE } from "../enums";

/**
 * A citable source: a Discord message, Naver cafe post, or web page the
 * research draws on. `id` is a `<site>:<key>` string, e.g. `dc:76135`.
 */
export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  site: text("site", { enum: SOURCE_SITE }).notNull(),
  url: text("url").notNull(),
  title: text("title"),
  titleEn: text("title_en"),
  date: text("date"),
  relevance: integer("relevance"),
  note: text("note"),
  summaryEn: text("summary_en"),
  capturePath: text("capture_path"),
});
