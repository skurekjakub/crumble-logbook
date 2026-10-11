/**
 * The maths behind the Guild Conquest attempts page: reading a run's score at a moment of the
 * fight off its curve, summarising the runs, and testing an earlier pace cut against the runs
 * that met the macro's bar.
 *
 * @module
 */
import type { Attempt, AttemptEnd, CurvePoint, PaceRule } from "@crumble/schema";

/** The seconds-left moments offered for an earlier cut, earliest first. */
export const CHECKPOINTS = [55, 50, 45, 40, 35] as const;

/** An earlier-cut moment, in seconds left. */
export type Checkpoint = (typeof CHECKPOINTS)[number];

/** The checkpoint shown first: 15 s into the fight. */
export const DEFAULT_CHECKPOINT: Checkpoint = 45;

/** Readings further apart than this, in seconds, don't vouch for the score between them. */
const MAX_GAP_S = 2.5;

/** How far below the weakest passing run's early score the suggested cut sits. */
export const CUT_MARGIN = 0.03;

/** Passing runs needed before a suggested cut reads as medium, then high, confidence. */
const CONFIDENCE_AT = { medium: 5, high: 15 } as const;

/** Gaps between runs longer than this, in seconds, are breaks, not cycles. */
const MAX_CYCLE_S = 300;

/**
 * Tells whether a run played the full fight rather than being pruned or cut short.
 *
 * @param end - how the run ended
 * @returns true for the `kept-*` ends
 */
export function isKept(end: AttemptEnd): boolean {
  return end.startsWith("kept");
}

/**
 * Reads a run's score at a moment of the fight, interpolating between the readings either side.
 *
 * @param curve - the run's readings, most seconds left first
 * @param tLeft - the moment, in seconds left
 * @returns the score then; null when no readings bracket the moment within {@link MAX_GAP_S}
 */
export function scoreAt(curve: readonly CurvePoint[], tLeft: number): number | null {
  for (let i = 0; i < curve.length; i++) {
    const [t, score] = curve[i]!;
    if (t === tLeft) return score;
    if (t > tLeft) continue;
    const before = curve[i - 1];
    if (!before || before[0] - t > MAX_GAP_S) return null;
    const share = (before[0] - tLeft) / (before[0] - t);
    return Math.round(before[1] + (score - before[1]) * share);
  }
  return null;
}

/**
 * A run's score when the pace was judged: the macro's own reading, else its curve's.
 *
 * @param attempt - the run
 * @param rule - the macro's pace rule
 * @returns the score at the rule's `checkAtS`; null when neither has it
 */
export function paceOf(attempt: Attempt, rule: PaceRule): number | null {
  if (attempt.paceScore !== null) return attempt.paceScore;
  return rule.checkAtS === null ? null : scoreAt(attempt.curve, rule.checkAtS);
}

/** The runs at a glance. */
export interface AttemptSummary {
  total: number;
  /** Runs that played the full fight. */
  kept: number;
  /** Runs that met the bar: `kept-on-pace`. */
  onPace: number;
  /** Runs judged against the bar: pruned or on pace. */
  judged: number;
  /** The run with the highest final score. */
  bestFinal: Attempt | null;
  /** The highest score at `checkAtS`. */
  bestPace: number | null;
  /** Runs an hour at the median cycle; null with fewer than two runs in a session. */
  perHour: number | null;
}

/**
 * Parses a run's time as local wall-clock time.
 *
 * @param time - `YYYY-MM-DD HH:mm:ss`
 * @returns milliseconds since the epoch
 */
export function timeOf(time: string): number {
  return new Date(time.replace(" ", "T")).getTime();
}

/**
 * The middle value of a list, the mean of the middle pair for an even length.
 *
 * @param values - the numbers
 * @returns the median; null for an empty list
 */
