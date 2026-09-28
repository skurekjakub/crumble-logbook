import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { snapshotPath } from "../../src/config";
import type { Store } from "../../src/repos";
import { createServices } from "../../src/services";
import { exportSnapshot, restoreSnapshot } from "../../src/services/export";
import type { Snapshot } from "../../src/services/export";
import { driftWarning, snapshotDrift } from "../../src/services/snapshot-drift";
import { addSource, testStore } from "../helpers";

/**
 * Loads a record row and one cited mechanic into `store`.
 *
 * @param store - the store to write to
 * @param slug - the record's slug
 */
function seedRecord(store: Store, slug: string): void {
  store.repos.records.upsert({
    slug,
    question: "q",
    status: "active",
    startedAt: "2026-01-01",
    updatedAt: "2026-01-01",
  });
  if (store.repos.sources.missing(["dc:1"]).length > 0) addSource(store, "dc:1");
  createServices(store).mechanics.create({ title: slug, body: "b", confidence: "high" }, ["dc:1"]);
}

/**
 * Builds a snapshot of a store holding the given records.
 *
 * @param slugs - the records the snapshot holds
 * @returns the snapshot, round-tripped through JSON as the committed file is
 */
function snapshotOf(...slugs: string[]): Snapshot {
  const store = testStore();
  for (const slug of slugs) seedRecord(store, slug);
  return JSON.parse(JSON.stringify(exportSnapshot(store))) as Snapshot;
}

const PATHS = { dbPath: "data/crumble.db", snapshotPath: "data/snapshot.json" };

describe("snapshotDrift", () => {
  it("finds nothing when the database was restored from the snapshot", () => {
    const snapshot = snapshotOf("001-a", "002-b");
    const store = testStore();
    restoreSnapshot(store, snapshot);
    const drift = snapshotDrift(store, snapshot);
    expect(drift).toEqual({ missingRecords: [], extraRecords: [], tables: [] });
    expect(driftWarning(drift, PATHS)).toBeNull();
  });

  it("finds nothing when a database is restored from the committed data/snapshot.json", () => {
    const snapshot = JSON.parse(readFileSync(snapshotPath, "utf-8")) as Snapshot;
    const store = testStore();
    restoreSnapshot(store, snapshot);
    expect(snapshotDrift(store, snapshot)).toEqual({
      missingRecords: [],
      extraRecords: [],
      tables: [],
    });
  });

  it("names a record the snapshot has and the database lacks, and the tables whose rows differ", () => {
    const store = testStore();
    restoreSnapshot(store, snapshotOf("001-a"));
    const drift = snapshotDrift(store, snapshotOf("001-a", "003-c"));
    expect(drift.missingRecords).toEqual(["003-c"]);
    expect(drift.extraRecords).toEqual([]);
    expect(drift.tables).toContainEqual({ table: "researchRecords", database: 1, snapshot: 2 });
    expect(drift.tables).toContainEqual({ table: "mechanics", database: 1, snapshot: 2 });
  });

  it("names a record the database has and the snapshot lacks", () => {
    const store = testStore();
    restoreSnapshot(store, snapshotOf("001-a", "003-c"));
    expect(snapshotDrift(store, snapshotOf("001-a")).extraRecords).toEqual(["003-c"]);
  });

  it("names a table whose rows changed though its row count didn't", () => {
    const snapshot = snapshotOf("001-a");
    const store = testStore();
    restoreSnapshot(store, snapshot);
    const [mechanic] = store.repos.mechanics.list();
    store.repos.mechanics.update(mechanic!.id, { body: "edited" });
    expect(snapshotDrift(store, snapshot).tables).toEqual([
      { table: "mechanics", database: 1, snapshot: 1 },
    ]);
  });

  it("treats a table the snapshot predates as empty there", () => {
    const seeded = testStore();
    seedRecord(seeded, "001-a");
    createServices(seeded).usageStats.create(
      { kind: "cookie", subject: "x", usagePct: 50, sample: "s", capturedAt: "2026-01-01" },
      ["dc:1"],
    );
    const snapshot = JSON.parse(JSON.stringify(exportSnapshot(seeded))) as Snapshot;
    const store = testStore();
    restoreSnapshot(store, snapshot);
    const older = { ...snapshot, tables: { ...snapshot.tables } } as Snapshot;
    delete (older.tables as Partial<Snapshot["tables"]>).usageStats;
    expect(snapshotDrift(store, older).tables).toEqual([
      { table: "usageStats", database: 1, snapshot: 0 },
    ]);
    const empty = testStore();
    seedRecord(empty, "001-a");
    const withoutRows = JSON.parse(JSON.stringify(exportSnapshot(empty))) as Snapshot;
    delete (withoutRows.tables as Partial<Snapshot["tables"]>).usageStats;
    expect(snapshotDrift(empty, withoutRows).tables).toEqual([]);
  });
});

describe("driftWarning", () => {
  it("names the missing records, the differing tables and both fixes, without changing anything", () => {
    const store = testStore();
    restoreSnapshot(store, snapshotOf("001-a"));
    const before = JSON.stringify(exportSnapshot(store));
    const warning = driftWarning(snapshotDrift(store, snapshotOf("001-a", "003-c")), PATHS);
    expect(warning).toContain("data/crumble.db differs from data/snapshot.json");
    expect(warning).toContain("003-c");
    expect(warning).toContain("mechanics (database 1, snapshot 2)");
    expect(warning).toContain("delete data/crumble.db");
    expect(warning).toContain("pnpm db:export");
    expect(JSON.stringify(exportSnapshot(store))).toBe(before);
  });

  it("sends a changed record through a fresh database, never an export of this one", () => {
    const store = testStore();
    restoreSnapshot(store, snapshotOf("001-a"));
    const warning = driftWarning(snapshotDrift(store, snapshotOf("001-a", "003-c")), PATHS)!;
    expect(warning).toContain("point CRUMBLE_DB at a new file");
    expect(warning).toContain("pnpm import:record");
    expect(warning).not.toMatch(/source of truth: run pnpm db:export/);
    expect(warning).toContain("Don't export this database");
  });
});
