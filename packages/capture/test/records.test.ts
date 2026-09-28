import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { describeProblem, hasLedger, verifyLedger } from "../src/ledger";
import { researchDir } from "../src/paths";

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
