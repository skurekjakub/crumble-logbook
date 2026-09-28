import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { repoRoot } from "../../src/config";
import { ImportError } from "../../src/errors";
import { importRecord } from "../../src/importers/import-record";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import type { TableKey } from "../../src/registry";
import { specOf, TABLE_KEYS } from "../../src/registry";
import type { Repos, Store } from "../../src/repos";
import { createServices } from "../../src/services";
import type { Snapshot } from "../../src/services/export";
import { exportSnapshot } from "../../src/services/export";
import { testStore } from "../helpers";

const CONQUEST = "001-guild-conquest-meta";
const PVP = "002-pvp-meta";
const conquestDir = join(repoRoot, "research", CONQUEST);
const pvpDir = join(repoRoot, "research", PVP);
/**
 * Each test imports whole records, several times over, and an import
 * verifies the record's capture ledger: with a cold hash cache that reads
 * and hashes every present evidence file, local media included, while
 * other test workers do the same.
 */
const FULL_IMPORT = { timeout: 180_000 };

/**
 * Reads a curated file of record 002, parsed, with a test-asserted shape.
 *
 * @param name - the file's name in the curated directory
 * @returns the parsed file, unchecked
 */
function pvp<T>(name: string): T {
  return JSON.parse(readFileSync(join(pvpDir, "curated", name), "utf-8")) as T;
}

type Cited = { sources: string[]; mode?: string };
type Rule = Cited & { title: string; topic: string };
type PvpMeta = {
  lede: string;
  you: Cited;
  modes: Record<string, { lede: string; caveat: string; rules: Rule[] }>;
};
const decks = pvp<Array<Cited & { id: string; cookies: unknown[]; pets?: string[] }>>("decks.json");
const runes = pvp<Array<Cited & { decks: string[] }>>("runes.json");
const counters =
  pvp<Array<Cited & { id: string; team: string; beaten_by: string }>>("counters.json");
const usage = pvp<Cited[]>("usage.json");
const mechanics = pvp<Cited[]>("mechanics.json");
const meta = pvp<PvpMeta>("meta.json");
const sources = pvp<Record<string, { title_en?: string }>>("sources.json");
const conquestSources = JSON.parse(
  readFileSync(join(conquestDir, "curated", "sources.json"), "utf-8"),
) as Record<string, { title_en?: string }>;
const rules = Object.values(meta.modes).flatMap((m) => m.rules);
const shared = Object.keys(sources).filter((id) => id in conquestSources);

/**
 * Collects every row of `table` in `snapshot`, keyed by its JSON, for set comparisons.
 *
 * @param snapshot - the snapshot
 * @param table - the table's registry name
 * @returns each row's JSON
 */
function rowSet(snapshot: Snapshot, table: TableKey): Set<string> {
  return new Set((snapshot.tables[table] as unknown[]).map((row) => JSON.stringify(row)));
}

/**
 * Counts the rows of `before` that `after` no longer has, per table.
 *
 * @param before - the earlier snapshot
 * @param after - the later snapshot
 * @returns lost row counts by table; empty when every row survived
 */
function lostRows(before: Snapshot, after: Snapshot): Record<string, number> {
  const lost: Record<string, number> = {};
  for (const key of TABLE_KEYS) {
    const kept = rowSet(after, key);
    const missing = [...rowSet(before, key)].filter((row) => !kept.has(row)).length;
    if (missing > 0) lost[key] = missing;
  }
  return lost;
}

/**
 * Collects the rows of `snapshot` a record owns, per table with an owner column, without their ids.
 *
 * @param snapshot - the snapshot
 * @param slug - the record's slug
 * @returns each owned row's JSON, by table
 */
function ownedContent(snapshot: Snapshot, slug: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const key of TABLE_KEYS) {
    const owner = key === "researchRecords" ? "slug" : "recordSlug";
    const rows = (snapshot.tables[key] as Array<Record<string, unknown>>).filter(
      (row) => row[owner] === slug,
    );
    if (rows.length === 0) continue;
    result[key] = rows.map(({ id: _id, ...row }) => JSON.stringify(row)).sort();
  }
  return result;
}

