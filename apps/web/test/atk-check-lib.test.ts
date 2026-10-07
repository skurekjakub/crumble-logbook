import { describe, expect, it } from "vitest";
import type { AtkCheckDeck } from "../src/lib/atk-check";
import { catcherCheck, petCheck, rankedAbove } from "../src/lib/atk-check";

const ORDER = [{ kr: "우유" }, { kr: "브시커" }, { kr: "치케" }];

/**
 * Builds a deck for the checks.
 *
 * @param over - the fields to override
 * @returns the deck
 */
const deck = (over: Partial<AtkCheckDeck> = {}): AtkCheckDeck => ({
  atkOrder: ORDER,
  cookies: [...ORDER.map((c) => ({ cookieKr: c.kr })), { cookieKr: "전갈" }],
  pets: [{ kr: "와사비문어" }],
  ...over,
});

describe("catcherCheck", () => {
  it("passes when the catcher is outside the order or last in it", () => {
    expect(catcherCheck(deck(), "전갈")).toBe("pass");
    expect(catcherCheck(deck({ atkOrder: [...ORDER, { kr: "전갈" }] }), "전갈")).toBe("pass");
  });

  it("fails when a ranked cookie comes after the catcher", () => {
    expect(catcherCheck(deck({ atkOrder: [{ kr: "전갈" }, ...ORDER] }), "전갈")).toBe("fail");
  });

  it("is unknown without the catcher in the deck or without an order", () => {
    expect(catcherCheck(deck(), "없음")).toBe("unknown");
    expect(catcherCheck(deck({ atkOrder: null }), "전갈")).toBe("unknown");
    expect(catcherCheck(deck({ atkOrder: [] }), "전갈")).toBe("unknown");
  });
});

describe("rankedAbove", () => {
  it("leaves the catcher out of the order", () => {
    expect(rankedAbove([...ORDER, { kr: "전갈" }], "전갈")).toEqual(ORDER);
    expect(rankedAbove(ORDER, "전갈")).toEqual(ORDER);
  });
});

describe("petCheck", () => {
  it("passes when the deck brings the pet, else fails", () => {
    expect(petCheck(deck(), "와사비문어")).toBe("pass");
    expect(petCheck(deck({ pets: [] }), "와사비문어")).toBe("fail");
  });
});
