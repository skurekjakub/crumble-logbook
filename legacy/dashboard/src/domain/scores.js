/**
 * Score arithmetic. Damage and power are stored in G (1e9); the community ranks runs
 * by 배, the multiple damage ÷ team power.
 */

/**
 * Damage as a multiple of team power.
 * @param {{damage_g?: number, power_g?: number, ratio?: number}} s
 * @returns {number|null} rounded 배, the stored `ratio` when power is unknown, or null
 */
export function ratio(s) {
  if (s.damage_g > 0 && s.power_g > 0) return Math.round(s.damage_g / s.power_g);
  return typeof s.ratio === "number" ? s.ratio : null;
}

/**
 * Format a G value the way the game does: "867G", "1.31T".
 * @param {number|null|undefined} g - value in G
 * @returns {string} "–" for missing values
 */
export function formatG(g) {
  if (g == null || g === "" || Number.isNaN(+g)) return "–";
  if (g >= 1000) return `${trim((g / 1000).toFixed(2))}T`;
  if (g >= 10) return `${Math.round(g)}G`;
  return `${trim((+g).toFixed(2))}G`;
}

/**
 * Scores sorted by damage, highest first. Does not mutate the input.
 * @param {object[]} scores
 * @returns {object[]}
 */
export const byDamage = scores => [...scores].sort((a, b) => (b.damage_g || 0) - (a.damage_g || 0));

/**
 * Scores that can be plotted (both damage and power known and positive).
 * @param {object[]} scores
 * @returns {object[]}
 */
export const plottable = scores => scores.filter(s => s.damage_g > 0 && s.power_g > 0);

function trim(s) { return s.replace(/\.?0+$/, ""); }