function median(values: readonly number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * Summarises the runs.
 *
 * @param attempts - the runs, oldest first
 * @param rule - the macro's pace rule
 * @returns the summary
 */
export function summarize(attempts: readonly Attempt[], rule: PaceRule): AttemptSummary {
  let bestFinal: Attempt | null = null;
  let bestPace: number | null = null;
  for (const a of attempts) {
    if (a.finalScore !== null && (bestFinal?.finalScore ?? -1) < a.finalScore) bestFinal = a;
    const pace = paceOf(a, rule);
    if (pace !== null && (bestPace === null || pace > bestPace)) bestPace = pace;
  }
  const cycles = attempts
    .slice(1)
    .map((a, i) => (timeOf(a.time) - timeOf(attempts[i]!.time)) / 1000)
    .filter((s) => s > 0 && s <= MAX_CYCLE_S);
  const cycle = median(cycles);
  const onPace = attempts.filter((a) => a.end === "kept-on-pace").length;
  return {
    total: attempts.length,
    kept: attempts.filter((a) => isKept(a.end)).length,
    onPace,
    judged: onPace + attempts.filter((a) => a.end === "pruned").length,
    bestFinal,
    bestPace,
    perHour: cycle === null ? null : 3600 / cycle,
  };
}

/** One run's early score against its score when the pace was judged. */
export interface CutPair {
  attempt: Attempt;
  early: number;
  pace: number;
  /** Met the bar at `checkAtS`. */
  passed: boolean;
}

/** How sure a suggested cut is: how many passing runs it stands on. */
export type CutConfidence = "high" | "medium" | "low";

/** An earlier cut tested against the recorded runs. */
export interface CutTest {
  checkpoint: Checkpoint;
  /** The runs with a score at both moments. */
  pairs: CutPair[];
  /** How many of them met the bar. */
  passing: number;
  /**
   * The suggested cut: {@link CUT_MARGIN} below the lowest early score of a passing run, so no
   * recorded pass would have been pruned; null with no passing run.
   */
  cut: number | null;
  /** The share of runs the cut would have pruned at the checkpoint. */
  prunedShare: number | null;
  /** How well the early score predicts the score at `checkAtS` (Pearson's r); null under 3 runs. */
  r: number | null;
  /** Seconds each early prune saves. */
  savedS: number;
  confidence: CutConfidence;
}

/**
 * Pearson's correlation of two equal-length lists.
 *
 * @param xs - the first values
 * @param ys - the second values
 * @returns r in [-1, 1]; null under 3 values or when either list is constant
 */
export function pearson(xs: readonly number[], ys: readonly number[]): number | null {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = ys.reduce((s, y) => s + y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - mx;
    const dy = ys[i]! - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
}

/**
 * Tests a cut at an earlier moment against the recorded runs: which runs met the bar at
 * `checkAtS`, and how low their scores were at the checkpoint.
 *
 * @param attempts - the runs
 * @param rule - the macro's pace rule
 * @param checkpoint - the earlier moment, in seconds left
 * @returns the test; no pairs when the rule has no bar or moment
 */
export function testCut(
  attempts: readonly Attempt[],
  rule: PaceRule,
  checkpoint: Checkpoint,
): CutTest {
  const { minScore, checkAtS } = rule;
  const pairs: CutPair[] = [];
  if (minScore && checkAtS !== null) {
    for (const attempt of attempts) {
      const early = scoreAt(attempt.curve, checkpoint);
      const pace = paceOf(attempt, rule);
      if (early !== null && pace !== null)
        pairs.push({ attempt, early, pace, passed: pace >= minScore });
    }
  }
  const passing = pairs.filter((p) => p.passed);
  const cut = passing.length ? Math.min(...passing.map((p) => p.early)) * (1 - CUT_MARGIN) : null;
  return {
    checkpoint,
    pairs,
    passing: passing.length,
    cut,
    prunedShare:
      cut === null || !pairs.length
        ? null
        : pairs.filter((p) => p.early < cut).length / pairs.length,
    r: pearson(
      pairs.map((p) => p.early),
      pairs.map((p) => p.pace),
    ),
    savedS: checkpoint - (checkAtS ?? checkpoint),
    confidence:
      passing.length >= CONFIDENCE_AT.high
        ? "high"
        : passing.length >= CONFIDENCE_AT.medium
          ? "medium"
          : "low",
  };
}

/** One bar of a histogram. */
export interface Bin {
  /** Its lower edge, inclusive. */
  from: number;
  /** Its upper edge, exclusive. */
  to: number;
  count: number;
}

/**
 * Picks a round step, 1, 2 or 5 times a power of ten, at least a span's share.
 *
 * @param span - the range to cover
 * @param parts - about how many steps to cut it into
 * @returns the step; 1 for an empty span
 */
export function niceStep(span: number, parts: number): number {
  if (!(span > 0)) return 1;
  const raw = span / parts;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].find((m) => m * power >= raw)!;
  return step * power;
}

/**
 * Counts values into bins of a round width.
 *
 * @param values - the values
 * @param parts - about how many bins to cut their range into
 * @returns the bins, lowest first, empty ones included; none for no values
 */
export function histogram(values: readonly number[], parts = 24): Bin[] {
  if (!values.length) return [];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const width = niceStep(hi - lo, parts);
  const start = Math.floor(lo / width) * width;
  const bins: Bin[] = [];
  for (let from = start; from <= hi; from += width) bins.push({ from, to: from + width, count: 0 });
  for (const v of values) bins[Math.min(bins.length - 1, Math.floor((v - start) / width))]!.count++;
  return bins;
}

/**
 * Formats a score the way the game abbreviates it.
 *
 * @param score - the score
 * @returns e.g. "2.359T", "812.4G" or "–" for none
 */
export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return "–";
  if (score >= 1e12) return `${(score / 1e12).toFixed(3)}T`;
  if (score >= 1e9) return `${(score / 1e9).toFixed(1)}G`;
  if (score >= 1e6) return `${(score / 1e6).toFixed(1)}M`;
  return String(score);
}
