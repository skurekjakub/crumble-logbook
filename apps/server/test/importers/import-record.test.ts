import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { repoRoot } from "../../src/config";
import { ImportError } from "../../src/errors";
import { importRecord } from "../../src/importers/import-record";
import type { Store } from "../../src/repos";
import { createServices } from "../../src/services";
import { exportSnapshot } from "../../src/services/export";
import { testStore } from "../helpers";

const recordDir = join(repoRoot, "research", "001-guild-conquest-meta");

/**
 * Reads a curated file of record 001, parsed, with a test-asserted shape.
 *
 * @param name - the file's name in the curated directory
 * @returns the parsed file, unchecked
 */
function curated<T>(name: string): T {
  return JSON.parse(readFileSync(join(recordDir, "curated", name), "utf-8")) as T;
}

type Cited = { sources: string[] };
type CuratedDeck = Cited & {
  cookies: unknown[];
  pets?: string[];
  substitutions?: string[];
  unorthodox?: string[];
};
const decks = curated<CuratedDeck[]>("decks.json");
const runes = curated<Array<Cited & { decks: string[] }>>("runes.json");
const gear = curated<Cited[]>("gear.json");
const scores = curated<Cited[]>("scores.json");
const mechanics = curated<Cited[]>("mechanics.json");
const rng = curated<Cited[]>("rng.json");
const timeline = curated<Cited[]>("timeline.json");
const takeaways = curated<Cited[]>("takeaways.json");
const glossary = curated<unknown[]>("glossary.json");
const sources = curated<Record<string, unknown>>("sources.json");
const meta = curated<{ lede: string; you: Cited }>("meta.json");

/**
 * Reads a JSON file of record 001 by its record-relative path, with a test-asserted shape.
 *
 * @param path - the file's record-relative path
 * @returns the parsed file, unchecked
 */
function recordJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(recordDir, path), "utf-8")) as T;
}

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
const distinct = (ids: string[]) => new Set(ids).size;

type Manifest = {
  fightEvents: { file: string; sourceAliases: Record<string, string> };
  buffValues: {
    file: string;
    catalog: string;
    cookies: string[];
    selfBuffs: Record<string, string[]>;
  };
};
const manifest = recordJson<Manifest>("import.json");
const encounter = recordJson<{
  encounter: { timeline: Array<Cited & { event: string; t_seconds: number | null }> };
}>(manifest.fightEvents.file);
const fightTimeline = encounter.encounter.timeline;
const catalog = recordJson<{ cookies: Array<{ gameId: number; name: { ko: string } }> }>(
  manifest.buffValues.catalog,
);
const buffCapture = recordJson<{
  recommendations: Record<string, { grades: Record<string, { buffs: []; debuffs: [] }> }>;
}>(manifest.buffValues.file);
const buffRowsPerCookie = manifest.buffValues.cookies.map((kr) => {
  const gameId = catalog.cookies.find((c) => c.name.ko === kr)!.gameId;
  const grades = Object.values(buffCapture.recommendations[String(gameId)]!.grades);
  return sum(grades.map((g) => g.buffs.length + g.debuffs.length));
});
const alias = (id: string) => manifest.fightEvents.sourceAliases[id] ?? id;

/**
 * Counts the data lines (every non-blank line after the header) of an evidence TSV.
 *
 * @param file - the TSV's name in the crumb.gg evidence directory
 * @returns the number of data lines
 */
function tsvDataLines(file: string): number {
  const text = readFileSync(join(recordDir, "evidence", "15-crumbgg", file), "utf-8");
  return text.split(/\r?\n/).filter((line) => line.trim() !== "").length - 1;
}

const citedRows: Cited[] = [
  ...decks,
  ...runes,
  ...gear,
  ...scores,
  ...mechanics,
  ...rng,
  ...timeline,
  ...takeaways,
];

