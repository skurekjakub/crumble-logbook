import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import type { FightEventView } from "../../src/services/fight-events";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/**
 * Builds a fresh app over its own in-memory store, with source `dc:1` to cite.
 *
 * @returns the app and its store
 */
function setup() {
  const store = testStore();
  addSource(store, "dc:1");
  return { app: createApp(createServices(store)), store };
}

/**
 * Builds a fight event POST body at `tElapsed` for `boss`.
 *
 * @param boss - the boss
 * @param tElapsed - seconds into the fight, or `null` if untimed
 * @param name - the event, also the stem of its detail
 * @returns the body
 */
function event(boss: string, tElapsed: number | null, name: string) {
  return {
    boss,
    tElapsed,
    event: name,
    detail: `${name} detail`,
    confidence: "medium",
    sources: ["dc:1"],
  };
}

describe("fight-events routes", () => {
  it("GET /api/fight-events?boss=pinata is time-ordered, untimed events last, other bosses excluded", async () => {
    const { app } = setup();
    for (const body of [
      event("pinata", 43, "wipe"),
      event("pinata", null, "untimed"),
      event("other", 5, "elsewhere"),
      event("pinata", 0, "engage"),
      event("pinata", 30, "slam"),
    ]) {
      expect((await app.request("/api/fight-events", jsonBody(body))).status).toBe(201);
    }

    const res = await app.request("/api/fight-events?boss=pinata");
    expect(res.status).toBe(200);
    const rows = await readJson<FightEventView[]>(res);
    expect(rows.map((r) => [r.event, r.tElapsed])).toEqual([
      ["engage", 0],
      ["slam", 30],
      ["wipe", 43],
      ["untimed", null],
    ]);
    expect(rows[0]!.sources).toEqual(["dc:1"]);
  });

  it("GET /api/fight-events without a filter lists every boss", async () => {
    const { app } = setup();
    await app.request("/api/fight-events", jsonBody(event("pinata", 1, "a")));
    await app.request("/api/fight-events", jsonBody(event("other", 2, "b")));
    const rows = await readJson<FightEventView[]>(await app.request("/api/fight-events"));
    expect(rows.map((r) => r.boss)).toEqual(["pinata", "other"]);
  });

  it("POST citing an unknown source is a 422 naming it", async () => {
    const { app } = setup();
    const res = await app.request(
      "/api/fight-events",
      jsonBody({ ...event("pinata", 1, "a"), sources: ["dc:404"] }),
    );
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: "unknown_refs", kind: "sources", ids: ["dc:404"] });
  });

  it("PATCH and DELETE work by id", async () => {
    const { app } = setup();
    const created = await readJson<FightEventView>(
      await app.request("/api/fight-events", jsonBody(event("pinata", 1, "a"))),
    );
    const patched = await app.request(`/api/fight-events/${created.id}`, {
      ...jsonBody({ confidence: "low" }),
      method: "PATCH",
    });
    expect((await readJson<FightEventView>(patched)).confidence).toBe("low");
    const deleted = await app.request(`/api/fight-events/${created.id}`, { method: "DELETE" });
    expect(deleted.status).toBe(204);
    expect((await app.request(`/api/fight-events/${created.id}`)).status).toBe(404);
  });
});
