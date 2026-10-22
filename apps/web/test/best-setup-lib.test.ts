import { describe, expect, it } from "vitest";
import { leadDeck, runesFor, sameCookie } from "../src/lib/best-setup";

/**
 * Builds a deck as Best setup reads it.
 *
 * @param id - its id
 * @param position - its curated position
 * @param status - its tier
 * @param obsoleteSince - when it went obsolete; null while current
 * @returns the deck
 */
const deck = (
  id: string,
  position: number,
  status: string,
  obsoleteSince: string | null = null,
) => ({
  id,
  position,
  status,
  obsoleteSince,
});

describe("leadDeck", () => {
  it("picks the current meta deck with the lowest position, whatever the list order", () => {
    const decks = [
      deck("late", 4, "meta"),
      deck("alt", 2, "alt"),
      deck("lead", 3, "meta"),
      deck("old", 1, "meta", "2026-10-12"),
    ];
    expect(leadDeck(decks)?.id).toBe("lead");
  });

  it("skips the decks it's told to, such as the Rift's", () => {
    expect(leadDeck([deck("rift", 1, "meta"), deck("main", 2, "meta")], ["rift"])?.id).toBe("main");
  });

  it("answers undefined when no current deck is meta", () => {
    expect(leadDeck([deck("alt", 1, "alt"), deck("old", 2, "meta", "2026-10-12")])).toBeUndefined();
  });
});

describe("sameCookie", () => {
  it("matches by English name when both have one, so a shorthand meets its full name", () => {
    expect(
      sameCookie(
        { cookieKr: "우유", en: "Milk Cookie" },
        { cookieKr: "우유맛 쿠키", en: "Milk Cookie" },
      ),
    ).toBe(true);
    expect(
      sameCookie({ cookieKr: "우유", en: "Milk Cookie" }, { cookieKr: "우유", en: "Other" }),
    ).toBe(false);
  });

  it("falls back to the stored name when either is unresolved", () => {
    expect(
      sameCookie({ cookieKr: "브시커", en: null }, { cookieKr: "브시커", en: "Brightseeker" }),
    ).toBe(true);
    expect(sameCookie({ cookieKr: "브시커", en: null }, { cookieKr: "시커", en: null })).toBe(
      false,
    );
  });
});

describe("runesFor", () => {
  const milk = { cookieKr: "우유", en: "Milk Cookie" };
  /**
   * Builds a rune build stored under Milk's shorthand.
   *
   * @param id - its id
   * @param decks - the decks it's linked to
   * @param en - the English name it resolved to
   * @returns the build
   */
  const build = (id: number, decks: string[], en = "Milk Cookie") => ({
    id,
    cookieKr: "우유",
    en,
    decks,
  });

  it("keeps the cookie's builds linked to the deck, leaving out its unlinked ones", () => {
    const builds = [build(1, []), build(2, ["cherry", "alt"]), build(3, ["alt"])];
    expect(runesFor(milk, "cherry", builds).map((b) => b.id)).toEqual([2]);
  });

  it("falls back to the cookie's builds linked to no deck", () => {
    const builds = [build(1, []), build(3, ["alt"]), build(4, [], "Other Cookie")];
    expect(runesFor(milk, "cherry", builds).map((b) => b.id)).toEqual([1]);
  });

  it("answers no builds when the cookie has none for this deck or for every deck", () => {
    expect(runesFor(milk, "cherry", [build(3, ["alt"])])).toEqual([]);
  });
});
