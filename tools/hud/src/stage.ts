/**
 * The stage's number, e.g. 358-20: the chapter, whose world repeats every few chapters, and the
 * stage within it. A stage shows it in the top bar ("Stage 358-20") while its enemies are being
 * cleared, and under Summon Boss ("Repeating Stage 358-20...") after its boss has won.
 *
 * @module
 */
import type { Field } from "./glyphs.ts";
import type { HudTemplates, Reading } from "./hud.ts";
import { learnDigits, readDigits } from "./hud.ts";
import type { Screen } from "./screen.ts";

/** A stage's number. */
export interface StageNumber {
  chapter: number;
  stage: number;
}

/** Gaps up to this fraction of the line height part the chapter from the stage across the hyphen (about 1.0). */
const HYPHEN_GAP = 1.4;
/** The stages of a chapter run from 1 to this. */
const LAST_STAGE = 30;
/**
 * The stage glyphs are about 20 px tall, so a pixel's shift moves a sample further from its
 * template than the bigger Conquest digits do: a learned 8 has read at 0.14. The next-nearest digit
 * stays beyond 0.3, so the looser limit doesn't let one digit pass for another.
 */
const STAGE_MAX_DISTANCE = 0.2;

/**
 * The number in the top bar's "Stage 358-20", in pale yellow. "Stage" ends at column 459 and the
 * digits start at 473, rows 428 to 450; the band stops short of the Auto Summon checkbox.
 */
export const STAGE_BAR: Field = {
  region: { x: 465, y: 415, width: 225, height: 50 },
  isInk: (r, g, b) => r >= 200 && g >= 200 && b <= 190,
  minHeight: 15,
  maxSeparatorGap: HYPHEN_GAP,
  maxDistance: STAGE_MAX_DISTANCE,
};

/**
 * The number in "Repeating Stage 358-20..." under Summon Boss, in yellow beside white words, rows
 * 484 to 502. The line is centred, so the band spans its width; the trailing dots are too short
 * to be digits.
 */
export const STAGE_REPEAT: Field = {
  region: { x: 560, y: 470, width: 600, height: 50 },
  isInk: (r, g, b) => r >= 200 && g >= 200 && b <= 100,
  minHeight: 12,
  maxSeparatorGap: HYPHEN_GAP,
  maxDistance: STAGE_MAX_DISTANCE,
};

/** A place a stage shows its number, and the font it is drawn in there. */
interface StagePlace {
  field: Field;
  font: "stageBar" | "stageRepeat";
}

/** The places a stage shows its number, in the order they are tried. */
const STAGE_PLACES: readonly StagePlace[] = [
  { field: STAGE_BAR, font: "stageBar" },
  { field: STAGE_REPEAT, font: "stageRepeat" },
];

/**
 * Reads the stage's number from whichever place shows it.
 *
 * @param screen - a capture of a stage.
 * @param templates - the learned digits.
 * @returns the stage's number, or why neither place could be read: not on screen, a hidden or
 *   unclear digit, digits that aren't a chapter and a stage, or no digits learned for that place.
 */
export function readStage(screen: Screen, templates: HudTemplates): Reading<StageNumber> {
  const reasons: string[] = [];
  for (const place of STAGE_PLACES) {
    let reading: Reading<StageNumber>;
    try {
      reading = readStageAt(screen, place, templates);
    } catch (err) {
      reading = { ok: false, reason: (err as Error).message };
    }
    if (reading.ok) return reading;
    reasons.push(reading.reason);
  }
  return { ok: false, reason: reasons.join("; ") };
}

/**
 * Reads the stage's number from one place.
 *
 * @param screen - a capture of a stage.
 * @param place - the place to read.
 * @param templates - the learned digits.
 * @returns the stage's number, or why it can't be read.
 * @throws Error when the place's font has no templates.
 */
function readStageAt(
  screen: Screen,
  place: StagePlace,
  templates: HudTemplates,
): Reading<StageNumber> {
  const read = readDigits(screen, place.field, templates[place.font]);
  if (!read.ok) return read;
  const [chapterDigits, stageDigits] = read.groups;
  if (read.groups.length !== 2 || chapterDigits! > 4 || stageDigits! > 2)
    return { ok: false, reason: `digit groups ${read.groups.join(",")} aren't a chapter-stage` };
  const chapter = Number(read.digits.slice(0, chapterDigits));
  const stage = Number(read.digits.slice(chapterDigits));
  if (stage < 1 || stage > LAST_STAGE)
    return { ok: false, reason: `stage ${stage} isn't one of a chapter's` };
  return { ok: true, value: { chapter, stage } };
}

/**
 * Learns the stage number's digits from a capture whose number is known, from whichever place
 * shows it, into that place's font.
 *
 * @param screen - a capture of a stage.
 * @param shown - the number shown, e.g. "358-20".
 * @param templates - the current templates; left unchanged.
 * @returns the updated templates.
 * @throws Error when `shown` isn't a chapter and a stage, or neither place shows that many digits.
 */
export function learnStage(screen: Screen, shown: string, templates: HudTemplates): HudTemplates {
  if (!/^\d{1,4}-\d{1,2}$/.test(shown)) throw new Error(`"${shown}" isn't a chapter-stage`);
  const reasons: string[] = [];
  for (const { field, font } of STAGE_PLACES) {
    try {
      return { ...templates, [font]: learnDigits(screen, field, shown, templates[font]) };
    } catch (err) {
      reasons.push((err as Error).message);
    }
  }
  throw new Error(reasons.join("; "));
}
