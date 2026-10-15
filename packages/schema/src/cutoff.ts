/**
 * The Guild Conquest early cutoff: reading a run's score at a moment of the fight, measuring how
 * long a run takes, and fitting the earliest pace check that keeps every top run. The target is
 * the top {@link TOP_SHARE} of the sample runs' finals, the runs the macro plays out whatever
 * their pace. Pure, with only type imports, so it loads on its own (`@crumble/schema/cutoff`).
 *
 * @module
 */
import type { Attempt, AttemptEnd, CurvePoint } from "./attempts";

/** Readings further apart than this, in seconds, don't vouch for the score between them. */
const MAX_GAP_S = 2.5;

/** The macro's bar: the moment, in seconds left, its pace check judges a run. */
export const BAR_S = 30;

/** The checkpoint grid's spacing, in seconds. */
const STEP_S = 2.5;

/** The latest checkpoint fitted, in seconds left. */
const LAST_CHECKPOINT_S = 30;

/** The leniencies a rule may take: how many seconds earlier a reference run's score sets `T(c)`. */
export const DELTAS_S = [0.5, 1, 1.5, 2] as const;

/** The share of the sample runs, by final, that counts as top. */
const TOP_SHARE = 0.01;

/** The share of the sample runs, by final, that sets the thresholds. */
const REFERENCE_SHARE = 0.05;

/** The fewest reference runs the analysis fits a rule on. */
const MIN_REFERENCE = 5;

/** Gaps between runs of this many seconds or more are breaks, not cycles. */
const MAX_CYCLE_S = 300;

/** The chance the loss bound understates the true loss rate: the bound holds at 95%. */
export const BOUND_RISK = 0.05;

/** One checkpoint fitted at one leniency; `threshold` null marks it unscorable. */
export type CheckpointFit =
  | {
      /** The checkpoint, in seconds left. */
      tLeft: number;
      /** A reference run has no score `δ` seconds before the checkpoint. */
      threshold: null;
    }
  | {
      /** The checkpoint, in seconds left. */
      tLeft: number;
      /** `T(c)`: the lowest score a reference run had `δ` seconds before the checkpoint. */
      threshold: number;
      /** Sample runs strictly under the threshold at the checkpoint. */
      cuts: number;
      /** Seconds those cuts save against playing the runs out. */
      savedS: number;
      /** Reference runs that thresholds fitted without them would cut. */
      looLosses: number;
    };

/** Every checkpoint fitted at one leniency, earliest first. */
export interface CutoffFit {
  /** The leniency, in seconds. */
  delta: (typeof DELTAS_S)[number];
  /** From the earliest scorable checkpoint down to {@link LAST_CHECKPOINT_S}. */
  checkpoints: CheckpointFit[];
  /** The cheapest rule at this leniency with no leave-one-out loss; null when no rule qualifies. */
  best: CutoffRule | null;
}

/** One check of a rule: a run under `minScore` at `tLeft` seconds left is ended. */
export interface CutoffCheckpoint {
  tLeft: number;
  minScore: number;
}

/** A chosen rule and what it costs on the sample runs. */
export interface CutoffRule {
  /** The leniency its thresholds were fitted at, in seconds. */
  delta: (typeof DELTAS_S)[number];
  /** Earliest first. */
  checkpoints: CutoffCheckpoint[];
  /** The sample runs' time under the rule. */
  hours: number;
  /** Top runs the rule keeps, per hour of that time. */
  topPerHour: number;
  /**
   * The rate at which the rule cuts a reference-like run, bounded from zero leave-one-out losses
   * over the reference set: `1 − 0.05^(1/r)` for `r` reference runs.
   */
  lossBound: number;
}

/** The macro's own rule, its pace check at {@link BAR_S}, on the same sample runs. */
export interface CutoffBaseline {
  /** The sample runs' time under it. */
  hours: number;
  /** Top runs it would have cut. */
  topCut: number;
  /** Top runs it keeps, per hour of that time. */
  topPerHour: number;
}

