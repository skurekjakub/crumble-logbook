import { describe, expect, it } from "vitest";
import { testStore } from "../helpers";

describe("SourcesRepo", () => {
  it("lists dated sources newest first, with null dates last, then by id", () => {
    const store = testStore();
    const { sources } = store.repos;
    sources.insert({ id: "dc:1", site: "dc", url: "u1", date: "2026-01-01" });
    sources.insert({ id: "dc:2", site: "dc", url: "u2", date: null });
    sources.insert({ id: "dc:3", site: "dc", url: "u3", date: "2026-02-01" });
    sources.insert({ id: "dc:4", site: "dc", url: "u4", date: null });

    expect(sources.list().map((s) => s.id)).toEqual(["dc:3", "dc:1", "dc:2", "dc:4"]);
  });

  it("filters by site", () => {
    const store = testStore();
    const { sources } = store.repos;
    sources.insert({ id: "dc:1", site: "dc", url: "u1" });
    sources.insert({ id: "nv:1", site: "nv", url: "u2" });

    expect(sources.list("nv").map((s) => s.id)).toEqual(["nv:1"]);
  });

  it("missing returns only the absent ids", () => {
    const store = testStore();
    store.repos.sources.insert({ id: "dc:1", site: "dc", url: "u1" });

    expect(store.repos.sources.missing(["dc:1", "dc:2"])).toEqual(["dc:2"]);
  });

  it("missing of an empty list is empty", () => {
    const store = testStore();
    expect(store.repos.sources.missing([])).toEqual([]);
  });
});
