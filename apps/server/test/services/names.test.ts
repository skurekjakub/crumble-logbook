import type { GlossaryRow } from "@crumble/schema";
import { describe, expect, it } from "vitest";
import { cookieKey, createEntryFinder, createNameResolver } from "../../src/services/names";

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
    expect(resolve("피겨")).toEqual({
      kr: "피겨",
      en: "Skating Queen Cookie",
      key: "skating-queen-cookie",
    });
  });

  it("resolves the English name case-insensitively, keeping kr as written", () => {
    const resolve = createNameResolver([skatingQueen]);
    expect(resolve("skating queen cookie")).toEqual({
      kr: "skating queen cookie",
      en: "Skating Queen Cookie",
      key: "skating-queen-cookie",
    });
  });

  it("returns en and key null for a name that matches nothing", () => {
    const resolve = createNameResolver([skatingQueen]);
    expect(resolve("아무도 모름")).toEqual({ kr: "아무도 모름", en: null, key: null });
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

  it("resolves an entry with a null gloss to en null, keyed by its Korean name", () => {
    const resolve = createNameResolver([unglossed]);
    expect(resolve("미확인 쿠키")).toEqual({ kr: "미확인 쿠키", en: null, key: "미확인-쿠키" });
  });

  it("gives a name that resolves to anything but a cookie a null key", () => {
    const term = { ...skatingQueen, kr: "공증", shorthand: [], en: "ATK%", kind: "stat" as const };
    expect(createNameResolver([term])("공증")).toEqual({ kr: "공증", en: "ATK%", key: null });
  });
});

describe("createEntryFinder", () => {
  it("returns the winning entry itself, per the records asked for, or undefined", () => {
    const bari = { ...skatingQueen, kr: "바리공주맛 쿠키", shorthand: ["바궁"], recordSlug: "a" };
    const archer = { ...skatingQueen, kr: "바궁", shorthand: [], kind: "term" as const };
    const find = createEntryFinder([bari, { ...archer, recordSlug: "b" }]);
    expect(find("바궁", ["a"])).toBe(bari);
    expect(find("바궁", ["b"])?.kind).toBe("term");
    expect(find("없음")).toBeUndefined();
  });
});

describe("cookieKey", () => {
  it("keys a cookie by its game resource key first", () => {
    expect(cookieKey({ ...skatingQueen, extra: { resource_key: "cookie0018" } })).toBe(
      "cookie0018",
    );
  });

  it("keys a cookie whose resource key isn't one the game writes by its English name", () => {
    expect(cookieKey({ ...skatingQueen, extra: { resource_key: "Skating Queen" } })).toBe(
      "skating-queen-cookie",
    );
  });

  it("slugs the English name to lower-case words joined by hyphens", () => {
    expect(cookieKey({ ...skatingQueen, en: "Space Doughnut's Royal Excellence" })).toBe(
      "space-doughnut-s-royal-excellence",
    );
  });

  it("keys a pet, a stat or a term nothing", () => {
    expect(cookieKey({ ...skatingQueen, kind: "pet", extra: { resource_key: "pet4001" } })).toBe(
      null,
    );
    expect(cookieKey({ ...skatingQueen, kind: "term" })).toBeNull();
  });
});
