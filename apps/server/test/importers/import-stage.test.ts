import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { postedPowerG } from "@crumble/schema";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { repoRoot } from "../../src/config";
import { ImportError } from "../../src/errors";
import { importRecord } from "../../src/importers/import-record";
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
const clears = curated<{
  clears: Array<Cited & { stage: string; result: string; standing: string }>;
}>("stage-clears.json").clears;
const riftBosses = curated<{ levels: Cited[] }>("rift-bosses.json").levels;

let tmp: string | undefined;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/**
 * Builds a throwaway copy of record 003's curated dataset, under its own
 * slug, with no evidence, capture rules or ledger, after applying `edit`
 * to its curated files. Building a slug again overwrites its copy.
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
  mkdirSync(join(dir, "extract"), { recursive: true });
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
    "rift-clears.json": (file) => {
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
    const alsoRift = services.mechanics.list().filter((m) => m.alsoTopics.includes("rift"));
    expect(new Set(alsoRift.map((m) => m.topic))).toEqual(
      new Set(["power-gate", "accuracy-focus"]),
    );
    const pack = services.stageClears.list().find((c) => c.bossKr === "케이크 들개떼");
    expect(pack?.bossEn).toBe("Cake Hound Pack");
    expect(services.riftUnlocks.list()).toMatchObject([
      { stage: "328-30", sources: ["nv:37730", "nv:44477"] },
    ]);
  });

  it("loads the game facts owned by no record, and a --replace reloads them as they were, once", () => {
    const store = testStore();
    importRecord(store, stageDir);
    const facts = [
      "powerBrackets",
      "stageChapters",
      "riftLevels",
      "riftSeasons",
      "riftUnlocks",
    ] as const;
    const before = facts.map((key) => store.repos.tables.dump(key));
    for (const rows of before) {
      expect(rows.every((row) => !("recordSlug" in row))).toBe(true);
    }
    const citations = store.repos.tables.dump("citations");
    importRecord(store, stageDir, { replace: true });
    expect(facts.map((key) => store.repos.tables.dump(key))).toEqual(before);
    expect(store.repos.tables.dump("citations")).toEqual(citations);
    expect(store.repos.stageClears.count()).toBe(clears.length);
  });

  it("ranks the clears the record accepts by stage reached, then lower power, above every other attempt", async () => {
    const store = testStore();
    importRecord(store, stageDir);
    const app = createApp(createServices(store));
    type Row = {
      chapter: number;
      stageNo: number;
      powerG: number | null;
      result: string;
      standing: string;
      sources: string[];
    };
    const rows = await readJson<Row[]>(await app.request("/api/stage-clears"));
    const group = (r: Row) =>
      r.standing === "accepted"
        ? r.result === "clear"
          ? 0
          : 1
        : r.standing === "unverified"
          ? 2
          : 3;
    const groups = rows.map(group);
    expect(groups).toEqual([...groups].sort((a, b) => a - b));
    const ranked = rows.filter((r) => group(r) === 0);
    expect(ranked.length).toBe(
      clears.filter((c) => c.standing === "accepted" && c.result === "clear").length,
    );
    for (const [above, below] of ranked.slice(1).map((r, i) => [ranked[i]!, r] as const)) {
      const reached = (r: Row) => r.chapter * 100 + r.stageNo;
      expect(reached(above)).toBeGreaterThanOrEqual(reached(below));
      if (reached(above) === reached(below))
        expect(above.powerG!).toBeLessThanOrEqual(below.powerG!);
    }
    expect(rows[0]).toMatchObject({ chapter: 328, stageNo: 30, standing: "accepted" });
    expect(rows[0]!.sources).toEqual(["dc:76835"]);
    const rejected = rows.find((r) => r.sources.includes("dc:76779"))!;
    expect(rows.indexOf(rejected)).toBe(rows.length - 1);
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

  it("checks the entry powers of a record without a brackets file against the stored brackets", () => {
    const withoutBrackets = {
      "manifest.json": (file: Record<string, unknown>) => {
        delete (file.collections as Record<string, string>).powerBrackets;
      },
    };
    expect(() => importRecord(testStore(), stageCopy("907-stage-copy", withoutBrackets))).toThrow(
      /stage-chapters\.json \[0\]: power_for_\d+: no power bracket keeps \d+%/,
    );
    const store = testStore();
    importRecord(store, stageCopy("908-stage-copy"));
    const { counts } = importRecord(
      store,
      stageCopy("909-stage-copy", { ...ownDecks("-e"), ...withoutBrackets }),
    );
    expect(counts).toMatchObject({ stageClears: clears.length, powerBrackets: 0 });
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

  it("holds one Rift unlock: another record naming a different stage conflicts with it", () => {
    const store = testStore();
    importRecord(store, stageCopy("905-stage-copy"));
    const moved = stageCopy("906-stage-copy", {
      ...ownDecks("-d"),
      "rift-levels.json": (file) => {
        (file.unlock as { stage: string }).stage = "336-30";
      },
    });
    expect(() => importRecord(store, moved)).toThrow(
      /rift-levels\.json \[unlock\]: Rift unlock 336-30 conflicts with the stored game fact/,
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

describe("--replace and the game facts a record lists", FULL_IMPORT, () => {
  type Row = Record<string, unknown>;
  /**
   * Replaces the sources of the first power bracket.
   *
   * @param sources - the sources it cites afterwards
   * @returns the edit, by curated file name
   */
  const firstBracketCites = (sources: string[]) => ({
    "power-brackets.json": (file: Row) => {
      (file.brackets as Row[])[0]!.sources = sources;
    },
  });
  /** Drops the last Rift season and the last Rift level. */
  const withoutLastSeason = {
    "rift-levels.json": (file: Row) => {
      (file.seasons as Row[]).pop();
      (file.levels as Row[]).pop();
    },
  };

  it("refreshes the sources the record gives a game fact", () => {
    const store = testStore();
    importRecord(store, stageCopy("910-stage-copy"));
    importRecord(store, stageCopy("910-stage-copy", firstBracketCites(["dc:76835"])), {
      replace: true,
    });
    const [first] = createServices(store).powerBrackets.list();
    expect(first!.sources).toEqual(["dc:76835"]);
  });

  it("drops a game fact the record no longer lists", () => {
    const store = testStore();
    importRecord(store, stageCopy("911-stage-copy"));
    const seasons = rift.seasons.length;
    importRecord(store, stageCopy("911-stage-copy", withoutLastSeason), { replace: true });
    expect(store.repos.riftSeasons.count()).toBe(seasons - 1);
    expect(store.repos.riftLevels.count()).toBe(rift.levels.length - 1);
    const cited = new Set(
      store.repos.tables
        .dump("citations")
        .filter((c) => c.entity === "rift_season")
        .map((c) => Number(c.entityId)),
    );
    expect([...cited].sort((a, b) => a - b)).toEqual(
      store.repos.riftSeasons.list().map((s) => s.id),
    );
  });

  it("keeps a fact another record still lists, cited to that record's sources alone", () => {
    const store = testStore();
    importRecord(store, stageCopy("912-stage-copy", firstBracketCites(["dc:76835"])));
    importRecord(store, stageCopy("913-stage-copy", ownDecks("-b")));
    const cites = () => createServices(store).powerBrackets.list()[0]!.sources;
    expect(cites()).toEqual([...new Set([...brackets[0]!.sources, "dc:76835"])].sort());
    importRecord(store, stageCopy("912-stage-copy", withoutLastSeason), { replace: true });
    expect(store.repos.riftSeasons.count()).toBe(rift.seasons.length);
    expect(cites()).toEqual([...brackets[0]!.sources].sort());
    importRecord(store, stageCopy("913-stage-copy", { ...ownDecks("-b"), ...withoutLastSeason }), {
      replace: true,
    });
    expect(store.repos.riftSeasons.count()).toBe(rift.seasons.length - 1);
  });

  it("drops every record's claim to a fact deleted through the API", async () => {
    const store = testStore();
    importRecord(store, stageCopy("916-stage-copy"));
    const app = createApp(createServices(store));
    const [first] = store.repos.powerBrackets.list();
    expect(
      (await app.request(`/api/power-brackets/${first!.id}`, { method: "DELETE" })).status,
    ).toBe(204);
    const claims = store.repos.tables
      .dump("factClaims")
      .filter((c) => c.entity === "power_bracket" && c.entityId === String(first!.id));
    expect(claims).toEqual([]);
  });

  it("loads a changed fact the record alone claimed, and still fails one another record claims", () => {
    const store = testStore();
    /**
     * Renames the first chapter's boss.
     *
     * @param bossEn - the English name it gets
     * @returns the edit, by curated file name
     */
    const firstBoss = (bossEn: string) => ({
      "stage-chapters.json": (file: Row) => {
        (file.chapters as Row[])[0]!.boss_en = bossEn;
      },
    });
    importRecord(store, stageCopy("914-stage-copy"));
    importRecord(store, stageCopy("914-stage-copy", firstBoss("Renamed")), { replace: true });
    expect(store.repos.stageChapters.list()[0]!.bossEn).toBe("Renamed");
    importRecord(
      store,
      stageCopy("915-stage-copy", { ...ownDecks("-b"), ...firstBoss("Renamed") }),
    );
    expect(() =>
      importRecord(store, stageCopy("914-stage-copy", firstBoss("Again")), { replace: true }),
    ).toThrow(/stage chapter conflicts with the stored game fact/);
  });
});

