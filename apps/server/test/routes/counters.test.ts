import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import type { Store } from "../../src/repos";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/** A fresh app over its own in-memory store, with a source and three arena decks. */
function setup() {
  const store = testStore();
  addSource(store, "dc:1");
  const services = createServices(store);
  for (const id of ["rye", "bari", "wizard"]) addDeck(store, id);
  return { app: createApp(services), store };
}

/** Inserts a minimal arena deck. */
function addDeck(store: Store, id: string): void {
  store.repos.decks.insert({ id, position: 0, nameEn: id, status: "meta", mode: "arena" });
}

const edge = {
  slug: "rye-vs-bari",
  mode: "arena",
  teamDeckId: "rye",
  beatenByDeckId: "bari",
  conditions: "Bari at 8★ or more",
  why: "The chargers dash at Milk first.",
  confidence: "medium",
  sources: ["dc:1"],
};

type CounterView = {
  id: number;
  slug: string;
  teamDeckId: string;
  beatenByDeckId: string;
  sources: string[];
};

describe("counters routes", () => {
  it("POST creates a directed edge and returns 201 with its sources", async () => {
    const { app } = setup();
    const res = await app.request("/api/counters", jsonBody(edge));
    expect(res.status).toBe(201);
    const data = await readJson<CounterView>(res);
    expect(data).toMatchObject({ slug: "rye-vs-bari", teamDeckId: "rye", beatenByDeckId: "bari" });
    expect(data.sources).toEqual(["dc:1"]);
  });

  it("POST with an unknown team deck returns 422 naming it, and writes nothing", async () => {
    const { app, store } = setup();
    const res = await app.request("/api/counters", jsonBody({ ...edge, teamDeckId: "nope" }));
    expect(res.status).toBe(422);
    expect(await readJson<unknown>(res)).toEqual({
      error: "unknown_refs",
      kind: "decks",
      ids: ["nope"],
    });
    expect(store.repos.counters.count()).toBe(0);
  });

  it("POST with an unknown beaten-by deck returns 422 naming it", async () => {
    const { app } = setup();
    const res = await app.request("/api/counters", jsonBody({ ...edge, beatenByDeckId: "gone" }));
    expect(res.status).toBe(422);
    expect(await readJson<unknown>(res)).toMatchObject({ kind: "decks", ids: ["gone"] });
  });

  it("PATCH to an unknown deck returns 422", async () => {
    const { app } = setup();
    const { id } = await readJson<CounterView>(await app.request("/api/counters", jsonBody(edge)));
    const res = await app.request(`/api/counters/${id}`, {
      ...jsonBody({ beatenByDeckId: "gone" }),
      method: "PATCH",
    });
    expect(res.status).toBe(422);
  });

  it("POST with a deck countering itself returns 400", async () => {
    const { app } = setup();
    const res = await app.request("/api/counters", jsonBody({ ...edge, beatenByDeckId: "rye" }));
    expect(res.status).toBe(400);
  });

  it("POST with a slug already taken returns 409", async () => {
    const { app } = setup();
    await app.request("/api/counters", jsonBody(edge));
    const res = await app.request("/api/counters", jsonBody({ ...edge, teamDeckId: "wizard" }));
    expect(res.status).toBe(409);
  });

  it("GET /?deck= lists the edges on either side of the deck, never flipping them", async () => {
    const { app } = setup();
    await app.request("/api/counters", jsonBody(edge));
    await app.request(
      "/api/counters",
      jsonBody({ ...edge, slug: "bari-vs-wizard", teamDeckId: "bari", beatenByDeckId: "wizard" }),
    );
    await app.request(
      "/api/counters",
      jsonBody({ ...edge, slug: "wizard-vs-rye", teamDeckId: "wizard", beatenByDeckId: "rye" }),
    );

    const res = await app.request("/api/counters?deck=bari");
    const data = await readJson<CounterView[]>(res);
    expect(data.map((c) => [c.teamDeckId, c.beatenByDeckId])).toEqual([
      ["rye", "bari"],
      ["bari", "wizard"],
    ]);
  });

  it("GET /?deck= rejects a value that isn't a deck slug with 400", async () => {
    const { app } = setup();
    const res = await app.request("/api/counters?deck=Not%20A%20Slug");
    expect(res.status).toBe(400);
  });
});
