/**
 * Pure helpers for the damage formula screen: the crit arithmetic the
 * calculator runs, and how each step, constant and claim reads as a badge.
 * Rates are fractions (1 = 100%) throughout.
 *
 * @module
 */
import type { ClaimVerdict, FormulaConfidence, FormulaStacking } from "@crumble/schema";
import type { PillKind } from "../components/Pill";

/** A badge: the pill kind that colours it and the word it shows. */
export interface Badge {
  kind: PillKind;
  label: string;
}

/** Each confidence's badge: read is solid, inferred a caution, unknown a gap. */
const CONFIDENCE_BADGE: Record<FormulaConfidence, Badge> = {
  read: { kind: "high", label: "read" },
  inferred: { kind: "medium", label: "inferred" },
  unknown: { kind: "low", label: "unknown" },
};

/** Each verdict's badge: the code confirms, doesn't contradict, half confirms, contradicts, or can't tell. */
const VERDICT_BADGE: Record<ClaimVerdict, Badge> = {
  agrees: { kind: "good", label: "agrees" },
  consistent: { kind: "alt", label: "consistent" },
  partly: { kind: "medium", label: "partly" },
  disagrees: { kind: "avoid", label: "wrong" },
  unresolved: { kind: "legacy", label: "open" },
};

/** Each stacking rule's badge. */
const STACKING_BADGE: Record<FormulaStacking, Badge> = {
  additive: { kind: "alt", label: "adds inside" },
  screen: { kind: "niche", label: "screen stacking" },
  mixed: { kind: "niche", label: "adds; RES screens" },
  fixed: { kind: "legacy", label: "fixed value" },
};

/**
 * The badge of a step's confidence.
 *
 * @param confidence - how the step is known
 * @returns its badge
 */
export function confidenceBadge(confidence: FormulaConfidence): Badge {
  return CONFIDENCE_BADGE[confidence];
}

/**
 * The badge of a claim's verdict; a contradicted claim reads "wrong".
 *
 * @param verdict - what the code says of the claim
 * @returns its badge
 */
export function verdictBadge(verdict: ClaimVerdict): Badge {
  return VERDICT_BADGE[verdict];
}

/**
 * The badge of a step's stacking rule; screen stacking, whole or on the
 * resistance side, reads as a caution, since there two bonuses give less
 * than their sum.
 *
 * @param stacking - how the step's bonuses combine
 * @returns its badge
 */
export function stackingBadge(stacking: FormulaStacking): Badge {
  return STACKING_BADGE[stacking];
}

/**
 * The crit tiers a hit rolls at an effective crit rate: the tiers every
 * hit gets, and the chance of one more.
 *
 * @param effectiveRate - crit rate minus the target's crit RES, as a fraction
 * @returns `sure`, the guaranteed tiers, and `chance`, the probability of one
 *   more; both 0 at or below a rate of 0
 */
export function critTiers(effectiveRate: number): { sure: number; chance: number } {
  if (!(effectiveRate > 0)) return { sure: 0, chance: 0 };
  const sure = Math.floor(effectiveRate);
  return { sure, chance: effectiveRate - sure };
}

/**
 * The expected crit multiplier: 1 + crit DMG × the effective crit rate,
 * linear past 100% and ×1 at or below 0.
 *
 * @param effectiveRate - crit rate minus the target's crit RES, as a fraction
 * @param critDamage - crit DMG, as a fraction (0.5 = +50% per tier)
 * @returns the multiplier, e.g. 2 for a 100% rate with 100% crit DMG
 */
export function expectedCrit(effectiveRate: number, critDamage: number): number {
  return 1 + Math.max(0, critDamage) * Math.max(0, effectiveRate);
}

/** What one more point of crit rate or of crit DMG is worth, and which wins. */
export interface CritEdge {
  /** Relative damage gained from +`step` crit rate, e.g. 0.004 for +0.4%. */
  rate: number;
  /** Relative damage gained from +`step` crit DMG. */
  damage: number;
  /** The stat whose point is worth more; `even` when they tie. */
  better: "rate" | "damage" | "even";
}

/**
 * Weighs one more point of crit rate against one more of crit DMG at the
 * given stats: crit rate wins while crit DMG exceeds the effective rate,
 * crit DMG once the rate exceeds it. At an effective rate of 0 or below no
 * hit crits, so crit DMG is worth nothing and crit rate is the stat to raise.
 *
 * @param effectiveRate - crit rate minus the target's crit RES, as a fraction
 * @param critDamage - crit DMG, as a fraction
 * @param step - the size of the point, as a fraction; 0.01 when omitted
 * @returns each point's relative gain and the better one
 */
export function critEdge(effectiveRate: number, critDamage: number, step = 0.01): CritEdge {
  const base = expectedCrit(effectiveRate, critDamage);
  const rate = expectedCrit(effectiveRate + step, critDamage) / base - 1;
  const damage = expectedCrit(effectiveRate, critDamage + step) / base - 1;
  if (effectiveRate <= 0) return { rate, damage, better: "rate" };
  const better = Math.abs(rate - damage) < 1e-12 ? "even" : rate > damage ? "rate" : "damage";
  return { rate, damage, better };
}

/**
 * What +`step` is worth in a bucket that multiplies as 1 + its total.
 *
 * @param total - the bucket's current total, as a fraction (1.22 for 122% skill amp)
 * @param step - the gain, as a fraction; 0.01 when omitted
 * @returns the relative damage gained, step ÷ (1 + total)
 */
export function bucketGain(total: number, step = 0.01): number {
  return step / (1 + Math.max(0, total));
}

/**
 * Formats a fraction as a percentage for a badge or a gain line.
 *
 * @param fraction - the value, 1 = 100%
 * @param digits - decimals to keep; 2 when omitted, trailing zeros dropped
 * @returns the percentage, e.g. `0.45%`
 */
export function formatPct(fraction: number, digits = 2): string {
  return `${Number((fraction * 100).toFixed(digits))}%`;
}

/**
 * Formats a multiplier, e.g. `×1.75`.
 *
 * @param value - the multiplier
 * @returns the multiplier with up to three decimals, trailing zeros dropped
 */
export function formatTimes(value: number): string {
  return `×${Number(value.toFixed(3))}`;
}

/**
 * Reads a percentage the reader typed: an optional leading minus (a hyphen
 * or `−`), digits with an optional decimal part, an optional `%`, nothing
 * else.
 *
 * @param text - the field's text, e.g. `135`, `135.5%` or `-20`
 * @returns the value as a fraction, or `null` when the text isn't a percentage
 */
export function parsePct(text: string): number | null {
  const match = /^\s*([-−]?)\s*(\d+(?:\.\d+)?)\s*%?\s*$/.exec(text);
  if (!match) return null;
  const value = Number(match[2]) / 100;
  return match[1] ? -value : value;
}
