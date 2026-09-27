import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ImportError } from "../errors";
import type { RankingInsert } from "../repos/rankings";
import type { ImportManifest } from "./manifest";
import { mapRankingRow } from "./manifest";
import type { WriteStep } from "./steps";
import { parseTsv } from "./tsv";

/**
 * Parses and maps every ranking TSV the manifest lists, checking each row's
 * source id against the curated sources, and that no two rows, across every
 * TSV, share a `(board, season, rank, capturedAt)` key. A `null` season
 * counts as a value here, unlike in the table's unique index, where two
 * `null`s never collide.
 *
 * @param recordDir - absolute path to the record directory
 * @param manifest - the record's `import.json`
 * @param sourceIds - every curated source id
 * @returns a step inserting every TSV's rows, TSV by TSV, in file order
 * @throws {ImportError} naming the TSV (and line) of the first failure
 */
export function readRankings(
  recordDir: string,
  manifest: ImportManifest,
  sourceIds: ReadonlySet<string>,
): WriteStep {
  const seen = new Map<string, string>();
  const batches = manifest.rankings.map((spec) => {
    const path = join(recordDir, spec.file);
    if (!existsSync(path)) throw new ImportError(spec.file, null, "file not found");
    let parsed: Array<Record<string, string>>;
    try {
      parsed = parseTsv(readFileSync(path, "utf-8"));
    } catch (err) {
      throw new ImportError(spec.file, null, (err as Error).message);
    }
    return parsed.map((raw, index) => {
      const line = `line ${index + 2}`;
      let row: RankingInsert;
      try {
        row = mapRankingRow(raw, spec);
      } catch (err) {
        throw new ImportError(spec.file, line, (err as Error).message);
      }
      if (!sourceIds.has(row.sourceId)) {
        throw new ImportError(spec.file, line, `unknown source ids: ${row.sourceId}`);
      }
      const key = `board ${row.board}, season ${row.season ?? "null"}, rank ${row.rank}, captured ${row.capturedAt}`;
      const first = seen.get(key);
      if (first !== undefined) {
        throw new ImportError(
          spec.file,
          line,
          `duplicate ranking (${key}), first seen at ${first}`,
        );
      }
      seen.set(key, `${spec.file} ${line}`);
      return row;
    });
  });
  return (repos) => {
    for (const rows of batches) repos.rankings.insertMany(rows);
  };
}
