import { describe, expect, it } from "vitest";
import { ImportError } from "../../src/errors";
import {
  mapDeck,
  mapGearSlot,
  mapGlossary,
  mapMeta,
  mapScore,
  mapSource,
} from "../../src/importers/seed/map";
import type { SeedDeck } from "../../src/importers/seed/schema";
import {
  seedDeck,
  seedGear,
  seedGlossaryEntry,
  seedMeta,
  seedMechanic,
  seedRng,
  seedRune,
  seedScore,
  seedSources,
  seedTakeaway,
  seedTimeline,
} from "../../src/importers/seed/schema";

/**
 * Validates a curated deck and files it under Guild Conquest when it states
 * no mode, as the import does for a record whose `import.json` says so.
 *
 * @param raw - the curated deck
 * @returns the deck, with its mode resolved
 */
function conquestDeck(raw: unknown): SeedDeck {
  const deck = seedDeck.parse(raw);
  return { ...deck, mode: deck.mode ?? "guild_conquest" };
}

const cherry = conquestDeck({
  id: "cherry",
  name_en: "Cherry deck",
  name_kr: "체리덱",
  status: "meta",
  ceiling: "1T 312G at 1.8G (729×)",
  summary: "The standard high-end deck.",
  cookies: [
    { kr: "우유", level: "100", why: "ATK #1 on purpose." },
    {
      kr: "브시커",
      level_rule: "Lv.100, or as high as possible while ATK < Milk",
      why: "The carry.",
    },
  ],
  atk_order: ["우유", "브시커"],
  atk_order_note: "Milk first.",
  pets: ["와사비문어", "핫도그", "색동주머니"],
  perks: "열정페이",
  formation: "Straight line.",
  substitutions: ["Tiger Lily → Herb.", "Cherry → Melon Soda."],
  rng: "Beam targets.",
  unorthodox: ["Five cookies at Lv.1."],
  sources: ["nv:43653", "dc:76135"],
});

describe("seed schemas", () => {
  it("require at least one source on every cited row", () => {
    const base = { title: "t", body: "b", confidence: "high" };
    expect(seedMechanic.safeParse({ ...base, sources: [] }).success).toBe(false);
    expect(seedMechanic.safeParse({ ...base, sources: ["dc:1"] }).success).toBe(true);
    expect(seedRng.safeParse({ factor: "f", effect: "e", sources: [] }).success).toBe(false);
    expect(seedTimeline.safeParse({ date: "2026-09-20", event: "e", sources: [] }).success).toBe(
      false,
    );
    expect(seedTakeaway.safeParse({ text: "t", sources: [] }).success).toBe(false);
    expect(
      seedRune.safeParse({ cookie: "우유", lines: "ATK%", why: "w", decks: [], sources: [] })
        .success,
    ).toBe(false);
    expect(
      seedGear.safeParse({
        slot: "top-left",
        substats: "s",
        why: "w",
        context: "raid",
        sources: [],
      }).success,
    ).toBe(false);
    expect(
      seedScore.safeParse({
        damage_g: 1,
        power_g: null,
        deck: null,
        verified: true,
        date: "2026-09-27",
        note: "",
        sources: [],
      }).success,
    ).toBe(false);
  });

  it("reject a deck cookie with neither a level nor a level rule", () => {
    const result = seedDeck.safeParse({
      ...cherry,
      cookies: [{ kr: "우유", why: "no level" }],
    });
    expect(result.success).toBe(false);
  });

  it("reject a level rule that is only an unknown marker, and keep one that says why", () => {
    for (const marker of ["?", "Lv ?", "lv.?", " LV?? ", "Lv ？"]) {
      const result = seedDeck.safeParse({
        ...cherry,
        cookies: [{ kr: "우유", level_rule: marker, why: "level not shown" }],
      });
      expect(result.success, marker).toBe(false);
    }
    const stated = seedDeck.safeParse({
      ...cherry,
      cookies: [{ kr: "우유", level_rule: "Likely Lv 100 (not stated)", why: "w" }],
    });
    expect(stated.success).toBe(true);
  });

  it("accept a sources record keyed by source id, with optional fields", () => {
    const parsed = seedSources.parse({
      "dc:76135": { url: "https://gall.dcinside.com/76135" },
      "web:x": {
        url: "https://x.test",
        title: "",
        title_en: "X",
        date: null,
        signal: "relevance 1/3",
      },
    });
    expect(Object.keys(parsed)).toEqual(["dc:76135", "web:x"]);
  });

  it("keep unknown glossary fields through the catchall", () => {
    const entry = seedGlossaryEntry.parse({
      kr: "털뭉치 멍뭉이",
      kr_short: ["털뭉치멍뭉이"],
      en: "Furball Pup",
      kind: "pet",
      element: "",
      class: "",
      rarity: "SSR",
      owned_stat: "CriticalResistAddition",
      brand_new_field: 7,
    });
    expect(entry.brand_new_field).toBe(7);
  });
});

