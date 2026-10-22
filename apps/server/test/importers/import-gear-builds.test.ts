import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { importRecord } from "../../src/importers/import-record";
import type { Store } from "../../src/repos";
import { createServices } from "../../src/services";
import { exportSnapshot } from "../../src/services/export";
import { readJson, testStore } from "../helpers";

const fixtureDir = join(import.meta.dirname, "fixtures", "006-daily-dungeons");

type Row = Record<string, unknown>;

const SLOTS = {
  top_left: ["Skill AMP", "Skill AMP"],
  top_right: ["Skill AMP", "Skill Haste"],
  bottom_left: ["Damage reduction", "HP"],
  bottom_right: ["Damage reduction"],
};

/**
 * The staged builds, out of position order: a build for one boss on a
 * fixture deck, the mode's default, and an obsolete build for the same boss.
 *
 * @returns fresh rows, safe to edit
 */
function builds(): Row[] {
  return [
    {
      id: "exp-milk",
      variant: "EXP boss",
      deck: "exp-auto-milk",
      position: 2,
      confidence: "medium",
      haste_lines: { min: 1, max: 4, note: "Fixture: fewer with a long-cooldown buffer" },
      accuracy: 1000,
      focus: null,
      slots: SLOTS,
      avoid: ["Crit damage over Skill AMP"],
      why: "Fixture: keeps Milk's heal up through the boss.",
      sources: ["web:fixture-exp-guide"],
    },
    {
      id: "daily-default",
      variant: null,
      deck: null,
      position: 1,
      confidence: "high",
      haste_lines: { min: 2, max: 2, note: null },
      accuracy: null,
      focus: null,
      slots: SLOTS,
      avoid: [],
      why: "Fixture: the default for every daily dungeon.",
      sources: ["web:fixture-wiki"],
    },
    {
      id: "exp-retired",
      variant: "EXP boss",
      deck: null,
      position: 3,
      confidence: "low",
      haste_lines: { min: 0, max: 1, note: null },
      accuracy: 800,
      focus: 300,
      slots: SLOTS,
      avoid: [],
      why: "Fixture: the build before the boss changed.",
      obsolete: {
        since: "2026-10-06",
        reason: "Fixture: the boss changed.",
        sources: ["web:fixture-exp-clear"],
      },
      sources: ["web:fixture-exp-guide"],
    },
  ];
}

let tmp: string | undefined;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/**
 * Stages a copy of the daily dungeon fixture record with a gear builds file
 * listed in its curated manifest.
 *
 * @param edit - changes the staged builds in place before they are written
 * @returns the copy's directory
 */
function staged(edit: (rows: Row[]) => void = () => {}): string {
  tmp = mkdtempSync(join(tmpdir(), "crumble-gear-builds-"));
  const dir = join(tmp, "006-daily-dungeons");
  cpSync(fixtureDir, dir, { recursive: true });
  const rows = builds();
  edit(rows);
  const about = { about: "Fixture: what to roll for.", measured: "2026-10-07" };
  writeFileSync(
    join(dir, "curated", "gear-builds.json"),
    JSON.stringify({ ...about, builds: rows }),
  );
  const manifestPath = join(dir, "curated", "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as {
    collections: Record<string, string>;
  };
  manifest.collections.gearBuilds = "gear-builds.json";
  writeFileSync(manifestPath, JSON.stringify(manifest));
  return dir;
}

/**
 * Lists gear builds through the API.
 *
 * @param store - the store the app serves
 * @param query - the query string, e.g. `?mode=stage`
 * @returns the listed builds
 */
async function listed(store: Store, query: string): Promise<Row[]> {
  const res = await createApp(createServices(store)).request(`/api/gear-builds${query}`);
  expect(res.status).toBe(200);
  return readJson<Row[]>(res);
}

