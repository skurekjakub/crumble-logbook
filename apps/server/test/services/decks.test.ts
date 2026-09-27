import type { DeckInput } from "@crumble/schema";
import { describe, expect, it } from "vitest";
import { ConflictError, UnknownRefsError } from "../../src/errors";
import type { Store } from "../../src/repos";
import { createDeckService } from "../../src/services/decks";
import { addSource, testStore } from "../helpers";

/** A valid deck input: one cookie (cherry cookie, glossed via {@link seedGlossary}), no pets or notes. */
const baseDeck: DeckInput = {
  id: "cherry",
  nameEn: "Cherry",
  nameKr: null,
  status: "meta",
  ceilingText: null,
  summary: "A summary",
  formation: null,
  perks: null,
  rng: null,
  atkOrder: null,
  atkOrderNote: null,
  cookies: [{ cookieKr: "체리 쿠키", level: "70", levelRule: null, stars: null, why: "carry" }],
  pets: [],
  notes: [],
  sources: ["dc:1"],
};

/** Adds the glossary entry that resolves `baseDeck`'s one cookie to English. */
function seedGlossary(store: Store): void {
  store.repos.glossary.upsert({ kr: "체리 쿠키", shorthand: [], en: "Cherry Cookie", kind: "cookie" });
}

describe("createDeckService", () => {
  it("create returns cookies in input order with en resolved", () => {
    const store = testStore();
    addSource(store, "dc:1");
    seedGlossary(store);
    const svc = createDeckService(store);

    const created = svc.create(baseDeck);

    expect(created.cookies.map((c) => c.en)).toEqual(["Cherry Cookie"]);
    expect(created.cookies.map((c) => c.cookieKr)).toEqual(["체리 쿠키"]);
  });

  it("a duplicate id throws ConflictError", () => {
    const store = testStore();
    addSource(store, "dc:1");
    seedGlossary(store);
    const svc = createDeckService(store);
    svc.create(baseDeck);

    expect(() => svc.create(baseDeck)).toThrow(ConflictError);
  });

  it("an unknown source throws UnknownRefsError", () => {
    const store = testStore();
    seedGlossary(store);
    const svc = createDeckService(store);

    expect(() => svc.create(baseDeck)).toThrow(UnknownRefsError);
  });

  it("a patch with only summary leaves cookies, pets and notes untouched", () => {
    const store = testStore();
    addSource(store, "dc:1");
    seedGlossary(store);
    const svc = createDeckService(store);
    svc.create({ ...baseDeck, pets: ["펫1"], notes: [{ kind: "substitution", text: "swap" }] });

    const updated = svc.update("cherry", { summary: "Updated" });

    expect(updated.summary).toBe("Updated");
    expect(updated.cookies).toHaveLength(1);
    expect(updated.pets).toHaveLength(1);
    expect(updated.notes).toHaveLength(1);
  });

  it("a patch with pets: [] clears pets", () => {
    const store = testStore();
    addSource(store, "dc:1");
    seedGlossary(store);
    const svc = createDeckService(store);
    svc.create({ ...baseDeck, pets: ["펫1"] });

    const updated = svc.update("cherry", { pets: [] });

    expect(updated.pets).toEqual([]);
  });

  it("remove sets the referencing score's deckId to null and deletes citations", () => {
    const store = testStore();
    addSource(store, "dc:1");
    seedGlossary(store);
    const svc = createDeckService(store);
    svc.create(baseDeck);
    const score = store.repos.scores.insert({
      damageG: 100,
      powerG: 1,
      deckId: "cherry",
      verified: false,
      date: null,
      season: null,
      player: null,
      note: null,
    });

    svc.remove("cherry");

    expect(store.repos.scores.get(score.id)?.deckId).toBeNull();
    expect(store.repos.citations.sourcesFor("deck", ["cherry"]).size).toBe(0);
  });

  it("get and update and remove of an unknown id throw NotFoundError", () => {
    const store = testStore();
    const svc = createDeckService(store);

    expect(() => svc.get("missing")).toThrow("deck not found: missing");
    expect(() => svc.update("missing", { summary: "x" })).toThrow("deck not found: missing");
    expect(() => svc.remove("missing")).toThrow("deck not found: missing");
  });
});