/** A run the fit uses: a sample run with a final (and a curve, which the type can't say). */
export type Sample = Attempt & { finalScore: number };

/** The runs {@link analyzeCutoff} read, as both of its outcomes count them. */
interface RunsRead {
  /** Sample runs: `sample` true, with a final and a curve. */
  samples: number;
  /** Runs left out of the fit. */
  others: number;
}

/** Why {@link analyzeCutoff} can't fit a rule on the runs. */
export type CutoffRefusal = RunsRead & { ok: false } & (
    | {
        /** The reference set is under {@link MIN_REFERENCE} runs. */
        reason: "small-reference";
        /** The fewest sample runs whose reference set reaches {@link MIN_REFERENCE}. */
        samplesNeeded: number;
      }
    | {
        /**
         * `no-cut-cycle`: no pruned run is followed by another under {@link MAX_CYCLE_S} later.
         * `no-kept-cycle`: no played-out run is followed by another under {@link MAX_CYCLE_S} later.
         */
        reason: "no-cut-cycle" | "no-kept-cycle";
      }
  );

/** The fit {@link analyzeCutoff} makes when the runs support one. */
export interface CutoffFitted extends RunsRead {
  ok: true;
  /** `B`: the lowest final that counts as top. */
  bar: number;
  /** Sample runs whose final is at least {@link bar}, oldest first. */
  top: Sample[];
  /** The sample runs that set the thresholds, best final first. */
  reference: Sample[];
  /** One per leniency in {@link DELTAS_S}. */
  fits: CutoffFit[];
  /** The cheapest of the leniencies' best rules; null when no rule qualifies. */
  best: CutoffRule | null;
  baseline: CutoffBaseline;
}

/** What {@link analyzeCutoff} finds. */
export type CutoffAnalysis = CutoffRefusal | CutoffFitted;

/** The median cycle lengths, in seconds, from a run's ENTER to the next run's ENTER. */
interface Cycles {
  /** A pruned run. */
  cut: number;
  /** A run that played out. */
  kept: number;
}

/** A candidate rule and its cost on the sample runs. */
interface Candidate {
  delta: (typeof DELTAS_S)[number];
  /** Its checkpoints, earliest first, each with a threshold. */
  checkpoints: CutoffCheckpoint[];
  /** The sample runs' total seconds under the rule. */
  seconds: number;
  /** Top runs the rule keeps. */
  topKept: number;
}

/**
 * Reads a run's score at a moment of the fight, interpolating between the readings either side.
 *
 * @param curve - the run's readings, most seconds left first
 * @param tLeft - the moment, in seconds left
 * @returns the score then, rounded to a whole score; null when no readings bracket the moment
 *   within {@link MAX_GAP_S}
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
 * A run's score at the bar: the macro's own reading, else its curve's at {@link BAR_S}.
 *
 * @param attempt - the run
 * @returns the score; null when neither has it. It takes `paceScore` as the score at
 *   {@link BAR_S}, which holds while the INI's `CheckAtS` is 30.
 */
export function barScore(attempt: Attempt): number | null {
  return attempt.paceScore ?? scoreAt(attempt.curve, BAR_S);
}

/**
 * Parses a run's time as local wall-clock time.
 *
 * @param time - `YYYY-MM-DD HH:mm:ss`
 * @returns milliseconds since the epoch
 */
