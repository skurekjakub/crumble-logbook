import {
  appendFileSync,
  cpSync,
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
import { createServices } from "../../src/services";
import { testStore } from "../helpers";

const source = join(repoRoot, "research", "001-guild-conquest-meta");
const SHA_A = "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb";

let tmp: string | undefined;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/**
 * Builds a throwaway record from record 001's curated files, with one
 * evidence file (`evidence/a.md`, holding `a`) and the given ledger text.
 * The record is named `001-guild-conquest-meta`, as its curated rows say.
 *
 * @param ledger - the ledger file's content
 * @returns the record directory
 */
function recordWithLedger(ledger: string): string {
  tmp = mkdtempSync(join(tmpdir(), "crumble-ledger-"));
  const dir = join(tmp, "001-guild-conquest-meta");
  cpSync(join(source, "curated"), join(dir, "curated"), { recursive: true });
  mkdirSync(join(dir, "extract"));
  mkdirSync(join(dir, "evidence"));
  writeFileSync(join(dir, "evidence", "a.md"), "a");
  writeFileSync(join(dir, "evidence", "captures.jsonl"), ledger);
  const base = JSON.parse(readFileSync(join(source, "import.json"), "utf-8")) as object;
  writeFileSync(
    join(dir, "import.json"),
    JSON.stringify({
      ...base,
      extractions: "extract",
      captures: [],
      rankings: [],
      fightEvents: undefined,
      buffValues: undefined,
      ledger: { file: "evidence/captures.jsonl" },
    }),
  );
  return dir;
}

/**
 * Formats a ledger line for `evidence/a.md`.
 *
 * @param over - fields to override
 * @returns the JSON line, newline-terminated
 */
function line(over: Record<string, unknown> = {}): string {
  return `${JSON.stringify({
    path: "evidence/a.md",
    url: "https://m.dcinside.com/board/projectcc/1",
    captured_at: "2026-09-27T10:39:53+02:00",
    tool: "python:dc_scrape",
    sha256: SHA_A,
    approx: "header",
    ...over,
  })}\n`;
}

describe("the ledger block", () => {
  it("imports every ledger line as a capture the record owns, and serves it", () => {
    const store = testStore();
    const { counts } = importRecord(store, recordWithLedger(line()));
    expect(counts.captures).toBe(1);
    const services = createServices(store);
    expect(services.captures.list({ record: "001-guild-conquest-meta" })).toEqual([
      {
        id: 1,
        recordSlug: "001-guild-conquest-meta",
        path: "evidence/a.md",
        url: "https://m.dcinside.com/board/projectcc/1",
        capturedAt: "2026-09-27T10:39:53+02:00",
        approx: "header",
        tool: "python:dc_scrape",
        sha256: SHA_A,
      },
    ]);
    expect(services.captures.list({ path: "evidence/b.md" })).toEqual([]);
  });

  it("refreshes the record's captures on --replace", () => {
    const store = testStore();
    const dir = recordWithLedger(line());
    importRecord(store, dir);
    writeFileSync(join(dir, "evidence", "b.md"), "a");
    appendFileSync(join(dir, "evidence", "captures.jsonl"), line({ path: "evidence/b.md" }));
    importRecord(store, dir, { replace: true });
    expect(store.repos.captures.list().map((c) => c.path)).toEqual([
      "evidence/a.md",
      "evidence/b.md",
    ]);
  }, 10_000);

  it("fails on a bad line, naming the ledger and the line", () => {
    const dir = recordWithLedger(`${line()}\n${line({ tool: "wget" })}`);
    expect(() => importRecord(testStore(), dir)).toThrow(ImportError);
    expect(() => importRecord(testStore(), dir)).toThrow(
      /^evidence\/captures\.jsonl \[3\]: tool: expected/,
    );
  });

  it("fails when the ledger and the evidence disagree, and writes nothing", () => {
    const store = testStore();
    const dir = recordWithLedger(line({ sha256: "0".repeat(64) }));
    expect(() => importRecord(store, dir)).toThrow(
      /evidence\/captures\.jsonl \[1\]: the ledger doesn't match the evidence: evidence\/a\.md \(line 1\) differs from its ledger hash/,
    );
    writeFileSync(join(dir, "evidence", "captures.jsonl"), "");
    expect(() => importRecord(store, dir)).toThrow(/evidence\/a\.md has no ledger line/);
    expect(store.repos.captures.list()).toEqual([]);
    expect(store.repos.records.list()).toEqual([]);
  });

  it("rejects a ledger block naming another file", () => {
    const dir = recordWithLedger(line());
    const manifest = JSON.parse(readFileSync(join(dir, "import.json"), "utf-8")) as object;
    writeFileSync(
      join(dir, "import.json"),
      JSON.stringify({ ...manifest, ledger: { file: "evidence/other.jsonl" } }),
    );
    expect(() => importRecord(testStore(), dir)).toThrow(/import\.json.*ledger\.file/);
  });
});
