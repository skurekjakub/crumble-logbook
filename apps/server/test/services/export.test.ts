import { getTableName, sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { openDb } from "../../src/db/client";
import { ConflictError } from "../../src/errors";
import type { TableKey } from "../../src/registry";
import { specOf } from "../../src/registry";
import type { Store } from "../../src/repos";
import { createServices } from "../../src/services";
import type { Snapshot } from "../../src/services/export";
import { assertSnapshotNonEmpty, exportSnapshot, restoreSnapshot } from "../../src/services/export";
import { addSource, testStore } from "../helpers";

/**
 * Tables the migrations create that a snapshot deliberately leaves out:
 * transient job state, SQLite's id counters, and drizzle's migration log.
 */
const NOT_SNAPSHOTTED = ["jobs", "sqlite_sequence", "__drizzle_migrations"];

/** The ids the round-trip test asserts survive restore, gaps and all. */
interface SeedIds {
  /** The surviving mechanic's id; a first mechanic was created then deleted, so this isn't `1`. */
  mechanicId: number;
  /** The surviving score's id; a first score was created then deleted, so this isn't `1`. */
  scoreId: number;
  /** The surviving deck cookie's id, after the deck's original two cookies were replaced by one. */
  deckCookieId: number;
}

/**
 * Seeds `store` with at least one row in every snapshot table, through the
 * real services where practical so the fixture matches a realistic write
 * path (deck and rune-build aggregates, cited content, plus the two
 * repo-only tables `researchRecords`/`rankings`, which have no write route).
 *
 * Three tables are deliberately seeded with a gap before their surviving
 * row's id (a created-then-deleted mechanic, score, and deck-cookie
 * replacement), so a round trip that silently re-assigns fresh autoincrement
 * ids — instead of preserving the exported ones — is caught rather than
 * masked by every id coincidentally starting at `1`.
 *
 * @returns the ids the round-trip test checks are preserved exactly
 */
function seedEverything(store: Store): SeedIds {
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
    cookies: [
      { cookieKr: "체리 쿠키", level: "70", levelRule: null, stars: null, why: "carry" },
      { cookieKr: "체리 쿠키", level: "60", levelRule: null, stars: null, why: "backup" },
    ],
    pets: ["체리 펫"],
    notes: [{ kind: "substitution", text: "swap for X" }],
    sources: ["dc:1"],
  });
  // Replace both original cookies with a single one: `deck_cookies` frees
  // the first two autoincrement ids, so the surviving row's id isn't `1`.
  services.decks.update("cherry-onion", {
    cookies: [{ cookieKr: "체리 쿠키", level: "70", levelRule: null, stars: null, why: "carry" }],
  });
  const deckCookieId = store.repos.decks.allCookies()[0]!.id;

  services.runeBuilds.create({
    cookieKr: "체리 쿠키",
    lines: "ATK/ATK/ATK%",
    why: "carry",
    disputed: null,
    decks: ["cherry-onion"],
    sources: ["dc:1"],
  });

  services.gearRecs.create(
    { slot: "top_left", substats: "ATK%/ATK%/ATK Flat", context: "raid", why: "dmg" },
    ["dc:1"],
  );

  // A first score is created then deleted (and its citation with it), so
  // the surviving score's id and citation both skip past `1`.
  const droppedScore = services.scores.create(
    {
      deckId: "cherry-onion",
      verified: false,
      date: null,
      season: null,
      player: null,
      note: null,
      damageG: 1,
      powerG: null,
    },
    ["dc:1"],
  );
  const score = services.scores.create(
    {
      deckId: "cherry-onion",
      verified: true,
      date: "2026-01-01",
      season: 1,
      player: "me",
      note: null,
      damageG: 50,
      powerG: 10,
    },
    ["dc:1"],
  );
  services.scores.remove(droppedScore.id);

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

  // Same drop-then-keep pattern as `score`, for a second table.
  const droppedMechanic = services.mechanics.create(
    { title: "dropped", body: "will be deleted", confidence: "low" },
    ["dc:1"],
  );
  const mechanic = services.mechanics.create(
    { title: "Enrage timer", body: "Enrages at 30s.", confidence: "high" },
    ["dc:1"],
  );
  services.mechanics.remove(droppedMechanic.id);

  services.rngFactors.create({ factor: "crit", effect: "varies damage", mitigation: null }, [
    "dc:1",
  ]);
  services.timeline.create({ date: "2026-01-01", event: "patch" }, ["dc:1"]);
  services.takeaways.create({ position: 1, text: "do X", detail: null }, ["dc:1"]);
  services.recommendations.create({ summary: "buff X", changes: ["increase atk"] }, ["dc:1"]);
  services.fightEvents.create(
    { boss: "pinata", tElapsed: 30, event: "slam", detail: "30 s slam", confidence: "high" },
    ["dc:1"],
  );
  services.buffValues.create(
    {
      cookieKr: "체리 쿠키",
      effectType: "AttackPointAddition",
      skillGrade: 9,
      fromStar: 9,
      valuePct: 10,
      maxStack: 10,
      base: "CastersAttackPoint",
      scalesWithCasterAmp: true,
    },
    ["web:2"],
  );

  store.repos.tables.load("recordModes", [
    { recordSlug: "kr-levers", mode: "arena", lede: "Arena lede", caveat: null },
  ]);
  services.decks.create({
    id: "rival",
    nameEn: "Rival",
    status: "alt",
    mode: "arena",
    cookies: [{ cookieKr: "체리 쿠키", level: "1", levelRule: null, stars: null, why: "x" }],
    pets: [],
    notes: [],
    sources: ["dc:1"],
  });
  services.counters.create(
    {
      slug: "cherry-onion-vs-rival",
      mode: "arena",
      teamDeckId: "cherry-onion",
      beatenByDeckId: "rival",
      conditions: null,
      why: "dives first",
      confidence: "low",
    },
    ["dc:1"],
  );
  services.usageStats.create(
    {
      mode: "rumble_arena",
      kind: "team",
      subject: "Cherry Onion",
      members: ["체리 쿠키"],
      usagePct: 12.5,
      confirmedPct: null,
      sample: "top 100",
      capturedAt: "2026-01-01",
      note: null,
    },
    ["web:2"],
  );

  return { mechanicId: mechanic.id, scoreId: score.id, deckCookieId };
}

