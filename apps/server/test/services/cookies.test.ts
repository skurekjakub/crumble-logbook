import type { GameMode } from "@crumble/schema";
import { describe, expect, it } from "vitest";
import type { Store } from "../../src/repos";
import { createServices } from "../../src/services";
import { testStore } from "../helpers";

const CONQUEST = "a-conquest";
const PVP = "b-pvp";

/**
 * Stages the records, glossaries, rune builds, decks and usage rows the
 * cookies service aggregates: Milk named in full in one record and by
 * shorthand in another, 바궁 meaning a different cookie in each record, a
 * cookie with no resource key, one with no English name, a pet, and names
 * no glossary row matches.
 *
 * @returns the store
 */
function staged(): Store {
  const store = testStore();
  const { repos } = store;
  for (const [slug, mode] of [
    [CONQUEST, "guild_conquest"],
    [PVP, "arena"],
  ] as const) {
    repos.records.upsert({
      slug,
      question: "q",
      status: "active",
      startedAt: "2026-10-01",
      updatedAt: "2026-10-01",
      mode,
    });
  }
  repos.glossary.upsert({
    kr: "우유맛 쿠키",
    shorthand: ["우유"],
    en: "Milk Cookie",
    kind: "cookie",
    element: "빛/Light",
    class: "지원/Support",
    rarity: "SSR",
    extra: { resource_key: "cookie0055", skill_en: "Healing Milk" },
    recordSlug: CONQUEST,
  });
  repos.glossary.upsert({
    kr: "바리공주맛 쿠키",
    shorthand: ["바궁"],
    en: "Princess Bari Cookie",
    kind: "cookie",
    extra: { resource_key: "cookie0100" },
    recordSlug: CONQUEST,
  });
  repos.glossary.upsert({
    kr: "바람궁수 쿠키",
    shorthand: ["바궁"],
    en: "Wind Archer Cookie",
    kind: "cookie",
    element: "Grass",
    recordSlug: PVP,
  });
  repos.glossary.upsert({ kr: "무명 쿠키", en: null, kind: "cookie", recordSlug: PVP });
  repos.glossary.upsert({ kr: "갓난갓방울", en: "Holy Baby Drop", kind: "pet", recordSlug: PVP });

  const build = (cookieKr: string, mode: GameMode, recordSlug: string) =>
    repos.runeBuilds.insert({ cookieKr, lines: "ATK%", why: "w", mode, recordSlug });
  build("우유맛 쿠키", "guild_conquest", CONQUEST);
  build("우유맛 쿠키", "guild_conquest", CONQUEST);
  build("바궁", "guild_conquest", CONQUEST);
  build("all", "guild_conquest", CONQUEST);

  repos.decks.insert({
    id: "arena-dive",
    position: 1,
    nameEn: "Dive",
    status: "meta",
    mode: "arena",
    recordSlug: PVP,
  });
  repos.decks.replaceCookies("arena-dive", [
    { cookieKr: "우유", level: "100", levelRule: null, stars: null, why: "ATK #1" },
    { cookieKr: "바궁", level: null, levelRule: "as high as Milk", stars: null, why: "Carry" },
    { cookieKr: "수수께끼 쿠키", level: "1", levelRule: null, stars: null, why: "Filler" },
  ]);
  repos.decks.replacePets("arena-dive", ["갓난갓방울"]);

  const usage = (kind: "cookie" | "core" | "pet", subject: string, members: string[] | null) =>
    repos.usageStats.insert({
      mode: "arena",
      kind,
      subject,
      members,
      usagePct: 50,
      sample: "top 100",
      capturedAt: "2026-10-01",
      recordSlug: PVP,
    });
  usage("core", "Milk core", ["우유", "바궁"]);
  usage("pet", "갓난갓방울", null);
  return store;
}

describe("the cookies service", () => {
  it("lists every cookie the glossary holds once, with the modes it appears in counted, not its rows", () => {
    const { cookies } = createServices(staged()).cookies.list();
    expect(cookies.map((c) => [c.key, c.modes])).toEqual([
      ["cookie0055", ["guild_conquest", "arena"]],
      ["cookie0100", ["guild_conquest"]],
      ["wind-archer-cookie", ["arena"]],
      ["무명-쿠키", []],
    ]);
  });

  it("reads element and class as their English halves, and names in both languages", () => {
    const milk = createServices(staged()).cookies.list().cookies[0];
    expect(milk).toEqual({
      key: "cookie0055",
      kr: "우유맛 쿠키",
      en: "Milk Cookie",
      element: "Light",
      class: "Support",
      rarity: "SSR",
      modes: ["guild_conquest", "arena"],
    });
  });

  it("never makes a pet a cookie", () => {
    const services = createServices(staged());
    expect(services.cookies.list().cookies.map((c) => c.kr)).not.toContain("갓난갓방울");
  });

  it("lists the names no glossary row matches, with the modes they appear in", () => {
    expect(createServices(staged()).cookies.list().unresolved).toEqual([
      { name: "all", modes: ["guild_conquest"] },
      { name: "수수께끼 쿠키", modes: ["arena"] },
    ]);
  });

  it("gathers a cookie's rune builds, deck slots and usage into one block per mode", () => {
    const milk = createServices(staged()).cookies.get("cookie0055");
    expect(milk.skill).toBe("Healing Milk");
    expect(
      milk.blocks.map((b) => ({
        mode: b.mode,
        runeBuilds: b.runeBuilds.map((r) => r.cookieKr),
        decks: b.decks.map(({ deck, slot }) => [deck.id, slot.cookieKr, slot.level, slot.why]),
        usage: b.usage.map((u) => u.subject),
      })),
    ).toEqual([
      { mode: "guild_conquest", runeBuilds: ["우유맛 쿠키", "우유맛 쿠키"], decks: [], usage: [] },
      {
        mode: "arena",
        runeBuilds: [],
        decks: [["arena-dive", "우유", "100", "ATK #1"]],
        usage: ["Milk core"],
      },
    ]);
  });

  it("lands one shorthand on the cookie each row's own record means by it", () => {
    const services = createServices(staged());
    const bari = services.cookies.get("cookie0100");
    expect(bari.blocks.map((b) => [b.mode, b.runeBuilds.length, b.decks.length])).toEqual([
      ["guild_conquest", 1, 0],
    ]);
    const archer = services.cookies.get("wind-archer-cookie");
    expect(
      archer.blocks.map((b) => [b.mode, b.decks.map((d) => d.slot.levelRule), b.usage.length]),
    ).toEqual([["arena", ["as high as Milk"], 1]]);
  });

  it("serves a cookie no row names, with no blocks", () => {
    const nameless = createServices(staged()).cookies.get("무명-쿠키");
    expect(nameless).toMatchObject({ kr: "무명 쿠키", en: null, modes: [], blocks: [] });
  });

  it("throws NotFoundError for a key no cookie has", () => {
    expect(() => createServices(staged()).cookies.get("cookie9999")).toThrow(
      /cookie not found: cookie9999/,
    );
  });
});
