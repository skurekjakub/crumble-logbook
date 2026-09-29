import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { snapshotPath } from "../../src/config";
import type { TableKey } from "../../src/registry";
import { TABLE_KEYS } from "../../src/registry";
import type { Store } from "../../src/repos";
import type { Snapshot } from "../../src/services/export";
import { exportSnapshot } from "../../src/services/export";
import { changedFacts, changedRecords, scopeRole } from "../../src/services/snapshot-scope";
import { testStore } from "../helpers";

/**
 * Adds a gear rec that `record` owns.
 *
 * @param store - the store
 * @param record - the owning record's slug
 * @param substats - the rec's substats, which tell rows apart
 */
function gear(store: Store, record: string, substats: string): void {
  store.repos.gearRecs.insert({
    slot: "top_left",
    substats,
    context: "raid",
    why: "w",
    recordSlug: record,
  });
}

describe("changedRecords", () => {
  it("names only the record whose rows changed, though a later record's rows were renumbered", () => {
    const before = testStore();
    gear(before, "r1", "ATK");
    gear(before, "r2", "CRIT");
    const after = testStore();
    gear(after, "r1", "ATK");
    gear(after, "r1", "HP");
    gear(after, "r2", "CRIT");
    expect(changedRecords(exportSnapshot(before), exportSnapshot(after))).toEqual([
      { record: "r1", tables: ["gearRecs"] },
    ]);
  });

  it("names a record whose row changed content, and one that appeared", () => {
    const before = testStore();
    gear(before, "r1", "ATK");
    const after = testStore();
    gear(after, "r1", "ATK%");
    gear(after, "r3", "DEF");
    expect(changedRecords(exportSnapshot(before), exportSnapshot(after))).toEqual([
      { record: "r1", tables: ["gearRecs"] },
      { record: "r3", tables: ["gearRecs"] },
    ]);
  });

  it("names nothing when the snapshots hold the same rows", () => {
    const store = testStore();
    gear(store, "r1", "ATK");
    expect(changedRecords(exportSnapshot(store), exportSnapshot(store))).toEqual([]);
  });
});

/**
 * Reads the committed snapshot afresh, so a test can change its copy.
 *
 * @returns the snapshot
 */
function committed(): Snapshot {
  return JSON.parse(readFileSync(snapshotPath, "utf-8")) as Snapshot;
}

/** A snapshot's table as plain rows, for editing a copy. */
type Rows = Array<Record<string, unknown>>;

/**
 * Finds a snapshot table's rows.
 *
 * @param snapshot - the snapshot
 * @param key - the table
 * @returns its rows
 */
function rows(snapshot: Snapshot, key: TableKey): Rows {
  return snapshot.tables[key];
}

/**
 * Finds the record that owns a deck in a snapshot.
 *
 * @param snapshot - the snapshot
 * @param id - the deck's id
 * @returns the owning record's slug
 */
function deckOwner(snapshot: Snapshot, id: unknown): unknown {
  return rows(snapshot, "decks").find((d) => d.id === id)?.recordSlug;
}

describe("the tables db:scope compares", () => {
  it("places every snapshot table: owned by a record, a game fact, a child row or a citation", () => {
    for (const key of TABLE_KEYS) expect(scopeRole(key), key).toBeDefined();
  });
});

describe("changedRecords on the committed snapshot", { timeout: 30_000 }, () => {
  it("stays silent on an untouched snapshot", () => {
    expect(changedRecords(committed(), committed())).toEqual([]);
    expect(changedFacts(committed(), committed())).toEqual([]);
  });

  it("names the record whose deck cookie's level changed, under its deck", () => {
    const after = committed();
    const cookie = rows(after, "deckCookies").find((c) => c.level !== null)!;
    cookie.level = `${String(cookie.level)}0`;
    expect(changedRecords(committed(), after)).toEqual([
      { record: deckOwner(after, cookie.deckId), tables: ["decks"] },
    ]);
  });

  it("names the record whose row's citation changed, and whose reason gained one", () => {
    const after = committed();
    const gearRec = rows(after, "gearRecs")[0]!;
    const citation = rows(after, "citations").find(
      (c) => c.entity === "gear_rec" && c.entityId === String(gearRec.id),
    )!;
    citation.sourceId = "dc:1";
    expect(changedRecords(committed(), after)).toEqual([
      { record: gearRec.recordSlug, tables: ["gearRecs"] },
    ]);
    const reason = committed();
    const deck = rows(reason, "decks")[0]!;
    rows(reason, "citations").push({
      id: 999_999,
      entity: "obsolescence",
      entityId: `deck:${String(deck.id)}`,
      sourceId: "dc:1",
    });
    expect(changedRecords(committed(), reason)).toEqual([
      { record: deck.recordSlug, tables: ["decks"] },
    ]);
  });

  it("reports a changed game fact apart from the records", () => {
    const after = committed();
    const level = rows(after, "riftLevels")[0]!;
    level.recommendedPower = 1;
    expect(changedFacts(committed(), after)).toEqual(["riftLevels"]);
  });
});
