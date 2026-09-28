import { decks } from "@crumble/schema";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { openDb } from "../../src/db/client";
import { createStore } from "../../src/repos";
import type { Store } from "../../src/repos";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson } from "../helpers";

/**
 * Builds a fresh app over its own in-memory store, with a `cherry` deck already inserted.
 *
 * @returns the app and its store
 */
function setup() {
  const db = openDb(":memory:");
  const store: Store = createStore(db);
  db.insert(decks).values({ id: "cherry", position: 0, nameEn: "Cherry", status: "meta" }).run();
  const app = createApp(createServices(store));
  return { app, store };
}

const baseScore = {
  powerG: 1,
  deckId: null,
  verified: false,
  date: null,
  season: null,
  player: null,
  note: null,
};

describe("scores routes", () => {
  it("GET /api/scores includes ratio", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");

    await app.request(
      "/api/scores",
      jsonBody({ ...baseScore, damageG: 1999, powerG: 3.07, deckId: "cherry", sources: ["dc:1"] }),
    );

    const res = await app.request("/api/scores");
    const data = await readJson<{ ratio: number | null }[]>(res);
    expect(data[0]?.ratio).toBe(651);
  });

  it("GET /api/scores?deck=cherry filters", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");

    await app.request(
      "/api/scores",
      jsonBody({ ...baseScore, damageG: 1, deckId: "cherry", sources: ["dc:1"] }),
    );
    await app.request("/api/scores", jsonBody({ ...baseScore, damageG: 2, sources: ["dc:1"] }));

    const res = await app.request("/api/scores?deck=cherry");
    const data = await readJson<{ deckId: string | null }[]>(res);
    expect(data).toHaveLength(1);
    expect(data[0]?.deckId).toBe("cherry");
  });
});