const expectedCounts = {
  sources: Object.keys(sources).length,
  researchRecords: 1,
  recordModes: 0,
  captures: readFileSync(join(recordDir, "evidence", "captures.jsonl"), "utf-8")
    .trimEnd()
    .split("\n").length,
  glossary: glossary.length,
  decks: decks.length,
  deckCookies: sum(decks.map((d) => d.cookies.length)),
  deckPets: sum(decks.map((d) => d.pets?.length ?? 0)),
  deckNotes: sum(decks.map((d) => (d.substitutions?.length ?? 0) + (d.unorthodox?.length ?? 0))),
  runeBuilds: runes.length,
  runeBuildDecks: sum(runes.map((r) => distinct(r.decks))),
  gearRecs: gear.length,
  scores: scores.length,
  rankings:
    tsvDataLines("11-players.tsv") +
    tsvDataLines("12-guilds.tsv") +
    tsvDataLines("13-power-top500.tsv"),
  mechanics: mechanics.length,
  rngFactors: rng.length,
  timeline: timeline.length,
  takeaways: takeaways.length,
  recommendations: 1,
  fightEvents: fightTimeline.length,
  buffValues: sum(buffRowsPerCookie),
  counters: 0,
  usageStats: 0,
  citations:
    sum(citedRows.map((r) => distinct(r.sources))) +
    distinct(meta.you.sources) +
    sum(fightTimeline.map((e) => distinct(e.sources.map(alias)))) +
    sum(buffRowsPerCookie),
};

/**
 * Reads the row count of every table back from the database, through a full snapshot.
 *
 * @param store - the store to read
 * @returns row counts, by table
 */
function tableCounts(store: Store): Record<string, number> {
  return Object.fromEntries(
    Object.entries(exportSnapshot(store).tables).map(([k, rows]) => [k, rows.length]),
  );
}

