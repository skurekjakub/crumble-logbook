import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { importRecord } from "../../src/importers/import-record";
import { createServices } from "../../src/services";
import { testStore } from "../helpers";

const fixtureDir = join(import.meta.dirname, "fixtures", "007-damage-formula");

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

const steps = curated<Array<{ id: string }>>("formula-steps.json");
const constants = curated<Row[]>("formula-constants.json");
const claims = curated<Row[]>("formula-claims.json");

let tmp: string | undefined;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/**
 * Builds a throwaway copy of the fixture record, under `slug`, after
 * applying `edit` to its curated array files.
 *
 * @param edit - changes each parsed curated file's rows in place, by file name
 * @param slug - the copy's record slug; the fixture's when omitted
 * @returns the copy's directory
 */
function fixtureCopy(
  edit: Record<string, (rows: Row[]) => void>,
  slug = "007-damage-formula",
): string {
  tmp ??= mkdtempSync(join(tmpdir(), "crumble-formula-"));
  const dir = join(tmp, slug);
  cpSync(fixtureDir, dir, { recursive: true });
  const manifest = join(dir, "import.json");
  const parsed = JSON.parse(readFileSync(manifest, "utf-8")) as { record: { slug: string } };
  parsed.record.slug = slug;
  writeFileSync(manifest, JSON.stringify(parsed));
  for (const [name, change] of Object.entries(edit)) {
    const path = join(dir, "curated", name);
    const rows = JSON.parse(readFileSync(path, "utf-8")) as Row[];
    change(rows);
    writeFileSync(path, JSON.stringify(rows));
  }
  return dir;
}

describe("importRecord on the damage formula fixture", () => {
  it("files the record under damage_formula and loads its steps, constants and claims in order", () => {
    const store = testStore();
    const { counts, warnings } = importRecord(store, fixtureDir);
    expect(counts).toMatchObject({
      researchRecords: 1,
      formulaSteps: steps.length,
      formulaConstants: constants.length,
      formulaClaims: claims.length,
      decks: 0,
    });
    expect(warnings).toEqual([]);
    expect(store.repos.records.get("007-damage-formula")?.mode).toBe("damage_formula");

    const services = createServices(store);
    const listed = services.formulaSteps.list();
    expect(listed.map((step) => step.slug)).toEqual(steps.map((step) => step.id));
    expect(listed[0]).toMatchObject({
      position: 0,
      phase: "gate",
      feeds: ["Accuracy", "Avoidance (target)"],
      stacking: "additive",
      appliesTo: "Fixture: only against Avoidance above 0",
      confidence: "read",
      detail: null,
      codeRef: "Fixture.DamageSystem @ 0x1",
      sources: ["web:fixture-client"],
    });
    expect(listed[2]).toMatchObject({ phase: "result", feeds: [], stacking: null });

    expect(services.formulaConstants.list()[0]).toMatchObject({
      slug: "c-def",
      step: "defense",
      labelKr: "방어 상수",
      value: null,
      candidate: "500 (fixture tool default)",
    });
    expect(services.formulaClaims.list()).toMatchObject([
      {
        slug: "crit-tiers",
        verdict: "agrees",
        refRecord: "007-damage-formula",
        refTitle: "Fixture: crit tiers",
      },
      { slug: "weapon-digits", verdict: "disagrees", refRecord: null, refTitle: null },
    ]);
  });

  it("replaces the record's rows with --replace", () => {
    const store = testStore();
    const first = importRecord(store, fixtureDir);
    const second = importRecord(store, fixtureDir, { replace: true });
    expect(second.counts).toEqual(first.counts);
  });

  it("refuses a constant whose step isn't loaded", () => {
    const dir = fixtureCopy({
      "formula-constants.json": (rows) => {
        rows[0]!.step = "armor";
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /formula-constants\.json \[0\]: step names armor, not loaded/,
    );
  });

  it("refuses a claim whose ref names no stored mechanic", () => {
    const dir = fixtureCopy({
      "formula-claims.json": (rows) => {
        rows[0]!.ref = { record: "001-guild-conquest-meta", title: "Crit tiers" };
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /formula-claims\.json \[0\]: ref names mechanic "Crit tiers" of record 001-guild-conquest-meta, not loaded/,
    );
  });

  it("refuses a repeated id within a file", () => {
    const dir = fixtureCopy({
      "formula-steps.json": (rows) => {
        rows[1]!.id = "miss";
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(
      /formula-steps\.json \[1\]: duplicate id "miss"/,
    );
  });

  it("refuses a step id another record already holds", () => {
    const store = testStore();
    importRecord(store, fixtureDir);
    const dir = fixtureCopy(
      {
        "formula-constants.json": (rows) => {
          rows[0]!.id = "c-def-2";
        },
        "formula-claims.json": (rows) => {
          rows.splice(0, rows.length);
        },
      },
      "008-formula-copy",
    );
    expect(() => importRecord(store, dir)).toThrow(
      /formula-steps\.json \[0\]: formula step id "miss" is already loaded by record 007-damage-formula/,
    );
  });

  it("refuses a step without a phase the schema knows", () => {
    const dir = fixtureCopy({
      "formula-steps.json": (rows) => {
        rows[0]!.phase = "bonus";
      },
    });
    expect(() => importRecord(testStore(), dir)).toThrow(/formula-steps\.json \[0\]/);
  });
});
