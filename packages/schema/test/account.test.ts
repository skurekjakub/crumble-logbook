import { describe, expect, it } from "vitest";
import {
  accountRoadmapItemFile,
  accountSize,
  accountSnapshotFile,
  runeChips,
  runeStatLabel,
  sameAsKey,
  withoutScreens,
} from "../src/account";

/**
 * Parses a snapshot holding only the given lineups.
 *
 * @param lineups - the lineups, keyed by lineup
 * @returns the parsed snapshot
 */
function lineups(lineups: Record<string, unknown>) {
  return accountSnapshotFile.parse({ lineups });
}

describe("withoutScreens", () => {
  it("drops screenshot fields by name, and image paths as values or entries, at any depth", () => {
    expect(
      withoutScreens({
        screen: "a",
        screens: ["a.jpg"],
        Screenshot: "x",
        screenshotPath: "shots/b",
        keep: "notes.txt",
        nested: { proof: "pets/c.WEBP", list: ["d.png", "e", { pic: "f.jpeg " }] },
      }),
    ).toEqual({ keep: "notes.txt", nested: { list: ["e", {}] } });
  });
});

describe("runeChips", () => {
  it("labels each stat and sums only the lines it read, marking the rest unread", () => {
    expect(
      runeChips([
        { stat: "skillAmp", value: 7 },
        { stat: "skillAmp", value: 7.5 },
        { stat: "skillAmp", value: null },
        { stat: "critRes", value: "?" },
        { stat: "critRes" },
        { stat: "atk", value: 3 },
      ]),
    ).toEqual(["Skill AMP 14.5 ×2 +1?", "CRIT RES ? ×2", "ATK 3"]);
  });

  it("words stats as short labels", () => {
    expect(runeStatLabel("atkAmp")).toBe("ATK AMP");
    expect(runeStatLabel("skill_haste")).toBe("Skill Haste");
    expect(runeStatLabel("critRate")).toBe("CRIT%");
    expect(runeStatLabel("dmgReduction")).toBe("DR");
    expect(runeStatLabel("Skill AMP")).toBe("Skill AMP");
  });
});

describe("same as <lineup>", () => {
  it("reads the key without its trailing punctuation", () => {
    expect(sameAsKey("same as arena_def.")).toBe("arena_def");
    expect(sameAsKey("Same as arena_def), then swap")).toBe("arena_def");
    expect(sameAsKey("all owned cookies")).toBeNull();
  });

  it("copies the named lineup's cookies, following a chain", () => {
    const { lineups: parsed, issues } = lineups({
      a: [{ name: "체리 쿠키" }],
      b: { rows: "same as a." },
      c: { rows: "same as b" },
    });
    expect(parsed.map((l) => [l.lineup, l.cookies.map((c) => c.name), l.note])).toEqual([
      ["a", ["체리 쿠키"], null],
      ["b", ["체리 쿠키"], null],
      ["c", ["체리 쿠키"], null],
    ]);
    expect(issues).toEqual([]);
  });

  it("keeps a note that names no lineup, a loop or a lineup without cookies, and reports it", () => {
    const { lineups: parsed, issues } = lineups({
      gone: { rows: "same as nowhere", rowsNote: "Swap pending" },
      x: { rows: "same as y" },
      y: { rows: "same as x" },
      prose: { rows: "all owned cookies" },
      empty: { rows: "same as prose" },
    });
    expect(parsed.map((l) => [l.lineup, l.cookies.length, l.note])).toEqual([
      ["gone", 0, "Swap pending · same as nowhere"],
      ["x", 0, "same as y"],
      ["y", 0, "same as x"],
      ["prose", 0, "all owned cookies"],
      ["empty", 0, "same as prose"],
    ]);
    expect(issues).toEqual([
      'lineups.gone: "same as nowhere" names no lineup nowhere; kept as its note',
      'lineups.x: "same as y" loops back to x; kept as its note',
      'lineups.y: "same as x" loops back to y; kept as its note',
      'lineups.empty: "same as prose" leads to prose, which lists no cookies; kept as its note',
    ]);
  });
});

describe("account profile", () => {
  it("prefers the later reading of a figure, marked with its time, and keeps the cookie list out of extra", () => {
    const parsed = accountSnapshotFile.parse({
      account: {
        capturedAt: "2026-10-07T12:51:00+02:00",
        level: 192,
        combatPower: 1,
        later: { capturedAt: "2026-10-07T17:13:00+02:00", combatPower: 2, headerRank: 520 },
      },
      cookies: { list: [] },
      client: { region: "global" },
    });
    expect(parsed.profile).toEqual([
      { name: "level", value: "192" },
      { name: "combatPower", value: "2", at: "2026-10-07T17:13:00+02:00" },
      { name: "headerRank", value: "520", at: "2026-10-07T17:13:00+02:00" },
    ]);
    expect(parsed.extra).toEqual({ client: { region: "global" } });
  });
});

describe("roadmap item size", () => {
  it("normalises a stated payoff size into extra, and keeps a word it doesn't know as written", () => {
    const item = { priority: "now", action: "a" };
    expect(accountRoadmapItemFile.parse({ ...item, size: " Big " }).extra).toEqual({
      size: "big",
    });
    expect(accountRoadmapItemFile.parse({ ...item, size: "low" }).extra).toEqual({
      size: "small",
    });
    expect(accountRoadmapItemFile.parse({ ...item, size: "huge-ish" }).extra).toEqual({
      size: "huge-ish",
    });
    expect(accountSize("medium")).toBe("medium");
    expect(accountSize(3)).toBeNull();
  });
});
