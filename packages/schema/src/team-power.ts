/**
 * The team-power rules both the record importer and the API apply to a
 * row: what a spending step must name, what makes a growth curve's table
 * whole, and when a planner step may carry a posted gain.
 *
 * @module
 */
import type { DataPointKind, StepBasis } from "./enums";
import type { CurveCell } from "./tables/team-power";

/** What a spending step spends on. */
export interface StepTarget {
  /** The power source it raises, as a slug. */
  powerSource: string | null;
  /** The package it buys, as a slug. */
  packageSlug: string | null;
}

/**
 * Checks that a spending step names one thing to spend on: a power source
 * or a package, not both and not neither.
 *
 * @param step - what the step names
 * @returns what is wrong with it, or `undefined` when it names one
 */
export function spendingStepProblem(step: StepTarget): string | undefined {
  if (step.powerSource != null && step.packageSlug != null) {
    return "a spending step names a power source or a package, not both";
  }
  if (step.powerSource == null && step.packageSlug == null) {
    return "a spending step names a power source or a package";
  }
  return undefined;
}

/** A growth curve's table. */
export interface CurveTable {
  /** The column names. */
  columns: readonly string[];
  /** The rows, one cell per column. */
  rows: ReadonlyArray<readonly CurveCell[]>;
  /** Each row's sources, when the curve cites rows apart. */
  rowSources: ReadonlyArray<readonly string[]> | null;
}

/**
 * Checks that a growth curve's table is whole: every row has a cell per
 * column, and per-row sources, when given, come one list per row.
 *
 * @param curve - the curve's table
 * @returns what is wrong with the first row out of shape, or `undefined`
 *   when the table is whole
 */
export function growthCurveProblem(curve: CurveTable): string | undefined {
  const width = curve.columns.length;
  const short = curve.rows.findIndex((row) => row.length !== width);
  if (short !== -1) {
    return `row ${short} has ${curve.rows[short]!.length} cells for ${width} columns`;
  }
  if (curve.rowSources !== null && curve.rowSources.length !== curve.rows.length) {
    return `row_sources has ${curve.rowSources.length} lists for ${curve.rows.length} rows`;
  }
  return undefined;
}

/** The data point a planner step takes its gain from, as the rule reads it. */
export interface GainPoint {
  /** How the figure is known. */
  kind: DataPointKind;
  /** The change in percent, when the figure gives one. */
  deltaPct: number | null;
}

/**
 * Checks a planner step's basis against its data point: a step whose basis
 * is posted takes its gain from a posted data point that gives a change,
 * so the planner never multiplies by a claimed or inferred figure.
 *
 * @param step - the step's basis and the data point it names
 * @param point - that data point, or `undefined` when the step names none
 *   or it doesn't exist
 * @returns what is wrong with the step, or `undefined` when it keeps the rule
 */
export function plannerStepProblem(
  step: { basis: StepBasis; dataPoint: string | null },
  point: GainPoint | undefined,
): string | undefined {
  if (step.basis !== "posted") return undefined;
  if (step.dataPoint == null) return "a posted planner step names the data point of its gain";
  if (!point) return `data point ${step.dataPoint} doesn't exist`;
  if (point.kind !== "posted") {
    return `a posted planner step takes a posted gain; data point ${step.dataPoint} is ${point.kind}`;
  }
  if (point.deltaPct === null) return `data point ${step.dataPoint} gives no change in percent`;
  return undefined;
}
