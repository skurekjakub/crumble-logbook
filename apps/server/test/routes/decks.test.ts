import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/** A fresh app over its own in-memory store. */
function setup() {
  const store = testStore();
  const app = createApp(createServices(store));
  return { app, store };
}

const validDeck = {
  id: "cherry",
  nameEn: "Cherry",
  status: "meta",
  cookies: [{ cookieKr: "체리 쿠키", level: "70", why: "carry" }],
  sources: ["dc:1"],
};

describe("decks routes", () => {
  it("POST with a cookie missing level and levelRule returns 400 naming cookies.0.level", async () => {
    const { app } = setup();
    const res = await app.request(
      "/api/decks",
      jsonBody({ ...validDeck, cookies: [{ cookieKr: "체리 쿠키", why: "carry" }] }),
    );
    expect(res.status).toBe(400);
    const data = await readJson<{ issues: { path: string[] }[] }>(res);
    expect(data.issues.some((issue) => issue.path.join(".") === "cookies.0.level")).toBe(true);
  });

  it("GET an unknown id returns 404", async () => {
    const { app } = setup();
    const res = await app.request("/api/decks/missing");
    expect(res.status).toBe(404);
  });

  it("POST creates and returns 201", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");
    const res = await app.request("/api/decks", jsonBody(validDeck));
    expect(res.status).toBe(201);
    const data = await readJson<{ id: string }>(res);
    expect(data.id).toBe("cherry");
  });

  it("GET /?mode= lists only that mode's decks, so PvP decks stay out of Guild Conquest", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");
    await app.request("/api/decks", jsonBody(validDeck));
    await app.request("/api/decks", jsonBody({ ...validDeck, id: "rye", mode: "arena" }));

    const conquest = await readJson<{ id: string }[]>(
      await app.request("/api/decks?mode=guild_conquest"),
    );
    expect(conquest.map((d) => d.id)).toEqual(["cherry"]);
    const arena = await readJson<{ id: string }[]>(await app.request("/api/decks?mode=arena"));
    expect(arena.map((d) => d.id)).toEqual(["rye"]);
  });

  it("GET /?mode= rejects an unknown mode with 400", async () => {
    const { app } = setup();
    const res = await app.request("/api/decks?mode=raid");
    expect(res.status).toBe(400);
  });

  it("returns each cookie's formation slot", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");
    await app.request(
      "/api/decks",
      jsonBody({
        ...validDeck,
        cookies: [{ cookieKr: "체리 쿠키", level: "70", why: "carry", slot: "row1-3" }],
      }),
    );
    const deck = await readJson<{ cookies: { slot: string | null }[] }>(
      await app.request("/api/decks/cherry"),
    );
    expect(deck.cookies[0]?.slot).toBe("row1-3");
  });

  it("glosses a deck's cookies with its own record's glossary entry first", async () => {
    const { app, store } = setup();
    store.repos.glossary.upsert({
      kr: "바리공주맛 쿠키",
      shorthand: ["바궁"],
      en: "Princess Bari Cookie",
      kind: "cookie",
      recordSlug: "001-guild-conquest-meta",
    });
    store.repos.glossary.upsert({
      kr: "바궁",
      en: "Wind Archer Cookie",
      kind: "term",
      recordSlug: "002-pvp-meta",
    });
    for (const [id, recordSlug] of [
      ["pvp", "002-pvp-meta"],
      ["raid", "001-guild-conquest-meta"],
    ] as const) {
      store.repos.decks.insert({ id, position: 0, nameEn: id, status: "meta", recordSlug });
      store.repos.decks.replaceCookies(id, [
        { cookieKr: "바궁", level: "100", levelRule: null, stars: null, why: "x" },
      ]);
    }

    const gloss = async (id: string) =>
      (await readJson<{ cookies: { en: string | null }[] }>(await app.request(`/api/decks/${id}`)))
        .cookies[0]?.en;
    expect(await gloss("pvp")).toBe("Wind Archer Cookie");
    expect(await gloss("raid")).toBe("Princess Bari Cookie");
  });

  it("DELETE removes the deck, then GET returns 404", async () => {
    const { app, store } = setup();
    addSource(store, "dc:1");
    await app.request("/api/decks", jsonBody(validDeck));

    const del = await app.request("/api/decks/cherry", { method: "DELETE" });
    expect(del.status).toBe(204);

    const get = await app.request("/api/decks/cherry");
    expect(get.status).toBe(404);
  });
});
