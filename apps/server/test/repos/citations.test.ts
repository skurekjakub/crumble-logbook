import { describe, expect, it } from "vitest";
import { addSource, testStore } from "../helpers";

describe("CitationsRepo", () => {
  it("replace de-duplicates and replaces the prior set", () => {
    const store = testStore();
    addSource(store, "dc:1");
    addSource(store, "dc:2");
    const { citations } = store.repos;

    citations.replace("deck", "deck-a", ["dc:1", "dc:1", "dc:2"]);
    expect(citations.sourcesFor("deck", ["deck-a"]).get("deck-a")).toEqual(["dc:1", "dc:2"]);

    citations.replace("deck", "deck-a", ["dc:2"]);
    expect(citations.sourcesFor("deck", ["deck-a"]).get("deck-a")).toEqual(["dc:2"]);
  });

  it("sourcesFor groups by entity id and returns an empty map for an empty input", () => {
    const store = testStore();
    addSource(store, "dc:1");
    addSource(store, "dc:2");
    const { citations } = store.repos;
    citations.replace("deck", "deck-a", ["dc:1"]);
    citations.replace("deck", "deck-b", ["dc:2"]);

    const grouped = citations.sourcesFor("deck", ["deck-a", "deck-b"]);
    expect(grouped.get("deck-a")).toEqual(["dc:1"]);
    expect(grouped.get("deck-b")).toEqual(["dc:2"]);
    expect(citations.sourcesFor("deck", [])).toEqual(new Map());
  });

  it("countForSource counts citations across entities", () => {
    const store = testStore();
    addSource(store, "dc:1");
    const { citations } = store.repos;
    citations.replace("deck", "deck-a", ["dc:1"]);
    citations.replace("mechanic", "1", ["dc:1"]);

    expect(citations.countForSource("dc:1")).toBe(2);
  });

  it("removeAll, count, all and clear behave as expected", () => {
    const store = testStore();
    addSource(store, "dc:1");
    const { citations } = store.repos;
    citations.replace("deck", "deck-a", ["dc:1"]);
    expect(citations.count()).toBe(1);

    citations.removeAll("deck", "deck-a");
    expect(citations.count()).toBe(0);

    citations.replace("deck", "deck-a", ["dc:1"]);
    expect(citations.all()).toHaveLength(1);

    citations.clear();
    expect(citations.count()).toBe(0);
  });
});
