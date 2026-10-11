/**
 * Finds the digits of a number on the Guild Conquest fight screen: the running score (the big
 * red-to-orange number at the top, e.g. 1,776,472,632,591) or the countdown under it (white,
 * e.g. 30.267).
 *
 * @module
 */
import type { Screen } from "./screen.ts";

/** A rectangle of the screen in game pixels. */
export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A number on the fight screen: where it sits, the colour of its glyphs, and how tall they are. */
export interface Field {
  name: "score" | "timer";
  region: Region;
  /** Tells whether a pixel is the glyphs' ink. */
  isInk: (r: number, g: number, b: number) => boolean;
  /** Blobs shorter than this are separators, floating damage numbers or confetti. */
  minHeight: number;
}

/**
 * The score on the 1440x2560 portrait display. Its glyphs span rows 404 to 477; the band is wider
 * so a longer number or a small layout shift still fits. Its fill runs from a pink red (E6324F)
 * at the top to an orange red (EE4A37) at the bottom; the black outline, the pink and orange bears
 * and the blue Piñata all fall outside it.
 */
export const SCORE: Field = {
  name: "score",
  region: { x: 40, y: 370, width: 1360, height: 150 },
  isInk: (r, g, b) => r >= 200 && g <= 150 && b <= 110 && r - g >= 90,
  minHeight: 40,
};

/**
 * The countdown, seconds left in the fight. Its glyphs span rows 527 to 556 from column 613; the
 * band starts right of the clock icon and stops above the leaderboard's names.
 */
export const TIMER: Field = {
  name: "timer",
  region: { x: 605, y: 512, width: 275, height: 60 },
  isInk: (r, g, b) => r >= 200 && g >= 200 && b >= 200,
  minHeight: 20,
};

/** One 4-connected blob of the mask, in region coordinates. */
export interface Glyph {
  /** The blob's label in `Blobs.labels`. */
  label: number;
  x0: number;
  y0: number;
  /** Inclusive right column. */
  x1: number;
  /** Inclusive bottom row. */
  y1: number;
}

/** The labelled blobs of a region. */
export interface Blobs {
  width: number;
  height: number;
  /** Per pixel, the 1-based label of its blob; 0 off the mask. */
  labels: Int32Array;
  glyphs: Glyph[];
}

/** How far a digit's top or bottom may sit from the line's median, in pixels. */
const EDGE_TOLERANCE = 4;
/** Narrower blobs (as a fraction of the line height) are slivers of the backdrop; a "1" is about 0.45. */
const MIN_GLYPH_ASPECT = 0.25;
/** Gaps up to this fraction of the line height part digits of one group; a "1" next to a digit leaves about 0.15. */
const MAX_DIGIT_GAP = 0.28;
/** Gaps up to this fraction part two groups across a comma or the dot (about 0.5); wider ones mean a digit went missing. */
const MAX_SEPARATOR_GAP = 0.75;

/**
 * Labels the 4-connected blobs of a field's ink in its region of the screen.
 *
 * @param screen - the capture.
 * @param field - the number to look for; its region is clipped to the screen.
 * @returns the labels and each blob's bounding box.
 */
export function findBlobs(screen: Screen, field: Field): Blobs {
  const { region } = field;
  const x0 = Math.max(0, region.x);
  const y0 = Math.max(0, region.y);
  const width = Math.max(0, Math.min(screen.width, region.x + region.width) - x0);
  const height = Math.max(0, Math.min(screen.height, region.y + region.height) - y0);
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = ((y0 + y) * screen.width + x0 + x) * 4;
      const { rgba } = screen;
      if (field.isInk(rgba[i]!, rgba[i + 1]!, rgba[i + 2]!)) mask[y * width + x] = 1;
    }
  }
  const labels = new Int32Array(width * height);
  const glyphs: Glyph[] = [];
  const stack: number[] = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || labels[start]) continue;
    const label = glyphs.length + 1;
    const glyph: Glyph = { label, x0: width, y0: height, x1: 0, y1: 0 };
    labels[start] = label;
    stack.push(start);
    while (stack.length > 0) {
      const p = stack.pop()!;
      const x = p % width;
      const y = (p - x) / width;
      glyph.x0 = Math.min(glyph.x0, x);
      glyph.x1 = Math.max(glyph.x1, x);
      glyph.y0 = Math.min(glyph.y0, y);
      glyph.y1 = Math.max(glyph.y1, y);
      const next = [
        x > 0 ? p - 1 : -1,
        x < width - 1 ? p + 1 : -1,
        y > 0 ? p - width : -1,
        y < height - 1 ? p + width : -1,
      ];
      for (const q of next) {
        if (q >= 0 && mask[q] && !labels[q]) {
          labels[q] = label;
          stack.push(q);
        }
      }
    }
    glyphs.push(glyph);
  }
  return { width, height, labels, glyphs };
}

/**
 * Picks a field's digits out of its blobs: the tall blobs whose top and bottom sit on the line
 * most tall blobs share, left to right.
 *
 * @param blobs - the region's blobs.
 * @param field - the field the blobs came from.
 * @returns the digit glyphs in reading order; empty when the number doesn't show.
 */
export function digitGlyphs(blobs: Blobs, field: Field): Glyph[] {
  const tall = blobs.glyphs.filter((g) => g.y1 - g.y0 + 1 >= field.minHeight);
  if (tall.length === 0) return [];
  const top = median(tall.map((g) => g.y0));
  const bottom = median(tall.map((g) => g.y1));
  const lineHeight = bottom - top + 1;
  return tall
    .filter(
      (g) =>
        Math.abs(g.y0 - top) <= EDGE_TOLERANCE &&
        Math.abs(g.y1 - bottom) <= EDGE_TOLERANCE &&
        g.x1 - g.x0 + 1 >= MIN_GLYPH_ASPECT * lineHeight,
    )
    .sort((a, b) => a.x0 - b.x0);
}

/**
 * Splits the digits into groups by the gaps between them: a separator (a comma or the dot) leaves
 * a wider gap than two digits do. A digit hidden behind a floating damage number or merged with
 * one leaves a gap too wide for either, so a misread can't pass as a shorter number.
 *
 * @param digits - the digit glyphs in reading order.
 * @returns the number of digits in each group, left to right.
 * @throws Error when there are no digits or a gap is too wide.
 */
export function groupDigits(digits: Glyph[]): number[] {
  if (digits.length === 0) throw new Error("not on screen");
  const lineHeight = median(digits.map((g) => g.y1 - g.y0 + 1));
  const groups = [1];
  for (let i = 1; i < digits.length; i++) {
    const gap = digits[i]!.x0 - digits[i - 1]!.x1 - 1;
    if (gap <= MAX_DIGIT_GAP * lineHeight) {
      groups[groups.length - 1]! += 1;
    } else if (gap <= MAX_SEPARATOR_GAP * lineHeight) {
      groups.push(1);
    } else {
      throw new Error(`a ${gap} px gap after digit ${i}: a digit is hidden`);
    }
  }
  return groups;
}

/**
 * The median of a non-empty list, the upper one of the middle pair for an even length.
 *
 * @param values - the numbers.
 * @returns their median.
 */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)]!;
}
