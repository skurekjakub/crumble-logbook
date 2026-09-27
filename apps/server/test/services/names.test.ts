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

  it("resolves an entry with a null gloss to en null", () => {
    const resolve = createNameResolver([unglossed]);
    expect(resolve("미확인 쿠키")).toEqual({ kr: "미확인 쿠키", en: null });
  });
});
