/**
 * The dimensional rift's stage number, e.g. 12: the rift counts its stages up from 1 with no
 * chapters. It shows under the purple Summon Dimensional Boss button ("Repeating Dimensional Rift
 * Stage 12...") after its boss has won.
 *
 * @module
 */
import type { DigitTemplate } from "./digits.ts";
import type { Field } from "./glyphs.ts";
import type { HudTemplates, Reading } from "./hud.ts";
import { learnDigits, readDigits } from "./hud.ts";
import type { Screen } from "./screen.ts";

/**
 * The number in "Dimensional Rift Stage 12...", in yellow beside white words, rows 727 to 743 on
 * 2026-10-15. The line is centred, so the band spans its width; the trailing dots are too short
 * to be digits. The digits look like those of "Repeating Stage 358-20..." but are drawn a little
 * smaller, which puts them too far from that font's templates, so they learn their own.
 */
export const RIFT_REPEAT: Field = {
  region: { x: 560, y: 705, width: 600, height: 60 },
  isInk: (r, g, b) => r >= 200 && g >= 200 && b <= 100,
  minHeight: 12,
  maxSeparatorGap: 1.4,
  // The glyphs are 17 px tall and the 1 three wide, so a pixel's shift moves a sample far: a
  // learned 1 has read at 0.31 with the next digit at 0.59. The margin over the next digit
  // (digits.ts MIN_MARGIN) still keeps one digit from passing for another.
  maxDistance: 0.35,
};

/** The font the rift's number is read in: its key in `templates.json`. */
const FONT = "riftRepeat";
/** The font that stands in for a digit the rift's hasn't learned: the same shapes, drawn larger. */
const FALLBACK = "stageRepeat";

/** A rift stage's number has at most this many digits. */
const MAX_DIGITS = 3;

/**
 * Picks the templates the rift's number is matched against: the rift's own, and for each digit it
 * hasn't learned yet, the chapter stages' repeat font's. Without one, an unlearned digit could
 * pass for its nearest learned one, as a 7 once read as a 6.
 *
 * @param templates - the learned digits.
 * @returns the templates to match against.
 */
function riftDigits(templates: HudTemplates): DigitTemplate[] {
  const learned = new Set(templates[FONT].map((t) => t.digit));
  return [...templates[FONT], ...templates[FALLBACK].filter((t) => !learned.has(t.digit))];
}

/**
 * Reads the rift stage's number under Summon Dimensional Boss.
 *
 * @param screen - a capture of the rift.
 * @param templates - the learned digits.
 * @returns the stage's number, or why it can't be read: not on screen, a hidden or unclear
 *   digit, or digits that aren't one stage number.
 * @throws Error when neither font has templates.
 */
export function readRift(screen: Screen, templates: HudTemplates): Reading {
  const read = readDigits(screen, RIFT_REPEAT, riftDigits(templates));
  if (!read.ok) return read;
  if (read.groups.length !== 1 || read.digits.length > MAX_DIGITS || read.digits[0] === "0")
    return { ok: false, reason: `digit groups ${read.groups.join(",")} aren't a rift stage` };
  return { ok: true, value: Number(read.digits) };
}

/**
 * Learns the rift number's digits from a capture whose stage is known.
 *
 * @param screen - a capture of the rift.
 * @param shown - the stage shown, e.g. "12".
 * @param templates - the current templates; left unchanged.
 * @returns the updated templates.
 * @throws Error when `shown` isn't a rift stage, or the capture doesn't show that many digits.
 */
export function learnRift(screen: Screen, shown: string, templates: HudTemplates): HudTemplates {
  if (!/^[1-9]\d{0,2}$/.test(shown)) throw new Error(`"${shown}" isn't a rift stage`);
  return { ...templates, [FONT]: learnDigits(screen, RIFT_REPEAT, shown, templates[FONT]) };
}
