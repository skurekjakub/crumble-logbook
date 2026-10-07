import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { repoRoot } from "../../src/config";
import { importRecord } from "../../src/importers/import-record";
import type { Store } from "../../src/repos";
import { testStore } from "../helpers";

const pvpDir = join(repoRoot, "research", "002-pvp-meta");
const stageDir = join(repoRoot, "research", "003-stage-pushing-meta");
const dungeonDir = join(repoRoot, "research", "004-golden-drop-meta");
/** Importing a copy of record 002 reads every curated file; the copy has no ledger to hash. */
const IMPORT = { timeout: 60_000 };

type Row = Record<string, unknown>;

let tmp: string | undefined;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/**
 * Builds a throwaway copy of record 002's curated dataset, under its own
 * slug, with no evidence, capture rules or ledger, after applying `edit`
 * to its curated array files.
 *
 * @param slug - the copy's record slug
 * @param edit - changes each parsed curated file's rows in place, by file name
 * @returns the copy's directory
 */
function pvpCopy(slug: string, edit: Record<string, (rows: Row[]) => void> = {}): string {
  return recordCopy(pvpDir, slug, edit);
}

/** The refresh round the copies stand for: their `meta.json` is updated on it. */
const ROUND = "2026-10-12";

/**
 * Builds a throwaway copy of a record's curated dataset, under its own
 * slug, with no evidence, capture rules or ledger, updated on {@link ROUND}
 * as a refresh round leaves it, after applying `edit` to its curated array
 * files.
 *
 * @param recordDir - the record to copy
 * @param slug - the copy's record slug
 * @param edit - changes each parsed curated file's rows in place, by file name
 * @returns the copy's directory
 */
