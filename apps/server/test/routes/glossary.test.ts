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
