import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/**
 * Builds an app over a store holding record `r1`'s current and obsolete
 * recommendations. Arena decks `rye` and `bari` are current and `ranged`
 * is obsolete, superseded by `rye`; the Rumble Arena deck `wizard` is
 * current. Each lifecycle table has a current row and an obsolete one.
 * Every row cites `dc:1`, and every obsolete row cites `dc:2` for its reason.
 *
 * @returns the app, its store, and the ids of the integer-keyed rows
 */
function setup() {
  const store = testStore();
  addSource(store, "dc:1");
  addSource(store, "dc:2");
  const { decks, runeBuilds, gearRecs, counters, citations } = store.repos;
  const retired = { obsoleteSince: "2026-10-12", obsoleteReason: "Patched out." };
  const owned = { mode: "arena" as const, recordSlug: "r1" };
  decks.insert({ id: "rye", position: 0, nameEn: "Rye", status: "meta", ...owned });
  decks.insert({
    id: "ranged",
    position: 1,
    nameEn: "Ranged",
    status: "legacy",
    ...owned,
    ...retired,
    supersededBy: "rye",
  });
  decks.insert({ id: "bari", position: 2, nameEn: "Bari", status: "meta", ...owned });
  decks.insert({
    id: "wizard",
    position: 3,
    nameEn: "Wizard",
    status: "niche",
    mode: "rumble_arena",
    recordSlug: "r1",
  });
  const rune = { cookieKr: "호밀", why: "w", ...owned };
  const liveRune = runeBuilds.insert({ ...rune, lines: "ATK" });
  const oldRune = runeBuilds.insert({ ...rune, lines: "CRIT", ...retired });
  const gear = { slot: "top_left" as const, context: "arena" as const, why: "w", ...owned };
  const liveGear = gearRecs.insert({ ...gear, substats: "ATK" });
  const oldGear = gearRecs.insert({ ...gear, substats: "HP", ...retired });
  const edge = { why: "w", confidence: "low" as const, ...owned };
  const liveEdge = counters.insert({
    ...edge,
    slug: "rye-vs-bari",
    teamDeckId: "rye",
    beatenByDeckId: "bari",
  });
  const oldEdge = counters.insert({
    ...edge,
    slug: "ranged-vs-rye",
    teamDeckId: "ranged",
    beatenByDeckId: "rye",
    ...retired,
  });
  for (const id of ["rye", "ranged", "bari", "wizard"]) citations.replace("deck", id, ["dc:1"]);
  for (const { id } of [liveRune, oldRune]) citations.replace("rune_build", String(id), ["dc:1"]);
  for (const { id } of [liveGear, oldGear]) citations.replace("gear_rec", String(id), ["dc:1"]);
  for (const { id } of [liveEdge, oldEdge]) citations.replace("counter", String(id), ["dc:1"]);
  citations.replace("obsolescence", "deck:ranged", ["dc:2"]);
  citations.replace("obsolescence", `rune_build:${String(oldRune.id)}`, ["dc:2"]);
  citations.replace("obsolescence", `gear_rec:${String(oldGear.id)}`, ["dc:2"]);
  citations.replace("obsolescence", `counter:${String(oldEdge.id)}`, ["dc:2"]);
  return {
    app: createApp(createServices(store)),
    store,
    ids: {
      liveRune: liveRune.id,
      oldRune: oldRune.id,
      liveGear: liveGear.id,
      oldGear: oldGear.id,
      liveEdge: liveEdge.id,
      oldEdge: oldEdge.id,
    },
  };
}

describe("the ?current= list filter", () => {
  it("keeps the current rows with ?current=true and the obsolete ones with ?current=false", async () => {
    const { app, ids } = setup();
    /**
     * Lists the ids a list request returns.
     *
     * @param url - the request path
     * @returns each row's `id`, in list order
     */
    const listed = async (url: string) =>
      (await readJson<Array<{ id: unknown }>>(await app.request(url))).map((row) => row.id);
    expect(await listed("/api/decks")).toEqual(["rye", "ranged", "bari", "wizard"]);
    expect(await listed("/api/decks?current=true")).toEqual(["rye", "bari", "wizard"]);
    expect(await listed("/api/decks?current=false")).toEqual(["ranged"]);
    expect(await listed("/api/rune-builds?current=true")).toEqual([ids.liveRune]);
    expect(await listed("/api/rune-builds?current=false")).toEqual([ids.oldRune]);
    expect(await listed("/api/gear-recs?current=true")).toEqual([ids.liveGear]);
    expect(await listed("/api/gear-recs?current=false")).toEqual([ids.oldGear]);
    expect(await listed("/api/counters?current=true")).toEqual([ids.liveEdge]);
    expect(await listed("/api/counters?current=false")).toEqual([ids.oldEdge]);
    expect(await listed("/api/decks?mode=arena&current=true")).toEqual(["rye", "bari"]);
  });

  it("answers 400 for a ?current= that isn't true or false", async () => {
    const { app } = setup();
    expect((await app.request("/api/decks?current=yes")).status).toBe(400);
    expect((await app.request("/api/counters?current=1")).status).toBe(400);
  });
});