function timeOf(time: string): number {
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
 * The median time a run takes, from its ENTER to the next run's ENTER in the file, over gaps
 * under {@link MAX_CYCLE_S}.
 *
 * @param attempts - every run, oldest first; an excluded run still ends the gap before it
 * @param include - which runs' gaps count; every run's when omitted
 * @returns the median, in seconds; null with no gap to measure
 */
export function medianCycle(
  attempts: readonly Attempt[],
  include: (attempt: Attempt) => boolean = () => true,
): number | null {
  const gaps: number[] = [];
  for (let i = 0; i + 1 < attempts.length; i++) {
    const run = attempts[i]!;
    if (!include(run)) continue;
    const gap = (timeOf(attempts[i + 1]!.time) - timeOf(run.time)) / 1000;
    if (gap > 0 && gap < MAX_CYCLE_S) gaps.push(gap);
  }
  return median(gaps);
}

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
 * Seconds a run cut at a checkpoint takes, from its ENTER to the next.
 *
 * @param cycles - the measured cycles
 * @param tLeft - the checkpoint, in seconds left
 * @returns the cut cycle, shortened by the seconds the checkpoint comes before the bar
 */
function cutCycle(cycles: Cycles, tLeft: number): number {
  return cycles.cut - (tLeft - BAR_S);
}

/**
 * Tells whether a run's score at a checkpoint is strictly under a threshold.
 *
 * @param attempt - the run
 * @param tLeft - the checkpoint, in seconds left
 * @param threshold - the score it must reach
 * @returns false when the run has no score at the checkpoint
 */
function isUnder(attempt: Attempt, tLeft: number, threshold: number): boolean {
  const score = scoreAt(attempt.curve, tLeft);
  return score !== null && score < threshold;
}

/**
 * The checkpoints every reference run's readings could reach at a leniency: the multiples of
 * {@link STEP_S} from the latest-starting curve's first reading, less `delta`, down to
 * {@link LAST_CHECKPOINT_S}.
 *
 * @param reference - the reference runs, each with a curve
 * @param delta - the leniency, in seconds
 * @returns the checkpoints, earliest first
 */
function checkpointGrid(reference: readonly Attempt[], delta: number): number[] {
  const firstReading = Math.min(...reference.map((run) => run.curve[0]![0]));
  const earliest = Math.floor((firstReading - delta) / STEP_S) * STEP_S;
  const count = Math.max(0, Math.floor((earliest - LAST_CHECKPOINT_S) / STEP_S) + 1);
  return Array.from({ length: count }, (_, i) => earliest - i * STEP_S);
}

/**
 * Fits every checkpoint at one leniency: its threshold, the sample runs it cuts, the seconds they
 * save, and its leave-one-out losses over the reference set.
 *
 * @param samples - the sample runs
 * @param reference - the reference runs
 * @param delta - the leniency, in seconds
 * @param cycles - the measured cycles
 * @returns the fits, from the earliest scorable checkpoint down to {@link LAST_CHECKPOINT_S}
 */
function fitCheckpoints(
  samples: readonly Attempt[],
  reference: readonly Attempt[],
  delta: number,
  cycles: Cycles,
): CheckpointFit[] {
  const fits: CheckpointFit[] = [];
  for (const tLeft of checkpointGrid(reference, delta)) {
    const earlier = reference
      .map((run) => scoreAt(run.curve, tLeft + delta))
      .filter((score) => score !== null);
    if (earlier.length < reference.length) {
      if (fits.length) fits.push({ tLeft, threshold: null });
      continue;
    }
    const threshold = Math.min(...earlier);
    const cuts = samples.filter((run) => isUnder(run, tLeft, threshold)).length;
    const looLosses = reference.filter((run, i) =>
      isUnder(run, tLeft, Math.min(...earlier.filter((_, j) => j !== i))),
    ).length;
    const savedS = cuts * (cycles.kept - cutCycle(cycles, tLeft));
    fits.push({ tLeft, threshold, cuts, savedS, looLosses });
  }
  return fits;
}

/**
 * Times the sample runs under a rule.
 *
 * @param samples - the sample runs
 * @param top - the top runs among them
 * @param cutAt - the checkpoint a run is cut at, in seconds left; null when the rule keeps it
 * @param cycles - the measured cycles
 * @returns the runs' total seconds, and how many top runs the rule keeps
 */
function timeRule(
  samples: readonly Attempt[],
  top: ReadonlySet<Attempt>,
  cutAt: (attempt: Attempt) => number | null,
  cycles: Cycles,
): { seconds: number; topKept: number } {
  let seconds = 0;
  let topKept = 0;
  for (const run of samples) {
    const tLeft = cutAt(run);
    seconds += tLeft === null ? cycles.kept : cutCycle(cycles, tLeft);
    if (tLeft === null && top.has(run)) topKept++;
  }
  return { seconds, topKept };
}

/**
 * Every rule of one or two checkpoints from a leniency's fits that qualify: scorable, with no
 * leave-one-out loss.
 *
 * @param fits - one leniency's checkpoint fits, earliest first
 * @returns each rule's checkpoints, earliest first
 */
function ruleCheckpoints(fits: readonly CheckpointFit[]): CutoffCheckpoint[][] {
  const qualifying = fits.flatMap((fit) =>
    fit.threshold !== null && fit.looLosses === 0
      ? [{ tLeft: fit.tLeft, minScore: fit.threshold }]
      : [],
  );
  return qualifying.flatMap((first, i) => [
    [first],
    ...qualifying.slice(i + 1).map((second) => [first, second]),
  ]);
}

/**
 * Tells whether one candidate beats another: fewer seconds, then fewer checkpoints, then the
 * larger leniency, then the later checkpoints.
 *
 * @param a - the challenger
 * @param b - the candidate to beat
 * @returns true when `a` wins
 */
function beats(a: Candidate, b: Candidate): boolean {
  if (a.seconds !== b.seconds) return a.seconds < b.seconds;
  if (a.checkpoints.length !== b.checkpoints.length) {
    return a.checkpoints.length < b.checkpoints.length;
  }
  if (a.delta !== b.delta) return a.delta > b.delta;
  const differs = a.checkpoints.findIndex((c, i) => c.tLeft !== b.checkpoints[i]!.tLeft);
  return differs >= 0 && a.checkpoints[differs]!.tLeft < b.checkpoints[differs]!.tLeft;
}

/**
 * How many of the best sample finals count as top before ties at the bar widen it.
 *
 * @param samples - the sample runs' count
 * @returns the top {@link TOP_SHARE}, rounded up, at least one
 */
function topSize(samples: number): number {
  return Math.max(1, Math.ceil(samples * TOP_SHARE));
}

/**
 * How many of the best sample finals set the thresholds.
 *
 * @param samples - the sample runs' count
 * @param top - the top runs' count, ties at the bar included
 * @returns the top {@link REFERENCE_SHARE}, rounded up, widened to hold every top run
 */
function referenceSize(samples: number, top: number): number {
  return Math.max(top, Math.ceil(samples * REFERENCE_SHARE));
}

/**
 * The fewest sample runs whose reference set reaches {@link MIN_REFERENCE} with no tie at the bar.
 *
 * @returns the count
 */
function samplesNeeded(): number {
  let samples = 1;
  while (referenceSize(samples, topSize(samples)) < MIN_REFERENCE) samples++;
  return samples;
}

/**
 * Picks the cheapest qualifying rule at one leniency.
 *
 * @param delta - the leniency, in seconds
 * @param fits - its checkpoint fits, earliest first
 * @param samples - the sample runs
 * @param top - the top runs among them
 * @param cycles - the measured cycles
 * @returns the winning candidate; null when no checkpoint qualifies
 */
function chooseRule(
  delta: (typeof DELTAS_S)[number],
  fits: readonly CheckpointFit[],
  samples: readonly Attempt[],
  top: ReadonlySet<Attempt>,
  cycles: Cycles,
): Candidate | null {
  let best: Candidate | null = null;
  for (const checkpoints of ruleCheckpoints(fits)) {
    const cost = timeRule(
      samples,
      top,
      (run) => checkpoints.find((c) => isUnder(run, c.tLeft, c.minScore))?.tLeft ?? null,
      cycles,
    );
    const candidate = { delta, checkpoints, ...cost };
    if (best === null || beats(candidate, best)) best = candidate;
  }
  return best;
}

/**
 * Fits the earliest pace check that keeps every top run. The sample runs (`sample` true, with a
 * final and a curve) define the target: the top {@link TOP_SHARE} by final. The top
 * {@link REFERENCE_SHARE}, widened to hold every top run, set each checkpoint's threshold, the
 * lowest score one of them had `δ` seconds earlier, and a rule of one or two checkpoints
 * qualifies when no reference run falls under thresholds fitted without it. The cheapest
 * qualifying rule on the sample runs wins.
 *
 * @param attempts - every run, oldest first; ties by final go to the earlier run
 * @param minScore - the macro's bar score at {@link BAR_S}, for the baseline only
 * @returns the analysis; `ok: false`, with the reason, when the runs can't support a fit
 */
export function analyzeCutoff(attempts: readonly Attempt[], minScore: number): CutoffAnalysis {
  const samples = attempts.filter(
    (run): run is Sample => run.sample === true && run.finalScore !== null && run.curve.length > 0,
  );
  const read: RunsRead = { samples: samples.length, others: attempts.length - samples.length };
  const tooFew: CutoffRefusal = {
    ok: false,
    reason: "small-reference",
    ...read,
    samplesNeeded: samplesNeeded(),
  };
  if (!samples.length) return tooFew;

  // Array.prototype.sort is stable, so on a tie the earlier run in the file stays ahead.
  const ranked = [...samples].sort((a, b) => b.finalScore - a.finalScore);
  const bar = ranked[topSize(samples.length) - 1]!.finalScore;
  const top = samples.filter((run) => run.finalScore >= bar);
  const topSet = new Set(top);
  const reference = ranked.slice(0, referenceSize(samples.length, top.length));
  if (reference.length < MIN_REFERENCE) return tooFew;

  const cut = medianCycle(attempts, (run) => run.end === "pruned");
  if (cut === null) return { ok: false, reason: "no-cut-cycle", ...read };
  const kept = medianCycle(attempts, (run) => isKept(run.end));
  if (kept === null) return { ok: false, reason: "no-kept-cycle", ...read };
  const cycles: Cycles = { cut, kept };

  const lossBound = 1 - BOUND_RISK ** (1 / reference.length);
  const perDelta = DELTAS_S.map((delta) => {
    const checkpoints = fitCheckpoints(samples, reference, delta, cycles);
    const candidate = chooseRule(delta, checkpoints, samples, topSet, cycles);
    const fit: CutoffFit = {
      delta,
      checkpoints,
      best: candidate && {
        delta,
        checkpoints: candidate.checkpoints,
        hours: candidate.seconds / 3600,
        topPerHour: candidate.topKept / (candidate.seconds / 3600),
        lossBound,
      },
    };
    return { fit, candidate };
  });
  const winner = perDelta.reduce<{ fit: CutoffFit; candidate: Candidate } | null>(
    (best, { fit, candidate }) =>
      candidate !== null && (best === null || beats(candidate, best.candidate))
        ? { fit, candidate }
        : best,
    null,
  );

  const atBar = timeRule(
    samples,
    topSet,
    (run) => {
      const score = barScore(run);
      return score !== null && score < minScore ? BAR_S : null;
    },
    cycles,
  );
  const baselineHours = atBar.seconds / 3600;

  return {
    ok: true,
    ...read,
    bar,
    top,
    reference,
    fits: perDelta.map(({ fit }) => fit),
    best: winner?.fit.best ?? null,
    baseline: {
      hours: baselineHours,
      topCut: top.length - atBar.topKept,
      topPerHour: atBar.topKept / baselineHours,
    },
  };
}

/**
 * Writes a rule as the macro INI's `[Prune] Checkpoints` value.
 *
 * @param rule - the rule
 * @returns `<seconds left>:<min score>` per checkpoint, earliest first, joined by `|`
 */
export function checkpointsLine(rule: CutoffRule): string {
  return rule.checkpoints.map(({ tLeft, minScore }) => `${tLeft}:${minScore}`).join("|");
}
