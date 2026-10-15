import { describe, expect, it } from "vitest";
import type { HudTemplates } from "../src/hud.ts";
import { emptyTemplates } from "../src/hud.ts";
import { READS } from "../src/reads.ts";
import { learnRift, readRift } from "../src/rift.ts";
import {
  blankScreen,
  drawNumber,
  RIFT_REPEAT_LAYOUT,
  riftTemplates,
  stageTemplates,
} from "./helpers.ts";

describe("readRift", () => {
  const templates = riftTemplates();

  it.for([
    ["12", 12],
    ["7", 7],
    ["130", 130],
  ] as const)("reads stage %s under Summon Dimensional Boss", ([shown, value]) => {
    const screen = blankScreen();
    drawNumber(screen, shown, RIFT_REPEAT_LAYOUT);
    expect(readRift(screen, templates)).toEqual({ ok: true, value });
  });

  it("refuses a hyphenated number, which is a chapter stage's", () => {
    const screen = blankScreen();
    drawNumber(screen, "358-20", RIFT_REPEAT_LAYOUT);
    expect(readRift(screen, templates)).toEqual({
      ok: false,
      reason: "digit groups 3,2 aren't a rift stage",
    });
  });

  it("refuses a screen that shows no rift number", () => {
    expect(readRift(blankScreen(), templates)).toEqual({ ok: false, reason: "not on screen" });
  });

  it("matches a digit its font hasn't learned against the chapter stages' repeat font", () => {
    let partial = { ...stageTemplates(), riftRepeat: [] as HudTemplates["riftRepeat"] };
    const taught = blankScreen();
    drawNumber(taught, "16", RIFT_REPEAT_LAYOUT);
    partial = learnRift(taught, "16", partial);
    const screen = blankScreen();
    drawNumber(screen, "17", RIFT_REPEAT_LAYOUT);
    expect(readRift(screen, partial)).toEqual({ ok: true, value: 17 });
  });

  it("prints its reading as a rift line", () => {
    const screen = blankScreen();
    drawNumber(screen, "12", RIFT_REPEAT_LAYOUT);
    expect(READS.rift(screen, templates)).toBe("rift 12\n");
  });
});

describe("learnRift", () => {
  it("learns every digit into the rift's font and leaves the others alone", () => {
    const templates = riftTemplates();
    expect(templates.riftRepeat.map((t) => t.digit).sort()).toEqual("0123456789".split(""));
    expect(templates.stageRepeat).toEqual([]);
  });

  it.for(["0", "012", "1234", "12-1"])("refuses %s, which isn't a rift stage", (shown) => {
    const screen = blankScreen();
    drawNumber(screen, "12", RIFT_REPEAT_LAYOUT);
    expect(() => learnRift(screen, shown, emptyTemplates())).toThrow(/isn't a rift stage/);
  });
});