describe("importRecord on research record 002", FULL_IMPORT, () => {
  it("loads every deck, slot, counter, usage figure and rule into an empty database", () => {
    const store = testStore();
    const { counts } = importRecord(store, pvpDir);
    expect(counts).toMatchObject({
      sources: Object.keys(sources).length,
      decks: decks.length,
      deckCookies: decks.reduce((n, d) => n + d.cookies.length, 0),
      runeBuilds: runes.length,
      counters: counters.length,
      usageStats: usage.length,
      mechanics: mechanics.length + rules.length,
      scores: 0,
      rankings: 0,
      researchRecords: 1,
      recordModes: Object.keys(meta.modes).length,
      recommendations: 1,
    });
    const slots = store.repos.decks.allCookies().filter((c) => c.slot !== null);
    expect(slots.length).toBeGreaterThan(0);
    expect(store.repos.decks.list().every((d) => d.mode !== "guild_conquest")).toBe(true);
  });

  it("files the record under arena and lists both PvP modes with their own ledes", () => {
    const store = testStore();
    importRecord(store, pvpDir);
    const record = createServices(store).records.get(PVP);
    expect(record.mode).toBe("arena");
    expect(record.modes).toEqual([
      { mode: "arena", lede: meta.modes.arena!.lede, caveat: meta.modes.arena!.caveat },
      {
        mode: "rumble_arena",
        lede: meta.modes.rumble_arena!.lede,
        caveat: meta.modes.rumble_arena!.caveat,
      },
    ]);
  });

  it("imports each mode's rules once, as cited mechanics with topic rules", () => {
    const store = testStore();
    importRecord(store, pvpDir);
    const services = createServices(store);
    for (const [mode, block] of Object.entries(meta.modes)) {
      const listed = services.mechanics.list({ mode, topic: "rules" });
      expect(listed.map((m) => m.title)).toEqual(block.rules.map((r) => r.title));
      expect(listed.map((m) => m.sources)).toEqual(
        block.rules.map((r) => [...new Set(r.sources)].sort()),
      );
    }
    expect(services.mechanics.list({ topic: "rules" })).toHaveLength(rules.length);
  });

  it("stores each counter as a directed edge between the curated decks", () => {
    const store = testStore();
    importRecord(store, pvpDir);
    const edges = createServices(store).counters.list();
    expect(edges.map((e) => [e.slug, e.teamDeckId, e.beatenByDeckId])).toEqual(
      counters.map((c) => [c.id, c.team, c.beaten_by]),
    );
  });

  it("warns about each DC or Naver source it loads without a capture", () => {
    const { warnings } = importRecord(testStore(), pvpDir);
    const uncaptured = warnings.filter((w) => w.includes("has no capture"));
    expect(uncaptured.length).toBeGreaterThan(0);
    expect(uncaptured.some((w) => w.startsWith("source nv:44477 "))).toBe(true);
    expect(uncaptured.every((w) => /^source (dc|nv):/.test(w))).toBe(true);
    expect(importRecord(testStore(), conquestDir).warnings.some((w) => w.includes("capture"))).toBe(
      false,
    );
  });

  it("stamps every row it writes with the record's slug", () => {
    const store = testStore();
    importRecord(store, pvpDir);
    const snapshot = exportSnapshot(store);
    for (const key of TABLE_KEYS) {
      for (const row of snapshot.tables[key] as Array<Record<string, unknown>>) {
        if ("recordSlug" in row) expect(row.recordSlug, key).toBe(PVP);
      }
    }
  });
});

