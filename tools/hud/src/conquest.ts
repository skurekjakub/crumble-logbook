/**
 * The Guild Conquest numbers: the fight's running score (the big red-to-orange number at the top,
 * e.g. 1,776,472,632,591), the countdown under it (white, e.g. 30.267), and the final score on the
 * BATTLE OVER results (yellow-to-orange).
 *
 * @module
 */
import type { DigitTemplate } from "./digits.ts";
import type { Field } from "./glyphs.ts";
import type { HudTemplates, Reading } from "./hud.ts";
import { learnDigits, readDigits } from "./hud.ts";
import type { Screen } from "./screen.ts";

/** Gaps up to this fraction of the line height part two groups across a comma or the dot (about 0.5). */
const SEPARATOR_GAP = 0.75;

/**
 * The score on the 1440x2560 portrait display. Its glyphs span rows 404 to 477; the band is wider
 * so a longer number or a small layout shift still fits. Its fill runs from a pink red (E6324F)
 * at the top to an orange red (EE4A37) at the bottom; the black outline, the pink and orange bears
 * and the blue Piñata all fall outside it.
 */
export const SCORE: Field = {
  region: { x: 40, y: 370, width: 1360, height: 150 },
  isInk: (r, g, b) => r >= 200 && g <= 150 && b <= 110 && r - g >= 90,
  minHeight: 40,
  maxSeparatorGap: SEPARATOR_GAP,
};

/**
 * The countdown, seconds left in the fight. Its glyphs span rows 527 to 556 from column 613; the
 * band starts right of the clock icon and stops above the leaderboard's names.
 */
export const TIMER: Field = {
  region: { x: 605, y: 512, width: 275, height: 60 },
  isInk: (r, g, b) => r >= 200 && g >= 200 && b >= 200,
  minHeight: 20,
  maxSeparatorGap: SEPARATOR_GAP,
};

/**
 * The final score on the BATTLE OVER results, under the "Final Score" title. Its glyphs span about
 * rows 1045 to 1137 and settle a few pixels as the results slide in. Its fill runs from yellow
 * (FFE84A) at the top to orange (FC8D26) at the bottom; the orange stripes behind it stay under
 * a red of A8.
 */
export const FINAL: Field = {
  region: { x: 100, y: 1000, width: 1240, height: 180 },
  isInk: (r, g, b) => r >= 230 && g >= 130 && b <= 110,
  minHeight: 50,
  maxSeparatorGap: SEPARATOR_GAP,
};

/** The Guild Conquest fields by font: each is the only field drawn in its font. */
export const CONQUEST_FIELDS = { score: SCORE, timer: TIMER, final: FINAL } as const;

/** The fight lasts this long; a countdown above it is a misread. */
const FIGHT_SECONDS = 60;

/**
 * Reads the score, e.g. 1,776,472,632,591.
 *
 * @param screen - a capture of the fight screen.
 * @param templates - the learned digits.
 * @returns the score, or the reason it can't be read: not on screen, a digit hidden by a floating
 *   damage number, a glyph no template matches, or digits that don't group in thousands.
 * @throws Error when there are no score templates.
 */
export function readScore(screen: Screen, templates: HudTemplates): Reading {
  return readThousands(screen, SCORE, templates.score);
}

/**
 * Reads the final score on the BATTLE OVER results, e.g. 3,491,361,381,300.
 *
 * @param screen - a capture of the results.
 * @param templates - the learned digits.
 * @returns the final score, or the reason it can't be read: not on screen, a glyph no template
 *   matches, or digits that don't group in thousands.
 * @throws Error when there are no final-score templates.
 */
export function readFinal(screen: Screen, templates: HudTemplates): Reading {
  return readThousands(screen, FINAL, templates.final);
}

/**
 * Reads a field that shows a whole number grouped in thousands.
 *
 * @param screen - the capture.
 * @param field - the number to read.
 * @param templates - the field's learned digits.
 * @returns the number, or the reason it can't be read.
 * @throws Error when the field has no templates.
 */
function readThousands(screen: Screen, field: Field, templates: DigitTemplate[]): Reading {
  const read = readDigits(screen, field, templates);
  if (!read.ok) return read;
  const { groups } = read;
  if (groups[0]! > 3 || groups.slice(1).some((n) => n !== 3))
    return { ok: false, reason: `digit groups ${groups.join(",")} aren't a thousands grouping` };
  return { ok: true, value: Number(read.digits) };
}

/**
 * Reads the countdown, e.g. 30.267 seconds left.
 *
 * @param screen - a capture of the fight screen.
 * @param templates - the learned digits.
 * @returns the seconds left, or the reason they can't be read: not on screen, a hidden or unclear
 *   digit, or digits that aren't seconds and milliseconds of a fight.
 * @throws Error when there are no timer templates.
 */
export function readTimer(screen: Screen, templates: HudTemplates): Reading {
  const read = readDigits(screen, TIMER, templates.timer);
  if (!read.ok) return read;
  const [whole, millis] = read.groups;
  if (read.groups.length !== 2 || whole! > 2 || millis !== 3)
    return { ok: false, reason: `digit groups ${read.groups.join(",")} aren't seconds.millis` };
  const seconds = Number(read.digits) / 1000;
  if (seconds > FIGHT_SECONDS) return { ok: false, reason: `${seconds} s is longer than a fight` };
  return { ok: true, value: seconds };
}

/**
 * Learns a Guild Conquest field's digits from a capture whose number is known.
 *
 * @param screen - a capture of the fight screen, or of the results for "final".
 * @param font - the field the number is in.
 * @param shown - the number the field shows, e.g. "1,776,472,632,591" or "30.267".
 * @param templates - the current templates; left unchanged.
 * @returns the updated templates.
 * @throws Error when `shown` isn't a number, or the capture's digits can't be found or don't
 *   number as many as `shown`'s.
 */
export function learnField(
  screen: Screen,
  font: keyof typeof CONQUEST_FIELDS,
  shown: string,
  templates: HudTemplates,
): HudTemplates {
  return {
    ...templates,
    [font]: learnDigits(screen, CONQUEST_FIELDS[font], shown, templates[font]),
  };
}
