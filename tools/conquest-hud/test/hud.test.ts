import { describe, expect, it } from "vitest";
import type { HudTemplates } from "../src/hud.ts";
import { learnField, readScore, readTimer } from "../src/hud.ts";
import { blankScreen, drawNumber, fillRect, SCORE_LAYOUT, TIMER_LAYOUT } from "./helpers.ts";

/**
 * Learns templates from synthetic screens that show every digit in both fields.
 *
 * @returns the learned templates.
 */
function synthTemplates(): HudTemplates {
  let templates: HudTemplates = { score: [], timer: [] };
  for (const [score, timer] of [
    ["1,234,567,890", "12.345"],
    ["9,876,543,210", "50.678"],
    ["0", "9.000"],
  ] as const) {
    const screen = blankScreen();
    drawNumber(screen, score, SCORE_LAYOUT);
    drawNumber(screen, timer, TIMER_LAYOUT);
    templates = learnField(screen, "score", score, templates);
    templates = learnField(screen, "timer", timer, templates);
  }
  return templates;
}

const SCORE_INK = SCORE_LAYOUT.ink;
const { top } = SCORE_LAYOUT;

describe("readScore", () => {
  const templates = synthTemplates();

  it("reads a score it didn't learn from, leading 1 included", () => {
    const screen = blankScreen();
    drawNumber(screen, "1,776,472,632,591", SCORE_LAYOUT);
    expect(readScore(screen, templates)).toEqual({ ok: true, value: 1776472632591 });
  });

  it("reads a score whose first group is short", () => {
    const screen = blankScreen();
    drawNumber(screen, "40,799,090", SCORE_LAYOUT);
    expect(readScore(screen, templates)).toEqual({ ok: true, value: 40799090 });
  });

  it("ignores floating damage numbers and confetti around the score", () => {
    const screen = blankScreen();
    drawNumber(screen, "2,991,944,928,180", SCORE_LAYOUT);
    fillRect(screen, 60, top - 25, 30, 20, SCORE_INK);
    fillRect(screen, 1250, top + 10, 25, 25, SCORE_INK);
    expect(readScore(screen, templates)).toEqual({ ok: true, value: 2991944928180 });
  });

  it("refuses a score with a digit hidden, rather than read it short", () => {
    const screen = blankScreen();
    const lefts = drawNumber(screen, "2,991,944,928,180", SCORE_LAYOUT);
    fillRect(screen, lefts[4]! - 2, top - 2, 60, 80, [0, 0, 0]);
    expect(readScore(screen, templates)).toMatchObject({ ok: false });
  });

  it("refuses a score with a digit merged into a damage number", () => {
    const screen = blankScreen();
    const lefts = drawNumber(screen, "2,991,944,928,180", SCORE_LAYOUT);
    fillRect(screen, lefts[6]!, top - 20, 30, 25, SCORE_INK);
    expect(readScore(screen, templates)).toMatchObject({ ok: false });
  });

  it("refuses digits that don't group in thousands", () => {
    const screen = blankScreen();
    drawNumber(screen, "12,34", SCORE_LAYOUT);
    expect(readScore(screen, templates)).toMatchObject({ ok: false });
  });

  it("refuses a screen without a score", () => {
    expect(readScore(blankScreen(), templates)).toEqual({ ok: false, reason: "not on screen" });
  });

  it("refuses a glyph that matches no digit closely", () => {
    const screen = blankScreen();
    drawNumber(screen, "123", SCORE_LAYOUT);
    fillRect(screen, 900, top, 52, 72, SCORE_INK);
    expect(readScore(screen, templates)).toMatchObject({ ok: false });
  });
});

describe("readTimer", () => {
  const templates = synthTemplates();

  it("reads the seconds left, with one or two whole digits", () => {
    for (const [text, seconds] of [
      ["30.267", 30.267],
      ["7.810", 7.81],
    ] as const) {
      const screen = blankScreen();
      drawNumber(screen, text, TIMER_LAYOUT);
      expect(readTimer(screen, templates)).toEqual({ ok: true, value: seconds });
    }
  });

  it("refuses a countdown longer than a fight", () => {
    const screen = blankScreen();
    drawNumber(screen, "61.000", TIMER_LAYOUT);
    expect(readTimer(screen, templates)).toMatchObject({ ok: false });
  });

  it("refuses digits that aren't seconds and milliseconds", () => {
    const screen = blankScreen();
    drawNumber(screen, "30.26", TIMER_LAYOUT);
    expect(readTimer(screen, templates)).toMatchObject({ ok: false });
  });
});

describe("learnField", () => {
  it("refuses a number with a different count of digits from the capture", () => {
    const screen = blankScreen();
    drawNumber(screen, "123,456", SCORE_LAYOUT);
    expect(() => learnField(screen, "score", "12,345", { score: [], timer: [] })).toThrow(
      /6 digits/,
    );
  });

  it("refuses text that isn't a number", () => {
    expect(() => learnField(blankScreen(), "score", "1.2T", { score: [], timer: [] })).toThrow(
      /isn't a number/,
    );
  });
});
