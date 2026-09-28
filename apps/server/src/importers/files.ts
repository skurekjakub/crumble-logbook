import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { z } from "zod";
import { ImportError } from "../errors";
import { formatIssues } from "./manifest";

/**
 * Reads a JSON file of a record.
 *
 * @param recordDir - absolute path to the record directory
 * @param file - the file's path relative to `recordDir`, as errors name it
 * @returns the parsed value
 * @throws {ImportError} naming `file` if it's missing or isn't valid JSON
 */
export function readJson(recordDir: string, file: string): unknown {
  const path = join(recordDir, file);
  if (!existsSync(path)) throw new ImportError(file, null, "file not found");
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (err) {
    throw new ImportError(file, null, (err as Error).message);
  }
}

/**
 * Validates a whole-file value with `schema`.
 *
 * @param file - the file's record-relative path, as errors name it
 * @param raw - the parsed file
 * @param schema - the schema the file must satisfy
 * @returns the validated value
 * @throws {ImportError} naming `file` and every issue's path
 */
export function parseFile<S extends z.ZodType>(file: string, raw: unknown, schema: S): z.output<S> {
  const result = schema.safeParse(raw);
  if (!result.success) throw new ImportError(file, null, formatIssues(result.error));
  return result.data;
}
