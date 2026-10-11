/**
 * Tells the score's digits apart by shape: each glyph is reduced to a coarse grid of ink coverage
 * plus its aspect ratio and matched to the nearest learned template. The score's font, size and
 * colour never change, so this is exact where general OCR drops the thin leading "1".
 *
 * @module
 */
import type { Blobs, Glyph } from "./glyphs.ts";

/** Grid columns a glyph is reduced to. */
export const GRID_COLUMNS = 8;
/** Grid rows a glyph is reduced to. */
export const GRID_ROWS = 12;

/** A glyph's shape: ink coverage per grid cell, row by row, and width over height. */
export interface Shape {
  aspect: number;
  cells: number[];
}

/** A learned digit: the mean shape of its samples. */
export interface DigitTemplate extends Shape {
  digit: string;
  samples: number;
}

/** How a glyph matched the templates. */
export interface Match {
  digit: string;
  /** Distance to the best template. */
  distance: number;
  /** Distance to the best template of another digit. */
  runnerUp: number;
}

/** A best match further than this is no digit the templates know. */
export const MAX_DISTANCE = 0.12;
/** A best match closer than this to another digit's is too close to call. */
export const MIN_MARGIN = 0.05;
/** How much a difference in aspect ratio counts against a mean cell difference. */
const ASPECT_WEIGHT = 1;

/**
 * Reduces a glyph to its shape. Only the glyph's own pixels count, not other blobs inside its box.
 *
 * @param blobs - the labelled region the glyph came from.
 * @param glyph - the glyph.
 * @returns the glyph's shape.
 */
export function shapeOf(blobs: Blobs, glyph: Glyph): Shape {
  const w = glyph.x1 - glyph.x0 + 1;
  const h = glyph.y1 - glyph.y0 + 1;
  const ink = new Array<number>(GRID_COLUMNS * GRID_ROWS).fill(0);
  const area = new Array<number>(GRID_COLUMNS * GRID_ROWS).fill(0);
  for (let y = 0; y < h; y++) {
    const row = Math.floor((y * GRID_ROWS) / h);
    for (let x = 0; x < w; x++) {
      const cell = row * GRID_COLUMNS + Math.floor((x * GRID_COLUMNS) / w);
      area[cell]! += 1;
      if (blobs.labels[(glyph.y0 + y) * blobs.width + glyph.x0 + x] === glyph.label)
        ink[cell]! += 1;
    }
  }
  return { aspect: w / h, cells: ink.map((n, i) => (area[i] ? n / area[i] : 0)) };
}

/**
 * Measures how unlike two shapes are: the mean cell difference plus the aspect difference.
 *
 * @param a - one shape.
 * @param b - the other.
 * @returns 0 for identical shapes, growing with the difference.
 */
export function distance(a: Shape, b: Shape): number {
  let sum = 0;
  for (let i = 0; i < a.cells.length; i++) sum += Math.abs(a.cells[i]! - (b.cells[i] ?? 0));
  return sum / a.cells.length + ASPECT_WEIGHT * Math.abs(a.aspect - b.aspect);
}

/**
 * Finds the template nearest a shape.
 *
 * @param shape - the glyph's shape.
 * @param templates - the learned digits.
 * @returns the best match, with the distance to the nearest other digit.
 * @throws Error when there are no templates.
 */
export function match(shape: Shape, templates: DigitTemplate[]): Match {
  let best: Match | undefined;
  for (const t of templates) {
    const d = distance(shape, t);
    if (!best || d < best.distance) {
      best = { digit: t.digit, distance: d, runnerUp: best?.distance ?? Infinity };
    } else if (t.digit !== best.digit && d < best.runnerUp) {
      best.runnerUp = d;
    }
  }
  if (!best) throw new Error("no digit templates; learn some first");
  return best;
}

/**
 * Tells whether a match is certain enough to read the digit from.
 *
 * @param m - the match.
 * @returns true when the template is near and no other digit comes close.
 */
export function isConfident(m: Match): boolean {
  return m.distance <= MAX_DISTANCE && m.runnerUp - m.distance >= MIN_MARGIN;
}

/**
 * Folds a new sample of a digit into the templates, as a running mean of its samples.
 *
 * @param templates - the current templates; left unchanged.
 * @param digit - the digit the sample shows, "0" to "9".
 * @param shape - the sample's shape.
 * @returns the updated templates, ordered by digit.
 */
export function learn(templates: DigitTemplate[], digit: string, shape: Shape): DigitTemplate[] {
  const old = templates.find((t) => t.digit === digit);
  const n = old?.samples ?? 0;
  /**
   * Folds one value into the mean of the `n` samples so far.
   *
   * @param prev - the mean of the samples so far.
   * @param next - the new sample's value.
   * @returns the mean with the new sample.
   */
  const mean = (prev: number, next: number): number => (prev * n + next) / (n + 1);
  const updated: DigitTemplate = {
    digit,
    samples: n + 1,
    aspect: old ? mean(old.aspect, shape.aspect) : shape.aspect,
    cells: shape.cells.map((c, i) => (old ? mean(old.cells[i]!, c) : c)),
  };
  return [...templates.filter((t) => t.digit !== digit), updated].sort((a, b) =>
    a.digit.localeCompare(b.digit),
  );
}
