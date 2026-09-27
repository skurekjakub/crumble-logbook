import type { MechanicInput, MechanicRow, Values } from "@crumble/schema";
import { describe, expect, it } from "vitest";
import { NotFoundError, UnknownRefsError } from "../../src/errors";
import type { Store } from "../../src/repos";
import { createContentService } from "../../src/services/content";
import { addSource, testStore } from "../helpers";

/** Builds a `ContentService` over `mechanics`, the stand-in table for these tests. */
function mechanicsService(store: Store) {
  return createContentService<MechanicRow, Values<MechanicInput>>(store, {
    entity: "mechanic",
    table: (repos) => repos.mechanics,
  });
}

const values = { title: "Enrage timer", body: "Enrages at 30s.", confidence: "high" as const };

describe("createContentService", () => {
  it("create with an unknown source throws UnknownRefsError and writes no row", () => {
    const store = testStore();
    const svc = mechanicsService(store);

    expect(() => svc.create(values, ["dc:missing"])).toThrow(UnknownRefsError);
    expect(store.repos.mechanics.count()).toBe(0);
  });

  it("create then get returns the row with its sources", () => {
    const store = testStore();
    addSource(store, "dc:1");
    const svc = mechanicsService(store);

    const created = svc.create(values, ["dc:1"]);
    expect(created.sources).toEqual(["dc:1"]);
    expect(svc.get(created.id)).toEqual(created);
  });

  it("update without sources keeps the prior citations", () => {
    const store = testStore();
    addSource(store, "dc:1");
    const svc = mechanicsService(store);
    const created = svc.create(values, ["dc:1"]);

    const updated = svc.update(created.id, { title: "Renamed" });
    expect(updated.title).toBe("Renamed");
    expect(updated.sources).toEqual(["dc:1"]);
  });

  it("update with sources replaces them", () => {
    const store = testStore();
    addSource(store, "dc:1");
    addSource(store, "dc:2");
    const svc = mechanicsService(store);
    const created = svc.create(values, ["dc:1"]);

    const updated = svc.update(created.id, {}, ["dc:2"]);
    expect(updated.sources).toEqual(["dc:2"]);
  });

  it("remove deletes the row and its citations", () => {
    const store = testStore();
    addSource(store, "dc:1");
    const svc = mechanicsService(store);
    const created = svc.create(values, ["dc:1"]);

    svc.remove(created.id);
    expect(store.repos.mechanics.get(created.id)).toBeUndefined();
    expect(store.repos.citations.sourcesFor("mechanic", [String(created.id)]).size).toBe(0);
  });

  it("get, update and remove of an unknown id throw NotFoundError", () => {
    const store = testStore();
    const svc = mechanicsService(store);

    expect(() => svc.get(999)).toThrow(NotFoundError);
    expect(() => svc.update(999, { title: "x" })).toThrow(NotFoundError);
    expect(() => svc.remove(999)).toThrow(NotFoundError);
  });
});
