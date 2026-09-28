import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { repoRoot } from "../../src/config";
import { ImportError } from "../../src/errors";
import { importRecord } from "../../src/importers/import-record";
import { entryPower, powerInG } from "../../src/importers/stage-collections";
import { createServices } from "../../src/services";
import { readJson, testStore } from "../helpers";

const STAGE = "003-stage-pushing-meta";
const stageDir = join(repoRoot, "research", STAGE);
/** A full import verifies the record's capture ledger, hashing its evidence on a cold cache. */
const FULL_IMPORT = { timeout: 180_000 };

/**
 * Reads a curated file of record 003, parsed, with a test-asserted shape.
 *
 * @param name - the file's name in the curated directory
 * @returns the parsed file, unchecked
 */
function curated<T>(name: string): T {
  return JSON.parse(readFileSync(join(stageDir, "curated", name), "utf-8")) as T;
}

type Cited = { sources: string[] };
const brackets = curated<{ brackets: Cited[] }>("power-brackets.json").brackets;
const chapters = curated<{ sources: string[]; chapters: Array<Record<string, number | string>> }>(
  "stage-chapters.json",
);
const rift = curated<{ sources: string[]; levels: unknown[]; seasons: unknown[] }>(
  "rift-levels.json",
);
const zones = curated<{ zones: Array<{ slots: Array<Cited & { deck?: string }> }> }>(
  "stage-zones.json",
);
const clears = curated<{ clears: Array<Cited & { stage: string }> }>("stage-clears.json").clears;
const riftBosses = curated<{ levels: Cited[] }>("rift-bosses.json").levels;

let tmp: string | undefined;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/**
 * Builds a throwaway copy of record 003's curated dataset, under its own
 * slug, with no evidence, capture rules or ledger, after applying `edit`
 * to its curated files.
 *
 * @param slug - the copy's record slug
 * @param edit - changes each parsed curated file in place, by file name
 * @returns the copy's directory
 */
function stageCopy(
  slug: string,
  edit: Record<string, (file: Record<string, unknown>) => void> = {},
): string {
  tmp ??= mkdtempSync(join(tmpdir(), "crumble-stage-"));
  const dir = join(tmp, slug);
  cpSync(join(stageDir, "curated"), join(dir, "curated"), { recursive: true });
  mkdirSync(join(dir, "extract"));
  for (const [name, change] of Object.entries(edit)) {
    const path = join(dir, "curated", name);
    const file = JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
    change(file);
    writeFileSync(path, JSON.stringify(file));
  }
  const base = JSON.parse(readFileSync(join(stageDir, "import.json"), "utf-8")) as {
    record: object;
  };
  writeFileSync(
    join(dir, "import.json"),
    JSON.stringify({
      ...base,
      record: { ...base.record, slug },
      extractions: "extract",
      captures: [],
      ledger: undefined,
    }),
  );
  return dir;
}

/**
 * Edits that give a copy's decks ids of its own, so it loads next to
 * another copy, which already claims the curated ids.
 *
 * @param suffix - appended to every deck id and every reference to one
 * @returns the edits, by curated file name
 */
function ownDecks(suffix: string): Record<string, (file: Record<string, unknown>) => void> {
  type Row = Record<string, unknown>;
  /**
   * Renames the deck a row names under `field`, when it names one.
   *
   * @param row - the row
   * @param field - the field holding a deck id
   */
  const rename = (row: Row, field: string) => {
    if (typeof row[field] === "string") row[field] = `${row[field]}${suffix}`;
  };
  return {
    "decks.json": (file) => {
      for (const deck of file as unknown as Row[]) rename(deck, "id");
    },
    "runes.json": (file) => {
      for (const rune of file as unknown as Row[]) {
        rune.decks = ((rune.decks as string[] | undefined) ?? []).map((id) => `${id}${suffix}`);
      }
    },
    "stage-zones.json": (file) => {
      for (const zone of file.zones as Array<{ slots: Row[] }>) {
        for (const slot of zone.slots) rename(slot, "deck");
      }
    },
    "stage-clears.json": (file) => {
      for (const clear of file.clears as Row[]) rename(clear, "deck");
    },
  };
}