describe("mapSource", () => {
  it("derives the site from the id prefix", () => {
    expect(mapSource("dc:1", { url: "u" }).site).toBe("dc");
    expect(mapSource("nv:1", { url: "u" }).site).toBe("nv");
    expect(mapSource("web:x", { url: "u" }).site).toBe("web");
  });

  it("maps a '?' date to null (Review Focus 4)", () => {
    const row = mapSource("web:allthingshow-guild-conquest", {
      url: "https://allthings.how/cookierun-crumble-guild-conquest-best-team-for-the-extra-stuffed-pinata/",
      title: "",
      title_en: "CookieRun: Crumble Guild Conquest - Best Team and Tips to Score Higher",
      date: "?",
      signal: "relevance 1/3",
    });
    expect(row.date).toBeNull();
    expect(row.relevance).toBe(1);
    expect(row.note).toBeNull();
  });

  it("keeps a YYYY-MM-DD date, titles and url", () => {
    const row = mapSource("nv:43653", {
      url: "https://cafe.naver.com/ccrumble/43653",
      title: "[토벌 공략] 체리덱",
      title_en: "[Conquest guide] Cherry deck",
      date: "2026-09-20",
      signal: "relevance 3/3",
    });
    expect(row).toEqual({
      id: "nv:43653",
      site: "nv",
      url: "https://cafe.naver.com/ccrumble/43653",
      title: "[토벌 공략] 체리덱",
      titleEn: "[Conquest guide] Cherry deck",
      date: "2026-09-20",
      relevance: 3,
      note: null,
    });
  });

  it("maps a non-relevance signal to a note", () => {
    const row = mapSource("web:crumbgg-s5", {
      url: "u",
      date: "2026-09-27",
      signal: "public game data",
    });
    expect(row.relevance).toBeNull();
    expect(row.note).toBe("public game data");
  });

  it("maps a null date, an empty title and a missing signal to null", () => {
    const row = mapSource("web:crumbgg:rankings-s1", { url: "u", title: "", date: null });
    expect(row.date).toBeNull();
    expect(row.title).toBeNull();
    expect(row.titleEn).toBeNull();
    expect(row.relevance).toBeNull();
    expect(row.note).toBeNull();
  });
});

