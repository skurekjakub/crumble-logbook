import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { repoRoot } from "../../src/config";
import { importRecord } from "../../src/importers/import-record";
import { writeRecord } from "../../src/importers/write-record";
import { createServices } from "../../src/services";
import { exportSnapshot } from "../../src/services/export";
import { testStore } from "../helpers";

const SLUG = "005-team-power-growth";
const recordDir = join(repoRoot, "research", SLUG);
/** A full import verifies the record's capture ledger, hashing its evidence on a cold cache. */
const FULL_IMPORT = { timeout: 180_000 };

type Json = Record<string, unknown>;

/**
 * Reads a curated file of record 005, parsed, with a test-asserted shape.
 *
 * @param name - the file's name in the curated directory
 * @returns the parsed file, unchecked
 */
function curated<T>(name: string): T {
  return JSON.parse(readFileSync(join(recordDir, "curated", name), "utf-8")) as T;
}

type Step = { basis: string; basis_note?: string };
const powerSources = curated<{ sources_list: Array<{ id: string }> }>("power-sources.json");
const dataPoints = curated<{ rows: unknown[] }>("power-datapoints.json");
const packages = curated<{ packages: unknown[]; price_tiers: unknown[] }>("packages.json");
const orders = curated<{
  stages: Array<{ id: string; free: Step[]; paid: Step[] }>;
  ranked_at_2_2g: { id: string; note: string; free: Step[]; paid: Step[] };
}>("spending-orders.json");
const curves = curated<{ curves: unknown[] }>("growth-curves.json");
const planner = curated<{
  from_2_2g: { what_a_step_buys: Array<{ basis: string; data_point: string | null }> };
}>("power-planner.json");

let tmp: string | undefined;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/**
 * Builds a throwaway copy of record 005's curated dataset, under its own
 * slug, with no evidence, capture rules or ledger, after applying `edit`
 * to its curated files.
 *
 * @param slug - the copy's record slug
 * @param edit - changes each parsed curated file in place, by file name
 * @returns the copy's directory
 */
function recordCopy(slug: string, edit: Record<string, (file: Json) => void> = {}): string {
  tmp ??= mkdtempSync(join(tmpdir(), "crumble-power-"));
  const dir = join(tmp, slug);
  cpSync(join(recordDir, "curated"), join(dir, "curated"), { recursive: true });
  mkdirSync(join(dir, "extract"), { recursive: true });
  for (const [name, change] of Object.entries(edit)) {
    const path = join(dir, "curated", name);
    const file = JSON.parse(readFileSync(path, "utf-8")) as Json;
    change(file);
    writeFileSync(path, JSON.stringify(file));
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
 * The rows of one array inside a parsed curated file.
 *
 * @param file - the parsed file
 * @param key - the array's key
 * @returns the array, for editing in place
 */
const rowsOf = (file: Json, key: string) => file[key] as Json[];

describe("importRecord on research record 005", FULL_IMPORT, () => {
  it("files the record under team_power and loads every team-power table with its citations", () => {
    const store = testStore();
    const { counts, warnings } = importRecord(store, recordDir);
    const stepCount = [...orders.stages, orders.ranked_at_2_2g].reduce(
      (n, order) => n + order.free.length + order.paid.length,
      0,
    );
    expect(counts).toMatchObject({
      researchRecords: 1,
      decks: 0,
      powerSources: powerSources.sources_list.length,
      powerDataPoints: dataPoints.rows.length,
      packages: packages.packages.length,
      priceTiers: packages.price_tiers.length,
      spendingOrders: orders.stages.length + 1,
      spendingSteps: stepCount,
      growthCurves: curves.curves.length,
      plannerSteps: planner.from_2_2g.what_a_step_buys.length,
    });
    const services = createServices(store);
    expect(services.records.get(SLUG).mode).toBe("team_power");
    for (const list of [
      services.powerSources.list(),
      services.powerDataPoints.list(),
      services.packages.list(),
      services.priceTiers.list(),
      services.spendingOrders.list(),
      services.spendingSteps.list(),
      services.growthCurves.list(),
      services.plannerSteps.list(),
    ]) {
      expect(list.every((row) => row.sources.length > 0)).toBe(true);
    }
    // Sources whose captures another record holds warn, as expected.
    expect(warnings).toContain("source dc:76290 has no capture under this record's capture rules");
  });

  it("stores every step's basis as curated, and the ranked order last with its note", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const services = createServices(store);
    const endgame = services.spendingSteps.list({ order: "endgame", route: "free" });
    expect(endgame.map((s) => s.basis)).toEqual(
      orders.stages.find((s) => s.id === "endgame")!.free.map((s) => s.basis),
    );
    expect(endgame[0]).toMatchObject({
      powerSource: "guild_lab",
      basis: "claimed",
      basisNote: expect.stringMatching(/^claimed/),
    });
    const ranked = services.spendingOrders.list().at(-1)!;
    expect(ranked).toMatchObject({
      slug: orders.ranked_at_2_2g.id,
      kind: "ranked",
      note: orders.ranked_at_2_2g.note,
    });
    expect(services.spendingSteps.list({ basis: "unmeasured" }).length).toBeGreaterThan(0);
    const steps = services.plannerSteps.list();
    const posted = planner.from_2_2g.what_a_step_buys.filter((s) => s.basis === "posted");
    expect(posted.length).toBeGreaterThan(0);
    expect(steps.filter((s) => s.basis === "posted").map((s) => s.dataPoint)).toEqual(
      posted.map((s) => s.data_point),
    );
  });

  it("reloads identically with --replace", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const first = exportSnapshot(store);
    importRecord(store, recordDir, { replace: true });
    expect(exportSnapshot(store)).toEqual(first);
  });

  it("cites a power source and a curve to the sources they name inside, and warns about no decks", () => {
    const store = testStore();
    const { warnings } = importRecord(store, recordDir);
    const services = createServices(store);
    const stellar = services.powerSources.list().find((s) => s.slug === "stellar_link")!;
    for (const gain of stellar.postedGains) {
      for (const id of gain.sources) expect(stellar.sources).toContain(id);
    }
    const shapes = services.growthCurves.list().find((c) => c.slug === "stellar-shapes")!;
    for (const id of shapes.rowSources!.flat()) expect(shapes.sources).toContain(id);
    expect(warnings.some((w) => w.includes("lists no decks"))).toBe(false);
  });

  it("marks posted only the steps whose own gain was measured, and no package step", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const steps = createServices(store).spendingSteps.list();
    expect(steps.filter((s) => s.packageSlug !== null && s.basis === "posted")).toEqual([]);
    const plating = steps.find((s) => s.orderSlug === "endgame" && s.powerSource === "plating")!;
    expect(plating).toMatchObject({
      basis: "community",
      basisNote: expect.stringMatching(/posted gain near 15/),
    });
  });

  it("flags the figures a post gives loosely as approximate, and no others by default", () => {
    const store = testStore();
    importRecord(store, recordDir);
    const points = createServices(store).powerDataPoints.list();
    expect(points.find((p) => p.slug === "plate-14-15-1.6g")?.approximate).toBe(true);
    expect(points.find((p) => p.slug === "stellar8-triangle-2g")?.approximate).toBe(false);
  });
});

