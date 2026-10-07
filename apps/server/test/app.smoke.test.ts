import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app";
import { repoRoot } from "../src/config";
import { importRecord } from "../src/importers/import-record";
import type { Store } from "../src/repos";
import { createServices } from "../src/services";
import type { BuffValueView } from "../src/services/buff-values";
import type { DeckView } from "../src/services/decks";
import type { Snapshot } from "../src/services/export";
import { exportSnapshot, restoreSnapshot } from "../src/services/export";
import type { FightEventView } from "../src/services/fight-events";
import type { ScoreView } from "../src/services/scores";
import { readJson, testStore } from "./helpers";

let store: Store;
let app: ReturnType<typeof createApp>;

// The import verifies record 001's capture ledger: with a cold hash cache, every present
// evidence file, local media included, is read and hashed while other test workers do the same.
beforeAll(() => {
  store = testStore();
  importRecord(store, join(repoRoot, "research", "001-guild-conquest-meta"));
  app = createApp(createServices(store));
}, 180_000);

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

  it("serves the scores sorted by damage, with the best verified cherry run's ratio computed", async () => {
    const res = await app.request("/api/scores");
    expect(res.status).toBe(200);
    const scores = await readJson<ScoreView[]>(res);
    const damage = scores.map((s) => s.damageG);
    expect(damage).toEqual([...damage].sort((a, b) => b - a));
    const curated = JSON.parse(
      readFileSync(
        join(repoRoot, "research", "001-guild-conquest-meta", "curated", "scores.json"),
        "utf-8",
      ),
    ) as Array<{ damage_g: number; deck: string | null; verified: boolean }>;
    const best = Math.max(
      ...curated.filter((s) => s.verified && s.deck === "cherry").map((s) => s.damage_g),
    );
    const top = scores.find((s) => s.verified && s.deckId === "cherry");
    expect(top!.damageG).toBe(best);
    expect(top!.ratio).toBe(Math.round(top!.damageG / top!.powerG!));
  });

  it("serves the Piñata's fight events in elapsed-time order, untimed ones last", async () => {
    const res = await app.request("/api/fight-events?boss=pinata");
    expect(res.status).toBe(200);
    const events = await readJson<FightEventView[]>(res);
    expect(events.length).toBeGreaterThan(0);
    const timed = events.filter((e) => e.tElapsed !== null).map((e) => e.tElapsed!);
    expect(timed).toEqual([...timed].sort((a, b) => a - b));
    expect(events.slice(timed.length).every((e) => e.tElapsed === null)).toBe(true);
    expect(events.every((e) => e.sources.length > 0)).toBe(true);
  });

  it("serves Tea Knight's buff values with the cookie's English name", async () => {
    const res = await app.request(`/api/buff-values?cookie=${encodeURIComponent("실론")}`);
    expect(res.status).toBe(200);
    const buffs = await readJson<BuffValueView[]>(res);
    expect(buffs.length).toBeGreaterThan(0);
    expect(buffs.every((b) => b.en === "Tea Knight Cookie")).toBe(true);
  });

  it("answers an unknown id with 404 and a not_found body", async () => {
    const res = await app.request("/api/decks/no-such-deck");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: "not_found",
      message: "deck not found: no-such-deck",
    });
  });

  it("answers an unknown cited source with 422 and an unknown_refs body naming the ids", async () => {
    const res = await app.request("/api/mechanics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "t", body: "b", confidence: "low", sources: ["dc:0"] }),
    });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: "unknown_refs", kind: "sources", ids: ["dc:0"] });
  });

  it("answers a conflict with 409 and a conflict body", async () => {
    const cited = (await readJson<ScoreView[]>(await app.request("/api/scores")))[0]!.sources[0]!;
    const res = await app.request(`/api/sources/${encodeURIComponent(cited)}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(409);
    const body = await readJson<{ error: string; message: string }>(res);
    expect(Object.keys(body)).toEqual(["error", "message"]);
    expect(body.error).toBe("conflict");
  });

  it("answers an unexpected error with 500 and an internal body, logging it", async () => {
    const services = createServices(store);
    const failing = createApp({
      ...services,
      export: {
        run: () => {
          throw new Error("boom");
        },
      },
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await failing.request("/api/export");
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "internal" });
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
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
