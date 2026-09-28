import { describe, expect, it } from "vitest";
import { groupByObsoleteDeck, isCurrent, splitByDeck, splitObsolete } from "../src/lib/obsolete";

const current = { id: "rye", obsoleteSince: null };
const older = { id: "ranged", obsoleteSince: "2026-10-01" };
const newer = { id: "chain", obsoleteSince: "2026-10-12" };

describe("the obsolete lifecycle helpers", () => {
  it("counts a row without obsoleteSince as current", () => {
    expect(isCurrent(current)).toBe(true);
    expect(isCurrent({})).toBe(true);
    expect(isCurrent(older)).toBe(false);
  });

  it("splits rows into the current ones in order and the obsolete ones newest first", () => {
    expect(splitObsolete([older, current, newer])).toEqual({
      current: [current],
      obsolete: [newer, older],
    });
  });

  it("keeps a row current unless the deck it names is obsolete", () => {
    const rows = [
      { id: 1, deckId: "rye" },
      { id: 2, deckId: "ranged" },
      { id: 3, deckId: null },
      { id: 4, deckId: "unlisted" },
    ];
    expect(splitByDeck(rows, [current, older])).toEqual({
      current: [rows[0], rows[2], rows[3]],
      obsolete: [rows[1]],
    });
  });

  it("groups the rows of obsolete decks by deck, the most recently obsoleted first", () => {
    const rows = [
      { id: 1, deckId: "ranged" },
      { id: 2, deckId: "chain" },
      { id: 3, deckId: "ranged" },
      { id: 4, deckId: "rye" },
    ];
    expect(groupByObsoleteDeck(rows, [current, older, newer])).toEqual([
      { deck: newer, rows: [rows[1]] },
      { deck: older, rows: [rows[0], rows[2]] },
    ]);
  });
});