describe("importRecord's team-power checks", () => {
  it("refuses a data point whose power source isn't loaded", () => {
    const dir = recordCopy("t-point", {
      "power-datapoints.json": (f) => void (rowsOf(f, "rows")[0]!.system = "nothing"),
    });
    const store = testStore();
    expect(() => importRecord(store, dir)).toThrow(
      /power-datapoints\.json \[0\]: system names nothing, not loaded/,
    );
    expect(store.repos.powerSources.count()).toBe(0);
  });

  it("refuses a package feeding a power source that isn't loaded", () => {
    const dir = recordCopy("t-pack", {
      "packages.json": (f) => void (rowsOf(f, "packages")[0]!.feeds = ["nothing"]),
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /packages\.json \[0\]: feeds names nothing/,
    );
  });

  it("refuses a spending step naming both a power source and a package", () => {
    const dir = recordCopy("t-step", {
      "spending-orders.json": (f) => {
        const [early] = rowsOf(f, "stages");
        (early!.free as Json[])[0]!.package = "ad-removal";
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /spending-orders\.json \[early free 0\]: .*not both/,
    );
  });

  it("refuses a curve whose rows don't match its columns", () => {
    const dir = recordCopy("t-curve", {
      "growth-curves.json": (f) => void (rowsOf(f, "curves")[0]!.rows as unknown[][])[0]!.pop(),
    });
    expect(() => importRecord(testStore(), dir)).toThrow(/growth-curves\.json \[0\]: row 0 has/);
  });

  it("refuses a posted planner step whose gain comes from a claimed data point", () => {
    const dir = recordCopy("t-planner", {
      "power-planner.json": (f) => {
        const steps = (f.from_2_2g as Json).what_a_step_buys as Json[];
        steps[1]!.basis = "posted";
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /power-planner\.json \[step 1\]: .*guild-lab-claim is claimed/,
    );
  });

  it("refuses a power source id another record already loaded", () => {
    const store = testStore();
    importRecord(store, recordCopy("t-first"));
    expect(() => importRecord(store, recordCopy("t-second"))).toThrow(/power source id/);
  });

  it("drops a row the record no longer lists on --replace, with its citations", () => {
    const store = testStore();
    importRecord(store, recordCopy("t-drop"));
    // A package no spending step names, so the record stays whole without it.
    const dropped = "permanent-growth";
    const dir = recordCopy("t-drop", {
      "packages.json": (f) => {
        f.packages = rowsOf(f, "packages").filter((p) => p.id !== dropped);
      },
    });
    importRecord(store, dir, { replace: true });
    const slugs = createServices(store)
      .packages.list()
      .map((p) => p.slug);
    expect(slugs).not.toContain(dropped);
    expect(slugs).toHaveLength(packages.packages.length - 1);
    const ids = new Set(store.repos.packages.list().map((p) => String(p.id)));
    const cited = store.repos.citations.all().filter((c) => c.entity === "package");
    expect(cited.every((c) => ids.has(c.entityId))).toBe(true);
  });

  it("refuses a --replace that leaves another record's row naming a slug it no longer loads", () => {
    const store = testStore();
    store.repos.sources.insert({ id: "dc:1", site: "dc", url: "https://example.test/1" });
    store.repos.powerSources.insert({
      slug: "x",
      nameEn: "X",
      nameKr: "k",
      raises: "r",
      appliesIn: ["stage"],
      materials: [{ name: "m", free: "f", paid: "p", note: null }],
      costType: "free",
      cap: "c",
      postedGains: [],
      efficiency: { early: "e", mid: "m", late: "l", at22g: "a" },
      bracketEffect: "b",
      confidence: "high",
      recordSlug: "a",
    });
    store.repos.powerDataPoints.insert({
      slug: "p",
      kind: "posted",
      powerSource: "x",
      date: "2026-09-28",
      note: "n",
      recordSlug: "b",
    });
    expect(() => writeRecord(store, { slug: "a", steps: [], warnings: [] }, true)).toThrow(
      /power_data_point \d+ of record b names x in powerSource, which record a no longer loads/,
    );
    expect(store.repos.powerSources.count()).toBe(1);
  });
});
