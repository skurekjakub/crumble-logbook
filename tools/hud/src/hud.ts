/**
 * Reads a field's digits off a capture against learned templates, and learns the templates from a
 * capture whose number is known. The fields themselves live with their screens: `conquest.ts` and
 * `stage.ts`.
 *
 * @module
 */
import type { DigitTemplate } from "./digits.ts";
import { isConfident, learn, match, shapeOf } from "./digits.ts";
import type { Field } from "./glyphs.ts";
import { digitGlyphs, findBlobs, groupDigits } from "./glyphs.ts";
import type { Screen } from "./screen.ts";

/** The learned digits of each field's font. */
export interface HudTemplates {
  score: DigitTemplate[];
  timer: DigitTemplate[];
  final: DigitTemplate[];
  stageBar: DigitTemplate[];
  stageRepeat: DigitTemplate[];
}

/** A font's name: its key in `templates.json`. */
export type FontName = keyof HudTemplates;

/** Every font, in the order `templates.json` lists them. */
export const FONT_NAMES: readonly FontName[] = [
  "score",
  "timer",
  "final",
  "stageBar",
  "stageRepeat",
];

/** A value read off the screen, or why it can't be read. */
export type Reading<T = number> = { ok: true; value: T } | { ok: false; reason: string };

/** A field's digits as read, with the size of each group between separators. */
export type DigitsReading =
  { ok: true; digits: string; groups: number[] } | { ok: false; reason: string };

/**
 * Makes a set of templates with nothing learned.
 *
 * @returns an empty list per font.
 */
export function emptyTemplates(): HudTemplates {
  return { score: [], timer: [], final: [], stageBar: [], stageRepeat: [] };
}

/**
 * Reads a field's digits. Every digit must be found, sit in its group and match a template
 * confidently; otherwise the reading fails rather than guess.
 *
 * @param screen - the capture.
 * @param field - the number to read.
 * @param templates - the learned digits of the field's font.
 * @returns the digits and their grouping, or the reason they can't be read.
 * @throws Error when the font has no templates.
 */
export function readDigits(
  screen: Screen,
  field: Field,
  templates: DigitTemplate[],
): DigitsReading {
  const blobs = findBlobs(screen, field);
  const glyphs = digitGlyphs(blobs, field);
  let groups: number[];
  try {
    groups = groupDigits(glyphs, field);
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
  let digits = "";
  for (const [i, glyph] of glyphs.entries()) {
    const m = match(shapeOf(blobs, glyph), templates);
    if (!isConfident(m, field.maxDistance))
      return {
        ok: false,
        reason: `digit ${i + 1} is unclear (nearest ${m.digit} at ${m.distance.toFixed(3)}, next at ${m.runnerUp.toFixed(3)})`,
      };
    digits += m.digit;
  }
  return { ok: true, digits, groups };
}

/**
 * Learns a field's digits from a capture whose number is known, folding each glyph into its
 * digit's template.
 *
 * @param screen - the capture.
 * @param field - the field the number is in.
 * @param shown - the number the field shows, with or without its separators, e.g.
 *   "1,776,472,632,591", "30.267" or "358-20".
 * @param templates - the font's current templates; left unchanged.
 * @returns the font's updated templates.
 * @throws Error when `shown` isn't a number, or the capture's digits can't be found or don't
 *   number as many as `shown`'s.
 */
export function learnDigits(
  screen: Screen,
  field: Field,
  shown: string,
  templates: DigitTemplate[],
): DigitTemplate[] {
  const expected = shown.replaceAll(/[,.-]/g, "");
  if (!/^\d+$/.test(expected)) throw new Error(`"${shown}" isn't a number`);
  const blobs = findBlobs(screen, field);
  const glyphs = digitGlyphs(blobs, field);
  groupDigits(glyphs, field);
  if (glyphs.length !== expected.length)
    throw new Error(`the capture shows ${glyphs.length} digits, ${shown} has ${expected.length}`);
  let learned = templates;
  for (const [i, glyph] of glyphs.entries())
    learned = learn(learned, expected[i]!, shapeOf(blobs, glyph));
  return learned;
}
