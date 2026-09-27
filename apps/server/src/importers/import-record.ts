import type { Store } from "../repos";
import { readRecord } from "./read-record";
import type { ImportCounts } from "./write-record";
import { writeRecord } from "./write-record";

export type { ImportCounts } from "./write-record";

/** What {@link importRecord} wrote, plus anything worth a human's attention. */
export interface ImportResult {
  /** Rows per registered table after the import. */
  counts: ImportCounts;
  /**
   * Non-fatal findings, such as glossary lookup keys that more than one
   * entry claims (the name resolver lets the last entry, by `kr`, win).
   */
  warnings: string[];
}

/** Options for {@link importRecord}. */
export interface ImportOptions {
  /** Clear every registered table first, instead of refusing a non-empty database. */
  replace?: boolean;
}

/**
 * Loads a research record into the database: its curated collections (see
 * `collections.ts`), each row with its citations, its ranking TSVs, and,
 * when the manifest names them, its fight timeline and buff capture.
 * Sources get their English summary from the record's extractions and, for
 * `dc`/`nv` ids, the path of their evidence capture.
 *
 * Everything is read and checked before anything is written (`readRecord`),
 * and every write happens in one transaction (`writeRecord`): a failure
 * leaves the database as it was.
 *
 * @param store - the store to load into
 * @param recordDir - absolute path to the record directory (the one
 *   holding `import.json`)
 * @param opts - `replace: true` clears every registered table first and
 *   resets its id counter, so the result matches a fresh import, ids
 *   included
 * @returns rows per table, and non-fatal warnings
 * @throws {ImportError} naming the file and row, if a file is missing or
 *   malformed, a row fails its schema, a row cites an unknown source or
 *   deck, or two ranking rows share a key
 * @throws {ImportError} `"database already has content; pass --replace to
 *   load record <slug> over it"` if any registered table has rows and
 *   `replace` isn't set
 */
export function importRecord(
  store: Store,
  recordDir: string,
  opts: ImportOptions = {},
): ImportResult {
  const plan = readRecord(recordDir);
  const counts = writeRecord(store, plan, opts.replace ?? false);
  return { counts, warnings: plan.warnings };
}
