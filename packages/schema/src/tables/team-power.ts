import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  CONFIDENCE,
  COST_TYPE,
  DATA_POINT_KIND,
  PACKAGE_TIER,
  SPENDING_ORDER_KIND,
  SPEND_ROUTE,
  STEP_BASIS,
} from "../enums";
import type { PowerPlace } from "../enums";
import { recordSlugColumn } from "./columns";

/*
 * The team-power tables: what raises the power the game shows for a
 * lineup, what it costs, the figures players posted, the packages that
 * sell it, the orders to spend in, the cost curves, and what the planner
 * may multiply. Every row is a research finding a record owns. Rows name
 * each other by `slug`: a power source, a data point, a package or a
 * spending order.
 */

/** One material a power source consumes, and where a free and a paying player get it. */
export interface PowerMaterial {
  /** The material, as the record names it. */
  name: string;
  /** How a free player gets it. */
  free: string;
  /** How a paying player gets it. */
  paid: string;
  /** What else the record says about it, when anything. */
  note: string | null;
}

/**
 * One gain a power source's record lists: whose account, the power before
 * and after as posted, the change, what it cost, how the figure is known
 * (`kind`, in the record's words) and the sources that post it.
 */
export interface PostedGain {
  account: string;
  before: string | null;
  after: string | null;
  delta: string | null;
  cost: string | null;
  kind: string;
  sources: string[];
}

/**
 * A power source's efficiency, in the record's words, at each account
 * stage it grades: early, mid, late, and near 2.2G (`at22g`, the user's
 * team). A note may lead with the record's grade (high, medium, low, none).
 */
export interface PowerEfficiency {
  early: string;
  mid: string;
  late: string;
  at22g: string;
}

/** One cell of a growth curve's table: a number, a text, or nothing. */
export type CurveCell = string | number | null;

/**
 * One system that raises displayed team power: what it raises, where it
 * counts (`appliesIn`), its materials and what they cost (`costType`),
 * its cap and diminishing returns, the gains players posted, its
 * efficiency by account stage, what it does for the stage brackets, the
 * order players spend in, the patches that moved it and how well sourced
 * it is. `slug` is its curated id, by which other rows name it.
 */
export const powerSources = sqliteTable("power_sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameKr: text("name_kr").notNull(),
  raises: text("raises").notNull(),
  appliesIn: text("applies_in", { mode: "json" }).$type<PowerPlace[]>().notNull(),
  materials: text("materials", { mode: "json" }).$type<PowerMaterial[]>().notNull(),
  costType: text("cost_type", { enum: COST_TYPE }).notNull(),
  costPerRoll: text("cost_per_roll"),
  cap: text("cap").notNull(),
  diminishing: text("diminishing"),
  postedGains: text("posted_gains", { mode: "json" }).$type<PostedGain[]>().notNull(),
  efficiency: text("efficiency", { mode: "json" }).$type<PowerEfficiency>().notNull(),
  bracketEffect: text("bracket_effect").notNull(),
  spendOrder: text("spend_order"),
  patchNotes: text("patch_notes"),
  confidence: text("confidence", { enum: CONFIDENCE }).notNull(),
  recordSlug: recordSlugColumn(),
});

/**
 * One team-power figure: a measured change, a gain per step or an account
 * snapshot, for the power source `powerSource` (a slug). Power is in G as
 * posted (`beforeG`, `afterG`), `deltaPct` the change in percent; any of
 * them `null` when the post gives none. `kind` says how the figure is
 * known; `cost` what it took and `note` what else the record says. `slug`
 * is its curated id.
 */
export const powerDataPoints = sqliteTable("power_data_points", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  kind: text("kind", { enum: DATA_POINT_KIND }).notNull(),
  powerSource: text("power_source").notNull(),
  date: text("date").notNull(),
  beforeG: real("before_g"),
  afterG: real("after_g"),
  deltaPct: real("delta_pct"),
  cost: text("cost"),
  note: text("note").notNull(),
  recordSlug: recordSlugColumn(),
});

