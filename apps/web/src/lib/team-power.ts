/**
 * The team-power screens' arithmetic and wording. Pure; the rows come from
 * the API. Reach reads the power gate through `lib/stage.ts`.
 *
 * @module
 */
import type { CostType, DataPointKind, PowerPlace, StepBasis } from "@crumble/schema";
import type { Bracket } from "./stage";
import { entryPower, furthest } from "./stage";

/** The record's efficiency grades, best first. */
export const EFFICIENCY_GRADES = ["high", "medium", "low", "none"] as const;
/** An efficiency grade. */
export type EfficiencyGrade = (typeof EFFICIENCY_GRADES)[number];

/** The account stages a power source's efficiency is graded at, with their labels, earliest first. */
export const EFFICIENCY_STAGES = [
  ["early", "Early"],
  ["mid", "Mid"],
  ["late", "Late"],
  ["at22g", "Near 2.2G"],
] as const;
/** An account stage a power source's efficiency is graded at. */
export type EfficiencyStage = (typeof EFFICIENCY_STAGES)[number][0];

/** Labels per cost type, in the order the cost axis runs: free first, paid last. */
export const COST_TYPES: ReadonlyArray<readonly [CostType, string]> = [
  ["free", "Free"],
  ["time_gated", "Time-gated"],
  ["mixed", "Free or paid"],
  ["paid", "Paid"],
];

/** Labels per place a power source's power counts. */
export const PLACES: Readonly<Record<PowerPlace, string>> = {
  stage: "Stages",
  rift: "Rift",
  arena: "Arena",
  conquest: "Guild Conquest",
};

/** Labels per step basis. */
export const BASIS_LABELS: Readonly<Record<StepBasis, string>> = {
  posted: "Posted",
  claimed: "Claimed",
  unmeasured: "Unmeasured",
  community: "Community order",
};

/** Labels per kind of data point. */
export const KIND_LABELS: Readonly<Record<DataPointKind, string>> = {
  posted: "Posted",
  claimed: "Claimed",
  inferred: "Inferred",
};

/**
 * The grade an efficiency note leads with, as the record writes it
 * ("high: …", "medium; …", "low per coin; …", "none for power").
 *
 * @param note - the record's efficiency note
 * @returns the grade, or null for a note that leads with none
 */
export function efficiencyGrade(note: string): EfficiencyGrade | null {
  const lead = /^(high|medium|low|none)\b/i.exec(note.trim());
  return lead ? (lead[1]!.toLowerCase() as EfficiencyGrade) : null;
}

/** What the planner needs of a planner step. */
export interface GainStep {
  basis: StepBasis;
  dataPoint: string | null;
}

/** What the planner needs of a data point. */
export interface GainSource {
  slug: string;
  kind: DataPointKind;
  deltaPct: number | null;
}

/**
 * The data point a step takes its posted gain from, when the planner may
 * multiply by it (see {@link postedGainPct}).
 *
 * @param step - the planner step
 * @param points - the data points
 * @returns the data point, or undefined when the step has no posted gain
 */
export function postedGainPoint<P extends GainSource>(
  step: GainStep,
  points: readonly P[],
): P | undefined {
  if (postedGainPct(step, points) === null) return undefined;
  return points.find((p) => p.slug === step.dataPoint);
}

/**
 * The gain the planner may multiply team power by for a step: a posted
 * step's posted data point's change, never a claimed or inferred figure.
 *
 * @param step - the planner step
 * @param points - the data points, to find the step's by slug
 * @returns the change in percent, or null when the step has no posted gain
 */
export function postedGainPct(step: GainStep, points: readonly GainSource[]): number | null {
  if (step.basis !== "posted" || step.dataPoint === null) return null;
  const point = points.find((p) => p.slug === step.dataPoint);
  return point?.kind === "posted" ? point.deltaPct : null;
}

/** A chapter as reach reads it: its last stage and its recommended power. */
export interface ReachChapter {
  lastStage: string;
  recommendedPower: number;
}

