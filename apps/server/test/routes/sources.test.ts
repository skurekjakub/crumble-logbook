import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { jsonBody, readJson, testStore } from "../helpers";

/** A fresh app over its own in-memory store. */
function setup() {
  const store = testStore();
  const app = createApp(createServices(store));
  return { app, store };
}

describe("sources routes", () => {
  it("POST with id nv:1 stores site: nv", async () => {
    const { app } = setup();
    const res = await app.request(
      "/api/sources",
      jsonBody({ id: "nv:1", url: "https://example.test/nv1" }),
    );
    expect(res.status).toBe(201);
    const data = await readJson<{ id: string; site: string }>(res);
    expect(data.site).toBe("nv");
  });

  it("POST an existing id returns 409", async () => {
    const { app } = setup();
    await app.request("/api/sources", jsonBody({ id: "dc:1", url: "https://example.test/dc1" }));
    const res = await app.request(
      "/api/sources",
      jsonBody({ id: "dc:1", url: "https://example.test/dc1-again" }),
    );
    expect(res.status).toBe(409);
  });

  it("GET /:id with a URL-encoded colon resolves to the decoded id, with citedBy", async () => {
    const { app, store } = setup();
    store.repos.sources.insert({ id: "dc:76135", site: "dc", url: "https://example.test/dc76135" });
    store.repos.citations.replace("deck", "cherry", ["dc:76135"]);

    const res = await app.request("/api/sources/dc%3A76135");
    expect(res.status).toBe(200);
    const data = await readJson<{ id: string; citedBy: number }>(res);
    expect(data.id).toBe("dc:76135");
    expect(data.citedBy).toBe(1);
  });

  it("GET /:id for an unknown id returns 404", async () => {
    const { app } = setup();
    const res = await app.request("/api/sources/dc%3Amissing");
    expect(res.status).toBe(404);
  });

  it("GET /?site= filters", async () => {
    const { app, store } = setup();
    store.repos.sources.insert({ id: "dc:1", site: "dc", url: "u1" });
    store.repos.sources.insert({ id: "nv:1", site: "nv", url: "u2" });

    const res = await app.request("/api/sources?site=nv");
    const data = await readJson<{ id: string }[]>(res);
    expect(data.map((s) => s.id)).toEqual(["nv:1"]);
  });

  describe("records", () => {
    /**
     * Seeds three sources: dc:1 owned by r1 and cited by nothing; dc:2 owned
     * by no record and cited by r2's mechanic; dc:3 owned by r1 and cited by
     * r2's deck. nv:1 is owned by nobody and cited by a row no record owns.
     */
    function seedRecords() {
      const { app, store } = setup();
      const { sources, mechanics, citations } = store.repos;
      sources.insert({ id: "dc:1", site: "dc", url: "u1", recordSlug: "r1" });
      sources.insert({ id: "dc:2", site: "dc", url: "u2" });
      sources.insert({ id: "dc:3", site: "dc", url: "u3", recordSlug: "r1" });
      sources.insert({ id: "nv:1", site: "nv", url: "u4" });
      const owned = mechanics.insert({
        title: "t",
        body: "b",
        confidence: "high",
        recordSlug: "r2",
      });
      citations.replace("mechanic", String(owned.id), ["dc:2"]);
      const loose = mechanics.insert({ title: "t", body: "b", confidence: "high" });
      citations.replace("mechanic", String(loose.id), ["nv:1"]);
      store.repos.decks.insert({
        id: "d",
        position: 1,
        nameEn: "d",
        status: "meta",
        recordSlug: "r2",
      });
      citations.replace("deck", "d", ["dc:3"]);
      return app;
    }

    it("GET / gives each source its records: the one that owns it and every one whose rows cite it", async () => {
      const app = seedRecords();
      const data = await readJson<{ id: string; records: string[] }[]>(
        await app.request("/api/sources"),
      );
      expect(Object.fromEntries(data.map((s) => [s.id, s.records]))).toEqual({
        "dc:1": ["r1"],
        "dc:2": ["r2"],
        "dc:3": ["r1", "r2"],
        "nv:1": [],
      });
    });

    it("GET /?record= keeps the sources that record owns or cites", async () => {
      const app = seedRecords();
      const ids = async (query: string) =>
        (await readJson<{ id: string }[]>(await app.request(`/api/sources${query}`))).map(
          (s) => s.id,
        );
      expect(await ids("?record=r1")).toEqual(["dc:1", "dc:3"]);
      expect(await ids("?record=r2")).toEqual(["dc:2", "dc:3"]);
      expect(await ids("?record=r2&site=dc")).toEqual(["dc:2", "dc:3"]);
      expect(await ids("?record=none")).toEqual([]);
    });

    it("GET /?record= with an empty value returns 400", async () => {
      const app = seedRecords();
      expect((await app.request("/api/sources?record=")).status).toBe(400);
    });
  });

  it("PATCH updates fields", async () => {
    const { app, store } = setup();
    store.repos.sources.insert({ id: "dc:1", site: "dc", url: "u1" });

    const res = await app.request("/api/sources/dc%3A1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "A title" }),
    });
    expect(res.status).toBe(200);
    const data = await readJson<{ title: string | null }>(res);
    expect(data.title).toBe("A title");
  });

  it("DELETE an uncited source succeeds with 204", async () => {
    const { app, store } = setup();
    store.repos.sources.insert({ id: "dc:1", site: "dc", url: "u1" });

    const res = await app.request("/api/sources/dc%3A1", { method: "DELETE" });
    expect(res.status).toBe(204);
    expect(store.repos.sources.get("dc:1")).toBeUndefined();
  });

  it("DELETE a source cited by a citation returns 409 with the row count, and the source remains", async () => {
    const { app, store } = setup();
    store.repos.sources.insert({ id: "dc:1", site: "dc", url: "u1" });
    store.repos.citations.replace("deck", "cherry", ["dc:1"]);

    const res = await app.request("/api/sources/dc%3A1", { method: "DELETE" });
    expect(res.status).toBe(409);
    const data = await readJson<{ message: string }>(res);
    expect(data.message).toBe("source dc:1 is cited by 1 rows");
    expect(store.repos.sources.get("dc:1")).toBeDefined();
  });

  it("DELETE a source referenced only by a ranking row returns 409, and the source remains", async () => {
    const { app, store } = setup();
    store.repos.sources.insert({ id: "dc:1", site: "dc", url: "u1" });
    store.repos.rankings.insertMany([
      {
        season: 5,
        board: "players",
        rank: 1,
        name: "player-a",
        valueG: 100,
        capturedAt: "2026-09-27T00:00:00Z",
        sourceId: "dc:1",
      },
    ]);

    const res = await app.request("/api/sources/dc%3A1", { method: "DELETE" });
    expect(res.status).toBe(409);
    const data = await readJson<{ message: string }>(res);
    expect(data.message).toBe("source dc:1 is cited by 1 rows");
    expect(store.repos.sources.get("dc:1")).toBeDefined();
  });
});
