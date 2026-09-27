import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { USAGE_KIND } from "../enums";
import { modeColumn, recordSlugColumn } from "./columns";

/**
 * A usage figure: the share of a `sample` (e.g. the top 100 defenses,
 * captured `capturedAt`) that runs `subject`. `members` lists a core's or
 * team's cookies, else `null`. `usagePct` counts every sighting;
 * `confirmedPct`, when known, only the fully revealed ones. `note` says when
 * the figure is a bound rather than a count, e.g. because the game hides
 * slots.
 */
export const usageStats = sqliteTable("usage_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mode: modeColumn(),
  kind: text("kind", { enum: USAGE_KIND }).notNull(),
  subject: text("subject").notNull(),
  members: text("members", { mode: "json" }).$type<string[]>(),
  usagePct: real("usage_pct").notNull(),
  confirmedPct: real("confirmed_pct"),
  sample: text("sample").notNull(),
  capturedAt: text("captured_at").notNull(),
  note: text("note"),
  recordSlug: recordSlugColumn(),
});
