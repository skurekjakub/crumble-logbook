import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/**
 * Builds a fresh app over its own in-memory store, with a source, the
 * daily dungeons `exp` and `dough`, and an arena deck.
 *
 * @returns the app
 */
function setup() {
  const store = testStore();
  addSource(store, "dc:1");
  const services = createServices(store);
  for (const [position, slug] of ["exp", "dough"].entries()) {
    services.dailyDungeons.create({ slug, position, nameEn: slug, drops: [], notes: [] }, ["dc:1"]);
  }
  store.repos.decks.insert({ id: "rye", position: 0, nameEn: "r", status: "meta", mode: "arena" });
  return createApp(services);
}

const cookie = { cookieKr: "체리맛 쿠키", level: "100", levelRule: null, stars: null, why: "w" };

const dailyDeck = {
  id: "exp-auto",
  nameEn: "Auto",
  status: "meta",
  mode: "daily_dungeon",
  cookies: [cookie],
  dailyDungeon: {
    dungeon: "exp",
    auto: "full",
    stage: 40,
    power: "1.5G",
    recommendedPower: "1.8G",
    recommendedPowerG: 99,
    gearPreset: "Crit preset",
    captainKr: "체리맛 쿠키",
  },
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
function patch(app: ReturnType<typeof setup>, path: string, body: unknown) {
  return app.request(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("daily dungeon routes", () => {
  it("POST /api/decks stores a daily dungeon deck's run facts, its power read in billions", async () => {
    const app = setup();
    const res = await app.request("/api/decks", jsonBody(dailyDeck));
    expect(res.status).toBe(201);
    const deck = await readJson<{ dailyDungeon: Record<string, unknown> }>(res);
    expect(deck.dailyDungeon).toEqual({
      dungeon: "exp",
      auto: "full",
      stage: 40,
      power: "1.5G",
      powerG: 1.5,
      recommendedPower: "1.8G",
      recommendedPowerG: 1.8,
      gearPreset: "Crit preset",
      captain: { kr: "체리맛 쿠키", en: null },
    });
  });

  it("POST /api/decks refuses a daily dungeon deck without run facts, and run facts on another mode", async () => {
    const app = setup();
    const { dailyDungeon: _run, ...bare } = dailyDeck;
    expect((await app.request("/api/decks", jsonBody(bare))).status).toBe(400);
    const arena = { ...dailyDeck, id: "arena-run", mode: "arena" };
    expect((await app.request("/api/decks", jsonBody(arena))).status).toBe(400);
    const captain = {
      ...dailyDeck,
      id: "bad-captain",
      dailyDungeon: { ...dailyDeck.dailyDungeon, captainKr: "전갈맛 쿠키" },
    };
    expect((await app.request("/api/decks", jsonBody(captain))).status).toBe(400);
  });

  it("POST /api/decks answers 422 for a daily dungeon nobody stores", async () => {
    const app = setup();
    const gold = { ...dailyDeck, dailyDungeon: { dungeon: "gold", auto: "manual" } };
    const res = await app.request("/api/decks", jsonBody(gold));
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      error: "unknown_refs",
      kind: "dailyDungeons",
      ids: ["gold"],
    });
  });

  it("PATCH /api/decks/:id refuses to leave a deck breaking the daily dungeon rules", async () => {
    const app = setup();
    await app.request("/api/decks", jsonBody(dailyDeck));
    expect((await patch(app, "/api/decks/exp-auto", { dailyDungeon: null })).status).toBe(409);
    expect((await patch(app, "/api/decks/exp-auto", { mode: "arena" })).status).toBe(409);
    const moved = await patch(app, "/api/decks/exp-auto", {
      dailyDungeon: { dungeon: "dough", auto: "semi" },
    });
    expect(moved.status).toBe(200);
    expect(
      (await readJson<{ dailyDungeon: { dungeon: string } }>(moved)).dailyDungeon.dungeon,
    ).toBe("dough");
    expect(
      (await patch(app, "/api/decks/rye", { dailyDungeon: { dungeon: "exp", auto: "full" } }))
        .status,
    ).toBe(409);
  });

  it("refuses to delete or rename a daily dungeon a deck runs or a clear names", async () => {
    const app = setup();
    await app.request("/api/decks", jsonBody(dailyDeck));
    const [exp, dough] = await readJson<Array<{ id: number }>>(
      await app.request("/api/daily-dungeons"),
    );
    expect((await app.request(`/api/daily-dungeons/${exp!.id}`, { method: "DELETE" })).status).toBe(
      409,
    );
    expect((await patch(app, `/api/daily-dungeons/${exp!.id}`, { slug: "xp" })).status).toBe(409);
    expect((await patch(app, `/api/daily-dungeons/${exp!.id}`, { nameEn: "EXP" })).status).toBe(
      200,
    );
    await app.request(
      "/api/daily-dungeon-clears",
      jsonBody({
        dungeon: "dough",
        stage: 3,
        date: "2026-10-07",
        evidence: "text",
        sources: ["dc:1"],
      }),
    );
    expect(
      (await app.request(`/api/daily-dungeons/${dough!.id}`, { method: "DELETE" })).status,
    ).toBe(409);
  });

  it("POST /api/daily-dungeon-clears reads powerG from power and checks the dungeon and the deck's mode", async () => {
    const app = setup();
    await app.request("/api/decks", jsonBody(dailyDeck));
    const clear = {
      dungeon: "exp",
      stage: 41,
      power: "4G 3M 599K",
      powerG: 99,
      deckId: "exp-auto",
      auto: "full",
      date: "2026-10-07",
      evidence: "screenshot",
      sources: ["dc:1"],
    };
    const res = await app.request("/api/daily-dungeon-clears", jsonBody(clear));
    expect(res.status).toBe(201);
    expect((await readJson<{ powerG: number }>(res)).powerG).toBe(4.003599);
    const gold = await app.request(
      "/api/daily-dungeon-clears",
      jsonBody({ ...clear, dungeon: "gold" }),
    );
    expect(gold.status).toBe(422);
    const arena = await app.request(
      "/api/daily-dungeon-clears",
      jsonBody({ ...clear, deckId: "rye" }),
    );
    expect(arena.status).toBe(409);
  });

  it("refuses a clear naming a deck that runs another dungeon, on create and on update", async () => {
    const app = setup();
    await app.request("/api/decks", jsonBody(dailyDeck));
    const clear = {
      dungeon: "dough",
      stage: 41,
      deckId: "exp-auto",
      auto: "full",
      date: "2026-10-07",
      evidence: "screenshot",
      sources: ["dc:1"],
    };
    const mismatch = await app.request("/api/daily-dungeon-clears", jsonBody(clear));
    expect(mismatch.status).toBe(409);
    expect(await mismatch.text()).toContain("deck exp-auto runs daily dungeon exp, not dough");
    const created = await app.request(
      "/api/daily-dungeon-clears",
      jsonBody({ ...clear, dungeon: "exp" }),
    );
    expect(created.status).toBe(201);
    const { id } = await readJson<{ id: number }>(created);
    expect((await patch(app, `/api/daily-dungeon-clears/${id}`, { dungeon: "dough" })).status).toBe(
      409,
    );
    expect((await patch(app, `/api/daily-dungeon-clears/${id}`, { deckId: null })).status).toBe(
      200,
    );
  });

  it("PATCH /api/decks/:id refuses to move a deck off the dungeon a clear names it under", async () => {
    const app = setup();
    await app.request("/api/decks", jsonBody(dailyDeck));
    await app.request(
      "/api/daily-dungeon-clears",
      jsonBody({
        dungeon: "exp",
        stage: 41,
        deckId: "exp-auto",
        auto: "full",
        date: "2026-10-07",
        evidence: "screenshot",
        sources: ["dc:1"],
      }),
    );
    const moved = await patch(app, "/api/decks/exp-auto", {
      dailyDungeon: { dungeon: "dough", auto: "full" },
    });
    expect(moved.status).toBe(409);
    expect(await moved.text()).toContain("runs daily dungeon dough, not exp");
    const deck = await readJson<{ dailyDungeon: { dungeon: string } }>(
      await app.request("/api/decks/exp-auto"),
    );
    expect(deck.dailyDungeon.dungeon).toBe("exp");
    const stays = await patch(app, "/api/decks/exp-auto", {
      dailyDungeon: { dungeon: "exp", auto: "semi" },
    });
    expect(stays.status).toBe(200);
  });
});
