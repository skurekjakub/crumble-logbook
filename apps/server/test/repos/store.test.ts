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

  it("infers a synchronous callback's return type", () => {
    const store = testStore();

    const n: number = store.transaction(() => 1);

    expect(n).toBe(1);
  });

  it("rejects an async callback at compile time", () => {
    const store = testStore();

    // The transaction commits as soon as `work` returns, which for an async
    // callback is before its promise settles — a later rejection could
    // never roll back. Store.transaction's type must reject this at compile
    // time. Wrapped in a never-called function so tsc still checks the
    // `@ts-expect-error` below without opening a real transaction.
    function neverCalled() {
      // @ts-expect-error an async callback isn't assignable to Store.transaction's work parameter
      store.transaction(async () => 1);
    }

    expect(neverCalled).toBeTypeOf("function");
  });
});