describe("importRecord on research record 003", FULL_IMPORT, () => {
  it("files the record under stage and loads every stage table and its citations", () => {
    const store = testStore();
    const { counts } = importRecord(store, stageDir);
    const slots = zones.zones.flatMap((z) => z.slots);
    expect(counts).toMatchObject({
      researchRecords: 1,
      powerBrackets: brackets.length,
      stageChapters: chapters.chapters.length,
      riftLevels: rift.levels.length,
      riftSeasons: rift.seasons.length,
      stageZoneSlots: slots.length,
      stageClears: clears.length,
      riftBosses: riftBosses.length,
    });
    const services = createServices(store);
    expect(services.records.get(STAGE).mode).toBe("stage");
    expect(services.decks.list().every((d) => d.mode === "stage")).toBe(true);
    expect(services.stageChapters.list()[0]!.sources).toEqual([...chapters.sources].sort());
    expect(services.riftLevels.list()[0]!.sources).toEqual([...rift.sources].sort());
    expect(services.stageZoneSlots.list().map((s) => s.deckId)).toEqual(
      slots.map((s) => s.deck ?? null),
    );
  });

  it("loads the game facts owned by no record, so a --replace keeps them and doesn't repeat them", () => {
    const store = testStore();
    importRecord(store, stageDir);
    const facts = ["powerBrackets", "stageChapters", "riftLevels", "riftSeasons"] as const;
    const before = facts.map((key) => store.repos.tables.dump(key));
    for (const rows of before) {
      expect(rows.every((row) => !("recordSlug" in row))).toBe(true);
    }
    const { counts } = importRecord(store, stageDir, { replace: true });
    expect(counts).toMatchObject({
      powerBrackets: 0,
      stageChapters: 0,
      riftLevels: 0,
      riftSeasons: 0,
      stageClears: clears.length,
    });
    expect(facts.map((key) => store.repos.tables.dump(key))).toEqual(before);
    expect(store.repos.stageClears.count()).toBe(clears.length);
  });

  it("serves clears by stage reached, then lower power first, with the boss glossed", async () => {
    const store = testStore();
    importRecord(store, stageDir);
    const app = createApp(createServices(store));
    const rows = await readJson<Array<{ chapter: number; stageNo: number; powerG: number | null }>>(
      await app.request("/api/stage-clears"),
    );
    const reached = rows.map((r) => r.chapter * 100 + r.stageNo);
    expect(reached).toEqual([...reached].sort((a, b) => b - a));
    const top = rows.filter((r) => r.chapter === 328 && r.stageNo === 30).map((r) => r.powerG);
    expect(top).toEqual([...top].sort((a, b) => a! - b!));
    const fails = await readJson<unknown[]>(await app.request("/api/stage-clears?result=fail"));
    expect(fails.length).toBeGreaterThan(0);
    expect(fails.length).toBeLessThan(rows.length);
  });
});

describe("the stage collections' checks", FULL_IMPORT, () => {
  it("fails a chapter whose entry power isn't its bracket's share of recommended power", () => {
    const dir = stageCopy("900-stage-copy", {
      "stage-chapters.json": (file) => {
        const [first] = file.chapters as Array<Record<string, number>>;
        first!.power_for_35 = first!.power_for_35! + 1;
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(ImportError);
    expect(() => importRecord(testStore(), dir)).toThrow(/stage-chapters\.json.*power_for_35/);
  });

  it("fails a zone slot or a clear that names a deck of another mode", () => {
    const dir = stageCopy("901-stage-copy", {
      "decks.json": (file) => {
        for (const deck of file as unknown as Array<Record<string, unknown>>) {
          if (deck.id === "stage-aoe-rapidfire") deck.mode = "arena";
        }
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /stage-zones\.json.*stage_zone_slot mode stage doesn't match deck stage-aoe-rapidfire's mode arena/,
    );
  });

  it("keeps an identical game fact another record loaded, and fails one that differs", () => {
    const store = testStore();
    importRecord(store, stageCopy("902-stage-copy"));
    const same = importRecord(store, stageCopy("903-stage-copy", ownDecks("-b")));
    expect(same.counts).toMatchObject({ stageChapters: 0, riftLevels: 0, powerBrackets: 0 });
    const changed = stageCopy("904-stage-copy", {
      ...ownDecks("-c"),
      "stage-chapters.json": (file) => {
        const [first] = file.chapters as Array<Record<string, number | string>>;
        first!.boss_en = "Someone else";
      },
    });
    expect(() => importRecord(store, changed)).toThrow(
      /stage chapter conflicts with the stored game fact/,
    );
  });
});

describe("entryPower and powerInG", () => {
  it("rounds an entry power up to the next whole power", () => {
    expect(entryPower(10258, 40)).toBe(4104);
    expect(entryPower(1600, 20)).toBe(320);
  });

  it("reads the first G or M figure of a posted power as billions", () => {
    expect(powerInG("4.00G (4G 3M 599K)")).toBe(4);
    expect(powerInG("1.17G (1,169.78M)")).toBe(1.17);
    expect(powerInG("971.8M (971M 839K)")).toBe(0.9718);
    expect(powerInG("about 4.03G ('딱투')")).toBe(4.03);
    expect(powerInG("just over 3G")).toBe(3);
    expect(powerInG("no figure")).toBeNull();
  });
});
