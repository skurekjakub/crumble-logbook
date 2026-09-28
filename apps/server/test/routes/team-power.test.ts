import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/**
 * A power source's request body, with `over` applied on top.
 *
 * @param slug - its slug
 * @param over - fields to set instead
 * @returns the body
 */
const source = (slug: string, over: Record<string, unknown> = {}) => ({
  slug,
  nameEn: slug,
  nameKr: "k",
  raises: "r",
  appliesIn: ["stage"],
  materials: [{ name: "m", free: "f", paid: "p", note: null }],
  costType: "mixed",
  cap: "c",
  postedGains: [],
  efficiency: { early: "e", mid: "m", late: "l", at22g: "a" },
  bracketEffect: "b",
  confidence: "high",
  sources: ["dc:1"],
  ...over,
});

/**
 * Builds a fresh app over its own in-memory store, with a source, the
 * power source `plating`, a posted and a claimed data point on it, and the
 * spending order `endgame`.
 *
 * @returns the app
 */
async function setup() {
  const store = testStore();
  addSource(store, "dc:1");
  const app = createApp(createServices(store));
  await app.request("/api/power-sources", jsonBody(source("plating")));
  for (const [slug, kind, deltaPct] of [
    ["plate-step", "posted", 1.6],
    ["guild-claim", "claimed", 20],
  ] as const) {
    await app.request(
      "/api/power-data-points",
      jsonBody({
        slug,
        kind,
        powerSource: "plating",
        date: "2026-09-28",
        deltaPct,
        note: "n",
        sources: ["dc:1"],
      }),
    );
  }
  await app.request(
    "/api/spending-orders",
    jsonBody({ slug: "endgame", kind: "stage", label: "2G", position: 0, sources: ["dc:1"] }),
  );
  return app;
}

/**
 * Sends a JSON `PATCH`.
 *
 * @param app - the app
 * @param path - the resource path
 * @param body - the patch
 * @returns the response
 */
function patch(app: Awaited<ReturnType<typeof setup>>, path: string, body: unknown) {
  return app.request(path, { ...jsonBody(body), method: "PATCH" });
}

/**
 * A planner step's request body, with `over` applied on top.
 *
 * @param over - fields to set instead
 * @returns the body
 */
const plannerStep = (over: Record<string, unknown>) => ({
  position: 0,
  powerSource: "plating",
  basis: "posted",
  gain: "g",
  reach: "r",
  sources: ["dc:1"],
  ...over,
});