describe("mapGlossary", () => {
  it("renames kr_short to shorthand, keeps a null en and nulls empty element/class/rarity", () => {
    const row = mapGlossary(
      seedGlossaryEntry.parse({
        kr: "데빌스투스 쿠키",
        kr_short: ["데빌스투스"],
        en: null,
        kind: "cookie",
        element: "",
        class: "",
        rarity: "",
        status: "not playable as of 1.4.002",
        note: "No EN name found.",
        source: "https://namu.wiki/w/쿠키런: 크럼블",
      }),
    );
    expect(row).toEqual({
      kr: "데빌스투스 쿠키",
      shorthand: ["데빌스투스"],
      en: null,
      kind: "cookie",
      element: null,
      class: null,
      rarity: null,
      extra: {
        status: "not playable as of 1.4.002",
        note: "No EN name found.",
        source: "https://namu.wiki/w/쿠키런: 크럼블",
      },
    });
  });

  it("keeps set element/class/rarity and moves every other field into extra", () => {
    const row = mapGlossary(
      seedGlossaryEntry.parse({
        kr: "피겨여왕맛 쿠키",
        kr_short: ["피겨", "피겨여왕"],
        en: "Skating Queen Cookie",
        kind: "cookie",
        element: "물/Water",
        class: "돌격/Charge",
        rarity: "SSR",
        synergy_received: ["지속"],
        skill_kr: "완벽한 연기",
        skill_en: "A Perfect Performance",
        resource_key: "cookie0018",
        source: "https://cookieruncrumble.app/api/catalog/gameplay",
        crosscheck: 'crumblehub EN = "Skating Queen Cookie"',
        owned_stat: "CriticalResistAddition",
        battle_passive_max_kr: "아군 공격력 10% 증가",
        battle_passive_max_en: "Ally ATK +10%",
      }),
    );
    expect(row.element).toBe("물/Water");
    expect(row.class).toBe("돌격/Charge");
    expect(row.rarity).toBe("SSR");
    expect(row.extra).toEqual({
      synergy_received: ["지속"],
      skill_kr: "완벽한 연기",
      skill_en: "A Perfect Performance",
      resource_key: "cookie0018",
      source: "https://cookieruncrumble.app/api/catalog/gameplay",
      crosscheck: 'crumblehub EN = "Skating Queen Cookie"',
      owned_stat: "CriticalResistAddition",
      battle_passive_max_kr: "아군 공격력 10% 증가",
      battle_passive_max_en: "Ally ATK +10%",
    });
  });
});

describe("mapDeck", () => {
  it("maps the deck row, renaming ceiling to ceilingText", () => {
    expect(mapDeck(cherry, 0).deck).toEqual({
      id: "cherry",
      position: 0,
      nameEn: "Cherry deck",
      nameKr: "체리덱",
      status: "meta",
      ceilingText: "1T 312G at 1.8G (729×)",
      summary: "The standard high-end deck.",
      formation: "Straight line.",
      perks: "열정페이",
      rng: "Beam targets.",
      atkOrder: ["우유", "브시커"],
      atkOrderNote: "Milk first.",
      mode: "guild_conquest",
    });
  });

  it("maps cookies with a level or a level rule, and pets in order", () => {
    const { cookies, pets } = mapDeck(cherry, 0);
    expect(cookies).toEqual([
      {
        cookieKr: "우유",
        level: "100",
        levelRule: null,
        stars: null,
        why: "ATK #1 on purpose.",
        slot: null,
      },
      {
        cookieKr: "브시커",
        level: null,
        levelRule: "Lv.100, or as high as possible while ATK < Milk",
        stars: null,
        why: "The carry.",
        slot: null,
      },
    ]);
    expect(pets).toEqual(["와사비문어", "핫도그", "색동주머니"]);
  });

  it("maps substitutions and unorthodox choices to notes of their kind", () => {
    expect(mapDeck(cherry, 0).notes).toEqual([
      { kind: "substitution", text: "Tiger Lily → Herb." },
      { kind: "substitution", text: "Cherry → Melon Soda." },
      { kind: "unorthodox", text: "Five cookies at Lv.1." },
    ]);
  });

  it("maps absent optional fields to null or empty lists", () => {
    const minimal = conquestDeck({
      id: "lottery",
      name_en: "Lottery",
      status: "niche",
      cookies: [{ kr: "우유", level: "1", why: "filler" }],
      sources: ["dc:1"],
    });
    const mapped = mapDeck(minimal, 4);
    expect(mapped.deck.position).toBe(4);
    expect(mapped.deck.nameKr).toBeNull();
    expect(mapped.deck.ceilingText).toBeNull();
    expect(mapped.deck.atkOrder).toBeNull();
    expect(mapped.pets).toEqual([]);
    expect(mapped.notes).toEqual([]);
  });
});

describe("mapGearSlot", () => {
  it("maps dashed slot names to the enum", () => {
    expect(mapGearSlot("top-left")).toBe("top_left");
    expect(mapGearSlot("top-right")).toBe("top_right");
    expect(mapGearSlot("bottom-left")).toBe("bottom_left");
    expect(mapGearSlot("bottom-right")).toBe("bottom_right");
    expect(mapGearSlot("general")).toBe("general");
  });

  it("maps an unknown slot to general", () => {
    expect(mapGearSlot("left-ear")).toBe("general");
  });
});

