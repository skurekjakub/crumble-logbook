import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/**
 * Builds a fresh app over its own in-memory store, with a source, a stage
 * deck and an arena deck.
 *
 * @returns the app and its store
 */
function setup() {
  const store = testStore();
  addSource(store, "dc:1");
  store.repos.decks.insert({
    id: "charge",
    position: 0,
    nameEn: "c",
    status: "meta",
    mode: "stage",
  });
  store.repos.decks.insert({ id: "rye", position: 1, nameEn: "r", status: "meta", mode: "arena" });
  return { app: createApp(createServices(store)), store };
}

const clear = {
  chapter: 328,
  stageNo: 30,
  bossKr: "비겁한 쿠키",
  era: "post-easing",
  teamPower: "4.00G",
  bracket: 35,
  result: "clear",
  evidence: "screenshot",
  sources: ["dc:1"],
};

describe("stage routes", () => {
  it("POST /api/stage-clears with a stage deck returns 201 with its sources", async () => {
    const { app } = setup();
    const res = await app.request("/api/stage-clears", jsonBody({ ...clear, deckId: "charge" }));
    expect(res.status).toBe(201);
    expect(await readJson<{ deckId: string; sources: string[] }>(res)).toMatchObject({
      deckId: "charge",
      sources: ["dc:1"],
    });
  });

  it("POST /api/stage-clears or /api/stage-zone-slots naming an arena deck returns 409 and writes nothing", async () => {
    const { app, store } = setup();
    const res = await app.request("/api/stage-clears", jsonBody({ ...clear, deckId: "rye" }));
    expect(res.status).toBe(409);
    expect(store.repos.stageClears.count()).toBe(0);
    const slot = await app.request(
      "/api/stage-zone-slots",
      jsonBody({
        zoneIndex: 3,
        zoneKr: "폐허 도시",
        zoneEn: "Ruined City",
        position: 0,
        stage: "-30",
        bossKr: "비겁한 쿠키",
        plan: "p",
        deckId: "rye",
        sources: ["dc:1"],
      }),
    );
    expect(slot.status).toBe(409);
    expect(store.repos.stageZoneSlots.count()).toBe(0);
  });

  it("POST and PATCH /api/stage-clears read powerG from the posted power, never from the body", async () => {
    const { app } = setup();
    const res = await app.request(
      "/api/stage-clears",
      jsonBody({ ...clear, teamPower: "4.00G (4G 3M 599K)", powerG: 99 }),
    );
    expect(res.status).toBe(201);
    const { id, powerG } = await readJson<{ id: number; powerG: number }>(res);
    expect(powerG).toBe(4.003599);
    const patched = await app.request(`/api/stage-clears/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ teamPower: "971.8M" }),
    });
    expect(patched.status).toBe(200);
    expect((await readJson<{ powerG: number }>(patched)).powerG).toBe(0.9718);
    const untouched = await app.request(`/api/stage-clears/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note: "n", powerG: 7 }),
    });
    expect((await readJson<{ powerG: number }>(untouched)).powerG).toBe(0.9718);
  });

  it("GET /api/stage-chapters lists chapters in chapter order", async () => {
    const { app } = setup();
    for (const chapter of [2, 1]) {
      const res = await app.request(
        "/api/stage-chapters",
        jsonBody({
          chapter,
          zoneIndex: chapter,
          zone: "z",
          lastStage: `${chapter}-30`,
          bossKr: "b",
          bossEn: null,
          recommendedPower: 1000 * chapter,
          accuracyReq: 100,
          focusReq: 100,
          sources: ["dc:1"],
        }),
      );
      expect(res.status).toBe(201);
    }
    const rows = await readJson<Array<{ chapter: number }>>(
      await app.request("/api/stage-chapters"),
    );
    expect(rows.map((r) => r.chapter)).toEqual([1, 2]);
  });
});
