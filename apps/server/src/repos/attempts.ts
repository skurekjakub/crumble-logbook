import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Attempt, Attempts, CurvePoint, PaceRule } from "@crumble/schema";
import { attemptSchema } from "@crumble/schema";

/** The macro's INI, next to the files it writes. */
const INI = "conquest-loop.ini";
/** The runs and curves files when the INI names none, as the macro's own defaults do. */
const DEFAULT_RUNS = "conquest-runs.csv";
const DEFAULT_CURVES = "conquest-curves.csv";

/** Read access to the Guild Conquest macro's recorded attempts. */
export interface AttemptsRepo {
  /**
   * Reads every recorded attempt with its curve, and the macro's pace rule. A malformed row is
   * skipped, so a row the macro is still writing doesn't fail the read.
   *
   * @returns the attempts, oldest first; `available` false when there is no runs file
   */
  read(): Attempts;
}

/**
 * Parses an INI file into its sections' keys, values trimmed; `;` lines are comments.
 *
 * @param text - the file's text
 * @returns section → key → value
 */
export function parseIni(text: string): Map<string, Map<string, string>> {
  const sections = new Map<string, Map<string, string>>();
  let current = new Map<string, string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith(";")) continue;
    const header = /^\[(.+)\]$/.exec(line);
    if (header) {
      current = sections.get(header[1]!) ?? new Map<string, string>();
      sections.set(header[1]!, current);
      continue;
    }
    const eq = line.indexOf("=");
    if (eq > 0) current.set(line.slice(0, eq).trim(), line.slice(eq + 1).trim());
  }
  return sections;
}

/**
 * Reads a number from an INI value.
 *
 * @param value - the value, if the INI sets it
 * @returns the number; null when unset or not a finite number
 */
function iniNumber(value: string | undefined): number | null {
  if (value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Reads a CSV's data rows, the header dropped: the macro writes no quoted fields.
 *
 * @param path - the file
 * @returns each row's fields; empty when the file doesn't exist
 */
function csvRows(path: string): string[][] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf-8")
    .split(/\r?\n/)
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => line.split(","));
}

/**
 * Reads an optional integer field.
 *
 * @param field - the field's text
 * @returns the integer; null when empty
 */
function optionalInt(field: string | undefined): number | null {
  return field === undefined || field === "" ? null : Number(field);
}

/**
 * Groups the curves file's readings by run, each run's readings most seconds left first.
 *
 * @param rows - the curves file's rows: time, t_left, score
 * @returns run time → its readings; malformed rows skipped
 */
export function groupCurves(rows: readonly string[][]): Map<string, CurvePoint[]> {
  const curves = new Map<string, CurvePoint[]>();
  for (const [time, tLeft, score] of rows) {
    // Number("") is 0, so an empty field would pass as a reading of 0.
    if (!time || !tLeft || !score) continue;
    const t = Number(tLeft);
    const s = Number(score);
    if (!Number.isFinite(t) || !Number.isSafeInteger(s) || t < 0 || s < 0) continue;
    const curve = curves.get(time) ?? [];
    curve.push([t, s]);
    curves.set(time, curve);
  }
  for (const curve of curves.values()) curve.sort((a, b) => b[0] - a[0]);
  return curves;
}

/**
 * Builds the attempts from the runs file's rows and the grouped curves.
 *
 * @param rows - the runs file's rows: time, run, end, pace_score, final_score
 * @param curves - each run's readings, by run time
 * @returns the attempts that parse, in file order
 */
export function parseAttempts(
  rows: readonly string[][],
  curves: ReadonlyMap<string, CurvePoint[]>,
): Attempt[] {
  return rows.flatMap(([time, run, end, pace, final]) => {
    const parsed = attemptSchema.safeParse({
      time,
      run: Number(run),
      end,
      paceScore: optionalInt(pace),
      finalScore: optionalInt(final),
      curve: (time && curves.get(time)) ?? [],
    });
    return parsed.success ? [parsed.data] : [];
  });
}

/**
 * Builds an {@link AttemptsRepo} over the macro's folder.
 *
 * @param dir - the folder holding the macro's INI and the CSVs it writes; null where there is
 *   none, which reads as no attempts
 * @returns the repo
 */
export function createAttemptsRepo(dir: string | null): AttemptsRepo {
  return {
    /** @inheritdoc */
    read() {
      const none: PaceRule = { minScore: null, checkAtS: null };
      if (!dir) return { available: false, rule: none, attempts: [] };
      const iniPath = join(dir, INI);
      const ini = existsSync(iniPath)
        ? parseIni(readFileSync(iniPath, "utf-8"))
        : new Map<string, Map<string, string>>();
      const prune = ini.get("Prune");
      const run = ini.get("Run");
      const minScore = iniNumber(prune?.get("MinScore"));
      const rule: PaceRule = {
        minScore: minScore === null ? null : Math.round(minScore),
        checkAtS: iniNumber(prune?.get("CheckAtS")),
      };
      const runsPath = join(dir, run?.get("RunsFile") ?? DEFAULT_RUNS);
      if (!existsSync(runsPath)) return { available: false, rule, attempts: [] };
      const curves = groupCurves(csvRows(join(dir, run?.get("CurvesFile") ?? DEFAULT_CURVES)));
      return { available: true, rule, attempts: parseAttempts(csvRows(runsPath), curves) };
    },
  };
}