describe("obsolete recommendations in the API's views", () => {
  it("carries a deck's lifecycle and its reason's sources, keeping its status", async () => {
    const { app } = setup();
    const ranged = await readJson<Record<string, unknown>>(await app.request("/api/decks/ranged"));
    expect(ranged).toMatchObject({
      status: "legacy",
      obsoleteSince: "2026-10-12",
      obsoleteReason: "Patched out.",
      supersededBy: "rye",
      sources: ["dc:1"],
      obsoleteSources: ["dc:2"],
    });
    const rye = await readJson<Record<string, unknown>>(await app.request("/api/decks/rye"));
    expect(rye).toMatchObject({ obsoleteSince: null, supersededBy: null, obsoleteSources: [] });
  });

  it("carries the reason's sources on rune builds, gear recs and counter edges", async () => {
    const { app, ids } = setup();
    for (const [path, live, old] of [
      ["/api/rune-builds", ids.liveRune, ids.oldRune],
      ["/api/gear-recs", ids.liveGear, ids.oldGear],
      ["/api/counters", ids.liveEdge, ids.oldEdge],
    ] as const) {
      const rows = await readJson<Array<{ id: number; obsoleteSources: string[] }>>(
        await app.request(path),
      );
      expect(rows.find((r) => r.id === old)?.obsoleteSources, path).toEqual(["dc:2"]);
      expect(rows.find((r) => r.id === live)?.obsoleteSources, path).toEqual([]);
      const one = await readJson<{ obsoleteSources: string[] }>(
        await app.request(`${path}/${String(old)}`),
      );
      expect(one.obsoleteSources, `${path}/${String(old)}`).toEqual(["dc:2"]);
    }
  });

  it("ignores the lifecycle fields on POST: a row becomes obsolete only through its record's import", async () => {
    const { app } = setup();
    const gear = await app.request(
      "/api/gear-recs",
      jsonBody({
        slot: "top_right",
        substats: "DEF",
        context: "arena",
        why: "w",
        mode: "arena",
        sources: ["dc:1"],
        obsoleteSince: "2026-10-12",
        obsoleteReason: "x",
      }),
    );
    expect(gear.status).toBe(201);
    expect(await readJson<unknown>(gear)).toMatchObject({
      obsoleteSince: null,
      obsoleteReason: null,
      obsoleteSources: [],
    });
    const deck = await app.request(
      "/api/decks",
      jsonBody({
        id: "chain",
        nameEn: "Chain",
        status: "niche",
        mode: "arena",
        cookies: [{ cookieKr: "체인", level: "1", why: "w" }],
        sources: ["dc:1"],
        obsoleteSince: "2026-10-12",
        supersededBy: "rye",
      }),
    );
    expect(deck.status).toBe(201);
    expect(await readJson<unknown>(deck)).toMatchObject({
      obsoleteSince: null,
      supersededBy: null,
    });
  });

  it("deletes an obsolete row's reason citations with the row", async () => {
    const { app, store, ids } = setup();
    for (const path of [
      `/api/rune-builds/${String(ids.oldRune)}`,
      `/api/gear-recs/${String(ids.oldGear)}`,
      `/api/counters/${String(ids.oldEdge)}`,
    ]) {
      expect((await app.request(path, { method: "DELETE" })).status, path).toBe(204);
    }
    const reasons = store.repos.citations.all().filter((c) => c.entity === "obsolescence");
    expect(reasons.map((c) => c.entityId)).toEqual(["deck:ranged"]);
  });

  it("refuses to delete a deck another deck names as its successor, and deletes the obsolete deck with its reason", async () => {
    const { app, store, ids } = setup();
    for (const id of [ids.liveEdge, ids.oldEdge]) {
      await app.request(`/api/counters/${String(id)}`, { method: "DELETE" });
    }
    const refused = await app.request("/api/decks/rye", { method: "DELETE" });
    expect(refused.status).toBe(409);
    expect(await refused.text()).toMatch(/deck rye is named as the successor of ranged/);
    expect((await app.request("/api/decks/ranged", { method: "DELETE" })).status).toBe(204);
    expect(store.repos.citations.all().some((c) => c.entityId === "deck:ranged")).toBe(false);
    expect((await app.request("/api/decks/rye", { method: "DELETE" })).status).toBe(204);
  });

  it("refuses a mode change that would leave a successor on another mode than the deck it supersedes", async () => {
    const { app, store, ids } = setup();
    for (const id of [ids.liveEdge, ids.oldEdge]) {
      await app.request(`/api/counters/${String(id)}`, { method: "DELETE" });
    }
    /**
     * Patches a deck's mode.
     *
     * @param id - the deck
     * @param mode - its new mode
     * @returns the response
     */
    const patch = (id: string, mode: string) =>
      app.request(`/api/decks/${id}`, { ...jsonBody({ mode }), method: "PATCH" });
    const successor = await patch("rye", "rumble_arena");
    expect(successor.status).toBe(409);
    expect(await successor.text()).toMatch(
      /deck rye can't become rumble_arena: it supersedes deck ranged, of mode arena/,
    );
    const retired = await patch("ranged", "guild_conquest");
    expect(retired.status).toBe(409);
    expect(await retired.text()).toMatch(
      /deck ranged can't become guild_conquest: it is superseded by deck rye, of mode arena/,
    );
    expect(store.repos.decks.get("rye")?.mode).toBe("arena");
    expect(store.repos.decks.get("ranged")?.mode).toBe("arena");
    expect((await patch("bari", "rumble_arena")).status).toBe(200);
  });

  it("counts a source cited only for an obsolete reason as cited, under the record whose row cites it", async () => {
    const { app } = setup();
    const listed = await readJson<Array<{ id: string; records: string[] }>>(
      await app.request("/api/sources?record=r1"),
    );
    expect(listed.find((s) => s.id === "dc:2")?.records).toEqual(["r1"]);
    expect((await app.request("/api/sources/dc:2", { method: "DELETE" })).status).toBe(409);
  });
});
