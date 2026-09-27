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