function recordCopy(
  recordDir: string,
  slug: string,
  edit: Record<string, (rows: Row[]) => void> = {},
): string {
  tmp ??= mkdtempSync(join(tmpdir(), "crumble-obsolete-"));
  const dir = join(tmp, slug);
  cpSync(join(recordDir, "curated"), join(dir, "curated"), { recursive: true });
  mkdirSync(join(dir, "extract"), { recursive: true });
  const metaPath = join(dir, "curated", "meta.json");
  const meta = JSON.parse(readFileSync(metaPath, "utf-8")) as Row;
  writeFileSync(metaPath, JSON.stringify({ ...meta, updated: ROUND }));
  for (const [name, change] of Object.entries(edit)) {
    const path = join(dir, "curated", name);
    const rows = JSON.parse(readFileSync(path, "utf-8")) as Row[];
    change(rows);
    writeFileSync(path, JSON.stringify(rows));
  }
  const base = JSON.parse(readFileSync(join(recordDir, "import.json"), "utf-8")) as {
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
 * Finds a curated row by its id.
 *
 * @param rows - the file's rows
 * @param id - the row's `id`
 * @returns the row
 * @throws `Error` when no row has that id
 */
function byId(rows: Row[], id: string): Row {
  const row = rows.find((r) => r.id === id);
  if (!row) throw new Error(`no row ${id}`);
  return row;
}

/**
 * Rewrites one curated file of a record copy, whatever its shape, so a test
 * sets the rows it asserts on instead of relying on the live record's.
 *
 * @param dir - the copy's directory
 * @param name - the curated file's name
 * @param change - changes the parsed file in place
 */
function editCurated<T>(dir: string, name: string, change: (value: T) => void): void {
  const path = join(dir, "curated", name);
  const value = JSON.parse(readFileSync(path, "utf-8")) as T;
  change(value);
  writeFileSync(path, JSON.stringify(value));
}

/**
 * Lists the sources cited for why a row became obsolete.
 *
 * @param store - the store to read
 * @param key - the row's obsolescence key, e.g. `deck:arena-five-ranged`
 * @returns the source ids, sorted
 */
function reasonSources(store: Store, key: string): string[] {
  return store.repos.citations.sourcesFor("obsolescence", [key]).get(key) ?? [];
}

const RETIRED = {
  since: "2026-10-12",
  reason: "A patch cut ranged damage, and no top defense ran the deck in the round.",
  sources: ["dc:71947"],
};

/** Marks the five-ranged deck obsolete, superseded by the Rye one-carry deck, with every edge that names it. */
const retireFiveRanged: Record<string, (rows: Row[]) => void> = {
  "decks.json": (rows) => {
    byId(rows, "arena-five-ranged").obsolete = { ...RETIRED, superseded_by: "arena-rye-onecarry" };
  },
  "counters.json": (rows) => {
    for (const edge of rows) {
      if (edge.team === "arena-five-ranged" || edge.beaten_by === "arena-five-ranged") {
        edge.obsolete = RETIRED;
      }
    }
  },
};

describe("importing a record's obsolete recommendations", IMPORT, () => {
  it("files an obsolete deck with its date, reason, successor and cited reason, keeping its status", () => {
    const store = testStore();
    importRecord(store, pvpCopy("910-pvp-copy", retireFiveRanged));
    expect(store.repos.decks.get("arena-five-ranged")).toMatchObject({
      status: "legacy",
      obsoleteSince: "2026-10-12",
      obsoleteReason: RETIRED.reason,
      supersededBy: "arena-rye-onecarry",
    });
    expect(reasonSources(store, "deck:arena-five-ranged")).toEqual(["dc:71947"]);
    expect(store.repos.decks.get("arena-rye-onecarry")).toMatchObject({
      obsoleteSince: null,
      obsoleteReason: null,
      supersededBy: null,
    });
  });

  it("files an obsolete rune build, gear rec and counter edge with their cited reasons", () => {
    const store = testStore();
    importRecord(
      store,
      pvpCopy("911-pvp-copy", {
        ...retireFiveRanged,
        "runes.json": (rows) => {
          rows[0]!.obsolete = RETIRED;
        },
        "gear.json": (rows) => {
          rows[0]!.obsolete = RETIRED;
        },
      }),
    );
    // The record's own rounds mark rows obsolete too; only the rows this test marked are checked.
    const runes = store.repos.runeBuilds.list().filter((r) => r.obsoleteReason === RETIRED.reason);
    expect(runes.map((r) => r.cookieKr)).toEqual(["우유"]);
    expect(reasonSources(store, `rune_build:${String(runes[0]!.id)}`)).toEqual(["dc:71947"]);
    const gear = store.repos.gearRecs.list().filter((g) => g.obsoleteReason === RETIRED.reason);
    expect(gear.map((g) => g.slot)).toEqual(["top_left"]);
    expect(reasonSources(store, `gear_rec:${String(gear[0]!.id)}`)).toEqual(["dc:71947"]);
    const edges = store.repos.counters.list().filter((c) => c.obsoleteReason === RETIRED.reason);
    expect(edges.map((c) => c.slug).sort()).toEqual([
      "five-ranged-vs-bari-oven",
      "five-ranged-vs-rye-onecarry",
    ]);
    for (const edge of edges) {
      expect(reasonSources(store, `counter:${String(edge.id)}`)).toEqual(["dc:71947"]);
    }
  });
});

describe("the obsolete block's checks", IMPORT, () => {
  it("rejects a reason citing a source the record doesn't list, naming the file and row", () => {
    const dir = pvpCopy("912-pvp-copy", {
      "gear.json": (rows) => {
        rows[0]!.obsolete = { ...RETIRED, sources: ["dc:999999999"] };
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /curated\/gear\.json \[0\]: unknown source ids: dc:999999999/,
    );
  });

  it("rejects a successor that isn't a curated deck", () => {
    const dir = pvpCopy("913-pvp-copy", {
      ...retireFiveRanged,
      "decks.json": (rows) => {
        byId(rows, "arena-five-ranged").obsolete = { ...RETIRED, superseded_by: "arena-nothing" };
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /curated\/decks\.json \[\d+\]: unknown deck ids: arena-nothing/,
    );
  });

  it("rejects a successor of another mode, and a deck that supersedes itself", () => {
    const otherMode = pvpCopy("914-pvp-copy", {
      ...retireFiveRanged,
      "decks.json": (rows) => {
        byId(rows, "arena-five-ranged").obsolete = {
          ...RETIRED,
          superseded_by: "rumble-standard-12",
        };
      },
    });
    expect(() => importRecord(testStore(), otherMode)).toThrow(
      /deck mode arena doesn't match deck rumble-standard-12's mode rumble_arena/,
    );
    const itself = pvpCopy("915-pvp-copy", {
      ...retireFiveRanged,
      "decks.json": (rows) => {
        byId(rows, "arena-five-ranged").obsolete = {
          ...RETIRED,
          superseded_by: "arena-five-ranged",
        };
      },
    });
    expect(() => importRecord(testStore(), itself)).toThrow(
      /deck arena-five-ranged can't supersede itself/,
    );
  });

  it("rejects a malformed date and a missing reason", () => {
    const date = pvpCopy("916-pvp-copy", {
      "gear.json": (rows) => {
        rows[0]!.obsolete = { ...RETIRED, since: "12 Oct" };
      },
    });
    expect(() => importRecord(testStore(), date)).toThrow(/obsolete\.since: expected YYYY-MM-DD/);
    const day = pvpCopy("924-pvp-copy", {
      "gear.json": (rows) => {
        rows[0]!.obsolete = { ...RETIRED, since: "2026-02-30" };
      },
    });
    expect(() => importRecord(testStore(), day)).toThrow(
      /obsolete\.since: not a date on the calendar/,
    );
  });

  it("rejects an obsolete block dated after the record's last update, the round that marked it", () => {
    const later = pvpCopy("925-pvp-copy", {
      "gear.json": (rows) => {
        rows[0]!.obsolete = { ...RETIRED, since: "2026-10-13" };
      },
    });
    expect(() => importRecord(testStore(), later)).toThrow(
      /curated\/gear\.json \[0\]: obsolete since 2026-10-13 is after the record's update of 2026-10-12/,
    );
    const deckLater = pvpCopy("926-pvp-copy", {
      ...retireFiveRanged,
      "decks.json": (rows) => {
        byId(rows, "arena-five-ranged").obsolete = { ...RETIRED, since: "2026-11-01" };
      },
    });
    expect(() => importRecord(testStore(), deckLater)).toThrow(
      /curated\/decks\.json \[\d+\]: obsolete since 2026-11-01 is after the record's update/,
    );
    const reason = pvpCopy("917-pvp-copy", {
      "gear.json": (rows) => {
        rows[0]!.obsolete = { since: RETIRED.since, sources: RETIRED.sources };
      },
    });
    expect(() => importRecord(testStore(), reason)).toThrow(/obsolete\.reason/);
  });

  it("rejects an obsolete block where the lifecycle doesn't reach, and a successor on anything but a deck", () => {
    const mechanic = pvpCopy("918-pvp-copy", {
      "mechanics.json": (rows) => {
        rows[0]!.obsolete = RETIRED;
      },
    });
    expect(() => importRecord(testStore(), mechanic)).toThrow(
      /curated\/mechanics\.json \[0\]: .*obsolete/,
    );
    const gear = pvpCopy("919-pvp-copy", {
      "gear.json": (rows) => {
        rows[0]!.obsolete = { ...RETIRED, superseded_by: "arena-rye-onecarry" };
      },
    });
    expect(() => importRecord(testStore(), gear)).toThrow(
      /curated\/gear\.json \[0\]: .*superseded_by/,
    );
  });

  it("rejects a current counter edge that names an obsolete deck", () => {
    const dir = pvpCopy("920-pvp-copy", { "decks.json": retireFiveRanged["decks.json"]! });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /counter five-ranged-vs-\S+ names obsolete deck arena-five-ranged; mark the counter obsolete too/,
    );
  });
});

/**
 * Builds an in-memory store whose glossary knows every cookie record 004's
 * dungeon files name, as record 001's glossary does in the real import order.
 *
 * @returns the store
 */
function dungeonStore(): Store {
  /**
   * Reads one of record 004's curated files.
   *
   * @param name - the file's name
   * @returns its rows, unchecked
   */
  const read = (name: string) =>
    JSON.parse(readFileSync(join(dungeonDir, "curated", name), "utf-8")) as Row[];
  /**
   * Lists the names a row keeps in some of its fields.
   *
   * @param row - the row
   * @param fields - the fields holding a name or a list of names
   * @returns the names
   */
  const names = (row: Row, fields: readonly string[]) =>
    fields.flatMap((field) => {
      const value = row[field];
      if (typeof value === "string") return [value];
      return Array.isArray(value) ? (value as string[]) : [];
    });
  const cookies = new Set([
    ...read("dungeon-runs.json").flatMap((r) => names(r, ["atk_order"])),
    ...read("dungeon-lineups.json").flatMap((l) => names(l, ["first40", "excluded", "atk_order"])),
    ...read("dungeon-exclusions.json").flatMap((e) => names(e, ["kr"])),
  ]);
  const store = testStore();
  for (const kr of cookies) store.repos.glossary.upsert({ kr, en: null, kind: "cookie" });
  return store;
}

describe("recommendations that name an obsolete deck", IMPORT, () => {
  it("rejects a stage zone slot that names an obsolete deck, naming the slot and the deck", () => {
    const dir = recordCopy(stageDir, "922-stage-copy", {
      "decks.json": (rows) => {
        const deck = byId(rows, "stage-bari-coward-328");
        deck.obsolete = { ...RETIRED, sources: deck.sources };
      },
    });
    editCurated<{ zones: Array<{ zone_index: number; slots: Row[] }> }>(
      dir,
      "stage-zones.json",
      (file) => {
        file.zones.find((zone) => zone.zone_index === 3)!.slots[2]!.deck = "stage-bari-coward-328";
      },
    );
    expect(() => importRecord(testStore(), dir)).toThrow(
      /curated\/stage-zones\.json \[zone 3 slot 2\]: stage_zone_slot names obsolete deck stage-bari-coward-328/,
    );
  });

  it("rejects a dungeon lineup that names an obsolete deck, naming the lineup and the deck", () => {
    const dir = recordCopy(dungeonDir, "923-dungeon-copy", {
      "decks.json": (rows) => {
        const deck = byId(rows, "dungeon-no-cheesecake-0907");
        deck.obsolete = { ...RETIRED, sources: deck.sources };
      },
      "dungeon-lineups.json": (rows) => {
        rows[1]!.deck = "dungeon-no-cheesecake-0907";
      },
    });
    expect(() => importRecord(dungeonStore(), dir)).toThrow(
      /curated\/dungeon-lineups\.json \[1\]: dungeon_lineup names obsolete deck dungeon-no-cheesecake-0907/,
    );
  });
});

describe("re-importing a record whose recommendations changed state", IMPORT, () => {
  it("replaces the reasons' citations with the rows, and un-obsoletes a row whose block is gone", () => {
    /**
     * Lists the entity ids of every obsolescence citation in a store.
     *
     * @param from - the store to read
     * @returns the ids, sorted
     */
    const reasons = (from: Store) =>
      from.repos.citations
        .all()
        .filter((c) => c.entity === "obsolescence")
        .map((c) => c.entityId)
        .sort();
    const plain = testStore();
    importRecord(plain, pvpCopy("922-pvp-copy", {}));
    const own = reasons(plain);
    const store = testStore();
    const dir = pvpCopy("921-pvp-copy", retireFiveRanged);
    importRecord(store, dir);
    const first = reasons(store);
    expect(first).toContain("deck:arena-five-ranged");
    importRecord(store, dir, { replace: true });
    expect(reasons(store)).toEqual(first);
    for (const file of ["decks.json", "counters.json"]) {
      cpSync(join(pvpDir, "curated", file), join(dir, "curated", file));
    }
    importRecord(store, dir, { replace: true });
    expect(reasons(store)).toEqual(own);
    expect(store.repos.decks.get("arena-five-ranged")).toMatchObject({
      obsoleteSince: null,
      obsoleteReason: null,
      supersededBy: null,
    });
  });
});
