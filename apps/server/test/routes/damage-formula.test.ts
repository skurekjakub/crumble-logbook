import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/**
 * Builds a fresh app over its own in-memory store, with a source and the
 * formula steps `defense` and `crit`, in that order.
 *
 * @returns the app
 */
function setup() {
  const store = testStore();
  addSource(store, "dc:1");
  const services = createServices(store);
  for (const [position, slug] of ["defense", "crit"].entries()) {
    services.formulaSteps.create(
      {
        slug,
        position,
        phase: "factor",
        name: slug,
        expression: "x",
        feeds: [],
        confidence: "read",
        why: "w",
      },
      ["dc:1"],
    );
  }
  return createApp(services);
}

const constant = {
  slug: "c-def",
  position: 0,
  step: "defense",
  symbol: "C_def",
  field: "_combatConstantDefense",
  holder: "DamageSystem+0x90",
  meaning: "m",
  measure: "two hits",
  sources: ["dc:1"],
};

const claim = {
  slug: "crit-tiers",
  position: 0,
  claim: "200% crits twice",
  code: "floor(e) tiers",
  verdict: "agrees",
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

describe("damage formula routes", () => {
  it("lists the steps in position order, feeds and sources included", async () => {
    const app = setup();
    const steps = await readJson<Array<Record<string, unknown>>>(
      await app.request("/api/formula-steps"),
    );
    expect(steps.map((step) => [step.slug, step.position])).toEqual([
      ["defense", 0],
      ["crit", 1],
    ]);
    expect(steps[0]).toMatchObject({ feeds: [], stacking: null, sources: ["dc:1"] });
  });

  it("refuses a constant whose step isn't stored, and a step a constant names can't go", async () => {
    const app = setup();
    const unknown = await app.request(
      "/api/formula-constants",
      jsonBody({ ...constant, step: "armor" }),
    );
    expect(unknown.status).toBe(422);
    const created = await app.request("/api/formula-constants", jsonBody(constant));
    expect(created.status).toBe(201);
    const [defense] = await readJson<Array<{ id: number }>>(
      await app.request("/api/formula-steps"),
    );
    expect(
      (await app.request(`/api/formula-steps/${defense!.id}`, { method: "DELETE" })).status,
    ).toBe(409);
  });

  it("refuses a claim that names its record without the mechanic's title, on POST and PATCH", async () => {
    const app = setup();
    const half = await app.request(
      "/api/formula-claims",
      jsonBody({ ...claim, refRecord: "001-guild-conquest-meta" }),
    );
    expect(half.status).toBe(400);
    const created = await readJson<{ id: number }>(
      await app.request(
        "/api/formula-claims",
        jsonBody({ ...claim, refRecord: "001-guild-conquest-meta", refTitle: "Crit tiers" }),
      ),
    );
    const res = await patch(app, `/api/formula-claims/${created.id}`, { refTitle: null });
    expect(res.status).toBe(409);
  });

  it("filters the claims by verdict", async () => {
    const app = setup();
    await app.request("/api/formula-claims", jsonBody(claim));
    await app.request(
      "/api/formula-claims",
      jsonBody({ ...claim, slug: "weapon-digits", position: 1, verdict: "disagrees" }),
    );
    const listed = await readJson<Array<{ slug: string }>>(
      await app.request("/api/formula-claims?verdict=disagrees"),
    );
    expect(listed.map((row) => row.slug)).toEqual(["weapon-digits"]);
  });
});
