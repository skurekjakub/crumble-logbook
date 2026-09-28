import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { describeProblem, hasLedger, verifyLedger } from "../src/ledger";
import { researchDir } from "../src/paths";

/**
 * Records whose ledger gives a revised working file (a `SOURCES.md`, a
 * script) a new line instead of keeping one line per path. Their ledgers
 * are checked like any other's, except that a repeated path is allowed.
 */
const REPEATS_PATHS: ReadonlySet<string> = new Set(["003-stage-pushing-meta"]);

const records = readdirSync(researchDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && hasLedger(join(researchDir, entry.name)))
  .map((entry) => entry.name);

describe("every record's capture ledger", () => {
  it("finds the records that keep a ledger", () => {
    expect(records.length).toBeGreaterThan(0);
  });

  for (const record of records) {
    it(`${record}: every evidence file has its line, and every present file its hash`, () => {
      const problems = verifyLedger(join(researchDir, record)).filter(
        (problem) => !(problem.kind === "duplicate" && REPEATS_PATHS.has(record)),
      );
      expect(problems.map(describeProblem)).toEqual([]);
    });
  }
});
