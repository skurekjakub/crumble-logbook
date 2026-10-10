import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { CLAIM_VERDICT, FORMULA_CONFIDENCE, FORMULA_PHASE, FORMULA_STACKING } from "../enums";
import { recordSlugColumn } from "./columns";

/*
 * The damage formula tables: the steps a hit's damage goes through, the
 * server-side constants the steps read, and the community's claims held
 * against the client's code. Every row is a research finding a record
 * owns; the steps and constants name each other by `slug`.
 */

/**
 * One step of the damage formula, by its curated id (`slug`), in code
 * order (`position`): where it sits (`phase`), its name, its expression
 * as compact math (`expression`), the stats that feed it (`feeds`), how
 * the bonuses into those stats combine (`stacking`, `null` for a step no
 * bonus feeds), when it applies (`appliesTo`, `null` for every hit), how
 * it is known (`confidence`), what it means for upgrades in one line
 * (`why`), the longer reading (`detail`) and where in the client it was
 * read (`codeRef`: a function, address or field as a citation).
 */
export const formulaSteps = sqliteTable("formula_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  position: integer("position").notNull(),
  phase: text("phase", { enum: FORMULA_PHASE }).notNull(),
  name: text("name").notNull(),
  expression: text("expression").notNull(),
  feeds: text("feeds", { mode: "json" }).$type<string[]>().notNull(),
  stacking: text("stacking", { enum: FORMULA_STACKING }),
  appliesTo: text("applies_to"),
  confidence: text("confidence", { enum: FORMULA_CONFIDENCE }).notNull(),
  why: text("why").notNull(),
  detail: text("detail"),
  codeRef: text("code_ref"),
  recordSlug: recordSlugColumn(),
});

/**
 * A constant the damage formula reads that the client doesn't carry, by
 * its curated id (`slug`), in the record's order (`position`): the step
 * that reads it (`step`, a formula step's slug), its symbol, the client
 * field (`field`) and where it sits (`holder`), the authoring tooltip
 * (`labelKr`), what it does (`meaning`), its value when measured
 * (`value`, `null` while unknown), the value a community tool assumes
 * (`candidate`), and how to measure it (`measure`).
 */
export const formulaConstants = sqliteTable("formula_constants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  position: integer("position").notNull(),
  step: text("step").notNull(),
  symbol: text("symbol").notNull(),
  field: text("field").notNull(),
  holder: text("holder").notNull(),
  labelKr: text("label_kr"),
  meaning: text("meaning").notNull(),
  value: real("value"),
  candidate: text("candidate"),
  measure: text("measure").notNull(),
  recordSlug: recordSlugColumn(),
});

/**
 * A community claim about damage held against the client's code, by its
 * curated id (`slug`), in the record's order (`position`): the claim as
 * the community states it, what the code does (`code`), the verdict, and
 * the research record and mechanic title where the claim is recorded
 * (`refRecord`, `refTitle`; both `null` when no record files it as a
 * mechanic).
 */
export const formulaClaims = sqliteTable("formula_claims", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  position: integer("position").notNull(),
  claim: text("claim").notNull(),
  code: text("code").notNull(),
  verdict: text("verdict", { enum: CLAIM_VERDICT }).notNull(),
  refRecord: text("ref_record"),
  refTitle: text("ref_title"),
  recordSlug: recordSlugColumn(),
});
