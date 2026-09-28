/**
 * The `rankings` block of a record's `import.json`: leaderboard TSVs, each
 * mapped column by column onto `rankings` rows.
 *
 * @module
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { RANKING_BOARD, isoDate } from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import type { RankingInsert } from "../repos/rankings";
import type { WriteStep } from "./steps";
import { parseTsv } from "./tsv";

/** How a ranking TSV's columns map onto `rankings` columns. */
const rankingColumns = z.strictObject({
  season: z.string().min(1).optional(),
  rank: z.string().min(1),
  name: z.string().min(1),
  guild: z.string().min(1).optional(),
  value: z.string().min(1),
  power: z.string().min(1).optional(),
  ref: z.string().min(1).optional(),
});

/** One ranking capture to load: a TSV file, its board, and its column mapping. */
export const rankingSpec = z.strictObject({
  file: z.string().min(1),
  board: z.enum(RANKING_BOARD),
  capturedAt: isoDate,
  source: z.string().min(1),
  columns: rankingColumns,
});
/**
 * One ranking capture of an `import.json`. `file` is relative to the record
 * directory; `source` is the cited source id, in which `{season}` stands
 * for the row's season.
 */
export type RankingSpec = z.output<typeof rankingSpec>;

/**
 * Returns the cell of `row` under `column`.
 *
 * @param row - the row, keyed by header cell
 * @param column - the header cell to read
 * @returns the cell's text
 * @throws if the row has no such column
 */
function cell(row: Record<string, string>, column: string): string {
  const value = row[column];
  if (value === undefined) throw new Error(`no column "${column}"`);
  return value;
}

/**
 * Returns the cell under `column` parsed as a number, or `null` for an
 * empty cell or an absent (unmapped) column.
 *
 * @param row - the row, keyed by header cell
 * @param column - the header cell to read, if mapped
 * @returns the number, or `null`
 * @throws if the row has no such column
 * @throws if the cell isn't empty and doesn't parse as a number
 */
function optionalNumber(row: Record<string, string>, column: string | undefined): number | null {
  if (column === undefined) return null;
  const value = cell(row, column).trim();
  if (value === "") return null;
  const n = Number(value);
  if (Number.isNaN(n)) throw new Error(`column "${column}": not a number: "${value}"`);
  return n;
}

/**
 * Returns the cell under `column` parsed as a number.
 *
 * @param row - the row, keyed by header cell
 * @param column - the header cell to read
 * @returns the number
 * @throws if the row has no such column
 * @throws if the cell is empty or doesn't parse as a number
 */
function requiredNumber(row: Record<string, string>, column: string): number {
  const n = optionalNumber(row, column);
  if (n === null) throw new Error(`column "${column}": empty`);
  return n;
}

/**
 * Returns the cell under `column`, or `null` for an empty cell or an
 * absent (unmapped) column.
 *
 * @param row - the row, keyed by header cell
 * @param column - the header cell to read, if mapped
 * @returns the text, or `null`
 * @throws if the row has no such column
 */
function optionalText(row: Record<string, string>, column: string | undefined): string | null {
  if (column === undefined) return null;
  const value = cell(row, column);
  return value === "" ? null : value;
}

/**
 * Maps one parsed ranking TSV row onto a `rankings` insert.
 *
 * @param row - the row, keyed by header cell (see `parseTsv`)
 * @param spec - the ranking capture the row belongs to
 * @returns the insert; empty cells and unmapped optional columns become
 *   `null`, and `{season}` in `spec.source` is replaced by the row's season
 * @throws `Error` naming the column, if a mapped column is missing from the
 *   row, a number cell doesn't parse, `rank`/`value`/`name` is empty, or
 *   `spec.source` needs a season the row doesn't have
 */
export function mapRankingRow(row: Record<string, string>, spec: RankingSpec): RankingInsert {
  const { columns } = spec;
  const season = optionalNumber(row, columns.season);
  const name = optionalText(row, columns.name);
  if (name === null) throw new Error(`column "${columns.name}": empty`);
  if (spec.source.includes("{season}") && season === null) {
    throw new Error(`source "${spec.source}" needs a season, but the row has none`);
  }
  return {
    season,
    board: spec.board,
    rank: requiredNumber(row, columns.rank),
    name,
    guild: optionalText(row, columns.guild),
    valueG: requiredNumber(row, columns.value),
    powerG: optionalNumber(row, columns.power),
    ref: optionalText(row, columns.ref),
    capturedAt: spec.capturedAt,
    sourceId: spec.source.replaceAll("{season}", String(season)),
  };
}

/**
 * Parses and maps every ranking TSV of a manifest's `rankings` block,
 * checking each row's source id against the curated sources, and that no
 * two rows, across every TSV, share a `(board, season, rank, capturedAt)`
 * key. A `null` season counts as a value here, unlike in the table's unique
 * index, where two `null`s never collide.
 *
 * @param recordDir - absolute path to the record directory
 * @param specs - the manifest's `rankings` block
 * @param sourceIds - every curated source id
 * @returns a step inserting every TSV's rows, TSV by TSV, in file order,
 *   owned by the record being written
 * @throws {ImportError} naming the TSV (and line) of the first failure
 */
export function readRankings(
  recordDir: string,
  specs: readonly RankingSpec[],
  sourceIds: ReadonlySet<string>,
): WriteStep {
  const seen = new Map<string, string>();
  const batches = specs.map((spec) => {
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
  return (repos, { record }) => {
    for (const rows of batches) {
      repos.rankings.insertMany(rows.map((row) => ({ ...row, recordSlug: record })));
    }
  };
}
