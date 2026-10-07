import { describe, expect, it } from "vitest";
import {
  byVerdict,
  chaptersGained,
  efficiencyGrade,
  formatKrw,
  formatPct,
  gradeRank,
  packageVerdict,
  postedGainPct,
  reachAt,
  reachGained,
  usdPrice,
} from "../src/lib/team-power";
import { columnLabel } from "../src/views/GrowthCurvesView";
import { stageOf } from "../src/views/SpendingOrderView";

const CHAPTERS = [
  { lastStage: "1-30", recommendedPower: 100 },
  { lastStage: "2-30", recommendedPower: 200 },
  { lastStage: "3-30", recommendedPower: 300 },
];
/** The bracket that keeps 35% of damage from 40% of recommended power. */
const B35 = { minRatioPct: 40, damagePct: 35 };

describe("efficiencyGrade", () => {
  it("reads the grade a note leads with, and none from a note that leads with none", () => {
    expect(efficiencyGrade("high: rolls at 10 SP")).toBe("high");
    expect(efficiencyGrade("medium; a steady free source")).toBe("medium");
    expect(efficiencyGrade("low per coin; open banked chests")).toBe("low");
    expect(efficiencyGrade("none for power (damage only)")).toBe("none");
    expect(efficiencyGrade("High")).toBe("high");
    expect(efficiencyGrade("Up to 8-3 the points come from free pulls")).toBeNull();
    expect(efficiencyGrade("unmeasured (free)")).toBeNull();
    expect(efficiencyGrade("n/a until 328-30")).toBeNull();
    expect(efficiencyGrade("highly variable")).toBeNull();
  });
});

describe("postedGainPct", () => {
  const points = [
    { slug: "posted", kind: "posted" as const, deltaPct: 10 },
    { slug: "claim", kind: "claimed" as const, deltaPct: 20 },
    { slug: "sum", kind: "inferred" as const, deltaPct: 5 },
  ];

  it("takes a posted step's posted change", () => {
    expect(postedGainPct({ basis: "posted", dataPoint: "posted" }, points)).toBe(10);
  });

  it("never takes a claimed or inferred figure, or a step whose basis isn't posted", () => {
    expect(postedGainPct({ basis: "posted", dataPoint: "claim" }, points)).toBeNull();
    expect(postedGainPct({ basis: "posted", dataPoint: "sum" }, points)).toBeNull();
    expect(postedGainPct({ basis: "claimed", dataPoint: "claim" }, points)).toBeNull();
    expect(postedGainPct({ basis: "unmeasured", dataPoint: null }, points)).toBeNull();
    expect(postedGainPct({ basis: "posted", dataPoint: "missing" }, points)).toBeNull();
  });
});

describe("reachAt and chaptersGained", () => {
  it("finds the furthest chapter a power enters at a bracket, and what the next one takes", () => {
    const reach = reachAt(CHAPTERS, B35, 100);
    expect(reach.reached?.lastStage).toBe("2-30");
    expect(reach.next?.lastStage).toBe("3-30");
    expect(reach.nextPower).toBe(120);
  });

  it("reports no chapter before the first, and no next one after the last", () => {
    expect(reachAt(CHAPTERS, B35, 39).reached).toBeUndefined();
    expect(reachAt(CHAPTERS, B35, 39).next?.lastStage).toBe("1-30");
    const all = reachAt(CHAPTERS, B35, 1000);
    expect(all.reached?.lastStage).toBe("3-30");
    expect(all.next).toBeUndefined();
    expect(all.nextPower).toBeUndefined();
  });

  it("says how far the next chapter was when a gain moves the reach, and nothing more when it doesn't", () => {
    const before = reachAt(CHAPTERS, B35, 100);
    expect(reachGained(before, CHAPTERS[2], 1, 100)).toBe(
      "3-30 (+1 chapter; the next, 3-30, was +20% away)",
    );
    expect(reachGained(before, CHAPTERS[1], 0, 100)).toBe("2-30 (no change)");
    expect(reachGained(reachAt(CHAPTERS, B35, 30), CHAPTERS[0], 1, 30)).toBe(
      "1-30 (+1 chapter; the next, 1-30, was +33.3% away)",
    );
  });

  it("counts the chapters a gain moves the reach by", () => {
    expect(chaptersGained(CHAPTERS, CHAPTERS[0], CHAPTERS[2])).toBe(2);
    expect(chaptersGained(CHAPTERS, undefined, CHAPTERS[0])).toBe(1);
    expect(chaptersGained(CHAPTERS, CHAPTERS[1], CHAPTERS[1])).toBe(0);
  });
});

