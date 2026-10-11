import type { Attempt, PaceRule } from "@crumble/schema";
import { describe, expect, it } from "vitest";
import {
  CUT_MARGIN,
  formatScore,
  histogram,
  niceStep,
  paceOf,
  pearson,
  scoreAt,
  summarize,
  testCut,
} from "../src/lib/attempts";

const RULE: PaceRule = { minScore: 2_000, checkAtS: 30 };

/**
 * Builds a run whose score climbs linearly from 0 at 60 s left to `at30` at 30 s left.
 *
 * @param time - the run's ENTER time
 * @param at30 - its score at 30 s left
 * @param end - how it ended
 * @returns the run, with a reading every second from 58 to 30 s left
 */
function run(time: string, at30: number, end: Attempt["end"]): Attempt {
  const curve: Attempt["curve"] = [];
  for (let t = 58; t >= 30; t--) curve.push([t, Math.round((at30 * (60 - t)) / 30)]);
  return { time, run: 1, end, paceScore: null, finalScore: null, curve };
}

describe("scoreAt", () => {
  const curve: Attempt["curve"] = [
    [40, 1_000],
    [39, 1_100],
    [35, 1_500],
  ];

  it("interpolates between the readings either side", () => {
    expect(scoreAt(curve, 39.5)).toBe(1_050);
    expect(scoreAt(curve, 39)).toBe(1_100);
  });

  it("won't vouch for a moment between readings far apart, or outside the curve", () => {
    expect(scoreAt(curve, 37)).toBeNull();
    expect(scoreAt(curve, 41)).toBeNull();
    expect(scoreAt(curve, 30)).toBeNull();
  });
});

describe("paceOf", () => {
  it("prefers the macro's own reading over the curve's", () => {
    const a = run("2026-10-11 09:00:00", 1_500, "pruned");
    expect(paceOf(a, RULE)).toBe(1_500);
    expect(paceOf({ ...a, paceScore: 1_234 }, RULE)).toBe(1_234);
  });
});

describe("summarize", () => {
  it("counts the runs, finds the best ones, and reads the pace from the cycle", () => {
    const attempts: Attempt[] = [
      { ...run("2026-10-11 09:00:00", 1_500, "pruned"), finalScore: 1_700 },
      { ...run("2026-10-11 09:00:40", 2_400, "kept-on-pace"), finalScore: 4_000 },
      { ...run("2026-10-11 09:01:50", 1_000, "pruned"), finalScore: 1_200 },
      run("2026-10-11 12:00:00", 900, "stopped"),
    ];
    const s = summarize(attempts, RULE);
    expect(s).toMatchObject({ total: 4, kept: 1, onPace: 1, judged: 3, bestPace: 2_400 });
    expect(s.bestFinal?.finalScore).toBe(4_000);
    expect(s.perHour).toBeCloseTo(3600 / 55);
  });
});

describe("testCut", () => {
  const attempts = [
    run("2026-10-11 09:00:00", 1_000, "pruned"),
    run("2026-10-11 09:00:40", 1_500, "pruned"),
    run("2026-10-11 09:01:20", 2_200, "kept-on-pace"),
    run("2026-10-11 09:02:00", 3_000, "kept-on-pace"),
  ];

  it("sets the cut just below the weakest passing run's early score, pruning none of them", () => {
    const test = testCut(attempts, RULE, 45);
    expect(test.passing).toBe(2);
    expect(test.cut).toBeCloseTo(1_100 * (1 - CUT_MARGIN));
    expect(test.prunedShare).toBe(0.5);
    expect(test.savedS).toBe(15);
    expect(test.r).toBeCloseTo(1);
    expect(test.confidence).toBe("low");
  });

  it("suggests no cut before any run has met the bar", () => {
    const test = testCut(attempts.slice(0, 2), RULE, 45);
    expect(test.cut).toBeNull();
    expect(test.prunedShare).toBeNull();
  });

  it("has nothing to test with the pace check off", () => {
    expect(testCut(attempts, { minScore: 0, checkAtS: 30 }, 45).pairs).toEqual([]);
  });
});

describe("pearson", () => {
  it("reads a perfect, an inverse and no relationship", () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
    expect(pearson([1, 2, 3], [6, 4, 2])).toBeCloseTo(-1);
    expect(pearson([1, 2, 3], [5, 5, 5])).toBeNull();
    expect(pearson([1, 2], [1, 2])).toBeNull();
  });
});

describe("histogram", () => {
  it("cuts the range into round bins and counts every value once", () => {
    const bins = histogram([1.02, 1.07, 1.31, 1.49], 5);
    expect(niceStep(0.47, 5)).toBe(0.1);
    expect(bins.map((b) => b.count)).toEqual([2, 0, 0, 1, 1]);
    expect(bins.reduce((s, b) => s + b.count, 0)).toBe(4);
  });
});

describe("formatScore", () => {
  it("abbreviates the way the game does", () => {
    expect(formatScore(2_359_000_000_000)).toBe("2.359T");
    expect(formatScore(812_400_000_000)).toBe("812.4G");
    expect(formatScore(null)).toBe("–");
  });
});
