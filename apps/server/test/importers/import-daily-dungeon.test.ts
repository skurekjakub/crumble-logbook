import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { importRecord } from "../../src/importers/import-record";
import { writeRecord } from "../../src/importers/write-record";
import { createServices } from "../../src/services";
import { readJson, testStore } from "../helpers";

const fixtureDir = join(import.meta.dirname, "fixtures", "006-daily-dungeons");

type Row = Record<string, unknown>;

/**
 * Reads a curated file of the fixture record, parsed, with a test-asserted shape.
 *
 * @param name - the file's name in the curated directory
 * @returns the parsed file, unchecked
 */
function curated<T>(name: string): T {
  return JSON.parse(readFileSync(join(fixtureDir, "curated", name), "utf-8")) as T;
}

const dungeons = curated<Array<{ id: string }>>("daily-dungeons.json");
const decks = curated<Array<{ id: string; cookies: unknown[]; pets?: string[] }>>("decks.json");
const clears = curated<Row[]>("dungeon-clears.json");

/** A curated deck's run facts: the fields only a daily dungeon deck names. */
const DAILY_FIELDS = [
  "dungeon",
  "auto",
  "stage",
  "power",
  "recommended_power",
  "gear_preset",
  "captain",
];

let tmp: string | undefined;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/**
 * Builds a throwaway copy of the fixture record after applying `edit` to
 * its curated array files.
 *
 * @param edit - changes each parsed curated file's rows in place, by file name
 * @returns the copy's directory
 */
function fixtureCopy(edit: Record<string, (rows: Row[]) => void>): string {
  tmp ??= mkdtempSync(join(tmpdir(), "crumble-daily-"));
  const dir = join(tmp, "006-daily-dungeons");
  cpSync(fixtureDir, dir, { recursive: true });
  for (const [name, change] of Object.entries(edit)) {
    const path = join(dir, "curated", name);
    const rows = JSON.parse(readFileSync(path, "utf-8")) as Row[];
    change(rows);
    writeFileSync(path, JSON.stringify(rows));
  }
  return dir;
}

/**
 * Finds a row of a parsed curated file by a field's value.
 *
 * @param rows - the file's rows
 * @param field - the field to match
 * @param value - the value it must have
 * @returns the row
 * @throws `Error` when no row has that value
 */
function rowWhere(rows: Row[], field: string, value: unknown): Row {
  const row = rows.find((r) => r[field] === value);
  if (!row) throw new Error(`no row with ${field} ${String(value)}`);
  return row;
}

