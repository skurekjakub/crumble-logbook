/**
 * The power gate's arithmetic: reading and printing team power, a team's
 * damage bracket at a stage, the least power that enters a bracket, and how
 * far a team pushes while it stays in one. Pure; the bracket table and the
 * recommended powers come from the API.
 *
 * @module
 */

/** A bracket of the power gate: from `minRatioPct`% of recommended power, `damagePct`% of damage is kept. */
export interface Bracket {
  minRatioPct: number;
  damagePct: number;
}

/** The value of each power unit the game prints. */
const UNITS: Readonly<Record<string, number>> = { t: 1e12, g: 1e9, m: 1e6, k: 1e3 };

/**
 * Reads a team power as typed or as the game prints it: `2.2G`, `971.8M`,
 * `4G 3M 599K` (the parts add up), or a plain number with or without
 * thousands separators.
 *
 * @param text - the typed power
 * @returns the power, or null when the text isn't a positive power
 */
export function parsePower(text: string): number | null {
  const trimmed = text.trim().replaceAll(",", "");
  if (trimmed === "") return null;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed) > 0 ? Number(trimmed) : null;
  const parts = [...trimmed.matchAll(/(\d+(?:\.\d+)?)\s*([tgmk])/gi)];
  if (parts.length === 0 || parts.map((p) => p[0]).join("") !== trimmed.replace(/\s+/g, "")) {
    return null;
  }
  const total = parts.reduce((sum, p) => sum + Number(p[1]) * UNITS[p[2]!.toLowerCase()]!, 0);
  return total > 0 ? Math.round(total) : null;
}

/**
 * Drops trailing zeros and a trailing decimal point: "2.00" → "2".
 *
 * @param s - a formatted decimal number
 * @returns the trimmed text
 */
function trimZeros(s: string): string {
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}

/**
 * Prints a team power the short way the community writes it: `2.74G`,
 * `971.8M`, `10.26K`, `1.8T`.
 *
 * @param power - the power
 * @returns the text
 */
export function formatPower(power: number): string {
  if (power >= 1e12) return `${trimZeros((power / 1e12).toFixed(2))}T`;
  if (power >= 1e9) return `${trimZeros((power / 1e9).toFixed(2))}G`;
  if (power >= 1e6) return `${trimZeros((power / 1e6).toFixed(1))}M`;
  if (power >= 1e3) return `${trimZeros((power / 1e3).toFixed(2))}K`;
  return String(power);
}

/**
 * The least team power in a bracket at a stage: `minRatioPct`% of its
 * recommended power, rounded up to a whole power.
 *
 * @param recommended - the stage's or Rift level's recommended power
 * @param minRatioPct - the bracket's lower bound, in percent of recommended power
 * @returns the entry power
 */
export function entryPower(recommended: number, minRatioPct: number): number {
  return Math.ceil((recommended * minRatioPct) / 100);
}

/**
 * The bracket a team is in at a stage: the highest one whose entry power
 * it reaches. The gate is stepwise; nothing between steps is interpolated.
 *
 * @param brackets - the bracket table, in any order
 * @param power - the team's power
 * @param recommended - the stage's recommended power
 * @returns the bracket, or undefined when the table has none the team reaches
 */
export function bracketAt<B extends Bracket>(
  brackets: readonly B[],
  power: number,
  recommended: number,
): B | undefined {
  return [...brackets]
    .sort((a, b) => b.minRatioPct - a.minRatioPct)
    .find((b) => power >= entryPower(recommended, b.minRatioPct));
}

/**
 * The next bracket up from `current`: the one with the next higher lower bound.
 *
 * @param brackets - the bracket table, in any order
 * @param current - the team's bracket, or undefined when it's below them all
 * @returns the next bracket, or undefined at the top
 */
export function nextBracket<B extends Bracket>(
  brackets: readonly B[],
  current: B | undefined,
): B | undefined {
  const floor = current?.minRatioPct ?? -Infinity;
  return [...brackets]
    .sort((a, b) => a.minRatioPct - b.minRatioPct)
    .find((b) => b.minRatioPct > floor);
}

/**
 * How far a team pushes while keeping at least a bracket: the last of
 * `rows`, in push order, before the first one whose entry power for the
 * bracket the team doesn't reach.
 *
 * @param rows - stages or Rift levels, in push order
 * @param recommended - reads a row's recommended power
 * @param power - the team's power
 * @param minRatioPct - the bracket's lower bound
 * @returns the furthest row, or undefined when the team can't enter the first
 */
export function furthest<T>(
  rows: readonly T[],
  recommended: (row: T) => number,
  power: number,
  minRatioPct: number,
): T | undefined {
  let reached: T | undefined;
  for (const row of rows) {
    if (power < entryPower(recommended(row), minRatioPct)) break;
    reached = row;
  }
  return reached;
}

/**
 * Whether a text mentions any of `words`, case-insensitively.
 *
 * @param text - the text
 * @param words - the words to look for
 * @returns `true` if one of them is in the text
 */
export function mentionsAny(text: string, words: readonly string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w.toLowerCase()));
}

/** A Rift season's run of levels and dates, as {@link seasonAt} reads it. */
export interface SeasonSpan {
  startsAt: string;
  endsAt: string;
}

/**
 * The season running at `now`, else the next one to start.
 *
 * @param seasons - the seasons, in any order
 * @param now - the moment to look from
 * @returns the season and whether it is running, or undefined after the last one ends
 */
export function seasonAt<S extends SeasonSpan>(
  seasons: readonly S[],
  now: Date,
): { season: S; running: boolean } | undefined {
  const t = now.getTime();
  const sorted = [...seasons].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const running = sorted.find((s) => Date.parse(s.startsAt) <= t && t < Date.parse(s.endsAt));
  if (running) return { season: running, running: true };
  const next = sorted.find((s) => Date.parse(s.startsAt) > t);
  return next ? { season: next, running: false } : undefined;
}
