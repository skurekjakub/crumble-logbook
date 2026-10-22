import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import type { Store } from "../../src/repos";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/**
 * Builds a gear build's POST body with the fields a test doesn't vary filled in.
 *
 * @param over - fields to set instead
 * @returns the body
 */
function build(over: Record<string, unknown>) {
  return {
    mode: "stage",
    variant: null,
    deckId: null,
    position: 0,
    confidence: "medium",
    hasteLines: { min: 1, max: 4, note: null },
    accuracy: 1000,
    focus: null,
    slots: { top_left: ["Skill AMP"], top_right: [], bottom_left: [], bottom_right: [] },
    avoid: [],
    why: "w",
    sources: ["dc:1"],
    ...over,
  };
}

/**
 * Builds a fresh app over its own store, with a source to cite.
 *
 * @returns the app and its store
 */
function setup(): { app: ReturnType<typeof createApp>; store: Store } {
  const store = testStore();
  addSource(store, "dc:1");
  return { app: createApp(createServices(store)), store };
}

describe("/api/gear-builds", () => {
  it("lists builds by mode, then position, whatever order they were posted in", async () => {
    const { app } = setup();
    for (const [slug, mode, position] of [
      ["stage-boss", "stage", 2],
      ["arena-default", "arena", 0],
      ["stage-default", "stage", 1],
    ] as const) {
      const variant = slug === "stage-boss" ? "Boss" : null;
      const res = await app.request(
        "/api/gear-builds",
        jsonBody(build({ slug, mode, position, variant })),
      );
      expect(res.status).toBe(201);
    }
    const all = await readJson<Array<{ slug: string }>>(await app.request("/api/gear-builds"));
    expect(all.map((row) => row.slug)).toEqual(["arena-default", "stage-default", "stage-boss"]);
  });

  it("refuses a second current build for one mode and variant, and takes one for another variant", async () => {
    const { app } = setup();
    await app.request("/api/gear-builds", jsonBody(build({ slug: "a" })));
    const twin = await app.request("/api/gear-builds", jsonBody(build({ slug: "b" })));
    expect(twin.status).toBe(409);
    expect(await readJson(twin)).toMatchObject({ error: "conflict" });
    const boss = await app.request(
      "/api/gear-builds",
      jsonBody(build({ slug: "c", variant: "X" })),
    );
    expect(boss.status).toBe(201);
    const { id } = await readJson<{ id: number }>(boss);
    const moved = await app.request(`/api/gear-builds/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variant: null }),
    });
    expect(moved.status).toBe(409);
  });

  it("lets a current build share its mode and variant with an obsolete one", async () => {
    const { app, store } = setup();
    store.repos.gearBuilds.insert({
      slug: "old",
      mode: "stage",
      position: 0,
      confidence: "low",
      hasteLines: { min: 0, max: 0, note: null },
      slots: { top_left: [], top_right: [], bottom_left: [], bottom_right: [] },
      why: "w",
      obsoleteSince: "2026-10-01",
      obsoleteReason: "Patched.",
    });
    const res = await app.request("/api/gear-builds", jsonBody(build({ slug: "new" })));
    expect(res.status).toBe(201);
  });

  it("refuses a deck of another mode, and a haste range whose least is more than its most", async () => {
    const { app, store } = setup();
    store.repos.decks.insert({
      id: "arena-dive",
      position: 0,
      nameEn: "Dive",
      status: "meta",
      mode: "arena",
    });
    const deck = await app.request(
      "/api/gear-builds",
      jsonBody(build({ slug: "a", deckId: "arena-dive" })),
    );
    expect(deck.status).toBe(409);
    const haste = await app.request(
      "/api/gear-builds",
      jsonBody(build({ slug: "b", hasteLines: { min: 4, max: 1, note: null } })),
    );
    expect(haste.status).toBe(400);
  });
});
