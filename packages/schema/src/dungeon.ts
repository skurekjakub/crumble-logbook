/**
 * The Crumble Dungeon rules both the record importer and the API apply to
 * a row: how a run's standing follows from what shows it, and what makes
 * a published lineup's lists agree with each other.
 *
 * @module
 */
import type { DungeonBoard, RunEvidence, RunStanding } from "./enums";

/**
 * Whether a Crumble Dungeon score is shown or only claimed: a claim when
 * text alone states it or when it was posted as a claim (`board: claim`),
 * verified when a screenshot or a video shows it.
 *
 * @param run - what backs the score and what it was shown on
 * @returns `claim` or `verified`
 */
export function runStanding(run: { evidence: RunEvidence; board: DungeonBoard }): RunStanding {
  return run.evidence === "text" || run.board === "claim" ? "claim" : "verified";
}

/** A published lineup's lists, as Korean names. */
export interface LineupLists {
  /** The first wave, in the author's order. */
  first40: readonly string[];
  /** The cookies the author keeps out. */
  excluded: readonly string[];
  /** The ATK order from the top. */
  atkOrder: readonly string[];
}

/**
 * Checks a published lineup's lists against each other: no cookie is both
 * in the first wave and kept out, and every cookie of the ATK order is in
 * the first wave.
 *
 * @param lineup - the lineup's lists
 * @returns what is wrong with the first cookie out of place, or `undefined`
 *   when the lists agree
 */
export function lineupProblem(lineup: LineupLists): string | undefined {
  const first = new Set(lineup.first40);
  const both = lineup.excluded.find((kr) => first.has(kr));
  if (both !== undefined) return `${both} is both in first40 and excluded`;
  const outside = lineup.atkOrder.find((kr) => !first.has(kr));
  if (outside !== undefined) return `atk_order names ${outside}, not in first40`;
  return undefined;
}
