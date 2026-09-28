import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { addSource, readJson, testStore } from "../helpers";

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
