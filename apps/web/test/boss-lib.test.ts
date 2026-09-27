import { describe, expect, it } from "vitest";
import type { BuffValue } from "../src/api/types";
import {
  buffStars,
  effectLabel,
  eventLabel,
  fightLength,
  formatPct,
  markerRows,
  pivotBuffs,
  secondsLeft,
  staggerRows,
  starCells,
  starLabel,
  survivalTitle,
  trackPercent,
  whenLabel,
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
    target: "team",
    recordSlug: null,
    sources: [],
    en: null,
    ...p,
  };
}

const TEA = "실론나이트 쿠키";

/** The Piñata fight's length, in seconds. */
const FIGHT = 60;

describe("fight track scale", () => {
  it("maps 0–60 s elapsed onto 0–100% of the track", () => {
    expect(trackPercent(0, FIGHT)).toBe(0);
    expect(trackPercent(30, FIGHT)).toBe(50);
    expect(trackPercent(43, FIGHT)).toBeCloseTo(71.667, 2);
    expect(trackPercent(60, FIGHT)).toBe(100);
  });

  it("clamps times outside the fight to the track's ends", () => {
    expect(trackPercent(-5, FIGHT)).toBe(0);
    expect(trackPercent(70, FIGHT)).toBe(100);
  });

  it("scales to another fight length", () => {
    expect(trackPercent(45, 90)).toBe(50);
  });

  it("reads the in-game countdown off elapsed time", () => {
    expect(secondsLeft(43, FIGHT)).toBe(17);
    expect(secondsLeft(30, FIGHT)).toBe(30);
    expect(secondsLeft(0, FIGHT)).toBe(60);
  });

  it("says when an event happens, or that it's off the clock", () => {
    expect(whenLabel(43, FIGHT)).toBe("43 s · 17 s left");
    expect(whenLabel(null, FIGHT)).toBe("Off the clock");
  });

  it("puts positions closer than the gap on separate rows, reusing rows once clear", () => {
    expect(staggerRows([0, 30, 33, 41, 43, 60], 4)).toEqual([0, 0, 1, 0, 1, 0]);
    expect(staggerRows([10, 10, 10], 4)).toEqual([0, 1, 2]);
    expect(staggerRows([], 4)).toEqual([]);
  });

  it("staggers markers by their rendered pixel distance, so a phone-width track needs more rows", () => {
    const times = [30, 33, 41, 43, 46, 58];
    // About 3.5 px per second: markers 5 s apart are 17.5 px apart and would overlap.
    expect(markerRows(times, FIGHT, 210, 26)).toEqual([0, 1, 0, 1, 2, 0]);
    // About 18 px per second: every marker clears its neighbour on one row.
    expect(markerRows(times, FIGHT, 1100, 26)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it("titles a survival card by the in-game countdown at its anchor event", () => {
    expect(survivalTitle("slam", 30, FIGHT)).toBe("The 30 s slam");
    expect(survivalTitle("super-jump wipe", 43, FIGHT)).toBe("The 17 s super-jump wipe");
    expect(survivalTitle("super-jump wipe", 43, 90)).toBe("The 47 s super-jump wipe");
    expect(survivalTitle("slam", null, FIGHT)).toBe("Slam");
  });

  it("reads the fight's length off the event that states it, else the latest timed event", () => {
    const at = (event: string, tElapsed: number | null) => ({ event, tElapsed });
    expect(
      fightLength([at("engage", 0), at("fight_length", 90), at("wipe", 43)], "fight_length"),
    ).toBe(90);
    expect(fightLength([at("engage", 0), at("wipe", 43), at("off", null)], "fight_length")).toBe(
      43,
    );
    expect(fightLength([at("fight_length", null), at("wipe", 43)], "fight_length")).toBe(43);
    expect(fightLength([], "fight_length")).toBe(0);
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
      target: "self",
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
      target: "self",
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

  it("puts team buffs before self-only ones, marking a row self-only from its target", () => {
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

  it("keeps two skills with the same effect type apart instead of merging them", () => {
    const pivot = pivotBuffs([
      buff({ cookieKr: TEA, effectType: "AttackPointAddition", valuePct: 5 }),
      buff({
        cookieKr: TEA,
        effectType: "AttackPointAddition",
        valuePct: 8,
        base: "CastersAttackPoint",
      }),
      buff({ cookieKr: TEA, effectType: "AttackPointAddition", valuePct: 9 }),
    ]);
    expect(pivot.map((r) => [r.base, r.byStar])).toEqual([
      ["Fixed", { 0: 5 }],
      ["CastersAttackPoint", { 0: 8 }],
      ["Fixed", { 0: 9 }],
    ]);
    expect(new Set(pivot.map((r) => r.key)).size).toBe(3);
  });

  it("carries a value across the star columns a row has no grade for", () => {
    const pivot = pivotBuffs(rows);
    const stars = buffStars(rows);
    const def = pivot.find((r) => r.effectType === "DefensePointMultiplier")!;
    expect(starCells(def, stars)).toEqual([
      { value: 10, carried: false },
      { value: 10, carried: true },
      { value: 60, carried: false },
    ]);
    const late = pivotBuffs([
      buff({ cookieKr: TEA, effectType: "X", fromStar: 3, valuePct: 5 }),
    ])[0]!;
    expect(starCells(late, [0, 3, 9])).toEqual([
      { value: undefined, carried: false },
      { value: 5, carried: false },
      { value: 5, carried: true },
    ]);
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
