/**
 * Team power as the game prints it and players post it: reading a typed
 * power, reading the figure out of a posted one, and the least power that
 * enters a bracket of the power gate. Pure, with no imports, so the web
 * app can load it on its own (`@crumble/schema/power`).
 *
 * @module
 */

/** The value of each power unit the game prints, by its lower-case letter. */
const UNITS: Readonly<Record<string, number>> = { t: 1e12, g: 1e9, m: 1e6, k: 1e3 };

/** The units from largest to smallest: a power's parts come in this order, each unit once. */
const UNIT_ORDER = ["t", "g", "m", "k"];

/** A number as players write it: digits, with or without thousands separators, and an optional decimal part. */
const NUMBER = String.raw`(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?`;

/** A whole text that is a plain number. */
const PLAIN = new RegExp(`^${NUMBER}$`);

/** One figure and its unit, e.g. `4G` or `971.8 M`, read one after another from where the last stopped. */
const PART = new RegExp(String.raw`\s*(${NUMBER})\s*([tgmk])(?![a-z])`, "iy");

/** A run of figures with units inside free text, e.g. `4G 3M 599K` in `4.00G (4G 3M 599K)`. */
const RUN = new RegExp(
  String.raw`(?<![\d.,])${NUMBER}\s*[tgmk](?![a-z])(?:\s+${NUMBER}\s*[tgmk](?![a-z]))*`,
  "gi",
);

/**
 * Reads a number as players write it.
 *
 * @param text - digits, with or without thousands separators
 * @returns the number
 */
const numberOf = (text: string) => Number(text.replaceAll(",", ""));

/**
 * Reads a team power as typed or as the game prints it: `2.2G`, `971.8M`,
 * `4 G`, `4G 3M 599K` (the parts add up, largest unit first, each unit
 * once), or a plain number with or without thousands separators, rounded
 * to a whole power.
 *
 * @param text - the typed power; surrounding whitespace is ignored
 * @returns the power, rounded to a whole number, or null when the text
 *   isn't a positive power
 */
export function parsePower(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  if (PLAIN.test(trimmed)) {
    const plain = Math.round(numberOf(trimmed));
    return plain > 0 ? plain : null;
  }
  let total = 0;
  let at = 0;
  let unitAt = -1;
  while (at < trimmed.length) {
    PART.lastIndex = at;
    const part = PART.exec(trimmed);
    if (!part) return null;
    const unit = part[2]!.toLowerCase();
    const rank = UNIT_ORDER.indexOf(unit);
    if (rank <= unitAt) return null;
    unitAt = rank;
    total += numberOf(part[1]!) * UNITS[unit]!;
    at = PART.lastIndex;
  }
  const power = Math.round(total);
  return power > 0 ? power : null;
}

/**
 * The number of significant digits of a whole power: how precisely a
 * figure states it.
 *
 * @param power - a whole power
 * @returns its digits, trailing zeros left out
 */
const precisionOf = (power: number) => String(power).replace(/0+$/, "").length;

/**
 * Reads the team power out of a post's wording: every figure with units in
 * the text (`4.00G (4G 3M 599K)`, `about 4.03G ('딱투')`, `just over 3G`)
 * is read as {@link parsePower} reads it, and the most precise wins, the
 * first on a tie, so an exact breakdown beats its rounded headline.
 *
 * @param posted - the power as the post gives it
 * @returns the power, or null when the text has no figure with a unit
 */
export function postedPower(posted: string): number | null {
  let best: number | null = null;
  for (const [run] of posted.matchAll(RUN)) {
    const power = parsePower(run);
    if (power !== null && (best === null || precisionOf(power) > precisionOf(best))) best = power;
  }
  return best;
}

/**
 * Reads the team power out of a post's wording as billions (G), as
 * {@link postedPower} finds it.
 *
 * @param posted - the power as the post gives it
 * @returns the power in G, or null when the text has no figure with a unit
 */
export function postedPowerG(posted: string): number | null {
  const power = postedPower(posted);
  return power === null ? null : Number((power / 1e9).toPrecision(12));
}

/**
 * The least team power in a bracket at a stage: `minRatioPct`% of its
 * recommended power, rounded up to a whole power, as the game rounds it.
 *
 * @param recommended - the stage's or Rift level's recommended power
 * @param minRatioPct - the bracket's lower bound, in percent of recommended power
 * @returns the entry power
 */
export function entryPower(recommended: number, minRatioPct: number): number {
  return Math.ceil((recommended * minRatioPct) / 100);
}
