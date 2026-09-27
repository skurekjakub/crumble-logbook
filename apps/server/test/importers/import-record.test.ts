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
import { exportSnapshot } from "../../src/services/export";
import { testStore } from "../helpers";

const recordDir = join(repoRoot, "research", "001-guild-conquest-meta");

/** Reads a curated file of record 001, parsed, with a test-asserted shape. */
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

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
const distinct = (ids: string[]) => new Set(ids).size;

/** Data lines (every non-blank line after the header) of an evidence TSV. */
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
  citations: sum(citedRows.map((r) => distinct(r.sources))) + distinct(meta.you.sources),
};

/** Row counts per table, read back from the database through a full snapshot. */
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

  it("warns about glossary keys that more than one entry claims", () => {
    const { warnings } = importRecord(testStore(), recordDir);
    expect(warnings.some((w) => w.includes('"투력"') && w.includes("전투력"))).toBe(true);
  });
});

describe("importRecord guards", () => {
  it("refuses a second import without replace and leaves the database unchanged", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const before = exportSnapshot(store);
    expect(() => importRecord(store, recordDir)).toThrow(ImportError);
    expect(() => importRecord(store, recordDir)).toThrow(
      "database already has content; pass --replace to load record 001-guild-conquest-meta over it",
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
});

describe("importRecord validation", () => {
  let tmp: string | undefined;
  afterEach(() => {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
    tmp = undefined;
  });

  /**
   * Builds a throwaway record from record 001's curated files, with one
   * collection rewritten, no captures and no rankings.
   */
  function tempRecord(
    file: string,
    mutate: (rows: Array<Record<string, unknown>>) => void,
  ): string {
    tmp = mkdtempSync(join(tmpdir(), "crumble-record-"));
    cpSync(join(recordDir, "curated"), join(tmp, "curated"), { recursive: true });
    mkdirSync(join(tmp, "extract"));
    const manifest = JSON.parse(readFileSync(join(recordDir, "import.json"), "utf-8")) as Record<
      string,
      unknown
    >;
    writeFileSync(
      join(tmp, "import.json"),
      JSON.stringify({ ...manifest, extractions: "extract", captures: [], rankings: [] }),
    );
    const path = join(tmp, "curated", file);
    const rows = JSON.parse(readFileSync(path, "utf-8")) as Array<Record<string, unknown>>;
    mutate(rows);
    writeFileSync(path, JSON.stringify(rows));
    return tmp;
  }

  /** Every table's row count is zero. */
  function expectEmpty(store: Store): void {
    expect(Object.values(tableCounts(store)).every((n) => n === 0)).toBe(true);
  }

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
});