describe("importRecord with gear builds", () => {
  it("files each build under the record's mode and serves the mode's builds in position order", async () => {
    const store = testStore();
    expect(importRecord(store, staged()).counts.gearBuilds).toBe(builds().length);
    const rows = await listed(store, "?mode=daily_dungeon");
    expect(rows.map((row) => row.slug)).toEqual(["daily-default", "exp-milk", "exp-retired"]);
    expect(rows[1]).toMatchObject({
      mode: "daily_dungeon",
      variant: "EXP boss",
      deckId: "exp-auto-milk",
      confidence: "medium",
      hasteLines: { min: 1, max: 4, note: "Fixture: fewer with a long-cooldown buffer" },
      accuracy: 1000,
      focus: null,
      slots: SLOTS,
      avoid: ["Crit damage over Skill AMP"],
      recordSlug: "006-daily-dungeons",
      sources: ["web:fixture-exp-guide"],
      obsoleteSince: null,
    });
    expect(await listed(store, "?mode=stage")).toEqual([]);
  });

  it("keeps an obsolete build with its block, its reason cited apart from its sources", async () => {
    const store = testStore();
    importRecord(store, staged());
    expect(await listed(store, "?current=false")).toEqual([
      expect.objectContaining({
        slug: "exp-retired",
        obsoleteSince: "2026-10-06",
        obsoleteReason: "Fixture: the boss changed.",
        obsoleteSources: ["web:fixture-exp-clear"],
        sources: ["web:fixture-exp-guide"],
      }),
    ]);
  });

  it("refuses a source id the record doesn't list, naming the file and row", () => {
    const dir = staged((rows) => {
      rows[1]!.sources = ["web:nowhere"];
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /gear-builds\.json \[1\]: unknown source ids: web:nowhere/,
    );
  });

  it("refuses an id another record loaded, naming the file, row and record, and writes nothing", () => {
    const store = testStore();
    store.repos.gearBuilds.insert({
      slug: "daily-default",
      mode: "stage",
      position: 0,
      confidence: "low",
      hasteLines: { min: 0, max: 0, note: null },
      slots: SLOTS,
      why: "w",
      recordSlug: "007-other",
    });
    const before = exportSnapshot(store);
    expect(() => importRecord(store, staged())).toThrow(
      'curated/gear-builds.json [1]: gear build id "daily-default" is already loaded by record 007-other',
    );
    expect(exportSnapshot(store)).toEqual(before);
  });

  it("refuses a build for a mode the record doesn't cover", () => {
    const dir = staged((rows) => {
      rows[0]!.mode = "arena";
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /gear-builds\.json \[0\]: mode arena isn't one the record covers/,
    );
  });

  it("refuses a second current build for one mode and variant, an obsolete one aside", () => {
    const dir = staged((rows) => {
      delete rows[2]!.obsolete;
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /gear-builds\.json \[2\]: build exp-milk is already the current daily_dungeon build for EXP boss/,
    );
  });

  it("refuses a second current default when another record loaded the mode's default", () => {
    const store = testStore();
    store.repos.gearBuilds.insert({
      slug: "other-default",
      mode: "daily_dungeon",
      position: 0,
      confidence: "low",
      hasteLines: { min: 0, max: 0, note: null },
      slots: SLOTS,
      why: "w",
      recordSlug: "007-other",
    });
    expect(() => importRecord(store, staged())).toThrow(
      /gear-builds\.json \[1\]: build other-default of record 007-other is already the current daily_dungeon build for the default/,
    );
  });

  it("refuses an obsolete block dated after the record's update", () => {
    const dir = staged((rows) => {
      (rows[2]!.obsolete as Row).since = "2026-10-08";
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /gear-builds\.json \[2\]: obsolete since 2026-10-08 is after the record's update/,
    );
  });

  it("refuses a haste range whose least is more than its most, naming the file and field", () => {
    const dir = staged((rows) => {
      rows[0]!.haste_lines = { min: 5, max: 2, note: null };
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /gear-builds\.json: builds\.0\.haste_lines\.max/,
    );
  });
});
