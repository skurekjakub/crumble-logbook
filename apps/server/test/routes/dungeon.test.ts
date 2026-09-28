import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/**
 * Builds a fresh app over its own in-memory store, with a source, a
 * Crumble Dungeon deck, an arena deck and a glossary entry.
 *
 * @returns the app and its store
 */
function setup() {
  const store = testStore();
  addSource(store, "dc:1");
  store.repos.decks.insert({
    id: "milk-beam",
    position: 0,
    nameEn: "m",
    status: "meta",
    mode: "crumble_dungeon",
  });
  store.repos.decks.insert({ id: "rye", position: 1, nameEn: "r", status: "meta", mode: "arena" });
  store.repos.glossary.upsert({
    kr: "오븐방랑자 쿠키",
    en: "Oven Wanderer Cookie",
    kind: "cookie",
  });
  return { app: createApp(createServices(store)), store };
}

const run = {
  slug: "run-a",
  date: "2026-09-28",
  scoreG: 100,
  totalPowerG: 10,
  board: "run",
  evidence: "screenshot",
  sources: ["dc:1"],
};

/**
 * Sends a JSON `PATCH`.
 *
 * @param app - the app
 * @param path - the resource path
 * @param body - the patch
 * @returns the response
 */
function patch(app: ReturnType<typeof setup>["app"], path: string, body: unknown) {
  return app.request(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Crumble Dungeon routes", () => {
  it("POST and PATCH /api/dungeon-runs read standing from the evidence, never from the body", async () => {
    const { app } = setup();
    const res = await app.request(
      "/api/dungeon-runs",
      jsonBody({ ...run, deckId: "milk-beam", standing: "claim" }),
    );
    expect(res.status).toBe(201);
    const created = await readJson<{ id: number; standing: string; sources: string[] }>(res);
    expect(created).toMatchObject({ standing: "verified", sources: ["dc:1"] });
    const text = await patch(app, `/api/dungeon-runs/${created.id}`, { evidence: "text" });
    expect((await readJson<{ standing: string }>(text)).standing).toBe("claim");
    const note = await patch(app, `/api/dungeon-runs/${created.id}`, {
      note: "n",
      standing: "verified",
    });
    expect((await readJson<{ standing: string }>(note)).standing).toBe("claim");
  });

  it("GET /api/dungeon-runs ranks shown scores by score, then text-only claims by score, never by score ÷ power", async () => {
    const { app } = setup();
    const rows = [
      { slug: "shown-low-ratio", scoreG: 200, totalPowerG: 20, evidence: "video" },
      { slug: "claimed-high", scoreG: 350, totalPowerG: null, evidence: "text", board: "claim" },
      { slug: "shown-high-ratio", scoreG: 150, totalPowerG: 3, evidence: "screenshot" },
      { slug: "claimed-low", scoreG: 250, totalPowerG: null, evidence: "text", board: "claim" },
    ];
    for (const row of rows) {
      expect((await app.request("/api/dungeon-runs", jsonBody({ ...run, ...row }))).status).toBe(
        201,
      );
    }
    const listed = await readJson<Array<{ slug: string; standing: string }>>(
      await app.request("/api/dungeon-runs"),
    );
    expect(listed.map((r) => r.slug)).toEqual([
      "shown-low-ratio",
      "shown-high-ratio",
      "claimed-high",
      "claimed-low",
    ]);
    const claims = await readJson<Array<{ slug: string }>>(
      await app.request("/api/dungeon-runs?evidence=text"),
    );
    expect(claims.map((r) => r.slug)).toEqual(["claimed-high", "claimed-low"]);
  });

  it("POST /api/dungeon-runs or /api/dungeon-lineups naming an arena deck returns 409 and writes nothing", async () => {
    const { app, store } = setup();
    const res = await app.request("/api/dungeon-runs", jsonBody({ ...run, deckId: "rye" }));
    expect(res.status).toBe(409);
    expect(store.repos.dungeonRuns.count()).toBe(0);
    const lineup = await app.request(
      "/api/dungeon-lineups",
      jsonBody({
        slug: "l",
        author: "a",
        date: "2026-09-28",
        deckId: "rye",
        complete: false,
        first40: ["c"],
        excluded: [],
        atkOrder: [],
        levelRule: "r",
        sources: ["dc:1"],
      }),
    );
    expect(lineup.status).toBe(409);
    expect(store.repos.dungeonLineups.count()).toBe(0);
  });

  it("POST /api/dungeon-runs with a taken slug returns 409", async () => {
    const { app } = setup();
    expect((await app.request("/api/dungeon-runs", jsonBody(run))).status).toBe(201);
    expect((await app.request("/api/dungeon-runs", jsonBody(run))).status).toBe(409);
  });

  it("GET /api/dungeon-exclusions glosses each cookie in English", async () => {
    const { app } = setup();
    const res = await app.request(
      "/api/dungeon-exclusions",
      jsonBody({
        cookieKr: "오븐방랑자 쿠키",
        kind: "charger",
        why: "w",
        status: "excluded",
        sources: ["dc:1"],
      }),
    );
    expect(res.status).toBe(201);
    const listed = await readJson<Array<{ en: string | null }>>(
      await app.request("/api/dungeon-exclusions?kind=charger"),
    );
    expect(listed.map((r) => r.en)).toEqual(["Oven Wanderer Cookie"]);
  });
});