describe("importRecord on the daily dungeon fixture", () => {
  it("files the record under daily_dungeon and loads the dungeons, the decks' run facts and the clears", () => {
    const store = testStore();
    const { counts, warnings } = importRecord(store, fixtureDir);
    expect(counts).toMatchObject({
      researchRecords: 1,
      dailyDungeons: dungeons.length,
      decks: decks.length,
      deckDailyDungeons: decks.length,
      dailyDungeonClears: clears.length,
    });
    expect(warnings).toEqual([]);
    expect(store.repos.records.get("006-daily-dungeons")?.mode).toBe("daily_dungeon");

    const services = createServices(store);
    const [exp, dough, stone] = services.dailyDungeons.list();
    expect(exp).toMatchObject({
      slug: "exp",
      position: 0,
      nameKr: "경험치 던전",
      ticketBackOnLoss: true,
      quickClear: true,
      bossElement: "Fire",
      bossWeakness: "Water",
      bossRotates: false,
      topStage: 52,
      topStageDate: "2026-10-06",
      topStageSource: "web:fixture-exp-clear",
    });
    expect(exp!.sources).toEqual(
      expect.arrayContaining(["web:fixture-exp-guide", "web:fixture-exp-clear"]),
    );
    expect(dough).toMatchObject({ slug: "dough", bossRotates: true, quickClear: null, notes: [] });
    expect(stone).toMatchObject({
      slug: "research-stone",
      nameKr: null,
      entryKeys: null,
      topStage: null,
    });
  });

  it("serves each deck's run facts, its power read in billions and its captain glossed", async () => {
    const store = testStore();
    importRecord(store, fixtureDir);
    const app = createApp(createServices(store));
    const res = await app.request("/api/decks?mode=daily_dungeon");
    const listed = await readJson<Array<{ id: string; dailyDungeon: Row | null }>>(res);
    expect(listed.map((deck) => deck.id)).toEqual(decks.map((deck) => deck.id));
    expect(listed[0]!.dailyDungeon).toEqual({
      dungeon: "exp",
      auto: "full",
      stage: 45,
      power: "1.85G",
      powerG: 1.85,
      recommendedPower: "2.4G",
      recommendedPowerG: 2.4,
      gearPreset: "Fixture: crit-damage preset",
      captain: {
        kr: "바삭튼튼 소아과 의사 우유맛 쿠키",
        en: "Milk Cookie's Crunchy Strong Pediatrician",
      },
    });
    expect(listed[0]!).toMatchObject({ perks: "Fixture: 복지 heal-boost perk" });
    expect(listed[2]!.dailyDungeon).toMatchObject({
      auto: "manual",
      power: null,
      recommendedPower: null,
      captain: null,
    });
  });

  it("keeps an obsolete daily dungeon deck with its run facts, marked and superseded", async () => {
    const store = testStore();
    importRecord(store, fixtureDir);
    const app = createApp(createServices(store));
    const retired = await readJson<Row>(await app.request("/api/decks/exp-auto-retired"));
    expect(retired).toMatchObject({
      obsoleteSince: "2026-10-06",
      supersededBy: "exp-auto-milk",
      dailyDungeon: { dungeon: "exp", auto: "full", stage: 60 },
    });
  });

  it("lists the clears furthest stage first, filtered by dungeon, never by a ratio", async () => {
    const store = testStore();
    importRecord(store, fixtureDir);
    const app = createApp(createServices(store));
    const exp = await readJson<Row[]>(await app.request("/api/daily-dungeon-clears?dungeon=exp"));
    expect(exp.map((clear) => [clear.stage, clear.powerG, clear.deckId])).toEqual([
      [52, 2.1, "exp-partial-scorpion"],
      [45, 1.85, "exp-auto-milk"],
    ]);
    const auto = await readJson<Row[]>(await app.request("/api/daily-dungeon-clears?auto=full"));
    expect(auto).toHaveLength(1);
    const dungeonsRes = await readJson<Row[]>(await app.request("/api/daily-dungeons"));
    expect(dungeonsRes.map((row) => row.slug)).toEqual(dungeons.map((row) => row.id));
  });

  it("replaces the record's rows with --replace, run facts included", () => {
    const store = testStore();
    const first = importRecord(store, fixtureDir);
    const second = importRecord(store, fixtureDir, { replace: true });
    expect(second.counts).toEqual(first.counts);
    expect(store.repos.tables.count("deckDailyDungeons")).toBe(decks.length);
  });

  it("refuses a deck that runs a daily dungeon nobody loads", () => {
    const dir = fixtureCopy({
      "decks.json": (rows) => {
        rows[0]!.dungeon = "gold";
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /decks\.json \[0\]: daily dungeon gold isn't loaded/,
    );
  });

  it("refuses a deck that names a dungeon without auto, or a run fact without a dungeon", () => {
    const noAuto = fixtureCopy({
      "decks.json": (rows) => {
        delete rows[1]!.auto;
      },
    });
    expect(() => importRecord(testStore(), noAuto)).toThrow(/\[1\]: .*both dungeon and auto/);
    rmSync(tmp!, { recursive: true, force: true });
    tmp = undefined;
    const stray = fixtureCopy({
      "decks.json": (rows) => {
        delete rows[2]!.dungeon;
        delete rows[2]!.auto;
      },
    });
    expect(() => importRecord(testStore(), stray)).toThrow(
      /\[2\]: stage, power, recommended_power, gear_preset and captain are a daily dungeon deck's/,
    );
  });

  it("refuses a captain who isn't one of the deck's cookies", () => {
    const dir = fixtureCopy({
      "decks.json": (rows) => {
        rows[0]!.captain = "체리맛 쿠키";
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /\[0\]: captain 체리맛 쿠키 is not one of the deck's cookies/,
    );
  });

  it("refuses run facts on a deck of another mode, and a daily dungeon deck without them", () => {
    const other = fixtureCopy({
      "decks.json": (rows) => {
        rows[0]!.mode = "stage";
      },
    });
    expect(() => importRecord(testStore(), other)).toThrow(
      /\[0\]: a stage deck has no daily dungeon/,
    );
    rmSync(tmp!, { recursive: true, force: true });
    tmp = undefined;
    const bare = fixtureCopy({
      "decks.json": (rows) => {
        rows[0] = Object.fromEntries(
          Object.entries(rows[0]!).filter(([field]) => !DAILY_FIELDS.includes(field)),
        );
      },
    });
    expect(() => importRecord(testStore(), bare)).toThrow(
      /\[0\]: a daily_dungeon deck names its dungeon and auto/,
    );
  });

  it("refuses a clear whose deck runs another dungeon, or names a dungeon nobody loads", () => {
    const mismatch = fixtureCopy({
      "dungeon-clears.json": (rows) => {
        rowWhere(rows, "deck", "exp-auto-milk").dungeon = "dough";
      },
    });
    expect(() => importRecord(testStore(), mismatch)).toThrow(
      /dungeon-clears\.json \[1\]: deck exp-auto-milk runs daily dungeon exp, not dough/,
    );
    rmSync(tmp!, { recursive: true, force: true });
    tmp = undefined;
    const unknown = fixtureCopy({
      "dungeon-clears.json": (rows) => {
        rows[2]!.dungeon = "gold";
      },
    });
    expect(() => importRecord(testStore(), unknown)).toThrow(
      /dungeon-clears\.json \[2\]: daily dungeon gold isn't loaded/,
    );
  });

  it("refuses a repeated dungeon id and a top stage whose source isn't curated", () => {
    const repeat = fixtureCopy({
      "daily-dungeons.json": (rows) => {
        rows[1]!.id = "exp";
      },
    });
    expect(() => importRecord(testStore(), repeat)).toThrow(/\[1\]: duplicate id "exp"/);
    rmSync(tmp!, { recursive: true, force: true });
    tmp = undefined;
    const source = fixtureCopy({
      "daily-dungeons.json": (rows) => {
        (rows[0]!.top_stage as Row).source = "web:nowhere";
      },
    });
    expect(() => importRecord(testStore(), source)).toThrow(/unknown source ids: web:nowhere/);
  });

  it("refuses a --replace that drops a daily dungeon another record's deck runs", () => {
    const store = testStore();
    store.repos.dailyDungeons.insert({
      slug: "exp",
      position: 0,
      nameEn: "EXP",
      drops: [],
      notes: [],
      recordSlug: "a",
    });
    store.repos.decks.insert({
      id: "other-auto",
      position: 0,
      nameEn: "Other",
      status: "meta",
      mode: "daily_dungeon",
      recordSlug: "b",
    });
    store.repos.decks.replaceDailyRun("other-auto", { dungeon: "exp", auto: "full" });
    expect(() => writeRecord(store, { slug: "a", steps: [], warnings: [] }, true)).toThrow(
      /deck other-auto runs daily dungeon exp, which record a no longer loads/,
    );
    expect(store.repos.dailyDungeons.list().map((row) => row.slug)).toEqual(["exp"]);
  });
});