describe("team-power routes", () => {
  it("refuses a row naming a power source that isn't stored, with 422 naming the slug", async () => {
    const app = await setup();
    const res = await app.request(
      "/api/power-data-points",
      jsonBody({
        slug: "x",
        kind: "posted",
        powerSource: "nothing",
        date: "2026-09-28",
        note: "n",
        sources: ["dc:1"],
      }),
    );
    expect(res.status).toBe(422);
    expect(await readJson(res)).toMatchObject({ kind: "powerSources", ids: ["nothing"] });
  });

  it("refuses a package feeding an unknown power source, and a posted gain citing an unknown source", async () => {
    const app = await setup();
    const pack = await app.request(
      "/api/packages",
      jsonBody({
        slug: "p",
        nameKr: "k",
        nameEn: "e",
        priceKrw: 9900,
        usdSource: "not listed",
        kind: "repeatable",
        feeds: ["plating", "nothing"],
        verdict: "v",
        tier: "medium",
        sources: ["dc:1"],
      }),
    );
    expect(pack.status).toBe(422);
    const gain = {
      account: "a",
      before: null,
      after: null,
      delta: null,
      cost: null,
      kind: "posted",
      sources: ["dc:404"],
    };
    const res = await app.request(
      "/api/power-sources",
      jsonBody(source("stellar", { postedGains: [gain] })),
    );
    expect(res.status).toBe(422);
    expect(await readJson(res)).toMatchObject({ kind: "sources", ids: ["dc:404"] });
  });

  it("won't delete a power source other rows name, or change its slug, until they stop naming it", async () => {
    const app = await setup();
    const [plating] = await readJson<Array<{ id: number }>>(
      await app.request("/api/power-sources"),
    );
    const refused = await app.request(`/api/power-sources/${plating!.id}`, { method: "DELETE" });
    expect(refused.status).toBe(409);
    expect(await readJson(refused)).toMatchObject({
      message: expect.stringMatching(/power_source plating can't be deleted: power_data_point/),
    });
    expect((await patch(app, `/api/power-sources/${plating!.id}`, { slug: "plate" })).status).toBe(
      409,
    );
    expect((await patch(app, `/api/power-sources/${plating!.id}`, { cap: "30" })).status).toBe(200);
    const points = await readJson<Array<{ id: number }>>(
      await app.request("/api/power-data-points"),
    );
    for (const point of points) {
      await app.request(`/api/power-data-points/${point.id}`, { method: "DELETE" });
    }
    const deleted = await app.request(`/api/power-sources/${plating!.id}`, { method: "DELETE" });
    expect(deleted.status).toBe(204);
  });

  it("takes a spending step that names a power source or a package, not both, and filters steps by basis", async () => {
    const app = await setup();
    const both = await app.request(
      "/api/spending-steps",
      jsonBody({
        orderSlug: "endgame",
        route: "free",
        position: 0,
        powerSource: "plating",
        packageSlug: "plate-pack",
        basis: "community",
        sources: ["dc:1"],
      }),
    );
    expect(both.status).toBe(400);
    const created = await app.request(
      "/api/spending-steps",
      jsonBody({
        orderSlug: "endgame",
        route: "free",
        position: 0,
        powerSource: "plating",
        basis: "posted",
        sources: ["dc:1"],
      }),
    );
    expect(created.status).toBe(201);
    const { id } = await readJson<{ id: number }>(created);
    expect((await patch(app, `/api/spending-steps/${id}`, { powerSource: null })).status).toBe(409);
    const posted = await readJson<unknown[]>(await app.request("/api/spending-steps?basis=posted"));
    const claimed = await readJson<unknown[]>(
      await app.request("/api/spending-steps?basis=claimed"),
    );
    expect([posted.length, claimed.length]).toEqual([1, 0]);
  });

  it("gives a posted planner step only a posted data point's gain", async () => {
    const app = await setup();
    const claimed = await app.request(
      "/api/planner-steps",
      jsonBody(plannerStep({ dataPoint: "guild-claim" })),
    );
    expect(claimed.status).toBe(409);
    expect(await readJson(claimed)).toMatchObject({
      message: expect.stringMatching(/guild-claim is claimed/),
    });
    expect((await app.request("/api/planner-steps", jsonBody(plannerStep({})))).status).toBe(409);
    const claimStep = await app.request(
      "/api/planner-steps",
      jsonBody(plannerStep({ basis: "claimed", dataPoint: "guild-claim" })),
    );
    expect(claimStep.status).toBe(201);
    const posted = await app.request(
      "/api/planner-steps",
      jsonBody(plannerStep({ dataPoint: "plate-step" })),
    );
    expect(posted.status).toBe(201);
  });

  it("refuses a growth curve whose rows don't match its columns", async () => {
    const app = await setup();
    const res = await app.request(
      "/api/growth-curves",
      jsonBody({
        slug: "c",
        powerSource: "plating",
        title: "t",
        columns: ["from", "success_pct"],
        rows: [[0, 90], [1]],
        sources: ["dc:1"],
      }),
    );
    expect(res.status).toBe(400);
  });

  it("refuses a patch that leaves a curve out of shape or a step naming both targets, with 409", async () => {
    const app = await setup();
    const curve = await readJson<{ id: number }>(
      await app.request(
        "/api/growth-curves",
        jsonBody({
          slug: "c",
          powerSource: "plating",
          title: "t",
          columns: ["from"],
          rows: [[0]],
          sources: ["dc:1"],
        }),
      ),
    );
    const ragged = await patch(app, `/api/growth-curves/${curve.id}`, { rows: [[0, 1]] });
    expect(ragged.status).toBe(409);
    await app.request(
      "/api/packages",
      jsonBody({
        slug: "plate-pack",
        nameKr: "k",
        nameEn: "e",
        priceKrw: 9900,
        usdSource: "not listed",
        kind: "repeatable",
        feeds: ["plating"],
        verdict: "v",
        tier: "medium",
        sources: ["dc:1"],
      }),
    );
    const step = await readJson<{ id: number }>(
      await app.request(
        "/api/spending-steps",
        jsonBody({
          orderSlug: "endgame",
          route: "free",
          position: 0,
          powerSource: "plating",
          basis: "community",
          sources: ["dc:1"],
        }),
      ),
    );
    const both = await patch(app, `/api/spending-steps/${step.id}`, { packageSlug: "plate-pack" });
    expect(both.status).toBe(409);
  });

  it("refuses a patch that turns the data point of a posted planner step claimed, or takes its change away", async () => {
    const app = await setup();
    await app.request("/api/planner-steps", jsonBody(plannerStep({ dataPoint: "plate-step" })));
    const points = await readJson<Array<{ id: number; slug: string }>>(
      await app.request("/api/power-data-points"),
    );
    const plate = points.find((p) => p.slug === "plate-step")!;
    const claimed = await patch(app, `/api/power-data-points/${plate.id}`, { kind: "claimed" });
    expect(claimed.status).toBe(409);
    expect(await readJson(claimed)).toMatchObject({
      message: expect.stringMatching(/plate-step can't change so: planner_step \d+ names it/),
    });
    const noChange = await patch(app, `/api/power-data-points/${plate.id}`, { deltaPct: null });
    expect(noChange.status).toBe(409);
    const kept = await readJson<{ kind: string; deltaPct: number }>(
      await app.request(`/api/power-data-points/${plate.id}`),
    );
    expect(kept).toMatchObject({ kind: "posted", deltaPct: 1.6 });
    expect((await patch(app, `/api/power-data-points/${plate.id}`, { note: "m" })).status).toBe(
      200,
    );
  });

  it("cites the sources a row names inside it, so they can't be deleted and show among its sources", async () => {
    const app = await setup();
    for (const id of ["dc:2", "dc:3"]) {
      await app.request("/api/sources", jsonBody({ id, url: `https://example.test/${id}` }));
    }
    const created = await app.request(
      "/api/growth-curves",
      jsonBody({
        slug: "c",
        powerSource: "plating",
        title: "t",
        columns: ["from"],
        rows: [[0]],
        rowSources: [["dc:2"]],
        sources: ["dc:1"],
      }),
    );
    const curve = await readJson<{ id: number; sources: string[] }>(created);
    expect(curve.sources).toEqual(["dc:1", "dc:2"]);
    expect((await app.request("/api/sources/dc:2", { method: "DELETE" })).status).toBe(409);
    const moved = await readJson<{ sources: string[] }>(
      await patch(app, `/api/growth-curves/${curve.id}`, { rowSources: [["dc:3"]] }),
    );
    expect(moved.sources).toEqual(["dc:1", "dc:3"]);
    expect((await app.request("/api/sources/dc:2", { method: "DELETE" })).status).toBe(204);
    const gain = {
      account: "a",
      before: null,
      after: null,
      delta: null,
      cost: null,
      kind: "posted",
      sources: ["dc:3"],
    };
    const stellar = await readJson<{ sources: string[] }>(
      await app.request("/api/power-sources", jsonBody(source("stellar", { postedGains: [gain] }))),
    );
    expect(stellar.sources).toEqual(["dc:1", "dc:3"]);
  });
});
