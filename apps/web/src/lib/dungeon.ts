/**
 * Crumble Dungeon's arithmetic and labels: printing a score or a total
 * power in G, the score ÷ total power normaliser, a server rank, and how
 * a published lineup stands against the exclusions list. Pure; the rows
 * come from the API.
 *
 * @module
 */
import type { ExclusionClass, ExclusionStatus } from "@crumble/schema";

/** A label per kind of reason a cookie is kept out of the first wave. */
export const EXCLUSION_KINDS: Readonly<Record<ExclusionClass, string>> = {
  charger: "Charger",
  summoner: "Summoner",
  "projectile-speed": "Projectile Speed recipient",
  "buff-overwrite": "Buff overwrite",
};

/** A label per place an exclusion stands. */
export const EXCLUSION_STATUSES: Readonly<Record<ExclusionStatus, string>> = {
  excluded: "Excluded",
  disputed: "Disputed",
  patched: "Patched",
};

/**
 * Prints a value in G to four significant figures, as the runs board
 * shows scores and total powers: `379.3G`, `15.58G`, `0.575G`.
 *
 * @param g - a value in G
 * @returns the text, or "–" for null or undefined
 */
export function formatDungeonG(g: number | null | undefined): string {
  if (g == null) return "–";
  return `${Number(g.toPrecision(4))}G`;
}

/**
 * Score as a multiple of the collection's total power: only a normaliser
 * for comparing accounts, never a ranking.
 *
 * @param scoreG - the score, in G
 * @param totalPowerG - the total power the screen shows, in G, when known
 * @returns the multiple to one decimal, or null without a positive total power
 */
export function scorePerPower(scoreG: number, totalPowerG: number | null): number | null {
  if (totalPowerG == null || totalPowerG <= 0) return null;
  return Math.round((scoreG / totalPowerG) * 10) / 10;
}

/**
 * Prints a place on a board: `1st`, `2nd`, `3rd`, `11th`, `22nd`.
 *
 * @param n - the place, from 1
 * @returns the ordinal
 */
export function ordinal(n: number): string {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th");
  return `${n}${suffix}`;
}

/** One exclusion as a lineup check reads it. */
export interface ExclusionRef {
  /** The excluded cookie's Korean name. */
  cookieKr: string;
  /** Where the exclusion stands. */
  status: ExclusionStatus;
}

/**
 * The cookies a lineup keeps in its first wave although the exclusions
 * list names them as excluded or disputed (a patched exclusion no longer
 * applies).
 *
 * @param first - the lineup's first wave, as Korean names
 * @param exclusions - the exclusions list
 * @returns the exclusions the lineup keeps, in the list's order
 */
export function keptExclusions<E extends ExclusionRef>(
  first: readonly string[],
  exclusions: readonly E[],
): E[] {
  const kept = new Set(first);
  return exclusions.filter((e) => e.status !== "patched" && kept.has(e.cookieKr));
}
