import { describe, expect, it } from "vitest";
import {
  bucketGain,
  confidenceBadge,
  critEdge,
  critTiers,
  expectedCrit,
  formatPct,
  formatTimes,
  parsePct,
  stackingBadge,
  verdictBadge,
} from "../src/lib/damage-formula";

describe("crit arithmetic", () => {
  it("rolls the floor of the effective rate as sure tiers, and the rest as a chance at one more", () => {
    expect(critTiers(2)).toEqual({ sure: 2, chance: 0 });
    const tiers = critTiers(1.98);
    expect(tiers.sure).toBe(1);
    expect(tiers.chance).toBeCloseTo(0.98);
    expect(critTiers(0.4)).toEqual({ sure: 0, chance: 0.4 });
    expect(critTiers(-0.2)).toEqual({ sure: 0, chance: 0 });
  });

  it("expects 1 + crit DMG × the effective rate, linear past 100% and ×1 below 0", () => {
    expect(expectedCrit(1, 1)).toBe(2);
    expect(expectedCrit(1.35, 1)).toBeCloseTo(2.35);
    expect(expectedCrit(2.5, 0.5)).toBeCloseTo(2.25);
    expect(expectedCrit(-0.1, 1)).toBe(1);
  });

  it("puts the next point in crit rate while crit DMG exceeds the rate, and in crit DMG after", () => {
    expect(critEdge(0.6, 1.2).better).toBe("rate");
    expect(critEdge(1.35, 1).better).toBe("damage");
    expect(critEdge(1, 1).better).toBe("even");
    const edge = critEdge(1.35, 1);
    expect(edge.rate).toBeCloseTo(0.01 / 2.35);
    expect(edge.damage).toBeCloseTo(0.0135 / 2.35);
  });

  it("values a point in an additive bucket at 1 ÷ (1 + its total)", () => {
    expect(bucketGain(1)).toBeCloseTo(0.005);
    expect(bucketGain(1.22)).toBeCloseTo(0.0045, 4);
    expect(bucketGain(0, 0.1)).toBeCloseTo(0.1);
  });
});

describe("badges", () => {
  it("reads a contradicted claim as wrong and an unsettled one as open", () => {
    expect(verdictBadge("disagrees")).toEqual({ kind: "avoid", label: "wrong" });
    expect(verdictBadge("agrees").kind).toBe("good");
    expect(verdictBadge("unresolved").label).toBe("open");
  });

  it("marks inferred steps as a caution and screen stacking apart from additive", () => {
    expect(confidenceBadge("read").kind).toBe("high");
    expect(confidenceBadge("inferred").kind).toBe("medium");
    expect(confidenceBadge("unknown").kind).toBe("low");
    expect(stackingBadge("screen").kind).not.toBe(stackingBadge("additive").kind);
  });
});

describe("number formats", () => {
  it("formats percentages and multipliers without trailing zeros", () => {
    expect(formatPct(0.0045)).toBe("0.45%");
    expect(formatPct(0.35, 1)).toBe("35%");
    expect(formatTimes(2.35)).toBe("×2.35");
    expect(formatTimes(2)).toBe("×2");
  });

  it("reads a typed percentage, with or without %, and refuses anything else", () => {
    expect(parsePct("135")).toBeCloseTo(1.35);
    expect(parsePct(" 98.5% ")).toBeCloseTo(0.985);
    expect(parsePct("abc")).toBeNull();
    expect(parsePct("")).toBeNull();
    expect(parsePct("-5")).toBeNull();
  });
});
