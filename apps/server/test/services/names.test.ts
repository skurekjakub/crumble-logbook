import type { GlossaryRow } from "@crumble/schema";
import { describe, expect, it } from "vitest";
import { createNameResolver } from "../../src/services/names";

const skatingQueen: GlossaryRow = {
  kr: "스케이팅 퀸맛 쿠키",
  shorthand: ["피겨"],
  en: "Skating Queen Cookie",
  kind: "cookie",
  element: null,
  class: null,
  rarity: null,
  extra: {},
  recordSlug: null,
};

const unglossed: GlossaryRow = {
  kr: "미확인 쿠키",
  shorthand: [],
  en: null,
  kind: "cookie",
  element: null,
  class: null,
  rarity: null,
  extra: {},
  recordSlug: null,
};

describe("createNameResolver", () => {
  it("resolves a shorthand to its entry's English gloss, keeping kr as written", () => {
    const resolve = createNameResolver([skatingQueen]);
    expect(resolve("피겨")).toEqual({ kr: "피겨", en: "Skating Queen Cookie" });
  });

  it("resolves the English name case-insensitively, keeping kr as written", () => {
    const resolve = createNameResolver([skatingQueen]);
    expect(resolve("skating queen cookie")).toEqual({
      kr: "skating queen cookie",
      en: "Skating Queen Cookie",
    });
  });

  it("returns en null for a name that matches nothing", () => {
    const resolve = createNameResolver([skatingQueen]);
    expect(resolve("아무도 모름")).toEqual({ kr: "아무도 모름", en: null });
  });

  it("prefers an entry from one of the given records when several entries claim a key", () => {
    const bari = {
      kr: "바리공주맛 쿠키",
      shorthand: ["바궁"],
      en: "Princess Bari",
      recordSlug: "a",
    };
    const archer = { kr: "바궁", en: "Wind Archer", recordSlug: "b" };
    const resolve = createNameResolver([archer, bari]);
    expect(resolve("바궁").en).toBe("Princess Bari");
    expect(resolve("바궁", ["a"]).en).toBe("Princess Bari");
    expect(resolve("바궁", ["b"]).en).toBe("Wind Archer");
    expect(resolve("바궁", ["c"]).en).toBe("Princess Bari");
  });

  it("resolves an entry with a null gloss to en null", () => {
    const resolve = createNameResolver([unglossed]);
    expect(resolve("미확인 쿠키")).toEqual({ kr: "미확인 쿠키", en: null });
  });
});
