import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { exportSnapshot } from "../../src/services/export";
import { addSource, readJson, testStore } from "../helpers";

describe("export routes", () => {
  it("GET / returns the store's snapshot", async () => {
    const store = testStore();
    addSource(store, "dc:1");
    store.repos.glossary.upsert({
      kr: "체리 쿠키",
      shorthand: [],
      en: "Cherry Cookie",
      kind: "cookie",
    });
    const app = createApp(createServices(store));

    const res = await app.request("/api/export");

    expect(res.status).toBe(200);
    const data = await readJson<unknown>(res);
    expect(data).toEqual(exportSnapshot(store));
  });

  it("GET / on an empty database returns version 1 with every table empty", async () => {
    const store = testStore();
    const app = createApp(createServices(store));

    const res = await app.request("/api/export");

    const data = await readJson<{ version: number; tables: Record<string, unknown[]> }>(res);
    expect(data.version).toBe(1);
    expect(data.tables.sources).toEqual([]);
    expect(data.tables.citations).toEqual([]);
  });
});
