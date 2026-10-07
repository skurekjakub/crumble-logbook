import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { repoRoot } from "../../src/config";
import { importRecord } from "../../src/importers/import-record";
import { createServices } from "../../src/services";
import { readJson, testStore } from "../helpers";

const DUNGEON = "004-golden-drop-meta";
const dungeonDir = join(repoRoot, "research", DUNGEON);
/** A full import verifies the record's capture ledger, hashing its evidence on a cold cache. */
const FULL_IMPORT = { timeout: 180_000 };

type Row = Record<string, unknown>;

/**
 * Reads a curated file of record 004, parsed, with a test-asserted shape.
 *
 * @param name - the file's name in the curated directory
 * @returns the parsed file, unchecked
 */
function curated<T>(name: string): T {
  return JSON.parse(readFileSync(join(dungeonDir, "curated", name), "utf-8")) as T;
}

const runs = curated<
  Array<{
    id: string;
    evidence: string;
    board: string;
    score_g: number;
    deck: string | null;
    atk_order: string[] | null;
  }>
>("dungeon-runs.json");
const lineups =
  curated<Array<{ id: string; first40: string[]; excluded: string[]; atk_order: string[] }>>(
    "dungeon-lineups.json",
  );
const exclusions = curated<Array<{ kr: string }>>("dungeon-exclusions.json");
const decks = curated<Array<{ id: string; obsolete?: { superseded_by?: string } }>>("decks.json");
/** Decks an obsolete block ties together; changing one's mode fails that link's check first. */
const SUPERSESSION = new Set(
  decks.flatMap((d) => (d.obsolete ? [d.id, d.obsolete.superseded_by ?? d.id] : [])),
);

/** Every cookie name record 004's dungeon files give, which record 001's glossary holds. */
const COOKIES = new Set([
  ...runs.flatMap((r) => r.atk_order ?? []),
  ...lineups.flatMap((l) => [...l.first40, ...l.excluded, ...l.atk_order]),
  ...exclusions.map((e) => e.kr),
]);

/**
 * Builds an in-memory store whose glossary knows every cookie record 004
 * names, as record 001's glossary does in the real import order.
 *
 * @returns the store
 */
function dungeonStore() {
  const store = testStore();
  for (const kr of COOKIES) store.repos.glossary.upsert({ kr, en: null, kind: "cookie" });
  return store;
}

let tmp: string | undefined;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/**
 * Builds a throwaway copy of record 004's curated dataset, under its own
 * slug, with no evidence, capture rules or ledger, after applying `edit`
 * to its curated array files.
 *
 * @param slug - the copy's record slug
 * @param edit - changes each parsed curated file's rows in place, by file name
 * @returns the copy's directory
 */
