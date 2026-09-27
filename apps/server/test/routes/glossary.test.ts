import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { jsonBody, readJson, testStore } from "../helpers";

/** A fresh app over its own in-memory store. */
function setup() {
  const store = testStore();
  const app = createApp(createServices(store));
  return { app, store };
}

describe("glossary routes", () => {
  it("POST upserts and returns 200", async () => {
    const { app } = setup();
    const res = await app.request(
      "/api/glossary",
      jsonBody({ kr: "피겨", en: "Skating Queen", kind: "cookie" }),
    );
    expect(res.status).toBe(200);
    const data = await readJson<{ kr: string; en: string | null }>(res);
    expect(data.en).toBe("Skating Queen");
  });

  it("GET /?kind= filters", async () => {
    const { app, store } = setup();
    store.repos.glossary.upsert({ kr: "피겨", en: "Skating Queen", kind: "cookie" });
    store.repos.glossary.upsert({ kr: "haste", en: "haste", kind: "stat" });

    const res = await app.request("/api/glossary?kind=stat");
    const data = await readJson<{ kr: string }[]>(res);
    expect(data.map((g) => g.kr)).toEqual(["haste"]);
  });

  it("GET /resolve?name=피겨 resolves to its English gloss", async () => {
    const { app, store } = setup();
    store.repos.glossary.upsert({ kr: "피겨", en: "Skating Queen", kind: "cookie" });

    const res = await app.request(`/api/glossary/resolve?name=${encodeURIComponent("피겨")}`);
    expect(res.status).toBe(200);
    const data = await readJson<{ kr: string; en: string | null }>(res);
    expect(data).toEqual({ kr: "피겨", en: "Skating Queen" });
  });

  it("GET /resolve?mode= resolves 바궁 to Princess Bari in Guild Conquest and Wind Archer in Arena", async () => {
    const { app, store } = setup();
    for (const [slug, mode] of [
      ["001-guild-conquest-meta", "guild_conquest"],
      ["002-pvp-meta", "arena"],
    ] as const) {
      store.repos.records.upsert({
        slug,
        question: "q",
        status: "active",
        startedAt: "2026-09-27",
        updatedAt: "2026-09-27",
        mode,
      });
    }
    store.repos.records.replaceModes("002-pvp-meta", [
      { mode: "arena", lede: null, caveat: null },
      { mode: "rumble_arena", lede: null, caveat: null },
    ]);
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

    const resolve = async (mode: string) =>
      (
        await readJson<{ en: string | null }>(
          await app.request(
            `/api/glossary/resolve?name=${encodeURIComponent("바궁")}&mode=${mode}`,
          ),
        )
      ).en;
    expect(await resolve("guild_conquest")).toBe("Princess Bari Cookie");
    expect(await resolve("arena")).toBe("Wind Archer Cookie");
    expect(await resolve("rumble_arena")).toBe("Wind Archer Cookie");
  });

  it("GET /resolve?name= for an unresolved name returns en: null", async () => {
    const { app } = setup();
    const res = await app.request(
      `/api/glossary/resolve?name=${encodeURIComponent("unknown-term")}`,
    );
    expect(res.status).toBe(200);
    const data = await readJson<{ en: string | null }>(res);
    expect(data.en).toBeNull();
  });
});
