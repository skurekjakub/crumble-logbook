import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { BUFF_BASE, BUFF_TARGET, CONFIDENCE } from "../enums";
import { recordSlugColumn } from "./columns";

/**
 * A timed event of a boss fight. `tElapsed` is seconds since the fight
 * started, not the in-game HUD, which counts down: remaining time is the
 * fight length minus `tElapsed`. `null` means the event has no time inside
 * the fight.
 */
export const fightEvents = sqliteTable("fight_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  boss: text("boss").notNull(),
  tElapsed: real("t_elapsed"),
  event: text("event").notNull(),
  detail: text("detail").notNull(),
  confidence: text("confidence", { enum: CONFIDENCE }).notNull(),
  recordSlug: recordSlugColumn(),
});

/**
 * One buff (or debuff) a cookie's skill applies at one skill grade.
 * `valuePct` is a percent: for a buff, the value before the caster's skill
 * amp (`scalesWithCasterAmp`) is applied; for a debuff, its base
 * application chance. `fromStar` is the lowest star count that reaches
 * `skillGrade`. `target` is `self` for an effect that lands on the caster
 * alone, else `team`. A cookie has one row per effect type and grade: a
 * game fact several records can share, owned by the first record that
 * loaded it.
 */
export const buffValues = sqliteTable(
  "buff_values",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cookieKr: text("cookie_kr").notNull(),
    effectType: text("effect_type").notNull(),
    skillGrade: integer("skill_grade").notNull(),
    fromStar: integer("from_star").notNull(),
    valuePct: real("value_pct").notNull(),
    maxStack: integer("max_stack"),
    base: text("base", { enum: BUFF_BASE }).notNull(),
    scalesWithCasterAmp: integer("scales_with_caster_amp", { mode: "boolean" }).notNull(),
    target: text("target", { enum: BUFF_TARGET }).notNull().default("team"),
    recordSlug: recordSlugColumn(),
  },
  (t) => [
    uniqueIndex("buff_values_cookie_kr_effect_type_skill_grade_uq").on(
      t.cookieKr,
      t.effectType,
      t.skillGrade,
    ),
  ],
);
