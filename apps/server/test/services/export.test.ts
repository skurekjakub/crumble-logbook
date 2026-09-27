import { describe, expect, it } from "vitest";
import { ConflictError } from "../../src/errors";
import type { Store } from "../../src/repos";
import { createServices } from "../../src/services";
import type { Snapshot } from "../../src/services/export";
import { exportSnapshot, restoreSnapshot } from "../../src/services/export";
import { addSource, testStore } from "../helpers";

/**
 * Seeds `store` with at least one row in every snapshot table, through the
 * real services where practical so the fixture matches a realistic write
 * path (deck and rune-build aggregates, cited content, plus the two
 * repo-only tables `researchRecords`/`rankings`, which have no write route).
 */
function seedEverything(store: Store): void {
  const services = createServices(store);
  addSource(store, "dc:1");
  addSource(store, "web:2");

  store.repos.records.upsert({
    slug: "kr-levers",
    question: "What moves KR high scores?",
    status: "active",
    startedAt: "2026-01-01",
    updatedAt: "2026-01-02",
    seasonLabel: "S1",
    lede: null,
    caveat: null,
  });

  services.glossary.upsert({ kr: "체리 쿠키", shorthand: [], en: "Cherry Cookie", kind: "cookie" });

  services.decks.create({
    id: "cherry-onion",
    nameEn: "Cherry Onion",
    nameKr: null,
    status: "meta",
    ceilingText: null,
    summary: "A summary",
    formation: null,
    perks: null,
    rng: null,
    atkOrder: null,
    atkOrderNote: null,
    cookies: [{ cookieKr: "체리 쿠키", level: "70", levelRule: null, stars: null, why: "carry" }],
    pets: ["체리 펫"],
    notes: [{ kind: "substitution", text: "swap for X" }],
    sources: ["dc:1"],
  });

  services.runeBuilds.create({
    cookieKr: "체리 쿠키",
    lines: "ATK/ATK/ATK%",
    why: "carry",
    disputed: null,
    decks: ["cherry-onion"],
    sources: ["dc:1"],
  });

  services.gearRecs.create({ slot: "top_left", substats: "ATK%/ATK%/ATK Flat", context: "raid", why: "dmg" }, [
    "dc:1",
  ]);

  services.scores.create(
    { deckId: "cherry-onion", verified: true, date: "2026-01-01", season: 1, player: "me", note: null, damageG: 50, powerG: 10 },
    ["dc:1"],
  );

  store.repos.rankings.insertMany([
    {
      season: 1,
      board: "players",
      rank: 1,
      name: "me",
      guild: null,
      valueG: 50,
      powerG: 10,
      ref: null,
      capturedAt: "2026-01-01T00:00:00Z",
      sourceId: "dc:1",
    },
  ]);

  services.mechanics.create({ title: "Enrage timer", body: "Enrages at 30s.", confidence: "high" }, ["dc:1"]);
  services.rngFactors.create({ factor: "crit", effect: "varies damage", mitigation: null }, ["dc:1"]);
  services.timeline.create({ date: "2026-01-01", event: "patch" }, ["dc:1"]);
  services.takeaways.create({ position: 1, text: "do X", detail: null }, ["dc:1"]);
  services.recommendations.create({ summary: "buff X", changes: ["increase atk"] }, ["dc:1"]);
}

describe("exportSnapshot / restoreSnapshot", () => {
  it("round trip: export, restore into a fresh store, export again deep-equals the first (ids preserved)", () => {
    const source = testStore();
    seedEverything(source);

    const first = exportSnapshot(source);
    const target = testStore();
    const counts = restoreSnapshot(target, first);
    const second = exportSnapshot(target);

    expect(second).toEqual(first);
    expect(counts).toEqual({
      sources: 2,
      researchRecords: 1,
      glossary: 1,
      decks: 1,
      deckCookies: 1,
      deckPets: 1,
      deckNotes: 1,
      runeBuilds: 1,
      runeBuildDecks: 1,
      gearRecs: 1,
      scores: 1,
      rankings: 1,
      mechanics: 1,
      rngFactors: 1,
      timeline: 1,
      takeaways: 1,
      recommendations: 1,
      citations: 9,
    });
  });

  it("every table is ordered by primary key, independent of each repo's own list order", () => {
    const source = testStore();
    addSource(source, "web:2");
    addSource(source, "dc:1");

    const snapshot = exportSnapshot(source);

    expect(snapshot.tables.sources.map((s) => s.id)).toEqual(["dc:1", "web:2"]);
  });

  it("restoring into a non-empty store throws ConflictError", () => {
    const source = testStore();
    seedEverything(source);
    const snapshot = exportSnapshot(source);

    const target = testStore();
    addSource(target, "dc:99");

    expect(() => restoreSnapshot(target, snapshot)).toThrow(ConflictError);
    expect(() => restoreSnapshot(target, snapshot)).toThrow(/not empty/);
  });

  it("a version other than 1 is rejected", () => {
    const source = testStore();
    seedEverything(source);
    const valid = exportSnapshot(source);
    const badVersion = { ...valid, version: 2 } as unknown as Snapshot;

    const target = testStore();
    expect(() => restoreSnapshot(target, badVersion)).toThrow();
  });

  it("a citation naming a missing source throws and leaves the database empty (rolled back)", () => {
    const source = testStore();
    seedEverything(source);
    const snapshot = exportSnapshot(source);
    const broken: Snapshot = {
      ...snapshot,
      tables: {
        ...snapshot.tables,
        citations: [
          ...snapshot.tables.citations,
          { id: 999999, entity: "deck", entityId: "cherry-onion", sourceId: "dc:missing" },
        ],
      },
    };

    const target = testStore();
    expect(() => restoreSnapshot(target, broken)).toThrow();

    expect(target.repos.sources.count()).toBe(0);
    expect(target.repos.decks.count()).toBe(0);
    expect(target.repos.citations.count()).toBe(0);
    expect(target.repos.runeBuilds.count()).toBe(0);
  });
});