describe("importing several records", FULL_IMPORT, () => {
  it("adds record 002 to a database holding 001 without --replace, leaving every 001 row as it was", () => {
    const store = testStore();
    importRecord(store, conquestDir);
    const before = exportSnapshot(store);
    const { counts } = importRecord(store, pvpDir);
    expect(lostRows(before, exportSnapshot(store))).toEqual({});
    expect(counts.sources).toBe(Object.keys(sources).length - shared.length);
    expect(counts.decks).toBe(decks.length);
  });

  it("keeps the first record's row for a source both records cite, and warns that the second differs", () => {
    expect(shared.length).toBeGreaterThan(0);
    const store = testStore();
    importRecord(store, conquestDir);
    const { warnings } = importRecord(store, pvpDir);
    for (const id of shared) {
      const row = store.repos.sources.get(id)!;
      expect(row.recordSlug).toBe(CONQUEST);
      expect(row.titleEn).toBe(conquestSources[id]!.title_en);
      expect(warnings.some((w) => w.includes(`source ${id}`))).toBe(true);
    }
  });

  it("refuses to load a record that is already loaded unless replacing, and changes nothing", () => {
    const store = testStore();
    importRecord(store, conquestDir);
    importRecord(store, pvpDir);
    const before = exportSnapshot(store);
    expect(() => importRecord(store, pvpDir)).toThrow(ImportError);
    expect(() => importRecord(store, pvpDir)).toThrow(
      `record ${PVP} is already loaded; pass --replace to load it again`,
    );
    expect(exportSnapshot(store)).toEqual(before);
  });

  it("replacing one record clears and rewrites only that record's rows", () => {
    const store = testStore();
    importRecord(store, conquestDir);
    const first = importRecord(store, pvpDir);
    const withBoth = exportSnapshot(store);

    const replaced = importRecord(store, pvpDir, { replace: true });
    expect(replaced.counts).toEqual(first.counts);
    expect(exportSnapshot(store)).toEqual(withBoth);

    importRecord(store, conquestDir, { replace: true });
    const after = exportSnapshot(store);
    expect(ownedContent(after, CONQUEST)).toEqual(ownedContent(withBoth, CONQUEST));
    expect(ownedContent(after, PVP)).toEqual(ownedContent(withBoth, PVP));
    for (const key of TABLE_KEYS) {
      expect(after.tables[key].length, key).toBe(withBoth.tables[key].length);
    }
  });

  it("imports in either order to the same rows, apart from ids and shared sources", () => {
    const forward = testStore();
    importRecord(forward, conquestDir);
    importRecord(forward, pvpDir);
    const backward = testStore();
    importRecord(backward, pvpDir);
    importRecord(backward, conquestDir);
    const strip = (s: Snapshot, slug: string) => {
      const owned = ownedContent(s, slug);
      delete owned.sources;
      return owned;
    };
    expect(strip(exportSnapshot(backward), PVP)).toEqual(strip(exportSnapshot(forward), PVP));
    expect(strip(exportSnapshot(backward), CONQUEST)).toEqual(
      strip(exportSnapshot(forward), CONQUEST),
    );
  });

  it("resolves 바궁 per mode once both glossaries are loaded", async () => {
    const store = testStore();
    importRecord(store, conquestDir);
    importRecord(store, pvpDir);
    const app = createApp(createServices(store));
    const en = async (mode: string) =>
      (
        (await (
          await app.request(`/api/glossary/resolve?name=${encodeURIComponent("바궁")}&mode=${mode}`)
        ).json()) as { en: string | null }
      ).en;
    expect(await en("guild_conquest")).toBe("Princess Bari Cookie");
    expect(await en("arena")).toMatch(/^Wind Archer Cookie/);
    expect(await en("rumble_arena")).toMatch(/^Wind Archer Cookie/);
  });

  it("warns when another record's glossary claims one of this record's lookup keys", () => {
    const store = testStore();
    importRecord(store, conquestDir);
    const { warnings } = importRecord(store, pvpDir);
    expect(warnings.some((w) => w.includes('"바궁"') && w.includes(CONQUEST))).toBe(true);
  });
});

