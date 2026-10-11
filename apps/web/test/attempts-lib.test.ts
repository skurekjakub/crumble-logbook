import type { Attempt, PaceRule } from "@crumble/schema";
import { describe, expect, it } from "vitest";
import {
  CUT_MARGIN,
  formatScore,
  histogram,
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
    expect(scoreAt(curve, 39.75)).toBe(1_025);
  });

  it("reads the first reading at its own moment", () => {
    expect(scoreAt(curve, 40)).toBe(1_000);
  });

  it.for([37, 41, 30])(
    "won't vouch for %s s left, between readings far apart or outside the curve",
    (tLeft) => {
      expect(scoreAt(curve, tLeft)).toBeNull();
    },
  );
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
    run("2026-10-11 09:01:20", 2_000, "kept-on-pace"),
    run("2026-10-11 09:02:00", 3_000, "kept-on-pace"),
  ];

  it("sets the cut just below the weakest passing run's early score, a run at the bar passing", () => {
    const test = testCut(attempts, RULE, 45);
    expect(test.passing).toBe(2);
    expect(test.cut).toBeCloseTo(1_000 * (1 - CUT_MARGIN));
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
    const test = testCut(attempts, { minScore: 0, checkAtS: 30 }, 45);
    expect(test.pairs.map((p) => p.attempt.time)).toEqual([]);
  });
});

describe("pearson", () => {
  it.for([
    ["a perfect", [2, 4, 6], 1],
    ["an inverse", [6, 4, 2], -1],
  ] as const)("reads %s relationship", ([, ys, r]) => {
    expect(pearson([1, 2, 3], ys)).toBeCloseTo(r);
  });

  it("reads none against a constant", () => {
    expect(pearson([1, 2, 3], [5, 5, 5])).toBeNull();
  });

  it("reads none from fewer than 3 runs", () => {
    expect(pearson([1, 2], [1, 2])).toBeNull();
  });
});

describe("histogram", () => {
  it("cuts the range into round bins, empty ones included, and counts every value once", () => {
    const bins = histogram([1.02, 1.07, 1.31, 1.49], 5);
    expect(bins.map((b) => b.count)).toEqual([2, 0, 0, 1, 1]);
  });
});

describe("formatScore", () => {
  it.for([
    [2_359_000_000_000, "2.359T"],
    [812_400_000_000, "812.4G"],
    [1_500_000, "1.5M"],
    [999_999, "999999"],
    [null, "–"],
  ] as const)("abbreviates %s as %s", ([score, shown]) => {
    expect(formatScore(score)).toBe(shown);
  });
});