describe("importRecord on research record 001", () => {
  it("loads every curated row, ranking and citation", () => {
    const store = testStore();
    const { counts } = importRecord(store, recordDir);
    expect(counts).toEqual(expectedCounts);
    expect(tableCounts(store)).toEqual(expectedCounts);
  });

  it("keeps the 1999G score on the cherry deck, citing dc:76235", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const score = store.repos.scores.list().find((s) => Math.floor(s.damageG) === 1999);
    expect(score?.deckId).toBe("cherry");
    const cited = store.repos.citations
      .sourcesFor("score", [String(score!.id)])
      .get(String(score!.id));
    expect(cited).toContain("dc:76235");
  });

  it("fills capture paths that exist on disk and summaries from the extractions", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const dc = store.repos.sources.get("dc:76135");
    expect(dc?.capturePath).toBeTruthy();
    expect(existsSync(join(repoRoot, dc!.capturePath!))).toBe(true);
    expect(store.repos.sources.get("nv:43653")?.summaryEn).toBeTruthy();
    expect(store.repos.sources.get("web:allthingshow-guild-conquest")?.date).toBeNull();
  });

  it("writes the record row with the curated lede and the manifest's question", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const record = store.repos.records.get("001-guild-conquest-meta");
    expect(record?.lede).toBe(meta.lede);
    expect(record?.status).toBe("active");
    expect(record?.startedAt).toBe("2026-09-27");
    expect(record?.question).toMatch(/^There is a small, documented set of Guild Conquest teams/);
  });

  it("stores Tea Knight's grade-9 boss-damage buff as 70% BossDamageRateAddition from 9 stars", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const row = store.repos.buffValues
      .list()
      .find(
        (b) =>
          b.cookieKr === "실론나이트 쿠키" &&
          b.skillGrade === 9 &&
          b.effectType === "BossDamageRateAddition",
      );
    expect(row).toMatchObject({
      fromStar: 9,
      valuePct: 70,
      maxStack: 1,
      base: "Fixed",
      scalesWithCasterAmp: true,
    });
    expect(store.repos.citations.sourcesFor("buff_value", [String(row!.id)])).toEqual(
      new Map([[String(row!.id), ["web:sugarpocket-bundle-1.4.002"]]]),
    );
  });

  it("maps each skill grade to the first star that reaches it, and stores Dark Choco's debuff as its application chance", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const rows = store.repos.buffValues.list();
    const pomegranate = rows.filter((b) => b.cookieKr === "석류맛 쿠키");
    expect(pomegranate.map((b) => [b.skillGrade, b.fromStar])).toEqual([
      [0, 0],
      [1, 1],
      [3, 3],
      [5, 5],
      [7, 7],
      [9, 9],
    ]);
    const milk = rows.find(
      (b) => b.cookieKr === "바삭튼튼 소아과 의사 우유맛 쿠키" && b.skillGrade === 9,
    );
    expect(milk).toMatchObject({ valuePct: 10, base: "CastersAttackPoint", maxStack: 10 });
    const darkChoco = rows.filter((b) => b.cookieKr === "다크초코 쿠키");
    expect(darkChoco).toHaveLength(6);
    for (const row of darkChoco) {
      expect(row).toMatchObject({
        effectType: "DefensePointReductionChance",
        valuePct: 20,
        scalesWithCasterAmp: false,
      });
    }
  });

  it("targets exactly the manifest's self buffs at the caster, and every other row at the team", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const self = store.repos.buffValues.list().filter((b) => b.target === "self");
    expect(self.length).toBeGreaterThan(0);
    for (const row of self) {
      expect(manifest.buffValues.selfBuffs[row.cookieKr]).toContain(row.effectType);
    }
    const teaDef = store.repos.buffValues
      .list()
      .filter((b) => b.cookieKr === "실론나이트 쿠키" && b.effectType === "DefensePointMultiplier");
    expect(teaDef.map((b) => b.target)).toEqual(teaDef.map(() => "self"));
    expect(
      store.repos.buffValues
        .list()
        .filter((b) => b.effectType === "BossDamageRateAddition")
        .every((b) => b.target === "team"),
    ).toBe(true);
  });

  it("stores fight events on the elapsed clock, converting the countdown-timed ones", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const events = store.repos.fightEvents.list();
    const at = (event: string) => events.find((e) => e.event === event)?.tElapsed;
    expect(events.every((e) => e.boss === "pinata")).toBe(true);
    expect(at("engage")).toBe(0);
    expect(at("slam_pattern")).toBe(30);
    expect(at("mob_wave_hit")).toBe(33);
    expect(at("chip_deaths_begin")).toBe(41);
    expect(at("super_jump_wipe")).toBe(43);
    expect(at("unresolved_final_dr_stage")).toBeNull();
  });

  it("cites each fight event's own sources, through the manifest's aliases", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const wipe = store.repos.fightEvents.list().find((e) => e.event === "super_jump_wipe")!;
    expect(
      store.repos.citations.sourcesFor("fight_event", [String(wipe.id)]).get(String(wipe.id)),
    ).toEqual(["dc:69250", "dc:69358", "dc:71028", "dc:76583"]);
  });

  it("claims 전투력 and 투력 once each, so neither glossary key is contested", () => {
    const { warnings } = importRecord(testStore(), recordDir);
    const contested = warnings.filter((w) => w.startsWith("glossary key "));
    expect(contested.some((w) => w.includes('"투력"') || w.includes('"전투력"'))).toBe(false);
  });
});