describe("ids another record already loaded", FULL_IMPORT, () => {
  let tmp: string | undefined;
  afterEach(() => {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
    tmp = undefined;
  });

  const conquestManifest = JSON.parse(
    readFileSync(join(conquestDir, "import.json"), "utf-8"),
  ) as Record<string, unknown> & { record: object };
  const cite = Object.keys(conquestSources)[0]!;

  /**
   * Builds a curated deck of mode arena with `id`, citing a record 001 source.
   *
   * @param id - the deck's slug id
   * @returns the curated deck entry
   */
  const deck = (id: string) => ({
    id,
    mode: "arena",
    name_en: id,
    status: "niche",
    cookies: [{ kr: "우유", level: "100", why: "w" }],
    sources: [cite],
  });

  /**
   * Builds a record `003-clash` from record 001's sources, glossary and
   * meta, with `decks` and `counters` as its only other content.
   *
   * @param decks - the curated decks file's entries
   * @param counters - the curated counters file's entries
   * @returns the record's temporary directory
   */
  function clashRecord(decks: object[], counters: object[]): string {
    tmp = mkdtempSync(join(tmpdir(), "crumble-clash-"));
    cpSync(join(conquestDir, "curated"), join(tmp, "curated"), { recursive: true });
    for (const file of ["runes", "gear", "scores", "mechanics", "rng", "timeline", "takeaways"]) {
      writeFileSync(join(tmp, "curated", `${file}.json`), "[]");
    }
    writeFileSync(join(tmp, "curated", "decks.json"), JSON.stringify(decks));
    writeFileSync(join(tmp, "curated", "counters.json"), JSON.stringify(counters));
    const manifestFile = join(tmp, "curated", "manifest.json");
    const curatedManifest = JSON.parse(readFileSync(manifestFile, "utf-8")) as {
      collections: Record<string, string>;
    };
    curatedManifest.collections.counters = "counters.json";
    writeFileSync(manifestFile, JSON.stringify(curatedManifest));
    mkdirSync(join(tmp, "extract"));
    writeFileSync(
      join(tmp, "import.json"),
      JSON.stringify({
        ...conquestManifest,
        record: { ...conquestManifest.record, slug: "003-clash" },
        extractions: "extract",
        captures: [],
        rankings: [],
        fightEvents: undefined,
        buffValues: undefined,
        ledger: undefined,
      }),
    );
    return tmp;
  }

  it("rejects a deck id another record loaded, naming the file, row and record, and writes nothing", () => {
    const store = testStore();
    importRecord(store, pvpDir);
    const before = exportSnapshot(store);
    const dir = clashRecord([deck("clash-new"), deck(decks[0]!.id)], []);
    expect(() => importRecord(store, dir)).toThrow(ImportError);
    expect(() => importRecord(store, dir)).toThrow(
      `curated/decks.json [1]: deck id "${decks[0]!.id}" is already loaded by record ${PVP}`,
    );
    expect(exportSnapshot(store)).toEqual(before);
  });

  it("rejects a counter slug another record loaded, naming the file, row and record, and writes nothing", () => {
    const store = testStore();
    importRecord(store, pvpDir);
    const before = exportSnapshot(store);
    const edge = {
      mode: "arena",
      team: "clash-a",
      beaten_by: "clash-b",
      why: "w",
      confidence: "low",
      sources: [cite],
    };
    const dir = clashRecord(
      [deck("clash-a"), deck("clash-b")],
      [
        { ...edge, id: "clash-a-vs-clash-b" },
        { ...edge, id: counters[0]!.id },
      ],
    );
    expect(() => importRecord(store, dir)).toThrow(ImportError);
    expect(() => importRecord(store, dir)).toThrow(
      `curated/counters.json [1]: counter slug "${counters[0]!.id}" is already loaded by record ${PVP}`,
    );
    expect(exportSnapshot(store)).toEqual(before);
  });
});

/** The table each repo write method writes, when it isn't the repo's own. */
const WRITES: Record<string, TableKey> = {
  "records.upsert": "researchRecords",
  "records.replaceModes": "recordModes",
  "decks.replaceCookies": "deckCookies",
  "decks.replacePets": "deckPets",
  "decks.replaceNotes": "deckNotes",
  "runeBuilds.replaceDecks": "runeBuildDecks",
};

/**
 * Wraps `store` so every write through a transaction's repos is logged,
 * once per table, in the order tables are first written.
 *
 * @param store - the store to wrap
 * @returns the wrapping store, and the tables in first-write order
 */