describe("the Rift clears collection", FULL_IMPORT, () => {
  type Row = Record<string, unknown>;
  const [level1] = rift.levels as Array<{ level: number; recommended_power: number }>;
  /** A cited source of record 003, so a fixture clear's sources are curated. */
  const source = clears[0]!.sources[0]!;
  /**
   * Builds a fixture Rift clear at season 1, level 1, with `over` applied on top.
   *
   * @param over - fields to set instead
   * @returns the clear, as `rift-clears.json` holds it
   */
  const riftClear = (over: Row = {}): Row => ({
    season: 1,
    level: level1!.level,
    boss_kr: "비겁한 쿠키",
    boss_en: null,
    team_power: "2.31G",
    power_basis: "rift",
    rift_power_level: 14,
    recommended_power: level1!.recommended_power,
    bracket: 15,
    result: "clear",
    play: "manual",
    evidence: "screenshot",
    standing: "accepted",
    deck: "rift-shred",
    note: "fixture",
    sources: [source],
    ...over,
  });
  /**
   * Builds a copy of record 003 whose curated manifest lists a
   * `rift-clears.json` holding `rows`, after applying `edit`.
   *
   * @param slug - the copy's record slug
   * @param rows - the Rift clears the file holds
   * @param edit - further changes to the copy's curated files, by file name
   * @returns the copy's directory
   */
  const withRiftClears = (
    slug: string,
    rows: Row[],
    edit: Record<string, (file: Row) => void> = {},
  ): string => {
    const dir = stageCopy(slug, {
      ...edit,
      "manifest.json": (file) => {
        (file.collections as Record<string, string>).riftClears = "rift-clears.json";
      },
    });
    writeFileSync(
      join(dir, "curated", "rift-clears.json"),
      JSON.stringify({ about: "Fixture.", measured: "2026-10-03", clears: rows }),
    );
    return dir;
  };

  it("loads every clear with its sources, reading powerG from the posted power, and ranks them", async () => {
    const store = testStore();
    const { counts } = importRecord(
      store,
      withRiftClears("930-stage-copy", [
        riftClear({ level: 2, note: "lower", recommended_power: null }),
        riftClear({ team_power: "2.31G (2G 310M)", play: null, deck: null }),
        riftClear({ result: "fail", level: 3, recommended_power: null }),
        riftClear({ standing: "unverified", level: 9, recommended_power: null }),
      ]),
    );
    expect(counts).toMatchObject({ riftClears: 4 });
    const app = createApp(createServices(store));
    const rows = await readJson<
      Array<{ level: number; powerG: number; result: string; standing: string; sources: string[] }>
    >(await app.request("/api/rift-clears"));
    expect(rows.map((r) => [r.level, r.result, r.standing])).toEqual([
      [2, "clear", "accepted"],
      [1, "clear", "accepted"],
      [3, "fail", "accepted"],
      [9, "clear", "unverified"],
    ]);
    expect(rows[1]).toMatchObject({ powerG: 2.31, play: null, deckId: null, sources: [source] });
  });

  it("fails a clear whose level isn't in its season, naming the row", () => {
    const dir = withRiftClears("931-stage-copy", [riftClear(), riftClear({ level: 150 })]);
    expect(() => importRecord(testStore(), dir)).toThrow(
      /rift-clears\.json \[1\]: level 150 isn't in season 1, which runs levels 1-100/,
    );
  });

  it("fails a clear whose power is the formation screen's, since only Rift power sets a Rift bracket", () => {
    const dir = withRiftClears("938-stage-copy", [riftClear({ power_basis: "lobby" })]);
    expect(() => importRecord(testStore(), dir)).toThrow(/rift-clears\.json.*power_basis/s);
  });

  it("fails a clear at a season or a level no record loaded", () => {
    expect(() =>
      importRecord(testStore(), withRiftClears("932-stage-copy", [riftClear({ season: 99 })])),
    ).toThrow(/rift-clears\.json \[0\]: no Rift season 99 is loaded/);
    const withoutLastLevel = {
      "rift-levels.json": (file: Row) => {
        (file.levels as Row[]).pop();
      },
    };
    const last = (rift.levels as Array<{ level: number }>).at(-1)!.level;
    const dir = withRiftClears(
      "933-stage-copy",
      [riftClear({ season: 2, level: last, recommended_power: null })],
      withoutLastLevel,
    );
    expect(() => importRecord(testStore(), dir)).toThrow(
      new RegExp(`rift-clears\\.json \\[0\\]: no Rift level ${last} is loaded`),
    );
  });

  it("fails a clear whose recommended power isn't its level's", () => {
    const dir = withRiftClears("934-stage-copy", [riftClear({ recommended_power: 1 })]);
    expect(() => importRecord(testStore(), dir)).toThrow(
      /rift-clears\.json \[0\]: recommended_power is 1; level 1 recommends \d+/,
    );
  });

  it("fails a clear that names a deck of another mode, or cites a source the record doesn't curate", () => {
    const arena = withRiftClears("935-stage-copy", [riftClear()], {
      "decks.json": (file) => {
        for (const deck of file as unknown as Row[]) {
          if (deck.id === "rift-shred") deck.mode = "arena";
        }
      },
    });
    expect(() => importRecord(testStore(), arena)).toThrow(
      /rift-clears\.json \[0\]: rift_clear mode stage doesn't match deck rift-shred's mode arena/,
    );
    const uncited = withRiftClears("936-stage-copy", [riftClear({ sources: ["dc:1"] })]);
    expect(() => importRecord(testStore(), uncited)).toThrow(
      /rift-clears\.json \[0\]: unknown source ids: dc:1/,
    );
  });

  it("clears the record's Rift clears on --replace", () => {
    const store = testStore();
    importRecord(store, withRiftClears("937-stage-copy", [riftClear(), riftClear()]));
    expect(store.repos.riftClears.count()).toBe(2);
    importRecord(store, withRiftClears("937-stage-copy", [riftClear({ note: "again" })]), {
      replace: true,
    });
    expect(store.repos.riftClears.list().map((c) => c.note)).toEqual(["again"]);
  });
});

describe("a clear's powerG", FULL_IMPORT, () => {
  it("is the shared reading of its posted power, the exact breakdown over the headline", () => {
    const store = testStore();
    importRecord(store, stageCopy("920-stage-copy"));
    const rows = store.repos.stageClears.list();
    for (const row of rows) expect(row.powerG, row.teamPower).toBe(postedPowerG(row.teamPower));
    const exact = rows.find((r) => r.teamPower === "4.00G (4G 3M 599K)");
    expect(exact!.powerG).toBe(4.003599);
  });
});
