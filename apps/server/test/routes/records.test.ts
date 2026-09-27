import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { readJson, testStore } from "../helpers";

/** A fresh app over its own in-memory store. */
function setup() {
  const store = testStore();
  const app = createApp(createServices(store));
  return { app, store };
}

describe("records routes", () => {
  it("GET / lists research records ordered by slug", async () => {
    const { app, store } = setup();
    store.repos.records.upsert({
      slug: "001-guild-conquest-meta",
      question: "How do top players reach 2-3T?",
      status: "active",
      startedAt: "2026-09-01",
      updatedAt: "2026-09-27",
    });

    const res = await app.request("/api/records");
    expect(res.status).toBe(200);
    const data = await readJson<{ slug: string }[]>(res);
    expect(data.map((r) => r.slug)).toEqual(["001-guild-conquest-meta"]);
  });

  it("GET /:slug returns the record", async () => {
    const { app, store } = setup();
    store.repos.records.upsert({
      slug: "001-guild-conquest-meta",
      question: "How do top players reach 2-3T?",
      status: "active",
      startedAt: "2026-09-01",
      updatedAt: "2026-09-27",
    });

    const res = await app.request("/api/records/001-guild-conquest-meta");
    expect(res.status).toBe(200);
    const data = await readJson<{ question: string }>(res);
    expect(data.question).toBe("How do top players reach 2-3T?");
  });

  it("returns each record's mode and the modes it covers, each with its lede and caveat", async () => {
    const { app, store } = setup();
    store.repos.records.upsert({
      slug: "002-pvp-meta",
      question: "What wins PvP?",
      status: "active",
      startedAt: "2026-09-27",
      updatedAt: "2026-09-27",
      mode: "arena",
    });
    store.repos.records.replaceModes("002-pvp-meta", [
      { mode: "rumble_arena", lede: "Rumble lede", caveat: null },
      { mode: "arena", lede: "Arena lede", caveat: "Arena caveat" },
    ]);

    const data = await readJson<{ mode: string; modes: unknown[] }>(
      await app.request("/api/records/002-pvp-meta"),
    );
    expect(data.mode).toBe("arena");
    expect(data.modes).toEqual([
      { mode: "arena", lede: "Arena lede", caveat: "Arena caveat" },
      { mode: "rumble_arena", lede: "Rumble lede", caveat: null },
    ]);
  });

  it("GET /?mode= lists the records filed under that mode", async () => {
    const { app, store } = setup();
    for (const [slug, mode] of [
      ["001-guild-conquest-meta", "guild_conquest"],
      ["002-pvp-meta", "arena"],
    ] as const) {
      store.repos.records.upsert({
        slug,
        question: "q",
        status: "active",
        startedAt: "2026-09-27",
        updatedAt: "2026-09-27",
        mode,
      });
    }
    const data = await readJson<{ slug: string }[]>(await app.request("/api/records?mode=arena"));
    expect(data.map((r) => r.slug)).toEqual(["002-pvp-meta"]);
  });

  it("GET /:slug for an unknown slug returns 404", async () => {
    const { app } = setup();
    const res = await app.request("/api/records/missing");
    expect(res.status).toBe(404);
  });
});