function loggingWrites(store: Store): { store: Store; order: TableKey[] } {
  const order: TableKey[] = [];
  const log = (table: TableKey) => {
    if (!order.includes(table)) order.push(table);
  };
  const wrap = (repos: Repos): Repos =>
    Object.fromEntries(
      Object.entries(repos).map(([name, repo]) => [
        name,
        new Proxy(repo as object, {
          get(target, method: string) {
            const value = (target as Record<string, unknown>)[method];
            if (typeof value !== "function") return value;
            return (...args: unknown[]) => {
              if (/^(insert|insertMany|upsert|update|replace)/.test(method)) {
                log(WRITES[`${name}.${method}`] ?? (name as TableKey));
              }
              return (value as (...a: unknown[]) => unknown).apply(target, args);
            };
          },
        }),
      ]),
    ) as unknown as Repos;
  return {
    order,
    store: { repos: store.repos, transaction: (work) => store.transaction((r) => work(wrap(r))) },
  };
}

describe("write order", FULL_IMPORT, () => {
  it("writes every table after the tables its foreign keys reference", () => {
    const { store, order } = loggingWrites(testStore());
    importRecord(store, conquestDir);
    importRecord(store, pvpDir);
    expect(order).toContain("counters");
    for (const [index, key] of order.entries()) {
      for (const fk of getTableConfig(specOf(key).table).foreignKeys) {
        const referenced = TABLE_KEYS.find(
          (k) => specOf(k).table === (fk.reference().foreignTable as unknown),
        )!;
        if (!order.includes(referenced)) continue;
        expect(order.indexOf(referenced), `${key} is written after ${referenced}`).toBeLessThan(
          index,
        );
      }
    }
  });
});

describe("shared buff values", FULL_IMPORT, () => {
  let tmp: string | undefined;
  afterEach(() => {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
    tmp = undefined;
  });

  type Manifest = { buffValues: { file: string; catalog: string; selfBuffs: object } };
  const conquestManifest = JSON.parse(
    readFileSync(join(conquestDir, "import.json"), "utf-8"),
  ) as Manifest & Record<string, unknown>;

  /**
   * Builds a record `slug` that carries record 001's sources, glossary and
   * buff capture and nothing else, with `buffValues` overriding the
   * manifest's buff block.
   *
   * @param slug - the record's slug
   * @param buffValues - fields to override in the manifest's buff block
   * @returns the record's temporary directory
   */
  function buffRecord(slug: string, buffValues: Partial<Manifest["buffValues"]> = {}): string {
    tmp = mkdtempSync(join(tmpdir(), "crumble-buffs-"));
    cpSync(join(conquestDir, "curated"), join(tmp, "curated"), { recursive: true });
    for (const file of [
      "decks",
      "runes",
      "gear",
      "scores",
      "mechanics",
      "rng",
      "timeline",
      "takeaways",
    ]) {
      writeFileSync(join(tmp, "curated", `${file}.json`), "[]");
    }
    mkdirSync(join(tmp, "extract"));
    const { buffValues: buffs } = conquestManifest;
    for (const path of [buffs.file, buffs.catalog]) {
      cpSync(join(conquestDir, path), join(tmp, path), { recursive: true });
    }
    writeFileSync(
      join(tmp, "import.json"),
      JSON.stringify({
        ...conquestManifest,
        record: { ...(conquestManifest.record as object), slug },
        extractions: "extract",
        captures: [],
        rankings: [],
        fightEvents: undefined,
        buffValues: { ...buffs, ...buffValues },
        ledger: undefined,
      }),
    );
    return tmp;
  }

  it("skips buff values another record already loaded when they are identical", () => {
    const store = testStore();
    importRecord(store, conquestDir);
    const before = store.repos.buffValues.list();
    const { counts } = importRecord(store, buffRecord("003-buffs"));
    expect(counts.buffValues).toBe(0);
    expect(store.repos.buffValues.list()).toEqual(before);
  });

  it("fails loudly on a buff value that conflicts with another record's, and writes nothing", () => {
    const store = testStore();
    importRecord(store, conquestDir);
    const before = exportSnapshot(store);
    const dir = buffRecord("003-buffs", { selfBuffs: {} });
    expect(() => importRecord(store, dir)).toThrow(ImportError);
    expect(() => importRecord(store, dir)).toThrow(
      /conflicts with the one record 001-guild-conquest-meta loaded/,
    );
    expect(exportSnapshot(store)).toEqual(before);
  });
});
