import {
  entryPower as sharedEntryPower,
  parsePower as sharedParsePower,
} from "@crumble/schema/power";
import { describe, expect, it } from "vitest";
import {
  bracketAt,
  entryPower,
  formatPower,
  furthest,
  mentionsAny,
  nextBracket,
  parsePower,
  seasonAt,
} from "../src/lib/stage";

/** The power gate's steps as record 003 documents them. */
const BRACKETS = [
  { minRatioPct: 0, damagePct: 1 },
  { minRatioPct: 10, damagePct: 5 },
  { minRatioPct: 20, damagePct: 15 },
  { minRatioPct: 40, damagePct: 35 },
  { minRatioPct: 60, damagePct: 55 },
  { minRatioPct: 80, damagePct: 75 },
  { minRatioPct: 100, damagePct: 100 },
  { minRatioPct: 120, damagePct: 120 },
];

describe("parsePower and entryPower", () => {
  it("are the server's own, not a copy", () => {
    expect(parsePower).toBe(sharedParsePower);
    expect(entryPower).toBe(sharedEntryPower);
  });

  it("read a power typed with its unit set apart, as the game shows it", () => {
    expect(parsePower("4 G")).toBe(4_000_000_000);
    expect(parsePower("4G 4G")).toBeNull();
  });
});

describe("formatPower", () => {
  it("prints the short form the community writes", () => {
    expect(formatPower(2_740_000_000)).toBe("2.74G");
    expect(formatPower(4_000_000_000)).toBe("4G");
    expect(formatPower(971_800_000)).toBe("971.8M");
    expect(formatPower(10258)).toBe("10.26K");
    expect(formatPower(1_800_000_000_000)).toBe("1.8T");
    expect(formatPower(640)).toBe("640");
  });
});

describe("the power gate", () => {
  it("rounds an entry power up to a whole power", () => {
    expect(entryPower(10258, 40)).toBe(4104);
    expect(entryPower(1600, 20)).toBe(320);
  });

  it("puts a team in the highest bracket whose entry power it reaches, with no interpolation", () => {
    const recommended = 10_004_798_560;
    expect(bracketAt(BRACKETS, 4_001_919_424, recommended)?.damagePct).toBe(35);
    expect(bracketAt(BRACKETS, 4_001_919_423, recommended)?.damagePct).toBe(15);
    expect(bracketAt(BRACKETS, 13_000_000_000, recommended)?.damagePct).toBe(120);
    expect(bracketAt(BRACKETS, 1, recommended)?.damagePct).toBe(1);
  });

  it("names the next bracket up, and none above the top", () => {
    expect(nextBracket(BRACKETS, BRACKETS[3])?.damagePct).toBe(55);
    expect(nextBracket(BRACKETS, BRACKETS[7])).toBeUndefined();
    expect(nextBracket(BRACKETS, undefined)?.damagePct).toBe(1);
  });

  it("pushes to the last stage before the first one out of reach", () => {
    const rows = [{ rec: 100 }, { rec: 200 }, { rec: 300 }, { rec: 250 }];
    expect(furthest(rows, (r) => r.rec, 80, 40)).toEqual({ rec: 200 });
    expect(furthest(rows, (r) => r.rec, 39, 40)).toBeUndefined();
    expect(furthest(rows, (r) => r.rec, 1000, 40)).toEqual({ rec: 250 });
  });
});

describe("mentionsAny", () => {
  it("finds any of the words, whatever their case", () => {
    expect(mentionsAny("Rift level variance", ["rift"])).toBe(true);
    expect(mentionsAny("차원의 힘 grows", ["Rift", "차원"])).toBe(true);
    expect(mentionsAny("Pad displayed power", ["Rift", "차원"])).toBe(false);
  });
});

describe("seasonAt", () => {
  const seasons = [
    { season: 2, startsAt: "2026-10-08T04:30:00.000Z", endsAt: "2026-10-22T03:00:00.000Z" },
    { season: 1, startsAt: "2026-09-23T02:30:00.000Z", endsAt: "2026-10-08T03:00:00.000Z" },
  ];

  it("finds the running season, else the next one", () => {
    expect(seasonAt(seasons, new Date("2026-09-28T00:00:00Z"))).toEqual({
      season: seasons[1],
      running: true,
    });
    expect(seasonAt(seasons, new Date("2026-10-08T04:00:00Z"))).toEqual({
      season: seasons[0],
      running: false,
    });
    expect(seasonAt(seasons, new Date("2027-01-01T00:00:00Z"))).toBeUndefined();
  });
});