describe("importRecord guards", () => {
  it("refuses a second import without replace and leaves the database unchanged", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const before = exportSnapshot(store);
    expect(() => importRecord(store, recordDir)).toThrow(ImportError);
    expect(() => importRecord(store, recordDir)).toThrow(
      "record 001-guild-conquest-meta is already loaded; pass --replace to load it again",
    );
    expect(exportSnapshot(store)).toEqual(before);
  });

  it("replaces the content with replace, ending at the same counts", () => {
    const store = testStore();
    const first = importRecord(store, recordDir);
    const second = importRecord(store, recordDir, { replace: true });
    expect(second.counts).toEqual(first.counts);
    expect(tableCounts(store)).toEqual(expectedCounts);
  });

  it("loads next to rows no record owns, and replace keeps them", () => {
    const store = testStore();
    const stray = store.repos.fightEvents.insert({
      boss: "stray",
      tElapsed: 1,
      event: "stray",
      detail: "not from the record",
      confidence: "low",
    });
    importRecord(store, recordDir);
    store.repos.buffValues.insert({
      cookieKr: "stray",
      effectType: "Stray",
      skillGrade: 0,
      fromStar: 0,
      valuePct: 1,
      maxStack: null,
      base: "Fixed",
      scalesWithCasterAmp: true,
    });
    importRecord(store, recordDir, { replace: true });
    expect(store.repos.fightEvents.get(stray.id)?.boss).toBe("stray");
    expect(store.repos.buffValues.list().some((b) => b.cookieKr === "stray")).toBe(true);
    expect(tableCounts(store)).toEqual({
      ...expectedCounts,
      fightEvents: expectedCounts.fightEvents + 1,
      buffValues: expectedCounts.buffValues + 1,
    });
  });

  it("files record 001 under Guild Conquest, covering no other mode, with every row stamped", () => {
    const store = testStore();
    importRecord(store, recordDir);
    expect(createServices(store).records.get("001-guild-conquest-meta")).toMatchObject({
      mode: "guild_conquest",
      modes: [],
    });
    const snapshot = exportSnapshot(store);
    for (const [table, rows] of Object.entries(snapshot.tables)) {
      for (const row of rows as Array<Record<string, unknown>>) {
        if ("recordSlug" in row) expect(row.recordSlug, table).toBe("001-guild-conquest-meta");
        if ("mode" in row) expect(row.mode, table).toBe("guild_conquest");
      }
    }
  });

  it("a replace import over a populated database exports the same snapshot as a fresh import, ids included", () => {
    const fresh = testStore();
    importRecord(fresh, recordDir);
    const replaced = testStore();
    importRecord(replaced, recordDir);
    importRecord(replaced, recordDir, { replace: true });
    expect(exportSnapshot(replaced)).toEqual(exportSnapshot(fresh));
  });
});

