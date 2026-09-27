import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { RANKING_BOARD, RECORD_STATUS, isoDate } from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import type { RankingInsert } from "../repos/rankings";

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
const rankingSpec = z.strictObject({
  file: z.string().min(1),
  board: z.enum(RANKING_BOARD),
  capturedAt: isoDate,
  source: z.string().min(1),
  columns: rankingColumns,
});
/**
 * One ranking capture of an {@link ImportManifest}. `file` is relative to
 * the record directory; `source` is the cited source id, in which
 * `{season}` stands for the row's season.
 */
export type RankingSpec = z.output<typeof rankingSpec>;

/**
 * Schema of a research record's `import.json`: the record row to create,
 * where the curated dataset and the extractions live, how to find each
 * source's evidence capture, and which ranking TSVs to load. Every path is
 * relative to the record directory.
 */
export const importManifest = z.strictObject({
  record: z.strictObject({
    slug: z.string().min(1),
    question: z.string().min(1),
    status: z.enum(RECORD_STATUS),
    startedAt: isoDate,
  }),
  curated: z.string().min(1),
  extractions: z.string().min(1),
  captures: z.array(
    z.strictObject({
      site: z.enum(["dc", "nv"]),
      dir: z.string().min(1),
      file: z.string().includes("{id}", { message: "expected a file pattern containing {id}" }),
    }),
  ),
  rankings: z.array(rankingSpec),
});
/** Output of {@link importManifest}. */
export type ImportManifest = z.output<typeof importManifest>;

/** The `record` block of an {@link ImportManifest}. */
export type ManifestRecord = ImportManifest["record"];

/**
 * Formats every issue of a Zod error as `path: message`, joined by `; `.
 * @param error - the Zod error to format
 */
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.length > 0 ? issue.path.join(".") : "(root)"}: ${issue.message}`)
    .join("; ");
}

/**
 * Reads and validates a research record's `import.json`.
 *
 * @param recordDir - absolute path to the research record directory
 * @returns the validated manifest
 * @throws {ImportError} naming `import.json`, if it's missing, isn't valid
 *   JSON, or fails validation (the message lists every issue's path)
 */
export function readManifest(recordDir: string): ImportManifest {
  const file = join(recordDir, "import.json");
  if (!existsSync(file)) throw new ImportError(file, null, "file not found");
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf-8"));
  } catch (err) {
    throw new ImportError(file, null, (err as Error).message);
  }
  const result = importManifest.safeParse(raw);
  if (!result.success) throw new ImportError(file, null, formatIssues(result.error));
  return result.data;
}

/**
 * Returns the cell of `row` under `column`.
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
