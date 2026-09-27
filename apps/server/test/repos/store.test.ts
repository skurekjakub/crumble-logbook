import { describe, expect, it } from "vitest";
import { testStore } from "../helpers";

describe("Store.transaction", () => {
  it("rolls back all changes when the callback throws", () => {
    const store = testStore();

    expect(() =>
      store.transaction((repos) => {
        repos.sources.insert({ id: "dc:1", site: "dc", url: "u1" });
        throw new Error("boom");
      }),
    ).toThrow("boom");

    expect(store.repos.sources.count()).toBe(0);
  });

  it("returns the callback's return value", () => {
    const store = testStore();

    const result = store.transaction((repos) => {
      repos.sources.insert({ id: "dc:1", site: "dc", url: "u1" });
      return 42;
    });

    expect(result).toBe(42);
    expect(store.repos.sources.count()).toBe(1);
  });
});
