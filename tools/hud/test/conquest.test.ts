import { describe, expect, it } from "vitest";
import { learnField, readFinal, readScore, readTimer } from "../src/conquest.ts";
import type { HudTemplates } from "../src/hud.ts";
import { emptyTemplates } from "../src/hud.ts";
import {
  blankScreen,
  drawNumber,
  fillRect,
  FINAL_LAYOUT,
  SCORE_LAYOUT,
  TIMER_LAYOUT,
} from "./helpers.ts";

/**
 * Learns templates from synthetic screens that show every digit in every field.
 *
 * @returns the learned templates.
 */
function synthTemplates(): HudTemplates {
  let templates: HudTemplates = emptyTemplates();
  for (const [score, timer] of [
    ["1,234,567,890", "12.345"],
    ["9,876,543,210", "50.678"],
    ["0", "9.000"],
  ] as const) {
    const screen = blankScreen();
    drawNumber(screen, score, SCORE_LAYOUT);
    drawNumber(screen, timer, TIMER_LAYOUT);
    drawNumber(screen, score, FINAL_LAYOUT);
    templates = learnField(screen, "score", score, templates);
    templates = learnField(screen, "timer", timer, templates);
    templates = learnField(screen, "final", score, templates);
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

  it.for<[string, [x: number, y: number, w: number, h: number]]>([
    ["a tall blob off the digits' line", [1250, top + 40, 50, 75]],
    ["a sliver as tall as the digits", [1250, top, 10, 72]],
  ])("reads the score past %s", ([, [x, y, w, h]]) => {
    const screen = blankScreen();
    drawNumber(screen, "2,991,944,928,180", SCORE_LAYOUT);
    fillRect(screen, x, y, w, h, SCORE_INK);
    expect(readScore(screen, templates)).toEqual({ ok: true, value: 2991944928180 });
  });

  it("doesn't take confetti for a score", () => {
    const screen = blankScreen();
    fillRect(screen, 60, top - 25, 30, 20, SCORE_INK);
    fillRect(screen, 1250, top + 10, 25, 25, SCORE_INK);
    expect(readScore(screen, templates)).toEqual({ ok: false, reason: "not on screen" });
  });

  it("refuses a score with a whole group hidden, rather than read it short", () => {
    const screen = blankScreen();
    const lefts = drawNumber(screen, "2,991,944,928,180", SCORE_LAYOUT);
    fillRect(screen, lefts[4]! - 2, top - 2, lefts[7]! - lefts[4]! - 30, 80, [0, 0, 0]);
    expect(readScore(screen, templates)).toEqual({
      ok: false,
      reason: expect.stringMatching(/a digit is hidden/),
    });
  });

  it("refuses a score with a digit merged into a damage number", () => {
    const screen = blankScreen();
    const lefts = drawNumber(screen, "2,991,944,928,180", SCORE_LAYOUT);
    fillRect(screen, lefts[6]!, top - 20, 30, 25, SCORE_INK);
    expect(readScore(screen, templates)).toEqual({
      ok: false,
      reason: expect.stringMatching(/a digit is hidden/),
    });
  });

  it.for(["12,34", "1234,567"])("refuses %s, which doesn't group in thousands", (text) => {
    const screen = blankScreen();
    drawNumber(screen, text, SCORE_LAYOUT);
    expect(readScore(screen, templates)).toEqual({
      ok: false,
      reason: expect.stringMatching(/aren't a thousands grouping/),
    });
  });

  it("refuses a screen without a score", () => {
    expect(readScore(blankScreen(), templates)).toEqual({ ok: false, reason: "not on screen" });
  });

  it("refuses a glyph that matches no digit closely", () => {
    const screen = blankScreen();
    const lefts = drawNumber(screen, "12", SCORE_LAYOUT);
    fillRect(screen, lefts[1]! + 62, top, 52, 72, SCORE_INK);
    expect(readScore(screen, templates)).toEqual({
      ok: false,
      reason: expect.stringMatching(/^digit 3 is unclear/),
    });
  });
});

describe("readTimer", () => {
  const templates = synthTemplates();

  it.for([
    ["30.267", 30.267],
    ["7.810", 7.81],
  ] as const)("reads %s seconds left", ([text, seconds]) => {
    const screen = blankScreen();
    drawNumber(screen, text, TIMER_LAYOUT);
    expect(readTimer(screen, templates)).toEqual({ ok: true, value: seconds });
  });

  it("refuses a countdown longer than a fight", () => {
    const screen = blankScreen();
    drawNumber(screen, "61.000", TIMER_LAYOUT);
    expect(readTimer(screen, templates)).toEqual({
      ok: false,
      reason: "61 s is longer than a fight",
    });
  });

  it("refuses digits that aren't seconds and milliseconds", () => {
    const screen = blankScreen();
    drawNumber(screen, "30.26", TIMER_LAYOUT);
    expect(readTimer(screen, templates)).toEqual({
      ok: false,
      reason: expect.stringMatching(/aren't seconds.millis/),
    });
  });
});

describe("readFinal", () => {
  const templates = synthTemplates();

  it("reads the results' final score", () => {
    const screen = blankScreen();
    drawNumber(screen, "3,491,361,381,300", FINAL_LAYOUT);
    expect(readFinal(screen, templates)).toEqual({ ok: true, value: 3491361381300 });
  });

  it("doesn't take the fight's score for the final score", () => {
    const screen = blankScreen();
    drawNumber(screen, "3,491,361,381,300", SCORE_LAYOUT);
    expect(readFinal(screen, templates)).toEqual({ ok: false, reason: "not on screen" });
  });
});

describe("learnField", () => {
  const none = emptyTemplates();

  it("refuses a number with a different count of digits from the capture", () => {
    const screen = blankScreen();
    drawNumber(screen, "123,456", SCORE_LAYOUT);
    expect(() => learnField(screen, "score", "12,345", none)).toThrow(/6 digits/);
  });

  it("refuses text that isn't a number", () => {
    expect(() => learnField(blankScreen(), "score", "1.2T", none)).toThrow(/isn't a number/);
  });
});
