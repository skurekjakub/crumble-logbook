import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { readJson, testStore } from "../helpers";

/**
 * Builds a fresh app over its own in-memory store, with a source rankings can cite.
 *
 * @returns the app and its store
 */
function setup() {
  const store = testStore();
  store.repos.sources.insert({
    id: "web:crumbgg:rankings-s5",
    site: "web",
    url: "https://crumb.gg",
  });
  const app = createApp(createServices(store));
  return { app, store };
}

describe("rankings routes", () => {
  it("GET /?season=5&board=players returns rows in rank order", async () => {
    const { app, store } = setup();
    store.repos.rankings.insertMany([
      {
        season: 5,
        board: "players",
        rank: 2,
        name: "second",
        valueG: 200,
        capturedAt: "2026-09-27T00:00:00Z",
        sourceId: "web:crumbgg:rankings-s5",
      },
      {
        season: 5,
        board: "players",
        rank: 1,
        name: "first",
        valueG: 300,
        capturedAt: "2026-09-27T00:00:00Z",
        sourceId: "web:crumbgg:rankings-s5",
      },
    ]);

    const res = await app.request("/api/rankings?season=5&board=players");
    expect(res.status).toBe(200);
    const data = await readJson<{ rank: number; name: string }[]>(res);
    expect(data.map((r) => r.name)).toEqual(["first", "second"]);
  });

  it("GET /?board=bogus returns 400", async () => {
    const { app } = setup();
    const res = await app.request("/api/rankings?board=bogus");
    expect(res.status).toBe(400);
  });

  it("GET /seasons summarizes the latest capture per board+season", async () => {
    const { app, store } = setup();
    store.repos.rankings.insertMany([
      {
        season: 5,
        board: "players",
        rank: 1,
        name: "old",
        valueG: 100,
        capturedAt: "2026-09-26T00:00:00Z",
        sourceId: "web:crumbgg:rankings-s5",
      },
      {
        season: 5,
        board: "players",
        rank: 1,
        name: "new",
        valueG: 150,
        capturedAt: "2026-09-27T00:00:00Z",
        sourceId: "web:crumbgg:rankings-s5",
      },
    ]);

    const res = await app.request("/api/rankings/seasons");
    expect(res.status).toBe(200);
    const data =
      await readJson<{ board: string; season: number | null; count: number; capturedAt: string }[]>(
        res,
      );
    expect(data).toEqual([
      { board: "players", season: 5, count: 1, capturedAt: "2026-09-27T00:00:00Z" },
    ]);
  });
});
