/**
 * Score number formatting. Damage and power are stored in G (1e9); 배 is
 * damage ÷ team power, shown for comparison only and never used to rank.
 */

/**
 * Drops trailing zeros and a trailing decimal point: "2.00" → "2", "1.30" → "1.3".
 *
 * @param s - a formatted decimal number
 * @returns the trimmed text
 */
function trimZeros(s: string): string {
  return s.replace(/\.?0+$/, "");
}

/**
 * Formats a G value the way the game does: "867G", "0.97G", "1.31T".
 *
 * @param g - a value in G
 * @returns the formatted value, or "–" for null, undefined or NaN
 */
export function formatG(g: number | null | undefined): string {
  if (g == null || Number.isNaN(g)) return "–";
  if (g >= 1000) return `${trimZeros((g / 1000).toFixed(2))}T`;
  if (g >= 10) return `${Math.round(g)}G`;
  return `${trimZeros(g.toFixed(2))}G`;
}

/** The fields {@link ratio} reads from a score. */
export interface RatioInput {
  damageG: number;
  powerG: number | null;
  ratio?: number | null;
}

/**
 * Damage as a multiple of team power (배).
 *
 * @param s - a score
 * @returns `damageG ÷ powerG` rounded when both are positive; otherwise the
 *   score's stored `ratio`, or null when it has none
 */
export function ratio(s: RatioInput): number | null {
  if (s.damageG > 0 && s.powerG != null && s.powerG > 0) return Math.round(s.damageG / s.powerG);
  return s.ratio ?? null;
}

/**
 * Formats a 배 value for a table cell.
 *
 * @param r - a ratio, or null
 * @returns the number as text, or "–" when null
 */
export function formatRatio(r: number | null | undefined): string {
  return r == null ? "–" : String(r);
}
