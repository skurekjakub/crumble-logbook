import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { repoRoot } from "../../src/config";
import { importRecord } from "../../src/importers/import-record";
import type { Store } from "../../src/repos";
import { testStore } from "../helpers";

const pvpDir = join(repoRoot, "research", "002-pvp-meta");
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
  tmp ??= mkdtempSync(join(tmpdir(), "crumble-obsolete-"));
  const dir = join(tmp, slug);
  cpSync(join(pvpDir, "curated"), join(dir, "curated"), { recursive: true });
  mkdirSync(join(dir, "extract"), { recursive: true });
  for (const [name, change] of Object.entries(edit)) {
    const path = join(dir, "curated", name);
    const rows = JSON.parse(readFileSync(path, "utf-8")) as Row[];
    change(rows);
    writeFileSync(path, JSON.stringify(rows));
  }
  const base = JSON.parse(readFileSync(join(pvpDir, "import.json"), "utf-8")) as {
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
    const runes = store.repos.runeBuilds.list().filter((r) => r.obsoleteSince !== null);
    expect(runes.map((r) => [r.cookieKr, r.obsoleteReason])).toEqual([["우유", RETIRED.reason]]);
    expect(reasonSources(store, `rune_build:${String(runes[0]!.id)}`)).toEqual(["dc:71947"]);
    const gear = store.repos.gearRecs.list().filter((g) => g.obsoleteSince !== null);
    expect(gear.map((g) => g.slot)).toEqual(["top_left"]);
    expect(reasonSources(store, `gear_rec:${String(gear[0]!.id)}`)).toEqual(["dc:71947"]);
    const edges = store.repos.counters.list().filter((c) => c.obsoleteSince !== null);
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

describe("re-importing a record whose recommendations changed state", IMPORT, () => {
  it("replaces the reasons' citations with the rows, and un-obsoletes a row whose block is gone", () => {
    const store = testStore();
    const dir = pvpCopy("921-pvp-copy", retireFiveRanged);
    importRecord(store, dir);
    /**
     * Lists the entity ids of every obsolescence citation.
     *
     * @returns the ids, sorted
     */
    const reasons = () =>
      store.repos.citations
        .all()
        .filter((c) => c.entity === "obsolescence")
        .map((c) => c.entityId)
        .sort();
    const first = reasons();
    expect(first).toContain("deck:arena-five-ranged");
    importRecord(store, dir, { replace: true });
    expect(reasons()).toEqual(first);
    for (const file of ["decks.json", "counters.json"]) {
      cpSync(join(pvpDir, "curated", file), join(dir, "curated", file));
    }
    importRecord(store, dir, { replace: true });
    expect(reasons()).toEqual([]);
    expect(store.repos.decks.get("arena-five-ranged")).toMatchObject({
      obsoleteSince: null,
      obsoleteReason: null,
      supersededBy: null,
    });
  });
});
