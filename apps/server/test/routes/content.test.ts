import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/**
 * Builds a fresh app over its own in-memory store.
 *
 * @returns the app and its store
 */
function setup() {
  const store = testStore();
  const app = createApp(createServices(store));
  return { app, store };
}

const validMechanic = { title: "Enrage timer", body: "Enrages at 30s.", confidence: "high" };

describe("content routes (mechanics)", () => {
  it("POST with sources: [] returns 400 naming sources", async () => {
    const { app } = setup();
    const res = await app.request("/api/mechanics", jsonBody({ ...validMechanic, sources: [] }));
    expect(res.status).toBe(400);
    const data = await readJson<{ issues: { path: string[]; message: string }[] }>(res);
    expect(data.issues[0]?.path).toEqual(["sources"]);
  });

  it("POST with an unknown source returns 422", async () => {
    const { app } = setup();
    const res = await app.request(
      "/api/mechanics",
      jsonBody({ ...validMechanic, sources: ["dc:missing"] }),
    );
    expect(res.status).toBe(422);
    const data = await readJson<unknown>(res);
    expect(data).toMatchObject({ error: "unknown_refs", kind: "sources", ids: ["dc:missing"] });
  });

  it("GET an unknown id returns 404", async () => {
    const { app } = setup();
    const res = await app.request("/api/mechanics/999");
    expect(res.status).toBe(404);
  });

  it("GET a non-numeric id returns 400", async () => {
    const { app } = setup();
    const res = await app.request("/api/mechanics/abc");
    expect(res.status).toBe(400);
  });

  it("POST creates and returns 201 with sources", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");
    const res = await app.request(
      "/api/mechanics",
      jsonBody({ ...validMechanic, sources: ["dc:1"] }),
    );
    expect(res.status).toBe(201);
    const data = await readJson<{ sources: string[] }>(res);
    expect(data.sources).toEqual(["dc:1"]);
  });

  it("PATCH with sources: [] returns 400", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");
    const created = await readJson<{ id: number }>(
      await app.request("/api/mechanics", jsonBody({ ...validMechanic, sources: ["dc:1"] })),
    );

    const res = await app.request(`/api/mechanics/${created.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sources: [] }),
    });
    expect(res.status).toBe(400);
  });

  it("DELETE removes the row, then GET returns 404", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");
    const created = await readJson<{ id: number }>(
      await app.request("/api/mechanics", jsonBody({ ...validMechanic, sources: ["dc:1"] })),
    );

    const del = await app.request(`/api/mechanics/${created.id}`, { method: "DELETE" });
    expect(del.status).toBe(204);

    const get = await app.request(`/api/mechanics/${created.id}`);
    expect(get.status).toBe(404);
  });
});
