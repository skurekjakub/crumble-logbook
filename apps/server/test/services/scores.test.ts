import { decks } from "@crumble/schema";
import { describe, expect, it } from "vitest";
import { openDb } from "../../src/db/client";
import { UnknownRefsError } from "../../src/errors";
import { createStore } from "../../src/repos";
import type { Store } from "../../src/repos";
import { createScoreService, ratio } from "../../src/services/scores";
import { addSource, testStore } from "../helpers";

/**
 * Builds a fresh store with a `cherry` deck already inserted, for `deckId` references.
 *
 * @returns the store
 */
function storeWithCherryDeck(): Store {
  const db = openDb(":memory:");
  const store = createStore(db);
  db.insert(decks).values({ id: "cherry", position: 0, nameEn: "Cherry", status: "meta" }).run();
  return store;
}

const base = { deckId: null, verified: false, date: null, season: null, player: null, note: null };

describe("ratio", () => {
  it("rounds damage over power when both are positive", () => {
    expect(ratio(1999, 3.07)).toBe(651);
  });

  it("returns null when power is null", () => {
    expect(ratio(1999, null)).toBeNull();
  });

  it("returns null when damage is zero", () => {
    expect(ratio(0, 3)).toBeNull();
  });
});

describe("createScoreService", () => {
  it("list sorts by damage descending", () => {
    const store = testStore();
    addSource(store, "dc:1");
    const svc = createScoreService(store);

    svc.create({ ...base, damageG: 1, powerG: 1 }, ["dc:1"]);
    svc.create({ ...base, damageG: 3, powerG: 1 }, ["dc:1"]);
    svc.create({ ...base, damageG: 2, powerG: 1 }, ["dc:1"]);

    expect(svc.list().map((s) => s.damageG)).toEqual([3, 2, 1]);
  });

  it("list filters by deck", () => {
    const store = storeWithCherryDeck();
    addSource(store, "dc:1");
    const svc = createScoreService(store);

    svc.create({ ...base, damageG: 1, powerG: 1, deckId: "cherry" }, ["dc:1"]);
    svc.create({ ...base, damageG: 2, powerG: 1 }, ["dc:1"]);

    const filtered = svc.list({ deck: "cherry" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.deckId).toBe("cherry");
  });

  it("an unknown deckId throws UnknownRefsError", () => {
    const store = testStore();
    addSource(store, "dc:1");
    const svc = createScoreService(store);

    expect(() =>
      svc.create({ ...base, damageG: 1, powerG: 1, deckId: "missing-deck" }, ["dc:1"]),
    ).toThrow(UnknownRefsError);
  });
});
