import { describe, expect, it } from "vitest";
import { emptyTemplates } from "../src/hud.ts";
import { learnStage, readStage } from "../src/stage.ts";
import {
  blankScreen,
  drawNumber,
  STAGE_BAR_LAYOUT,
  STAGE_REPEAT_LAYOUT,
  stageTemplates,
} from "./helpers.ts";

describe("readStage", () => {
  const templates = stageTemplates();

  it.for([
    ["358-20", { chapter: 358, stage: 20 }],
    ["358-5", { chapter: 358, stage: 5 }],
    ["1000-30", { chapter: 1000, stage: 30 }],
  ] as const)("reads %s off the top bar", ([shown, value]) => {
    const screen = blankScreen();
    drawNumber(screen, shown, STAGE_BAR_LAYOUT);
    expect(readStage(screen, templates)).toEqual({ ok: true, value });
  });

  it("reads the number under Summon Boss when the top bar doesn't show", () => {
    const screen = blankScreen();
    drawNumber(screen, "359-1", STAGE_REPEAT_LAYOUT);
    expect(readStage(screen, templates)).toEqual({ ok: true, value: { chapter: 359, stage: 1 } });
  });

  it("refuses a stage past a chapter's last", () => {
    const screen = blankScreen();
    drawNumber(screen, "358-31", STAGE_BAR_LAYOUT);
    expect(readStage(screen, templates)).toEqual({
      ok: false,
      reason: expect.stringMatching(/stage 31 isn't one of a chapter's/),
    });
  });

  it("refuses digits with no hyphen between chapter and stage", () => {
    const screen = blankScreen();
    drawNumber(screen, "35820", STAGE_BAR_LAYOUT);
    expect(readStage(screen, templates)).toEqual({
      ok: false,
      reason: expect.stringMatching(/digit groups 5 aren't a chapter-stage/),
    });
  });

  it("learns each place's digits into that place's font", () => {
    const templates = stageTemplates();
    expect(templates.stageBar.map((t) => t.digit)).toEqual("0123456789".split(""));
    expect(templates.stageRepeat.map((t) => t.digit)).toEqual("0123456789".split(""));
  });

  it("refuses a screen that shows no stage number in either place", () => {
    expect(readStage(blankScreen(), templates)).toEqual({
      ok: false,
      reason: "not on screen; not on screen",
    });
  });
});

describe("learnStage", () => {
  it("refuses a shown number that isn't a chapter-stage", () => {
    const screen = blankScreen();
    drawNumber(screen, "358-20", STAGE_BAR_LAYOUT);
    expect(() => learnStage(screen, "35820", emptyTemplates())).toThrow(/isn't a chapter-stage/);
  });

  it("refuses a capture that shows a different count of digits", () => {
    const screen = blankScreen();
    drawNumber(screen, "358-2", STAGE_BAR_LAYOUT);
    expect(() => learnStage(screen, "358-20", emptyTemplates())).toThrow(
      /the capture shows 4 digits, 358-20 has 5/,
    );
  });
});
