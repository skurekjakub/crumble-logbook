import { describe, expect, it } from "vitest";
import type { BuffValue } from "../src/api/types";
import {
  buffStars,
  effectLabel,
  eventLabel,
  formatPct,
  pivotBuffs,
  secondsLeft,
  staggerRows,
  starLabel,
  trackPercent,
} from "../src/lib/boss";

/** A buff row with defaults for the fields a test doesn't care about. */
function buff(p: Partial<BuffValue> & Pick<BuffValue, "cookieKr" | "effectType">): BuffValue {
  return {
    id: 0,
    skillGrade: 0,
    fromStar: 0,
    valuePct: 0,
    maxStack: 1,
    base: "Fixed",
    scalesWithCasterAmp: true,
    sources: [],
    en: null,
    ...p,
  };
}

const TEA = "실론나이트 쿠키";

describe("fight track scale", () => {
  it("maps 0–60 s elapsed onto 0–100% of the track", () => {
    expect(trackPercent(0)).toBe(0);
    expect(trackPercent(30)).toBe(50);
    expect(trackPercent(43)).toBeCloseTo(71.667, 2);
    expect(trackPercent(60)).toBe(100);
  });

  it("clamps times outside the fight to the track's ends", () => {
    expect(trackPercent(-5)).toBe(0);
    expect(trackPercent(70)).toBe(100);
  });

  it("scales to another fight length", () => {
    expect(trackPercent(45, 90)).toBe(50);
  });

  it("reads the in-game countdown off elapsed time", () => {
    expect(secondsLeft(43)).toBe(17);
    expect(secondsLeft(30)).toBe(30);
    expect(secondsLeft(0)).toBe(60);
  });

  it("puts events closer than the gap on separate rows, reusing rows once clear", () => {
    expect(staggerRows([0, 30, 33, 41, 43, 60], 4)).toEqual([0, 0, 1, 0, 1, 0]);
    expect(staggerRows([10, 10, 10], 4)).toEqual([0, 1, 2]);
    expect(staggerRows([], 4)).toEqual([]);
  });

  it("turns an event key into a sentence-case label", () => {
    expect(eventLabel("super_jump_wipe")).toBe("Super jump wipe");
    expect(eventLabel("boss_defense_phase_0")).toBe("Boss defense phase 0");
  });
});

describe("buffs by star", () => {
  const rows = [
    buff({
      cookieKr: TEA,
      effectType: "DefensePointMultiplier",
      skillGrade: 0,
      fromStar: 0,
      valuePct: 10,
      maxStack: 2,
      sources: ["web:sp"],
    }),
    buff({
      cookieKr: TEA,
      effectType: "BossDamageRateAddition",
      skillGrade: 0,
      fromStar: 0,
      valuePct: 45,
      sources: ["web:sp"],
    }),
    buff({
      cookieKr: TEA,
      effectType: "BossDamageRateAddition",
      skillGrade: 3,
      fromStar: 3,
      valuePct: 55,
      sources: ["web:sp"],
    }),
    buff({
      cookieKr: TEA,
      effectType: "BossDamageRateAddition",
      skillGrade: 9,
      fromStar: 9,
      valuePct: 70,
      sources: ["web:sp", "dc:1"],
    }),
    buff({
      cookieKr: TEA,
      effectType: "DefensePointMultiplier",
      skillGrade: 9,
      fromStar: 9,
      valuePct: 60,
      maxStack: 2,
      sources: ["web:sp"],
    }),
    buff({
      cookieKr: "다크초코 쿠키",
      effectType: "DefensePointReductionChance",
      skillGrade: 9,
      fromStar: 9,
      valuePct: 20,
      maxStack: 10,
      scalesWithCasterAmp: false,
    }),
  ];

  it("lists each star a grade starts at, ascending", () => {
    expect(buffStars(rows)).toEqual([0, 3, 9]);
  });

  it("labels the last star column as open-ended", () => {
    const stars = [0, 1, 3, 5, 7, 9];
    expect(stars.map((s) => starLabel(s, stars))).toEqual(["0★", "1★", "3★", "5★", "7★", "9★+"]);
  });

  it("pivots one row per cookie and effect with each grade's value under its star", () => {
    const pivot = pivotBuffs(rows);
    const boss = pivot.find((r) => r.effectType === "BossDamageRateAddition")!;
    expect(boss.byStar).toEqual({ 0: 45, 3: 55, 9: 70 });
    expect(boss.byStar[9]).toBe(70);
    expect(boss.sources).toEqual(["web:sp", "dc:1"]);
    expect(boss.selfOnly).toBe(false);
  });

  it("puts team buffs before self-only ones and marks Tea Knight's DEF buff as self-only", () => {
    const pivot = pivotBuffs(rows);
    expect(pivot.map((r) => r.effectType)).toEqual([
      "BossDamageRateAddition",
      "DefensePointReductionChance",
      "DefensePointMultiplier",
    ]);
    const def = pivot.at(-1)!;
    expect(def.selfOnly).toBe(true);
    expect(def.maxStack).toBe(2);
  });

  it("marks an application chance, which doesn't scale with skill amp", () => {
    const chance = pivotBuffs(rows).find((r) => r.cookieKr === "다크초코 쿠키")!;
    expect(chance.chance).toBe(true);
    expect(chance.scalesWithCasterAmp).toBe(false);
  });

  it("names effects in words, keeping unknown effect types as they are", () => {
    expect(effectLabel("BossDamageRateAddition", "Fixed")).toBe("Boss DMG +");
    expect(effectLabel("AttackPointAddition", "CastersAttackPoint")).toBe(
      "ATK + (share of the caster's ATK)",
    );
    expect(effectLabel("DefensePointReductionChance", "Fixed")).toBe(
      "DEF shred: application chance",
    );
    expect(effectLabel("SomethingNew", "Fixed")).toBe("SomethingNew");
  });

  it("formats percentages without trailing zeros", () => {
    expect(formatPct(70)).toBe("70%");
    expect(formatPct(46.5)).toBe("46.5%");
    expect(formatPct(undefined)).toBe("–");
  });
});
