/**
 * Finds the digits of a number on a game screen: masks the field's ink in its region, labels the
 * blobs, keeps the ones on the digits' line, and groups them by the gaps a separator leaves.
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

/** A number on a screen: where it sits, the colour of its glyphs, and how tall they are. */
export interface Field {
  region: Region;
  /** Tells whether a pixel is the glyphs' ink. */
  isInk: (r: number, g: number, b: number) => boolean;
  /** Blobs shorter than this are separators, floating damage numbers or confetti. */
  minHeight: number;
  /**
   * The widest gap between two digits, as a fraction of the line height, that still parts two
   * groups across a separator; a wider one means a digit is hidden.
   */
  maxSeparatorGap: number;
  /** The furthest a digit may sit from its template; unset means digits.ts's MAX_DISTANCE. */
  maxDistance?: number;
}

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
 * Splits the digits into groups by the gaps between them: a separator (a comma, the dot or a
 * hyphen) leaves a wider gap than two digits do. A digit hidden behind a floating damage number or
 * merged with one leaves a gap too wide for either, so a misread can't pass as a shorter number.
 *
 * @param digits - the digit glyphs in reading order.
 * @param field - the field the digits came from, for its widest separator gap.
 * @returns the number of digits in each group, left to right.
 * @throws Error when there are no digits or a gap is too wide.
 */
export function groupDigits(digits: Glyph[], field: Field): number[] {
  if (digits.length === 0) throw new Error("not on screen");
  const lineHeight = median(digits.map((g) => g.y1 - g.y0 + 1));
  const groups = [1];
  for (let i = 1; i < digits.length; i++) {
    const gap = digits[i]!.x0 - digits[i - 1]!.x1 - 1;
    if (gap <= MAX_DIGIT_GAP * lineHeight) {
      groups[groups.length - 1]! += 1;
    } else if (gap <= field.maxSeparatorGap * lineHeight) {
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