describe("exportSnapshot / restoreSnapshot", () => {
  it("round trip: export, restore into a fresh store, export again deep-equals the first (ids preserved across gaps)", () => {
    const source = testStore();
    const ids = seedEverything(source);
    // The fixture's drop-then-keep pattern only proves something if the
    // surviving ids actually have gaps before them.
    expect(ids).toEqual({ mechanicId: 2, scoreId: 2, deckCookieId: 3 });

    const first = exportSnapshot(source);
    const target = testStore();
    const counts = restoreSnapshot(target, first);
    const second = exportSnapshot(target);

    expect(second).toEqual(first);
    expect(counts).toEqual({
      sources: 2,
      researchRecords: 1,
      recordModes: 1,
      glossary: 1,
      decks: 2,
      deckCookies: 2,
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
      fightEvents: 1,
      buffValues: 1,
      counters: 1,
      usageStats: 1,
      citations: 14,
    });
    for (const [table, rows] of Object.entries(first.tables)) {
      expect(rows.length, `table "${table}" should be seeded`).toBeGreaterThan(0);
    }
    // The snapshot must cover every table the migrations create, so a new
    // table that nobody registers fails here rather than going unexported.
    const created = openDb(":memory:")
      .all<{ name: string }>(sql`select name from sqlite_master where type = 'table'`)
      .map((row) => row.name)
      .filter((name) => !NOT_SNAPSHOTTED.includes(name));
    const snapshotted = (Object.keys(first.tables) as TableKey[]).map((key) =>
      getTableName(specOf(key).table),
    );
    expect([...snapshotted].sort()).toEqual([...created].sort());

    // The specific, gapped ids survived restore rather than being
    // reassigned by a fresh autoincrement counter.
    const restoredMechanic = target.repos.mechanics.get(ids.mechanicId);
    expect(restoredMechanic?.title).toBe("Enrage timer");
    expect(
      target.repos.citations
        .sourcesFor("mechanic", [String(ids.mechanicId)])
        .get(String(ids.mechanicId)),
    ).toEqual(["dc:1"]);

    const restoredScore = target.repos.scores.get(ids.scoreId);
    expect(restoredScore?.damageG).toBe(50);
    expect(
      target.repos.citations.sourcesFor("score", [String(ids.scoreId)]).get(String(ids.scoreId)),
    ).toEqual(["dc:1"]);

    const restoredCookie = target.repos.decks.allCookies().find((c) => c.id === ids.deckCookieId);
    expect(restoredCookie?.level).toBe("70");
  });

  it("every table is ordered by primary key, independent of each repo's own list order", () => {
    const source = testStore();
    addSource(source, "web:2");
    addSource(source, "dc:1");

    const services = createServices(source);
    // `zed` is created (and thus positioned) before `alpha`, so the decks
    // repo's UI list order (`position`) is the reverse of id order.
    services.decks.create({
      id: "zed",
      nameEn: "Zed",
      nameKr: null,
      status: "meta",
      ceilingText: null,
      summary: null,
      formation: null,
      perks: null,
      rng: null,
      atkOrder: null,
      atkOrderNote: null,
      cookies: [{ cookieKr: "kr-a", level: "1", levelRule: null, stars: null, why: "x" }],
      pets: [],
      notes: [],
      sources: ["dc:1"],
    });
    services.decks.create({
      id: "alpha",
      nameEn: "Alpha",
      nameKr: null,
      status: "meta",
      ceilingText: null,
      summary: null,
      formation: null,
      perks: null,
      rng: null,
      atkOrder: null,
      atkOrderNote: null,
      cookies: [{ cookieKr: "kr-b", level: "1", levelRule: null, stars: null, why: "x" }],
      pets: [],
      notes: [],
      sources: ["dc:1"],
    });

    // Two rankings inserted rank-2-then-rank-1, so the rankings repo's
    // rank-ordered list is the reverse of insertion (id) order.
    source.repos.rankings.insertMany([
      {
        season: 1,
        board: "players",
        rank: 2,
        name: "b",
        guild: null,
        valueG: 1,
        powerG: null,
        ref: null,
        capturedAt: "t",
        sourceId: "dc:1",
      },
    ]);
    source.repos.rankings.insertMany([
      {
        season: 1,
        board: "players",
        rank: 1,
        name: "a",
        guild: null,
        valueG: 2,
        powerG: null,
        ref: null,
        capturedAt: "t",
        sourceId: "dc:1",
      },
    ]);

    const snapshot = exportSnapshot(source);

    expect(snapshot.tables.sources.map((s) => s.id)).toEqual(["dc:1", "web:2"]);

    expect(source.repos.decks.list().map((d) => d.id)).toEqual(["zed", "alpha"]);
    expect(snapshot.tables.decks.map((d) => d.id)).toEqual(["alpha", "zed"]);

    // `alpha`'s cookie was inserted second (id 2) but sorts first by deckId.
    expect(source.repos.decks.allCookies().map((c) => c.id)).toEqual([2, 1]);
    expect(snapshot.tables.deckCookies.map((c) => c.id)).toEqual([1, 2]);

    expect(source.repos.rankings.list().map((r) => r.id)).toEqual([2, 1]);
    expect(snapshot.tables.rankings.map((r) => r.id)).toEqual([1, 2]);
  });

  it("restores a snapshot written before a table existed, leaving that table empty", () => {
    const source = testStore();
    seedEverything(source);
    const { usageStats: _usageStats, ...older } = exportSnapshot(source).tables;

    const target = testStore();
    const counts = restoreSnapshot(target, { version: 1, tables: older as Snapshot["tables"] });
    expect(counts.usageStats).toBe(0);
    expect(counts.decks).toBe(2);
    expect(exportSnapshot(target).tables.usageStats).toEqual([]);
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

  it("a version other than 1 is rejected with ConflictError naming the version", () => {
    const source = testStore();
    seedEverything(source);
    const valid = exportSnapshot(source);
    const badVersion = { ...valid, version: 2 } as unknown as Snapshot;

    const target = testStore();
    expect(() => restoreSnapshot(target, badVersion)).toThrow(ConflictError);
    expect(() => restoreSnapshot(target, badVersion)).toThrow(/version/i);
  });

  it("a citation naming a missing source throws and leaves every table empty (rolled back)", () => {
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

    const after = exportSnapshot(target);
    for (const [table, rows] of Object.entries(after.tables)) {
      expect(rows, `table "${table}" should be empty after the rolled-back restore`).toEqual([]);
    }
  });
});

describe("assertSnapshotNonEmpty", () => {
  it("throws ConflictError for a snapshot with every table empty", () => {
    const empty = exportSnapshot(testStore());
    expect(() => assertSnapshotNonEmpty(empty)).toThrow(ConflictError);
  });

  it("doesn't throw for a snapshot with at least one row", () => {
    const store = testStore();
    addSource(store, "dc:1");
    const snapshot = exportSnapshot(store);
    expect(() => assertSnapshotNonEmpty(snapshot)).not.toThrow();
  });
});
