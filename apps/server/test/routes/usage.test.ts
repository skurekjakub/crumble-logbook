import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { createServices } from "../../src/services";
import { addSource, jsonBody, readJson, testStore } from "../helpers";

/**
 * Builds a fresh app over its own in-memory store, with a source to cite.
 *
 * @returns the app and its store
 */
function setup() {
  const store = testStore();
  addSource(store, "web:1");
  return { app: createApp(createServices(store)), store };
}

/**
 * Builds a usage figure with defaults for the fields a test doesn't care about.
 *
 * @param o - the fields to override
 * @returns the figure's POST body
 */
const figure = (o: Record<string, unknown>) => ({
  mode: "rumble_arena",
  kind: "cookie",
  subject: "석류맛 쿠키",
  members: null,
  usagePct: 50,
  confirmedPct: null,
  sample: "top 100 defenses",
  capturedAt: "2026-09-27",
  note: "Lower bound: hidden slots.",
  sources: ["web:1"],
  ...o,
});

type UsageView = { subject: string; usagePct: number; kind: string; en: string | null };

describe("usage routes", () => {
  it("lists figures by usage, highest first, ties in insertion order", async () => {
    const { app } = setup();
    for (const [subject, usagePct] of [
      ["a", 40],
      ["b", 97],
      ["c", 40],
      ["d", 100],
    ] as const) {
      await app.request("/api/usage", jsonBody(figure({ subject, usagePct })));
    }
    const data = await readJson<UsageView[]>(await app.request("/api/usage"));
    expect(data.map((u) => u.subject)).toEqual(["d", "b", "a", "c"]);
  });

  it("GET /?mode=&kind= narrows to one mode and kind", async () => {
    const { app } = setup();
    await app.request("/api/usage", jsonBody(figure({ subject: "cookie" })));
    await app.request("/api/usage", jsonBody(figure({ subject: "core", kind: "core" })));
    await app.request("/api/usage", jsonBody(figure({ subject: "arena", mode: "arena" })));

    const res = await app.request("/api/usage?mode=rumble_arena&kind=core");
    expect((await readJson<UsageView[]>(res)).map((u) => u.subject)).toEqual(["core"]);
  });

  it("GET /?kind= rejects an unknown kind with 400", async () => {
    const { app } = setup();
    const res = await app.request("/api/usage?kind=rune");
    expect(res.status).toBe(400);
  });

  it("glosses the subject in English when the glossary knows it", async () => {
    const { app, store } = setup();
    store.repos.glossary.upsert({ kr: "석류맛 쿠키", en: "Pomegranate Cookie", kind: "cookie" });
    await app.request("/api/usage", jsonBody(figure({})));
    const [view] = await readJson<UsageView[]>(await app.request("/api/usage"));
    expect(view?.en).toBe("Pomegranate Cookie");
  });

  it("POST rejects a percentage over 100 with 400", async () => {
    const { app } = setup();
    const res = await app.request("/api/usage", jsonBody(figure({ usagePct: 101 })));
    expect(res.status).toBe(400);
  });
});
