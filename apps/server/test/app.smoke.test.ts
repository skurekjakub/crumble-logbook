import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { repoRoot } from "../src/config";
import { importRecord } from "../src/importers/import-record";
import type { Store } from "../src/repos";
import { createServices } from "../src/services";
import type { DeckView } from "../src/services/decks";
import type { Snapshot } from "../src/services/export";
import { exportSnapshot, restoreSnapshot } from "../src/services/export";
import type { ScoreView } from "../src/services/scores";
import { readJson, testStore } from "./helpers";

let store: Store;
let app: ReturnType<typeof createApp>;

beforeAll(() => {
  store = testStore();
  importRecord(store, join(repoRoot, "research", "001-guild-conquest-meta"));
  app = createApp(createServices(store));
});

describe("the API over imported record 001", () => {
  it("serves the decks with cherry first, every cookie carrying a level or rule and a why", async () => {
    const res = await app.request("/api/decks");
    expect(res.status).toBe(200);
    const decks = await readJson<DeckView[]>(res);
    expect(decks[0]!.id).toBe("cherry");
    for (const deck of decks) {
      expect(deck.cookies.length).toBeGreaterThan(0);
      for (const cookie of deck.cookies) {
        expect(cookie.level != null || cookie.levelRule != null).toBe(true);
        expect(cookie.why.trim()).not.toBe("");
      }
    }
  });

  it("serves the scores sorted by damage, with the 1999G run's ratio computed", async () => {
    const res = await app.request("/api/scores");
    expect(res.status).toBe(200);
    const scores = await readJson<ScoreView[]>(res);
    const damage = scores.map((s) => s.damageG);
    expect(damage).toEqual([...damage].sort((a, b) => b - a));
    const top = scores.find((s) => s.verified && s.deckId === "cherry");
    expect(Math.floor(top!.damageG)).toBe(1999);
    expect(top!.ratio).toBe(Math.round(top!.damageG / top!.powerG!));
  });

  it("serves an export that restores into a fresh database unchanged", async () => {
    const res = await app.request("/api/export");
    expect(res.status).toBe(200);
    const snapshot = await readJson<Snapshot>(res);
    expect(snapshot).toEqual(exportSnapshot(store));
    const fresh = testStore();
    restoreSnapshot(fresh, snapshot);
    expect(exportSnapshot(fresh)).toEqual(snapshot);
  });
});