describe("importRecord validation", () => {
  let tmp: string | undefined;
  afterEach(() => {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
    tmp = undefined;
  });

  /**
   * Builds a throwaway record from record 001's curated files, with one
   * collection (`file`, unless `null`) rewritten by `mutate`. The manifest
   * has no captures, rankings, fight events, buff values or ledger, unless
   * `opts.manifest` sets them; `opts.evidence` lists record-relative files
   * to copy over from record 001.
   *
   * @param file - the curated collection file to rewrite, or `null` for none
   * @param mutate - rewrites the collection's rows in place
   * @param opts - manifest overrides and evidence files to copy
   * @returns the record's temporary directory
   */
  function tempRecord(
    file: string | null,
    mutate: (rows: Array<Record<string, unknown>>) => void,
    opts: { manifest?: Record<string, unknown>; evidence?: string[] } = {},
  ): string {
    tmp = mkdtempSync(join(tmpdir(), "crumble-record-"));
    cpSync(join(recordDir, "curated"), join(tmp, "curated"), { recursive: true });
    mkdirSync(join(tmp, "extract"));
    for (const path of opts.evidence ?? []) {
      cpSync(join(recordDir, path), join(tmp, path), { recursive: true });
    }
    const base = recordJson<Record<string, unknown>>("import.json");
    writeFileSync(
      join(tmp, "import.json"),
      JSON.stringify({
        ...base,
        extractions: "extract",
        captures: [],
        rankings: [],
        fightEvents: undefined,
        buffValues: undefined,
        ledger: undefined,
        ...opts.manifest,
      }),
    );
    if (file !== null) editJson(tmp, join("curated", file), mutate);
    return tmp;
  }

  /**
   * Rewrites the JSON file at the record-relative `path` of `dir` with `mutate`.
   *
   * @param dir - the record directory
   * @param path - the file's record-relative path
   * @param mutate - edits the parsed file in place
   */
  function editJson<T>(dir: string, path: string, mutate: (value: T) => void): void {
    const value = JSON.parse(readFileSync(join(dir, path), "utf-8")) as T;
    mutate(value);
    writeFileSync(join(dir, path), JSON.stringify(value));
  }

  const rankingSpecs = recordJson<{ rankings: Array<Record<string, unknown> & { file: string }> }>(
    "import.json",
  ).rankings;
  /**
   * Finds record 001's manifest entry for the ranking TSV whose path ends in `file`.
   *
   * @param file - the end of the TSV's path
   * @returns the ranking spec
   */
  const rankingSpec = (file: string) => rankingSpecs.find((spec) => spec.file.endsWith(file))!;

  /**
   * Asserts that every table's row count is zero.
   *
   * @param store - the store to check
   */
  function expectEmpty(store: Store): void {
    expect(Object.values(tableCounts(store)).every((n) => n === 0)).toBe(true);
  }

  it("accepts a curated manifest that leaves out scores, counters and usage", () => {
    const dir = tempRecord(null, () => {});
    editJson<{ collections: Record<string, string> }>(dir, "curated/manifest.json", (m) => {
      delete m.collections.scores;
    });
    const { counts } = importRecord(testStore(), dir);
    expect(counts.scores).toBe(0);
    expect(counts.counters).toBe(0);
    expect(counts.usageStats).toBe(0);
  });

  it("warns about a glossary key that more than one entry claims, naming the winner", () => {
    const dir = tempRecord("glossary.json", (rows) => {
      const power = rows.find((r) => r.kr === "전투력")!;
      rows.push({ ...power, kr: "투력 (copy)", kr_short: ["전투력"], en: "copy" });
    });
    const { warnings } = importRecord(testStore(), dir);
    expect(warnings).toContainEqual(
      expect.stringMatching(
        /^glossary key "전투력" is claimed by .*"투력 \(copy\)".*; it resolves to/,
      ),
    );
  });

  it("rejects a counter whose decks aren't curated decks, naming the file and row", () => {
    const dir = tempRecord(null, () => {});
    writeFileSync(
      join(dir, "curated", "counters.json"),
      JSON.stringify([
        {
          id: "cherry-vs-nothing",
          mode: "guild_conquest",
          team: "cherry",
          beaten_by: "no-such-deck",
          why: "w",
          confidence: "low",
          sources: ["dc:76135"],
        },
      ]),
    );
    editJson<{ collections: Record<string, string> }>(dir, "curated/manifest.json", (m) => {
      m.collections.counters = "counters.json";
    });
    const store = testStore();
    expect(() => importRecord(store, dir)).toThrow(
      /counters\.json \[0\]: unknown deck ids: no-such-deck/,
    );
    expectEmpty(store);
  });

  it("rejects a counter filed under another mode than its decks, naming the file and row", () => {
    const dir = tempRecord(null, () => {});
    const edge = {
      mode: "guild_conquest",
      team: "cherry",
      beaten_by: "meso",
      why: "w",
      confidence: "low",
      sources: ["dc:76135"],
    };
    writeFileSync(
      join(dir, "curated", "counters.json"),
      JSON.stringify([
        { ...edge, id: "cherry-vs-meso" },
        { ...edge, id: "cherry-vs-meso-arena", mode: "arena" },
      ]),
    );
    editJson<{ collections: Record<string, string> }>(dir, "curated/manifest.json", (m) => {
      m.collections.counters = "counters.json";
    });
    const store = testStore();
    expect(() => importRecord(store, dir)).toThrow(ImportError);
    expect(() => importRecord(store, dir)).toThrow(
      /counters\.json \[1\]: counter mode arena doesn't match deck cherry's mode guild_conquest/,
    );
    expectEmpty(store);
  });

  it("rejects a rule filed under another mode's block, naming the row", () => {
    const dir = tempRecord(null, () => {});
    editJson<Record<string, unknown>>(dir, "curated/meta.json", (meta) => {
      meta.modes = {
        arena: {
          rules: [
            {
              mode: "rumble_arena",
              topic: "rules",
              title: "Format",
              body: "b",
              confidence: "high",
              sources: ["dc:76135"],
            },
          ],
        },
      };
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /meta\.json \[modes\.arena\.rules 0\]: a rule in the arena block has mode rumble_arena/,
    );
  });

  it("files a row that states no mode under the record's mode, and keeps a row's own mode", () => {
    const base = recordJson<{ record: Record<string, unknown> }>("import.json");
    const dir = tempRecord(
      "takeaways.json",
      (rows) => {
        rows[0]!.mode = "rumble_arena";
      },
      { manifest: { record: { ...base.record, mode: "arena" } } },
    );
    const store = testStore();
    importRecord(store, dir);
    expect(new Set(store.repos.decks.list().map((d) => d.mode))).toEqual(new Set(["arena"]));
    const takeaways = store.repos.takeaways.list();
    expect(takeaways.find((t) => t.position === 0)?.mode).toBe("rumble_arena");
    expect(takeaways.filter((t) => t.position > 0).every((t) => t.mode === "arena")).toBe(true);
  });

  it("rejects a row that states no mode when the record states none, naming the file and row", () => {
    const base = recordJson<{ record: Record<string, unknown> }>("import.json");
    const dir = tempRecord(null, () => {}, {
      manifest: { record: { ...base.record, mode: undefined } },
    });
    const store = testStore();
    expect(() => importRecord(store, dir)).toThrow(ImportError);
    expect(() => importRecord(store, dir)).toThrow(
      /decks\.json \[0\]: the row states no mode, and import\.json's record has none/,
    );
    expectEmpty(store);
  });

  it("rejects a cited source id that isn't curated, naming the file and row, and writes nothing", () => {
    const dir = tempRecord("scores.json", (rows) => {
      rows[3]!.sources = ["dc:0"];
    });
    const store = testStore();
    expect(() => importRecord(store, dir)).toThrow(ImportError);
    expect(() => importRecord(store, dir)).toThrow(/scores\.json \[3\]: unknown source ids: dc:0/);
    expectEmpty(store);
  });

  it("rejects a score deck that isn't a curated deck", () => {
    const dir = tempRecord("scores.json", (rows) => {
      rows[0]!.deck = "no-such-deck";
    });
    const store = testStore();
    expect(() => importRecord(store, dir)).toThrow(
      /scores\.json \[0\]: unknown deck ids: no-such-deck/,
    );
    expectEmpty(store);
  });

  it("rejects a rune deck that isn't a curated deck", () => {
    const dir = tempRecord("runes.json", (rows) => {
      rows[1]!.decks = ["cherry", "no-such-deck"];
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /runes\.json \[1\]: unknown deck ids: no-such-deck/,
    );
  });

  it("reports a schema failure with the file, row and issue path", () => {
    const dir = tempRecord("mechanics.json", (rows) => {
      rows[2]!.confidence = "certain";
    });
    const store = testStore();
    expect(() => importRecord(store, dir)).toThrow(/mechanics\.json \[2\]: confidence: /);
    expectEmpty(store);
  });

  it("rejects a fight event citing a source that isn't curated, naming the file and row, and writes nothing", () => {
    const dir = tempRecord(null, () => {}, {
      manifest: { fightEvents: manifest.fightEvents },
      evidence: [manifest.fightEvents.file],
    });
    editJson<typeof encounter>(dir, manifest.fightEvents.file, (file) => {
      file.encounter.timeline[4]!.sources = ["dc:0"];
    });
    const store = testStore();
    expect(() => importRecord(store, dir)).toThrow(
      /kr-encounter\.json \[timeline 4\]: unknown source ids: dc:0/,
    );
    expectEmpty(store);
  });

  it("rejects a countdown entry naming an event the timeline doesn't have", () => {
    const dir = tempRecord(null, () => {}, {
      manifest: {
        fightEvents: { ...manifest.fightEvents, countdown: { no_such_event: 10 } },
      },
      evidence: [manifest.fightEvents.file],
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /countdown names event "no_such_event", which the timeline doesn't have/,
    );
  });

  it("rejects a debuff whose effect has no effect type in the manifest", () => {
    const dir = tempRecord(null, () => {}, {
      manifest: { buffValues: { ...manifest.buffValues, debuffEffects: {} } },
      evidence: [manifest.buffValues.file, manifest.buffValues.catalog],
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /skills-runes-1\.4\.002\.json \[다크초코 쿠키 grade 0\]: debuff effect "방어력이 감소합니다\." has no effect type/,
    );
  });

  it("rejects a self buff that matches no buff value, naming the manifest entry", () => {
    const dir = tempRecord(null, () => {}, {
      manifest: {
        buffValues: { ...manifest.buffValues, selfBuffs: { "실론나이트 쿠키": ["NoSuchEffect"] } },
      },
      evidence: [manifest.buffValues.file, manifest.buffValues.catalog],
    });
    const store = testStore();
    expect(() => importRecord(store, dir)).toThrow(
      /import\.json \[buffValues\.selfBuffs 실론나이트 쿠키\]: no buff value of "실론나이트 쿠키" has effect type NoSuchEffect/,
    );
    expectEmpty(store);
  });

  it("rejects two buff values with the same cookie, effect type and grade before writing", () => {
    const dir = tempRecord(null, () => {}, {
      manifest: {
        buffValues: { ...manifest.buffValues, cookies: ["다크초코 쿠키", "다크초코 쿠키"] },
      },
      evidence: [manifest.buffValues.file, manifest.buffValues.catalog],
    });
    const store = testStore();
    expect(() => importRecord(store, dir)).toThrow(
      /skills-runes-1\.4\.002\.json \[다크초코 쿠키 grade 0\]: duplicate buff value \(effect type DefensePointReductionChance\)/,
    );
    expectEmpty(store);
  });

  it("rejects a buff cookie that isn't a glossary kr", () => {
    const dir = tempRecord(null, () => {}, {
      manifest: { buffValues: { ...manifest.buffValues, cookies: ["실론"] } },
      evidence: [manifest.buffValues.file, manifest.buffValues.catalog],
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /import\.json \[buffValues\.cookies 0\]: "실론" isn't a glossary kr/,
    );
  });

  it("rejects two ranking rows with the same board, season, rank and capture date, a null season included", () => {
    const power = rankingSpec("13-power-top500.tsv");
    const dir = tempRecord(null, () => {}, {
      manifest: { rankings: [power, power] },
      evidence: [power.file],
    });
    const store = testStore();
    expect(() => importRecord(store, dir)).toThrow(ImportError);
    expect(() => importRecord(store, dir)).toThrow(
      /13-power-top500\.tsv \[line 2\]: duplicate ranking \(board power, season null, rank 1, captured 2026-09-27\), first seen at evidence\/15-crumbgg\/13-power-top500\.tsv line 2/,
    );
    expectEmpty(store);
  });
});

describe("importRecord rollback", () => {
  /**
   * Wraps `store` so every transaction's buff-value inserts throw, the last
   * write of a record 001 import: the replace has cleared every table and
   * rewritten the rest by then. Records how many buff values the
   * transaction saw at the failing insert.
   *
   * @param store - the store to wrap
   * @returns the failing store, and the buff-value counts seen at each failed insert
   */
  function failingOnBuffInsert(store: Store) {
    const seen: number[] = [];
    const failing: Store = {
      repos: store.repos,
      transaction: (work) =>
        store.transaction((repos) =>
          work({
            ...repos,
            buffValues: {
              ...repos.buffValues,
              insert: () => {
                seen.push(repos.buffValues.count());
                throw new Error("buff insert failed");
              },
            },
          }),
        ),
    };
    return { failing, seen };
  }

  it("a replace that fails inside its transaction, after the clear, keeps the prior rows and id counters", () => {
    const store = testStore();
    importRecord(store, recordDir);
    // Drop the highest-id score, so its id is in `sqlite_sequence` but in no
    // row: only an intact counter makes the next score skip past it.
    const last = Math.max(...store.repos.scores.list().map((score) => score.id));
    createServices(store).scores.remove(last);
    const before = exportSnapshot(store);

    const { failing, seen } = failingOnBuffInsert(store);
    expect(() => importRecord(failing, recordDir, { replace: true })).toThrow("buff insert failed");
    expect(seen).toEqual([0]);

    expect(exportSnapshot(store)).toEqual(before);
    const next = store.repos.scores.insert({ damageG: 1, verified: false });
    expect(next.id).toBe(last + 1);
  });
});
