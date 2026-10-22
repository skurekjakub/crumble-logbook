import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import type { Store } from "../../src/repos";
import { createServices } from "../../src/services";
import { addSource, readJson, testStore } from "../helpers";

/**
 * Stages one glossed cookie with a cited rune build and a deck slot in
 * Arena, and a rune build naming a cookie the glossary lacks.
 *
 * @returns the store
 */
function staged(): Store {
  const store = testStore();
  const { repos } = store;
  addSource(store, "dc:1");
  repos.glossary.upsert({
    kr: "우유맛 쿠키",
    shorthand: ["우유"],
    en: "Milk Cookie",
    kind: "cookie",
    element: "빛/Light",
    class: "지원/Support",
    rarity: "SSR",
    extra: { resource_key: "cookie0055" },
  });
  const build = repos.runeBuilds.insert({
    cookieKr: "우유",
    lines: "All ATK%",
    why: "Holds ATK #1",
    mode: "arena",
  });
  repos.citations.replace("rune_build", String(build.id), ["dc:1"]);
  repos.decks.insert({
    id: "arena-dive",
    position: 1,
    nameEn: "Dive",
    status: "meta",
    mode: "arena",
  });
  repos.decks.replaceCookies("arena-dive", [
    { cookieKr: "우유맛 쿠키", level: "100", levelRule: null, stars: null, why: "ATK #1" },
  ]);
  repos.runeBuilds.replaceDecks(build.id, ["arena-dive"]);
  repos.runeBuilds.insert({ cookieKr: "수수께끼", lines: "x", why: "y", mode: "arena" });
  return store;
}

/**
 * Requests `path` from an app over `store`.
 *
 * @param store - the store the app serves
 * @param path - the request path, e.g. `/api/cookies`
 * @returns the response
 */
function get(store: Store, path: string): Promise<Response> {
  return Promise.resolve(createApp(createServices(store)).request(path));
}

describe("GET /api/cookies", () => {
  it("answers the cookie index and the names no glossary row matches", async () => {
    const res = await get(staged(), "/api/cookies");
    expect(res.status).toBe(200);
    expect(await readJson(res)).toEqual({
      cookies: [
        {
          key: "cookie0055",
          kr: "우유맛 쿠키",
          en: "Milk Cookie",
          element: "Light",
          class: "Support",
          rarity: "SSR",
          modes: ["arena"],
        },
      ],
      unresolved: [{ name: "수수께끼", modes: ["arena"] }],
    });
  });
});

describe("GET /api/cookies/:key", () => {
  it("answers the cookie's blocks, its rune builds and decks as their own routes show them", async () => {
    const store = staged();
    const res = await get(store, "/api/cookies/cookie0055");
    expect(res.status).toBe(200);
    const body = await readJson<{
      skill: string | null;
      blocks: Array<{ mode: string; runeBuilds: unknown[]; decks: unknown[]; usage: unknown[] }>;
    }>(res);
    const builds = await readJson<unknown[]>(await get(store, "/api/rune-builds?mode=arena"));
    const deck = await readJson<{ cookies: unknown[] }>(await get(store, "/api/decks/arena-dive"));
    expect(body.skill).toBeNull();
    expect(body.blocks).toEqual([
      {
        mode: "arena",
        runeBuilds: [builds[0]],
        decks: [{ deck, slot: deck.cookies[0] }],
        usage: [],
      },
    ]);
    expect(builds[0]).toMatchObject({ en: "Milk Cookie", key: "cookie0055", sources: ["dc:1"] });
    expect(deck.cookies[0]).toMatchObject({ en: "Milk Cookie", key: "cookie0055" });
  });

  it("answers 404 not_found for a key no cookie has", async () => {
    const res = await get(staged(), "/api/cookies/cookie9999");
    expect(res.status).toBe(404);
    expect(await readJson(res)).toEqual({
      error: "not_found",
      message: "cookie not found: cookie9999",
    });
  });
});