function dungeonCopy(slug: string, edit: Record<string, (rows: Row[]) => void> = {}): string {
  tmp ??= mkdtempSync(join(tmpdir(), "crumble-dungeon-"));
  const dir = join(tmp, slug);
  cpSync(join(dungeonDir, "curated"), join(dir, "curated"), { recursive: true });
  mkdirSync(join(dir, "extract"), { recursive: true });
  for (const [name, change] of Object.entries(edit)) {
    const path = join(dir, "curated", name);
    const rows = JSON.parse(readFileSync(path, "utf-8")) as Row[];
    change(rows);
    writeFileSync(path, JSON.stringify(rows));
  }
  const base = JSON.parse(readFileSync(join(dungeonDir, "import.json"), "utf-8")) as {
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

describe("importRecord on research record 004", FULL_IMPORT, () => {
  it("files the record under crumble_dungeon and loads every dungeon table with its citations", () => {
    const store = dungeonStore();
    const { counts, warnings } = importRecord(store, dungeonDir);
    expect(counts).toMatchObject({
      researchRecords: 1,
      dungeonRuns: runs.length,
      dungeonLineups: lineups.length,
      dungeonExclusions: exclusions.length,
    });
    const services = createServices(store);
    expect(services.records.get(DUNGEON).mode).toBe("crumble_dungeon");
    expect(services.decks.list().every((d) => d.mode === "crumble_dungeon")).toBe(true);
    expect(services.dungeonRuns.list().every((r) => r.sources.length > 0)).toBe(true);
    const top = services.dungeonRuns.list().find((r) => r.slug === "run-sminoff-379g");
    expect(top).toMatchObject({
      scoreG: 379.313,
      totalPowerG: 15.579,
      board: "run",
      evidence: "screenshot",
      standing: "verified",
      deckId: "dungeon-milk-scorpion-figure",
      atkOrder: runs.find((r) => r.id === "run-sminoff-379g")!.atk_order,
      atkOrderNote: null,
      sources: ["dc:77306"],
    });
    expect(top!.atkOrder![0]).toBe("바삭튼튼 소아과 의사 우유맛 쿠키");
    const ndrunner = services.dungeonLineups.list().find((l) => l.slug === "ndrunner-2026-09-18");
    expect(ndrunner?.first40).toEqual(lineups.find((l) => l.id === "ndrunner-2026-09-18")!.first40);
    expect(ndrunner?.deckId).toBe("dungeon-macaron-figure-beam");
    const long = lineups.filter((l) => l.first40.length !== 40).map((l) => l.id);
    for (const id of long) expect(warnings.some((w) => w.includes(id))).toBe(true);
  });

  it("ranks the runs a screenshot or video shows by score, above every claim", async () => {
    const store = dungeonStore();
    importRecord(store, dungeonCopy("904-dungeon-copy"));
    const app = createApp(createServices(store));
    const rows = await readJson<Array<{ slug: string; scoreG: number; standing: string }>>(
      await app.request("/api/dungeon-runs"),
    );
    const shown = runs.filter((r) => r.evidence !== "text" && r.board !== "claim");
    expect(rows.slice(0, shown.length).every((r) => r.standing === "verified")).toBe(true);
    expect(rows.slice(shown.length).every((r) => r.standing === "claim")).toBe(true);
    for (const group of [rows.slice(0, shown.length), rows.slice(shown.length)]) {
      const scores = group.map((r) => r.scoreG);
      expect(scores).toEqual([...scores].sort((a, b) => b - a));
    }
    expect(rows[0]!.slug).toBe([...shown].sort((a, b) => b.score_g - a.score_g)[0]!.id);
    const claims = runs.filter((r) => !shown.includes(r)).map((r) => r.id);
    expect(rows.slice(shown.length).map((r) => r.slug)).toEqual(
      expect.arrayContaining(claims) as unknown,
    );
  });

  it("makes a run posted on the claim board a claim, whatever its evidence", () => {
    const store = dungeonStore();
    const screenshotClaim = (rows: Row[]) => {
      rows[0]!.board = "claim";
    };
    importRecord(store, dungeonCopy("909-dungeon-copy", { "dungeon-runs.json": screenshotClaim }));
    const first = store.repos.dungeonRuns.list().find((r) => r.slug === runs[0]!.id);
    expect(first).toMatchObject({ evidence: "screenshot", board: "claim", standing: "claim" });
  });

  it("reloads the dungeon tables as they were under --replace", () => {
    const store = dungeonStore();
    const dir = dungeonCopy("905-dungeon-copy");
    importRecord(store, dir);
    const keys = ["dungeonRuns", "dungeonLineups", "dungeonExclusions", "citations"] as const;
    const before = keys.map((key) => store.repos.tables.dump(key));
    importRecord(store, dir, { replace: true });
    expect(keys.map((key) => store.repos.tables.dump(key))).toEqual(before);
  });

  it("drops the rows a record no longer lists under --replace, with their citations", () => {
    const store = dungeonStore();
    importRecord(store, dungeonCopy("910-dungeon-copy"));
    const dropped = runs[0]!.id;
    const withoutFirst = (rows: Row[]) => {
      rows.shift();
    };
    importRecord(
      store,
      dungeonCopy("910-dungeon-copy", {
        "dungeon-runs.json": withoutFirst,
        "dungeon-lineups.json": withoutFirst,
        "dungeon-exclusions.json": withoutFirst,
      }),
      { replace: true },
    );
    expect(store.repos.dungeonRuns.count()).toBe(runs.length - 1);
    expect(store.repos.dungeonRuns.list().some((r) => r.slug === dropped)).toBe(false);
    expect(store.repos.dungeonLineups.count()).toBe(lineups.length - 1);
    expect(store.repos.dungeonLineups.list().some((l) => l.slug === lineups[0]!.id)).toBe(false);
    expect(store.repos.dungeonExclusions.count()).toBe(exclusions.length - 1);
    expect(store.repos.dungeonExclusions.list().some((e) => e.cookieKr === exclusions[0]!.kr)).toBe(
      false,
    );
    const runIds = new Set(store.repos.dungeonRuns.list().map((r) => String(r.id)));
    const cited = store.repos.tables.dump("citations").filter((c) => c.entity === "dungeon_run");
    expect(cited.every((c) => runIds.has(c.entityId))).toBe(true);
    expect(new Set(cited.map((c) => c.entityId)).size).toBe(runs.length - 1);
  });
});

describe("the dungeon collections' checks", FULL_IMPORT, () => {
  it("fails a run or a lineup that names a deck of another mode", () => {
    const linked = runs.findIndex((r) => r.deck !== null && !SUPERSESSION.has(r.deck));
    const runDeck = runs[linked]!.deck!;
    const toArena = (rows: Row[]) => {
      for (const deck of rows) if (deck.id === runDeck) deck.mode = "arena";
    };
    expect(() =>
      importRecord(dungeonStore(), dungeonCopy("900-dungeon-copy", { "decks.json": toArena })),
    ).toThrow(
      `dungeon-runs.json [${linked}]: dungeon_run mode crumble_dungeon doesn't match deck ${runDeck}'s mode arena`,
    );
    const lineupDeck = (rows: Row[]) => {
      for (const deck of rows) if (deck.id === "dungeon-macaron-figure-beam") deck.mode = "arena";
    };
    const noRuns = (rows: Row[]) => {
      for (const run of rows) run.deck = null;
    };
    expect(() =>
      importRecord(
        dungeonStore(),
        dungeonCopy("901-dungeon-copy", { "decks.json": lineupDeck, "dungeon-runs.json": noRuns }),
      ),
    ).toThrow(/dungeon-lineups\.json \[0\]: dungeon_lineup mode crumble_dungeon/);
  });

  it("fails a lineup whose ATK order names a cookie outside its first 40, or that both keeps and excludes a cookie", () => {
    const outside = (rows: Row[]) => {
      (rows[0]!.atk_order as string[]).push("오븐방랑자 쿠키");
    };
    expect(() =>
      importRecord(
        dungeonStore(),
        dungeonCopy("902-dungeon-copy", { "dungeon-lineups.json": outside }),
      ),
    ).toThrow(/dungeon-lineups\.json \[0\]: atk_order names 오븐방랑자 쿠키, not in first40/);
    const both = (rows: Row[]) => {
      (rows[0]!.excluded as string[]).push("마카롱맛 쿠키");
    };
    expect(() =>
      importRecord(
        dungeonStore(),
        dungeonCopy("903-dungeon-copy", { "dungeon-lineups.json": both }),
      ),
    ).toThrow(/마카롱맛 쿠키 is both in first40 and excluded/);
  });

  it("fails a lineup or exclusion naming a cookie no glossary entry has, and writes nothing", () => {
    const misspelt = (rows: Row[]) => {
      (rows[0]!.first40 as string[]).push("이온맛쿠키로봇");
    };
    const store = dungeonStore();
    expect(() =>
      importRecord(store, dungeonCopy("911-dungeon-copy", { "dungeon-lineups.json": misspelt })),
    ).toThrow(/dungeon-lineups\.json \[0\]: 이온맛쿠키로봇 is no glossary entry's Korean name/);
    expect(store.repos.dungeonRuns.count()).toBe(0);
    const unknown = (rows: Row[]) => {
      rows[0]!.kr = "오븐 방랑자 쿠키";
    };
    expect(() =>
      importRecord(
        dungeonStore(),
        dungeonCopy("912-dungeon-copy", { "dungeon-exclusions.json": unknown }),
      ),
    ).toThrow(
      /dungeon-exclusions\.json \[0\]: 오븐 방랑자 쿠키 is no glossary entry's Korean name/,
    );
    const misspeltOrder = (rows: Row[]) => {
      rows[0]!.atk_order = ["전갈 쿠키"];
    };
    expect(() =>
      importRecord(
        dungeonStore(),
        dungeonCopy("914-dungeon-copy", { "dungeon-runs.json": misspeltOrder }),
      ),
    ).toThrow(/dungeon-runs\.json \[0\]: 전갈 쿠키 is no glossary entry's Korean name/);
    expect(() => importRecord(testStore(), dungeonCopy("913-dungeon-copy"))).toThrow(
      /is no glossary entry's Korean name/,
    );
  });

  it("fails a repeated run id, and a run id another record already loaded", () => {
    const repeat = (rows: Row[]) => {
      rows[1]!.id = rows[0]!.id;
    };
    expect(() =>
      importRecord(
        dungeonStore(),
        dungeonCopy("906-dungeon-copy", { "dungeon-runs.json": repeat }),
      ),
    ).toThrow(`curated/dungeon-runs.json [1]: duplicate id "${runs[0]!.id}"`);
    const store = dungeonStore();
    importRecord(store, dungeonCopy("907-dungeon-copy"));
    const ownDecks = (rows: Row[]) => {
      for (const deck of rows) {
        deck.id = `${String(deck.id)}-b`;
        const obsolete = deck.obsolete as { superseded_by?: string } | undefined;
        if (obsolete?.superseded_by) obsolete.superseded_by = `${obsolete.superseded_by}-b`;
      }
    };
    const unlinked = (rows: Row[]) => {
      for (const row of rows) row.deck = null;
    };
    const runes = (rows: Row[]) => {
      for (const rune of rows) rune.decks = [];
    };
    expect(() =>
      importRecord(
        store,
        dungeonCopy("908-dungeon-copy", {
          "decks.json": ownDecks,
          "runes.json": runes,
          "dungeon-runs.json": unlinked,
          "dungeon-lineups.json": unlinked,
        }),
      ),
    ).toThrow(`dungeon run id "${runs[0]!.id}" is already loaded by record 907-dungeon-copy`);
  });
});
