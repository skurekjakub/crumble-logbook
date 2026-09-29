import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { describeProblem, hasLedger, LEDGER_FILE, verifyLedger } from "../src/ledger";
import { researchDir } from "../src/paths";
import { readSearches, SEARCHES_FILE } from "../src/searches";

/**
 * A record's whole verification with a cold hash cache: every present
 * file, local media included, is read and hashed, in parallel with the
 * other test workers doing the same.
 */
const COLD_VERIFY = { timeout: 180_000 };

const records = readdirSync(researchDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && hasLedger(join(researchDir, entry.name)))
  .map((entry) => entry.name);

describe("every record's capture ledger", () => {
  it("finds a ledger in every record that has evidence", () => {
    const withEvidence = readdirSync(researchDir, { withFileTypes: true })
      .filter(
        (entry) => entry.isDirectory() && existsSync(join(researchDir, entry.name, "evidence")),
      )
      .map((entry) => entry.name);
    expect(withEvidence.length).toBeGreaterThan(0);
    expect(records).toEqual(withEvidence);
  });

  it("names the ledger in every importable record's manifest, so an import verifies it", () => {
    const manifests = records.filter((record) =>
      existsSync(join(researchDir, record, "import.json")),
    );
    expect(manifests.length).toBeGreaterThan(0);
    for (const record of manifests) {
      const manifest = JSON.parse(
        readFileSync(join(researchDir, record, "import.json"), "utf-8"),
      ) as { ledger?: unknown };
      expect(manifest.ledger, record).toEqual({ file: LEDGER_FILE });
    }
  });

  for (const record of records) {
    it(
      `${record}: every evidence file has its line, and every present file its hash`,
      COLD_VERIFY,
      () => {
        expect(verifyLedger(join(researchDir, record)).map(describeProblem)).toEqual([]);
      },
    );
  }
});

/** The areas a refresh round covers: the records with an `import.json`. */
const areas = readdirSync(researchDir, { withFileTypes: true })
  .filter(
    (entry) => entry.isDirectory() && existsSync(join(researchDir, entry.name, "import.json")),
  )
  .map((entry) => entry.name);

/** A README section a refresh round adds: `## Refresh YYYY-MM-DD`. */
const REFRESH_SECTION = /^## Refresh \d{4}-\d{2}-\d{2}\b/m;

describe("every area's saved searches", () => {
  it("finds the areas", () => {
    expect(areas.length).toBeGreaterThan(0);
  });

  for (const area of areas) {
    it(`${area}: its searches.json is a valid search list, and present once a refresh round ran`, () => {
      const dir = join(researchDir, area);
      const refreshed = REFRESH_SECTION.test(readFileSync(join(dir, "README.md"), "utf-8"));
      const searches = readSearches(dir);
      expect(
        searches !== null || !refreshed,
        `${area} has a refresh section and no ${SEARCHES_FILE}`,
      ).toBe(true);
    });
  }
});
