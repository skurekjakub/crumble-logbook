import { describe, expect, it } from "vitest";
import type { RankedDeck } from "../src/lib/daily-dungeon";
import {
  dungeonChipName,
  elementKey,
  factVerdict,
  pickDungeon,
  rankDecks,
  splitHero,
} from "../src/lib/daily-dungeon";

/**
 * Builds a deck as the board ranks it.
 *
 * @param id - the deck's id
 * @param run - its run facts, on the `exp` dungeon unless they say otherwise
 * @param position - its place in the record's list
 * @returns the deck
 */
function deck(
  id: string,
  run: Partial<NonNullable<RankedDeck["dailyDungeon"]>>,
  position = 0,
): RankedDeck & { id: string } {
  return {
    id,
    position,
    obsoleteSince: null,
    dailyDungeon: { dungeon: "exp", auto: "full", stage: null, powerG: null, ...run },
  };
}

describe("rankDecks", () => {
  it("ranks a dungeon's current decks by stage, then auto, then lowest power, never by a ratio", () => {
    const decks = [
      deck("manual-60", { auto: "manual", stage: 60 }),
      deck("auto-45-strong", { stage: 45, powerG: 3 }),
      deck("semi-45", { auto: "semi", stage: 45, powerG: 1 }),
      deck("auto-45-weak", { stage: 45, powerG: 1.5 }),
      deck("no-stage", { stage: null }),
      deck("other-dungeon", { dungeon: "dough", stage: 99 }),
      { ...deck("retired", { stage: 80 }), obsoleteSince: "2026-10-01" },
      { id: "arena", position: 0, dailyDungeon: null },
    ];
    expect(rankDecks(decks, "exp").map((d) => d.id)).toEqual([
      "manual-60",
      "auto-45-weak",
      "auto-45-strong",
      "semi-45",
      "no-stage",
    ]);
  });
});

describe("splitHero", () => {
  it("makes the furthest full-auto deck the hero, keeping the rest ranked", () => {
    const ranked = rankDecks(
      [
        deck("manual-60", { auto: "manual", stage: 60 }),
        deck("auto-45", { stage: 45 }),
        deck("auto-30", { stage: 30 }),
      ],
      "exp",
    );
    const { hero, rest } = splitHero(ranked);
    expect(hero?.id).toBe("auto-45");
    expect(rest.map((d) => d.id)).toEqual(["manual-60", "auto-30"]);
  });

  it("has no hero when no deck runs on full auto", () => {
    const { hero, rest } = splitHero([deck("semi", { auto: "semi", stage: 9 })]);
    expect(hero).toBeUndefined();
    expect(rest).toHaveLength(1);
  });
});

describe("pickDungeon", () => {
  it("shows the dungeon the URL names, else the first", () => {
    const dungeons = [{ slug: "exp" }, { slug: "dough" }];
    expect(pickDungeon(dungeons, "dough")?.slug).toBe("dough");
    expect(pickDungeon(dungeons, "gold")?.slug).toBe("exp");
    expect(pickDungeon(dungeons, undefined)?.slug).toBe("exp");
    expect(pickDungeon<{ slug: string }>([], "exp")).toBeUndefined();
  });
});

describe("elementKey and factVerdict", () => {
  it("reads an element in English or Korean, and nothing for an unknown one", () => {
    expect(elementKey("Fire")).toBe("fire");
    expect(elementKey("물/Water")).toBe("water");
    expect(elementKey("어둠")).toBe("dark");
    expect(elementKey("Chaos")).toBeUndefined();
    expect(elementKey(null)).toBeUndefined();
  });

  it("reads a yes/no fact, null as unknown", () => {
    expect(factVerdict(true)).toBe("yes");
    expect(factVerdict(false)).toBe("no");
    expect(factVerdict(null)).toBe("unknown");
  });
});

describe("dungeonChipName", () => {
  it("drops a trailing Dungeon, and keeps a name that is nothing else", () => {
    expect(dungeonChipName("EXP Dungeon")).toBe("EXP");
    expect(dungeonChipName("Research Stone Dungeon")).toBe("Research Stone");
    expect(dungeonChipName("Rune Crystal")).toBe("Rune Crystal");
    expect(dungeonChipName("Dungeon")).toBe("Dungeon");
  });
});
