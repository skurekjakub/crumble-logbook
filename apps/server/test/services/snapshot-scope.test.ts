import { describe, expect, it } from "vitest";
import type { Store } from "../../src/repos";
import { exportSnapshot } from "../../src/services/export";
import { changedRecords } from "../../src/services/snapshot-scope";
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