/** How far a power pushes at one bracket, and what the next chapter asks. */
export interface Reach<C extends ReachChapter> {
  /** The furthest chapter entered at the bracket or better; undefined before the first. */
  reached: C | undefined;
  /** The first chapter not entered, when there is one. */
  next: C | undefined;
  /** The power that enters `next` at the bracket. */
  nextPower: number | undefined;
}

/**
 * How far a team power pushes while keeping at least a bracket, chapter by
 * chapter's last stage, and the power the next chapter takes.
 *
 * @param chapters - the chapters, in push order
 * @param bracket - the bracket
 * @param power - the team power
 * @returns the reach
 */
export function reachAt<C extends ReachChapter>(
  chapters: readonly C[],
  bracket: Bracket,
  power: number,
): Reach<C> {
  const reached = furthest(chapters, (c) => c.recommendedPower, power, bracket.minRatioPct);
  const next = chapters[reached ? chapters.indexOf(reached) + 1 : 0];
  return {
    reached,
    next,
    nextPower: next ? entryPower(next.recommendedPower, bracket.minRatioPct) : undefined,
  };
}

/**
 * The chapters a gain moves the furthest chapter by, at a bracket.
 *
 * @param chapters - the chapters, in push order
 * @param before - the furthest chapter before the gain
 * @param after - the furthest chapter after it
 * @returns how many chapters further `after` is
 */
export function chaptersGained<C>(
  chapters: readonly C[],
  before: C | undefined,
  after: C | undefined,
): number {
  /**
   * A chapter's place in push order.
   *
   * @param c - the chapter, or undefined for none reached
   * @returns its index, or -1 for none
   */
  const at = (c: C | undefined) => (c === undefined ? -1 : chapters.indexOf(c));
  return at(after) - at(before);
}

/**
 * Prints a KRW price: `₩9,900`.
 *
 * @param krw - the price in won
 * @returns the text
 */
export function formatKrw(krw: number): string {
  return `₩${krw.toLocaleString("en-US")}`;
}

/**
 * Prints a USD price: `$4.99`.
 *
 * @param usd - the price in dollars
 * @returns the text
 */
export function formatUsd(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

/** What a USD price reads from a package. */
export interface UsdPriced {
  priceUsd: number | null;
  usdTier: number | null;
}

/**
 * A package's USD price: as a store lists it, or as the price tier its KRW
 * price pairs with (marked ≈), or none.
 *
 * @param pack - the package's USD figures
 * @returns the price text and whether it is inferred, or null when neither is known
 */
export function usdPrice(pack: UsdPriced): { text: string; inferred: boolean } | null {
  if (pack.priceUsd !== null) return { text: formatUsd(pack.priceUsd), inferred: false };
  if (pack.usdTier !== null) return { text: `≈ ${formatUsd(pack.usdTier)}`, inferred: true };
  return null;
}

/**
 * Prints a change in percent with its sign: `+10%`, `+1.6%`, and `≈ +1.6%`
 * for a figure given loosely.
 *
 * @param pct - the change
 * @param approximate - whether the figure is given loosely
 * @returns the text
 */
export function formatPct(pct: number, approximate = false): string {
  const rounded = Math.round(pct * 10) / 10;
  return `${approximate ? "≈ " : ""}${rounded >= 0 ? "+" : ""}${rounded}%`;
}

/**
 * The words for what a gain buys at one bracket: the furthest chapter
 * after it, how many chapters it moves, and, when it moves, how far away
 * the next chapter was, since a gain larger than that gap crosses it
 * whatever the step is.
 *
 * @param before - the reach before the gain
 * @param after - the furthest chapter after it
 * @param moved - how many chapters it moves
 * @param power - the power before the gain
 * @returns the text
 */
export function reachGained<C extends ReachChapter>(
  before: Reach<C>,
  after: C | undefined,
  moved: number,
  power: number,
): string {
  const stage = after?.lastStage ?? "–";
  if (moved === 0) return `${stage} (no change)`;
  const chapters = `+${moved} chapter${moved === 1 ? "" : "s"}`;
  if (!before.next || before.nextPower === undefined) return `${stage} (${chapters})`;
  const gap = formatPct((before.nextPower / power - 1) * 100);
  return `${stage} (${chapters}; the next, ${before.next.lastStage}, was ${gap} away)`;
}
