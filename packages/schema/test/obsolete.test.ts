import { describe, expect, it } from "vitest";
import { CITED_ENTITY } from "../src/enums";
import { counterInput, deckInput, gearRecInput, runeBuildInput } from "../src/inputs";
import {
  OBSOLESCENCE,
  OBSOLETE_ENTITIES,
  isObsoleteEntity,
  obsolescenceKey,
  parseObsolescenceKey,
} from "../src/obsolete";
import { counters, decks, gearRecs, runeBuilds } from "../src/tables";
import { deckInsert, gearRecInsert } from "../src/zod";
import { createTestDb } from "./helpers";

describe("the obsolete lifecycle", () => {
  it("names only cited entities, and cites reasons under an entity of its own", () => {
    for (const entity of OBSOLETE_ENTITIES) expect(CITED_ENTITY).toContain(entity);
    expect(CITED_ENTITY).toContain(OBSOLESCENCE);
    expect(isObsoleteEntity("deck")).toBe(true);
    expect(isObsoleteEntity("score")).toBe(false);
    expect(isObsoleteEntity(OBSOLESCENCE)).toBe(false);
  });

  it("keys a reason by its row's entity and id, and reads the key back", () => {
    expect(obsolescenceKey("deck", "arena-five-ranged")).toBe("deck:arena-five-ranged");
    expect(obsolescenceKey("counter", 12)).toBe("counter:12");
    expect(parseObsolescenceKey("counter:12")).toEqual({ entity: "counter", id: "12" });
    expect(parseObsolescenceKey("deck:a:b")).toEqual({ entity: "deck", id: "a:b" });
    expect(parseObsolescenceKey("score:1")).toBeUndefined();
    expect(parseObsolescenceKey("deck:")).toBeUndefined();
    expect(parseObsolescenceKey("deck")).toBeUndefined();
  });

  it("leaves every lifecycle column null on a row that doesn't set it", () => {
    const db = createTestDb();
    const deck = db
      .insert(decks)
      .values({ id: "d", position: 0, nameEn: "d", status: "meta" })
      .returning()
      .get();
    expect(deck).toMatchObject({ obsoleteSince: null, obsoleteReason: null, supersededBy: null });
    db.insert(decks).values({ id: "e", position: 1, nameEn: "e", status: "meta" }).run();
    const rune = db
      .insert(runeBuilds)
      .values({ cookieKr: "c", lines: "l", why: "w" })
      .returning()
      .get();
    const gear = db
      .insert(gearRecs)
      .values({ slot: "top_left", substats: "s", context: "raid", why: "w" })
      .returning()
      .get();
    const edge = db
      .insert(counters)
      .values({ slug: "d-vs-e", teamDeckId: "d", beatenByDeckId: "e", why: "w", confidence: "low" })
      .returning()
      .get();
    for (const row of [rune, gear, edge]) {
      expect(row).toMatchObject({ obsoleteSince: null, obsoleteReason: null });
    }
  });

  it("stores an obsolete deck's date, reason and successor", () => {
    const db = createTestDb();
    db.insert(decks).values({ id: "rye", position: 0, nameEn: "Rye", status: "meta" }).run();
    const ranged = db
      .insert(decks)
      .values({
        id: "ranged",
        position: 1,
        nameEn: "Ranged",
        status: "legacy",
        obsoleteSince: "2026-10-12",
        obsoleteReason: "Patched out.",
        supersededBy: "rye",
      })
      .returning()
      .get();
    expect(ranged).toMatchObject({
      status: "legacy",
      obsoleteSince: "2026-10-12",
      obsoleteReason: "Patched out.",
      supersededBy: "rye",
    });
  });

  it("validates the lifecycle columns on insert: an ISO date, a deck slug", () => {
    const base = { id: "d", position: 0, nameEn: "d", status: "meta" };
    expect(
      deckInsert.safeParse({ ...base, obsoleteSince: "2026-10-12", supersededBy: "rye" }).success,
    ).toBe(true);
    expect(deckInsert.safeParse({ ...base, obsoleteSince: "12/10/2026" }).success).toBe(false);
    expect(deckInsert.safeParse({ ...base, supersededBy: "Not A Slug" }).success).toBe(false);
    const gear = { slot: "top_left", substats: "s", context: "raid", why: "w" };
    expect(gearRecInsert.safeParse({ ...gear, obsoleteSince: "soon" }).success).toBe(false);
  });

  it("keeps the lifecycle columns out of every API input", () => {
    const lifecycle = { obsoleteSince: "2026-10-12", obsoleteReason: "r" };
    const gear = gearRecInput.parse({
      slot: "top_left",
      substats: "s",
      context: "raid",
      why: "w",
      sources: ["dc:1"],
      ...lifecycle,
    });
    expect(gear).not.toHaveProperty("obsoleteSince");
    const rune = runeBuildInput.parse({
      cookieKr: "c",
      lines: "l",
      why: "w",
      sources: ["dc:1"],
      ...lifecycle,
    });
    expect(rune).not.toHaveProperty("obsoleteSince");
    const edge = counterInput.parse({
      slug: "a-vs-b",
      teamDeckId: "a",
      beatenByDeckId: "b",
      why: "w",
      confidence: "low",
      sources: ["dc:1"],
      ...lifecycle,
    });
    expect(edge).not.toHaveProperty("obsoleteReason");
    const deck = deckInput.parse({
      id: "d",
      nameEn: "d",
      status: "meta",
      cookies: [{ cookieKr: "c", level: "1", why: "w" }],
      sources: ["dc:1"],
      ...lifecycle,
      supersededBy: "rye",
    });
    expect(deck).not.toHaveProperty("obsoleteSince");
    expect(deck).not.toHaveProperty("supersededBy");
  });
});
