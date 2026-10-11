/**
 * Reads the Guild Conquest fight's running score and countdown, and the results' final score,
 * from a capture, and learns the digit templates from a capture whose numbers are known.
 *
 * @module
 */
import type { DigitTemplate } from "./digits.ts";
import { isConfident, learn, match, shapeOf } from "./digits.ts";
import type { Field } from "./glyphs.ts";
import { digitGlyphs, findBlobs, FINAL, groupDigits, SCORE, TIMER } from "./glyphs.ts";
import type { Screen } from "./screen.ts";

/** The learned digits of each field; the fields use different fonts. */
export interface HudTemplates {
  score: DigitTemplate[];
  timer: DigitTemplate[];
  final: DigitTemplate[];
}

/** The fields by name. */
const FIELDS: Record<Field["name"], Field> = { score: SCORE, timer: TIMER, final: FINAL };

/** A number read off the screen, or why it can't be read. */
export type Reading = { ok: true; value: number } | { ok: false; reason: string };

/** The fight lasts this long; a countdown above it is a misread. */
const FIGHT_SECONDS = 60;

/**
 * Reads a field's digits. Every digit must be found, sit in its group and match a template
 * confidently; otherwise the reading fails rather than guess.
 *
 * @param screen - a capture of the fight screen.
 * @param field - the number to read.
 * @param templates - the field's learned digits.
 * @returns the digits and their grouping, or the reason they can't be read.
 * @throws Error when the field has no templates.
 */
function readDigits(
  screen: Screen,
  field: Field,
  templates: DigitTemplate[],
): { ok: true; digits: string; groups: number[] } | { ok: false; reason: string } {
  const blobs = findBlobs(screen, field);
  const glyphs = digitGlyphs(blobs, field);
  let groups: number[];
  try {
    groups = groupDigits(glyphs);
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
  let digits = "";
  for (const [i, glyph] of glyphs.entries()) {
    const m = match(shapeOf(blobs, glyph), templates);
    if (!isConfident(m))
      return {
        ok: false,
        reason: `digit ${i + 1} is unclear (nearest ${m.digit} at ${m.distance.toFixed(3)}, next at ${m.runnerUp.toFixed(3)})`,
      };
    digits += m.digit;
  }
  return { ok: true, digits, groups };
}

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
 * Learns the digits of a capture whose number is known, folding each glyph into its digit's
 * template.
 *
 * @param screen - a capture of the fight screen, or of the results for "final".
 * @param field - the field the number is in.
 * @param shown - the number the field shows, with or without its separators, e.g.
 *   "1,776,472,632,591" or "30.267".
 * @param templates - the current templates; left unchanged.
 * @returns the updated templates.
 * @throws Error when `shown` isn't a number, or the capture's digits can't be found or don't
 *   number as many as `shown`'s.
 */
export function learnField(
  screen: Screen,
  field: Field["name"],
  shown: string,
  templates: HudTemplates,
): HudTemplates {
  const expected = shown.replaceAll(/[,.]/g, "");
  if (!/^\d+$/.test(expected)) throw new Error(`"${shown}" isn't a number`);
  const spec = FIELDS[field];
  const blobs = findBlobs(screen, spec);
  const glyphs = digitGlyphs(blobs, spec);
  groupDigits(glyphs);
  if (glyphs.length !== expected.length)
    throw new Error(`the capture shows ${glyphs.length} digits, ${shown} has ${expected.length}`);
  let learned = templates[field];
  for (const [i, glyph] of glyphs.entries())
    learned = learn(learned, expected[i]!, shapeOf(blobs, glyph));
  return { ...templates, [field]: learned };
}
