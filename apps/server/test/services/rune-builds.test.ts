import type { RuneBuildInput } from "@crumble/schema";
import { describe, expect, it } from "vitest";
import { UnknownRefsError } from "../../src/errors";
import type { Store } from "../../src/repos";
import { createDeckService } from "../../src/services/decks";
import { createRuneBuildService } from "../../src/services/rune-builds";
import { addSource, testStore } from "../helpers";

/** Inserts a minimal deck row directly, for use as a rune build's linked deck in tests. */
function addDeck(store: Store, id: string): void {
  store.repos.decks.insert({ id, position: store.repos.decks.nextPosition(), nameEn: id, status: "meta" });
}

/** A valid rune build input citing `dc:1` and linked to the `cherry` deck. */
const baseInput: RuneBuildInput = {
  cookieKr: "체리 쿠키",
  lines: "ATK/ATK/ATK%",
  why: "carry",
  disputed: null,
  decks: ["cherry"],
  sources: ["dc:1"],
};

describe("createRuneBuildService", () => {
  it("create links decks and resolves en", () => {
    const store = testStore();
    addSource(store, "dc:1");
    addDeck(store, "cherry");
    store.repos.glossary.upsert({ kr: "체리 쿠키", shorthand: [], en: "Cherry Cookie", kind: "cookie" });
    const svc = createRuneBuildService(store);

    const created = svc.create(baseInput);

    expect(created.decks).toEqual(["cherry"]);
    expect(created.en).toBe("Cherry Cookie");
  });

  it("an unknown deck throws UnknownRefsError kind decks", () => {
    const store = testStore();
    addSource(store, "dc:1");
    const svc = createRuneBuildService(store);

    expect(() => svc.create(baseInput)).toThrow(UnknownRefsError);
    try {
      svc.create(baseInput);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(UnknownRefsError);
      expect((err as UnknownRefsError).kind).toBe("decks");
      expect((err as UnknownRefsError).ids).toEqual(["cherry"]);
    }
  });

  it("list({ deck }) filters to rune builds linked to that deck", () => {
    const store = testStore();
    addSource(store, "dc:1");
    addDeck(store, "cherry");
    addDeck(store, "onion");
    const svc = createRuneBuildService(store);
    svc.create(baseInput);
    svc.create({ ...baseInput, decks: ["onion"] });

    const filtered = svc.list({ deck: "cherry" });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.decks).toEqual(["cherry"]);
  });

  it("a patch without decks keeps existing links", () => {
    const store = testStore();
    addSource(store, "dc:1");
    addDeck(store, "cherry");
    const svc = createRuneBuildService(store);
    const created = svc.create(baseInput);

    const updated = svc.update(created.id, { why: "updated" });

    expect(updated.decks).toEqual(["cherry"]);
    expect(updated.why).toBe("updated");
  });

  it("deleting a linked deck via the deck service drops the link row (cascade)", () => {
    const store = testStore();
    addSource(store, "dc:1");
    addDeck(store, "cherry");
    const svc = createRuneBuildService(store);
    const created = svc.create(baseInput);
    const deckSvc = createDeckService(store);

    deckSvc.remove("cherry");

    expect(store.repos.runeBuilds.decksFor([created.id]).size).toBe(0);
  });

  it("get, update and remove of an unknown id throw NotFoundError", () => {
    const store = testStore();
    const svc = createRuneBuildService(store);

    expect(() => svc.get(999)).toThrow("rune_build not found: 999");
    expect(() => svc.update(999, { why: "x" })).toThrow("rune_build not found: 999");
    expect(() => svc.remove(999)).toThrow("rune_build not found: 999");
  });
});
