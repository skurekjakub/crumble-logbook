/**
 * Draws synthetic screens: the fight's score in its fill colour and the countdown in white, the
 * results' final score in yellow, and a stage's number in the top bar or under Summon Boss, in a
 * blocky 5x7 font on a dark backdrop, laid out like the game's (commas and dots on the baseline,
 * hyphens at mid-height). Also learns the stage font off them, and dumps a screen the way
 * `adb exec-out screencap` does.
 *
 * @module
 */
import { FINAL, SCORE, TIMER } from "../src/conquest.ts";
import type { HudTemplates } from "../src/hud.ts";
import { emptyTemplates } from "../src/hud.ts";
import type { Screen } from "../src/screen.ts";
import { learnStage, STAGE_BAR, STAGE_REPEAT } from "../src/stage.ts";

const FONT: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
};

type Rgb = [number, number, number];

/** How a field is drawn. Font cells are overlapping squares, so diagonal strokes stay 4-connected. */
export interface Layout {
  left: number;
  top: number;
  cell: number;
  block: number;
  digitGap: number;
  separatorGap: number;
  ink: Rgb;
}

/** The score's layout: glyphs 72 px tall in the score's fill colour. */
export const SCORE_LAYOUT: Layout = {
  left: SCORE.region.x + 100,
  top: SCORE.region.y + 30,
  cell: 10,
  block: 12,
  digitGap: 10,
  separatorGap: 36,
  ink: [0xe6, 0x32, 0x4f],
};

/** The countdown's layout: white glyphs 29 px tall. */
export const TIMER_LAYOUT: Layout = {
  left: TIMER.region.x + 10,
  top: TIMER.region.y + 15,
  cell: 4,
  block: 5,
  digitGap: 4,
  separatorGap: 16,
  ink: [0xff, 0xff, 0xff],
};

/** The final score's layout: yellow glyphs 72 px tall. */
export const FINAL_LAYOUT: Layout = {
  ...SCORE_LAYOUT,
  left: FINAL.region.x + 100,
  top: FINAL.region.y + 40,
  ink: [0xff, 0xc0, 0x3a],
};

/** The top bar's stage number: pale yellow glyphs 22 px tall. */
export const STAGE_BAR_LAYOUT: Layout = {
  left: STAGE_BAR.region.x + 8,
  top: STAGE_BAR.region.y + 13,
  cell: 3,
  block: 4,
  digitGap: 3,
  separatorGap: 22,
  ink: [0xff, 0xf0, 0xa0],
};

/** The stage number under Summon Boss: yellow glyphs 22 px tall, further right. */
export const STAGE_REPEAT_LAYOUT: Layout = {
  ...STAGE_BAR_LAYOUT,
  left: STAGE_REPEAT.region.x + 230,
  top: STAGE_REPEAT.region.y + 14,
  ink: [0xff, 0xe6, 0x00],
};

const BACKDROP: Rgb = [0x10, 0x10, 0x20];

/**
 * Makes a blank screen in the backdrop colour, tall enough to hold every field.
 *
 * @returns the screen.
 */
export function blankScreen(): Screen {
  const width = 1440;
  const height = FINAL.region.y + FINAL.region.height + 50;
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < rgba.length; i += 4) rgba.set([...BACKDROP, 255], i);
  return { width, height, rgba };
}

/**
 * Fills a rectangle of a screen with a colour.
 *
 * @param screen - the screen, changed in place.
 * @param x - left column.
 * @param y - top row.
 * @param w - width.
 * @param h - height.
 * @param colour - RGB.
 */
export function fillRect(
  screen: Screen,
  x: number,
  y: number,
  w: number,
  h: number,
  colour: Rgb,
): void {
  for (let row = y; row < y + h; row++)
    for (let col = x; col < x + w; col++)
      screen.rgba.set([...colour, 255], (row * screen.width + col) * 4);
}

/**
 * Draws a number the way the game shows it.
 *
 * @param screen - the screen, changed in place.
 * @param text - digits with their separators, e.g. "1,776,472,632,591", "30.267" or "358-20".
 * @param layout - where and how to draw it.
 * @returns each digit's left column, in reading order.
 */
export function drawNumber(screen: Screen, text: string, layout: Layout): number[] {
  const { cell, block, top, ink } = layout;
  const lefts: number[] = [];
  let x = layout.left;
  for (const [i, ch] of text.split("").entries()) {
    if (ch === "," || ch === "." || ch === "-") continue;
    const rows = FONT[ch]!;
    const lit = rows.flatMap((r) => r.split("").flatMap((c, col) => (c === "1" ? [col] : [])));
    const first = Math.min(...lit);
    const last = Math.max(...lit);
    lefts.push(x);
    for (const [row, bits] of rows.entries())
      for (const [col, bit] of bits.split("").entries())
        if (bit === "1")
          fillRect(screen, x + (col - first) * cell, top + row * cell, block, block, ink);
    x += (last - first) * cell + block;
    if (text[i + 1] === "," || text[i + 1] === ".") {
      const dot = Math.ceil(block / 2);
      const dotLeft = x + Math.floor((layout.separatorGap - dot) / 2);
      fillRect(screen, dotLeft, top + 6 * cell, dot, block, ink);
      x += layout.separatorGap;
    } else if (text[i + 1] === "-") {
      const dash = Math.floor(layout.separatorGap / 2);
      fillRect(screen, x + Math.floor(dash / 2), top + 3 * cell, dash, block, ink);
      x += layout.separatorGap;
    } else {
      x += layout.digitGap;
    }
  }
  return lefts;
}

/**
 * Learns stage templates from synthetic screens that show every digit, in the top bar and under
 * Summon Boss.
 *
 * @returns the learned templates.
 */
export function stageTemplates(): HudTemplates {
  let templates = emptyTemplates();
  for (const layout of [STAGE_BAR_LAYOUT, STAGE_REPEAT_LAYOUT]) {
    for (const shown of ["1234-5", "6789-10"]) {
      const screen = blankScreen();
      drawNumber(screen, shown, layout);
      templates = learnStage(screen, shown, templates);
    }
  }
  return templates;
}

/**
 * Dumps a screen the way `adb exec-out screencap` does: width, height, pixel format and colour
 * space as little-endian UInt32s, then the RGBA pixels.
 *
 * @param screen - the screen.
 * @returns the dump's bytes.
 */
export function rawDump(screen: Screen): Buffer {
  const header = Buffer.alloc(16);
  header.writeUInt32LE(screen.width, 0);
  header.writeUInt32LE(screen.height, 4);
  header.writeUInt32LE(1, 8);
  return Buffer.concat([header, screen.rgba]);
}