describe("mapScore", () => {
  it("renames deck to deckId and keeps a null power_g (Review Focus 4)", () => {
    const row = mapScore(
      seedScore.parse({
        damage_g: 3226,
        power_g: null,
        deck: null,
        verified: true,
        date: "2026-09-27",
        note: "#1 Season 5.",
        sources: ["web:crumbgg-s5"],
      }),
    );
    expect(row).toEqual({
      damageG: 3226,
      powerG: null,
      deckId: null,
      verified: true,
      date: "2026-09-27",
      season: null,
      player: null,
      note: "#1 Season 5.",
    });
  });

  it("keeps a set deck and power", () => {
    const row = mapScore(
      seedScore.parse({
        damage_g: 1999.4,
        power_g: 3.07,
        deck: "cherry",
        verified: true,
        date: "2026-09-26",
        note: "",
        sources: ["dc:76235"],
      }),
    );
    expect(row.deckId).toBe("cherry");
    expect(row.powerG).toBe(3.07);
  });
});

describe("mapMeta", () => {
  const metaInput = {
    updated: "2026-09-27",
    season: "S5 (live)",
    lede: "What players run.",
    caveat: "Snapshot of 2026-09-27.",
    record: "Games/crumble/research/001-guild-conquest-meta/",
    footer: "Built from the evidence.",
    gear_slot_names: { "top-left": "Top-left" },
    you: {
      summary: "Your lineup matches.",
      changes: ["Pomegranate: Lv.100 is fine."],
      sources: ["dc:76135", "nv:43653"],
    },
  };
  const meta = seedMeta.parse(metaInput);
  const modeless = {
    slug: "001-guild-conquest-meta",
    question: "Is there a documented set of teams?",
    status: "active" as const,
    startedAt: "2026-09-27",
  };
  const record = { ...modeless, mode: "guild_conquest" as const };

  it("builds the research record from the manifest record and the meta", () => {
    expect(mapMeta(meta, record).record).toEqual({
      slug: "001-guild-conquest-meta",
      question: "Is there a documented set of teams?",
      status: "active",
      startedAt: "2026-09-27",
      updatedAt: "2026-09-27",
      seasonLabel: "S5 (live)",
      lede: "What players run.",
      caveat: "Snapshot of 2026-09-27.",
      mode: "guild_conquest",
    });
    expect(mapMeta(meta, record).modes).toEqual([]);
    expect(mapMeta(meta, record).rules).toEqual([]);
  });

  it("files a record under its first covered mode, and maps each mode's rules", () => {
    const rule = { title: "Format", body: "b", confidence: "high", sources: ["dc:1"] };
    const pvp = seedMeta.parse({
      ...metaInput,
      modes: {
        rumble_arena: { lede: "Rumble", rules: [rule] },
        arena: { caveat: "Arena caveat", rules: [{ ...rule, mode: "arena", topic: "rules" }] },
      },
    });
    const mapped = mapMeta(pvp, modeless);
    expect(mapped.record.mode).toBe("arena");
    expect(mapMeta(pvp, { ...modeless, mode: "rumble_arena" }).record.mode).toBe("rumble_arena");
    expect(mapped.modes).toEqual([
      { mode: "arena", lede: null, caveat: "Arena caveat" },
      { mode: "rumble_arena", lede: "Rumble", caveat: null },
    ]);
    expect(mapped.rules.map((r) => [r.values.mode, r.values.topic, r.sources])).toEqual([
      ["arena", "rules", ["dc:1"]],
      ["rumble_arena", "rules", ["dc:1"]],
    ]);
  });

  it("rejects a record with no mode when the meta has no modes block, naming import.json", () => {
    expect(() => mapMeta(meta, modeless)).toThrow(ImportError);
    expect(() => mapMeta(meta, modeless)).toThrow(
      /import\.json \[record\.mode\]: the record states no mode, and meta\.json has no modes block/,
    );
  });

  it("maps you to the recommendation", () => {
    expect(mapMeta(meta, record).recommendation).toEqual({
      summary: "Your lineup matches.",
      changes: ["Pomegranate: Lv.100 is fine."],
      sources: ["dc:76135", "nv:43653"],
    });
  });
});