/**
 * One shop package: its names, its KRW price, its USD price as a store
 * lists it (`priceUsd`) or as the price tier its KRW price pairs with
 * (`usdTier`, inferred), where the USD figure comes from, what kind of
 * purchase it is, the power sources it feeds (slugs), its Crystal value
 * (a percentage of the plain Crystal pack's, not team power, over
 * `crystalValueBasis` when stated), its contents, the community's verdict
 * and the spender it suits. `slug` is its curated id.
 */
export const packages = sqliteTable("packages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  nameKr: text("name_kr").notNull(),
  nameEn: text("name_en").notNull(),
  priceKrw: integer("price_krw").notNull(),
  priceUsd: real("price_usd"),
  usdTier: real("usd_tier"),
  usdSource: text("usd_source").notNull(),
  kind: text("kind").notNull(),
  feeds: text("feeds", { mode: "json" }).$type<string[]>().notNull(),
  crystalValuePct: real("crystal_value_pct"),
  crystalValueBasis: text("crystal_value_basis"),
  contents: text("contents"),
  verdict: text("verdict").notNull(),
  tier: text("tier", { enum: PACKAGE_TIER }).notNull(),
  recordSlug: recordSlugColumn(),
});

/**
 * A KRW price and the USD price the stores pair it with, and the packages
 * that show the pairing (`pairedBy`): the basis of a package's inferred
 * USD tier.
 */
export const priceTiers = sqliteTable("price_tiers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  krw: integer("krw").notNull(),
  usd: real("usd").notNull(),
  pairedBy: text("paired_by").notNull(),
  recordSlug: recordSlugColumn(),
});

/**
 * One spending order: an account stage's (`kind: stage`) or one account's
 * ranking of every power source and package (`kind: ranked`), with its
 * label, what the record says about the order as a whole (`note`) and its
 * place among the orders (`position`). `slug` is its curated id.
 */
export const spendingOrders = sqliteTable("spending_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  kind: text("kind", { enum: SPENDING_ORDER_KIND }).notNull(),
  label: text("label").notNull(),
  note: text("note"),
  position: integer("position").notNull(),
  recordSlug: recordSlugColumn(),
});

/**
 * One step of a spending order (`orderSlug`): its route (free or paid),
 * its place on that route (`position`), what to do (`step`, when the
 * order words it), the power source or the package it spends on (a slug;
 * one of them), what its place rests on (`basis`, with the record's
 * wording in `basisNote`) and why it sits there.
 */
export const spendingSteps = sqliteTable("spending_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderSlug: text("order_slug").notNull(),
  route: text("route", { enum: SPEND_ROUTE }).notNull(),
  position: integer("position").notNull(),
  step: text("step"),
  powerSource: text("power_source"),
  packageSlug: text("package_slug"),
  basis: text("basis", { enum: STEP_BASIS }).notNull(),
  basisNote: text("basis_note"),
  why: text("why"),
  recordSlug: recordSlugColumn(),
});

/**
 * One cost or diminishing-return curve of a power source (`powerSource`, a
 * slug) as a table: its `columns`, its `rows` of cells, and, when the
 * record cites rows apart, each row's sources (`rowSources`, one list per
 * row). `note` says what the table leaves out, `evidence` the record's
 * file it condenses. `slug` is its curated id.
 */
export const growthCurves = sqliteTable("growth_curves", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  powerSource: text("power_source").notNull(),
  title: text("title").notNull(),
  columns: text("columns", { mode: "json" }).$type<string[]>().notNull(),
  rows: text("rows", { mode: "json" }).$type<CurveCell[][]>().notNull(),
  rowSources: text("row_sources", { mode: "json" }).$type<string[][]>(),
  note: text("note"),
  evidence: text("evidence"),
  recordSlug: recordSlugColumn(),
});

/**
 * One step the power planner weighs: the power source it raises, the data
 * point whose gain it takes (`dataPoint`, a slug, when there is one), what
 * that gain rests on (`basis`), the gain and the stage reach it buys in the
 * record's words (`gain`, `reach`), and its place in the planner. Only a
 * posted step is multiplied into a new power.
 */
export const plannerSteps = sqliteTable("planner_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  position: integer("position").notNull(),
  powerSource: text("power_source").notNull(),
  dataPoint: text("data_point"),
  basis: text("basis", { enum: STEP_BASIS }).notNull(),
  gain: text("gain").notNull(),
  reach: text("reach").notNull(),
  recordSlug: recordSlugColumn(),
});