describe("columnLabel", () => {
  it("reads a curve column's name as a heading, a percent anywhere in it included", () => {
    expect(columnLabel("success_pct")).toBe("success %");
    expect(columnLabel("decline_pct_unprotected")).toBe("decline % unprotected");
    expect(columnLabel("expected_krw")).toBe("expected (₩)");
    expect(columnLabel("cum_expected_syrup")).toBe("cum expected syrup");
  });
});

describe("prices and changes", () => {
  it("prints KRW, and USD as listed, as an inferred tier, or not at all", () => {
    expect(formatKrw(2646400)).toBe("₩2,646,400");
    expect(usdPrice({ priceUsd: 4.99, usdTier: null })).toEqual({ text: "$4.99", inferred: false });
    expect(usdPrice({ priceUsd: null, usdTier: 3.99 })).toEqual({
      text: "≈ $3.99",
      inferred: true,
    });
    expect(usdPrice({ priceUsd: null, usdTier: null })).toBeNull();
  });

  it("prints a change with its sign, to a tenth", () => {
    expect(formatPct(10)).toBe("+10%");
    expect(formatPct(1.6)).toBe("+1.6%");
    expect(formatPct(13.333)).toBe("+13.3%");
    expect(formatPct(-2)).toBe("-2%");
    expect(formatPct(1.6, true)).toBe("≈ +1.6%");
  });
});

describe("gradeRank", () => {
  it("sorts the grades best first and an ungraded note last", () => {
    expect(["none", "low: rare", "medium; steady", "high", "unmeasured"].map(gradeRank)).toEqual([
      3, 2, 1, 0, 4,
    ]);
  });
});

describe("packageVerdict and byVerdict", () => {
  it("reads a buy from the opening clause and a skip from a put-it-last word", () => {
    expect(packageVerdict("Early must-buy: carries stages 20–30s.")).toBe("buy");
    expect(packageVerdict("The best growth per KRW; poor while capped.")).toBe("buy");
    expect(packageVerdict("Called the worst value in the shop.")).toBe("skip");
    expect(packageVerdict("Buys levels; low value except the first tiers.")).toBe("skip");
    expect(packageVerdict("Not for light spenders; a copy comes free.")).toBe("depends");
    expect(packageVerdict("With the 5.5 it takes each pickup to 7★.")).toBeNull();
  });

  it("puts the buys first and the skips last, keeping the record's order within each", () => {
    const rows = [
      { id: 1, verdict: "Called the worst value." },
      { id: 2, verdict: "Plain words." },
      { id: 3, verdict: "Top Crystal value." },
      { id: 4, verdict: "Not for light spenders." },
      { id: 5, verdict: "First purchase for everyone." },
    ];
    expect(byVerdict(rows).map((r) => r.id)).toEqual([3, 5, 4, 2, 1]);
  });
});

describe("stageOf", () => {
  it("grades a stage order at its own stage, and the endgame and the Rift near 2.2G", () => {
    expect(["early", "mid", "late", "endgame", "rift"].map(stageOf)).toEqual([
      "early",
      "mid",
      "late",
      "at22g",
      "at22g",
    ]);
  });
});
