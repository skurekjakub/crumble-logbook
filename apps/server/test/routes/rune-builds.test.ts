import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import type { Store } from "../../src/repos";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/** A fresh app over its own in-memory store. */
function setup() {
  const store = testStore();
  const app = createApp(createServices(store));
  return { app, store };
}

/** Inserts a minimal deck row directly, for use as a rune build's linked deck in tests. */
function addDeck(store: Store, id: string): void {
  store.repos.decks.insert({ id, position: store.repos.decks.nextPosition(), nameEn: id, status: "meta" });
}

const validRuneBuild = {
  cookieKr: "체리 쿠키",
  lines: "ATK/ATK/ATK%",
  why: "carry",
  decks: ["cherry"],
  sources: ["dc:1"],
};

describe("rune-builds routes", () => {
  it("POST with an unknown deck returns 422 kind decks", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");

    const res = await app.request("/api/rune-builds", jsonBody(validRuneBuild));

    expect(res.status).toBe(422);
    const data = await readJson<{ kind: string; ids: string[] }>(res);
    expect(data.kind).toBe("decks");
    expect(data.ids).toEqual(["cherry"]);
  });

  it("GET an unknown id returns 404", async () => {
    const { app } = setup();

    const res = await app.request("/api/rune-builds/999");

    expect(res.status).toBe(404);
  });

  it("POST creates and returns 201", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");
    addDeck(store, "cherry");

    const res = await app.request("/api/rune-builds", jsonBody(validRuneBuild));

    expect(res.status).toBe(201);
    const data = await readJson<{ id: number; decks: string[] }>(res);
    expect(data.decks).toEqual(["cherry"]);
  });

  it("GET / with ?deck filters to rune builds linked to that deck", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");
    addDeck(store, "cherry");
    addDeck(store, "onion");
    await app.request("/api/rune-builds", jsonBody(validRuneBuild));
    await app.request("/api/rune-builds", jsonBody({ ...validRuneBuild, decks: ["onion"] }));

    const res = await app.request("/api/rune-builds?deck=cherry");

    const data = await readJson<{ decks: string[] }[]>(res);
    expect(data).toHaveLength(1);
    expect(data[0]!.decks).toEqual(["cherry"]);
  });

  it("DELETE removes the rune build, then GET returns 404", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");
    addDeck(store, "cherry");
    const created = await app.request("/api/rune-builds", jsonBody(validRuneBuild));
    const { id } = await readJson<{ id: number }>(created);

    const del = await app.request(`/api/rune-builds/${id}`, { method: "DELETE" });
    expect(del.status).toBe(204);

    const get = await app.request(`/api/rune-builds/${id}`);
    expect(get.status).toBe(404);
  });
});
