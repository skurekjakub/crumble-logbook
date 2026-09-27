import type { Store } from "../repos";
import { readRecord } from "./read-record";
import type { ImportCounts } from "./write-record";
import { writeRecord } from "./write-record";

export type { ImportCounts } from "./write-record";

/** What {@link importRecord} wrote, plus anything worth a human's attention. */
export interface ImportResult {
  /** Rows the import inserted, per registered table. */
  counts: ImportCounts;
  /**
   * Non-fatal findings: glossary lookup keys that more than one entry
   * claims, shared rows (sources, glossary entries) another record already
   * loaded in a different version, and DC or Naver sources with no capture.
   */
  warnings: string[];
}

/** Options for {@link importRecord}. */
export interface ImportOptions {
  /** Clear the rows the record owns first, instead of refusing a record that is already loaded. */
  replace?: boolean;
}

/**
 * Loads a research record into the database, next to any other records:
 * its curated collections (see `collections.ts`), each row with its
 * citations, its ranking TSVs, and, when the manifest names them, its
 * fight timeline and buff capture. Sources get their English summary from
 * the record's extractions and, for `dc`/`nv` ids, the path of their
 * evidence capture. Every row it writes is owned by the record. Sources,
 * glossary entries and buff values can be shared: the first record to load
 * one owns it, and a later record keeps that row.
 *
 * Everything is read and checked before anything is written (`readRecord`),
 * and every write happens in one transaction (`writeRecord`): a failure
 * leaves the database as it was.
 *
 * @param store - the store to load into
 * @param recordDir - absolute path to the record directory (the one
 *   holding `import.json`)
 * @param opts - `replace: true` clears the rows the record owns first; in
 *   a database holding only this record, the result matches a fresh
 *   import, ids included
 * @returns rows inserted per table, and non-fatal warnings
 * @throws {ImportError} naming the file and row, if a file is missing or
 *   malformed, a row fails its schema, a row cites an unknown source or
 *   deck, two ranking rows share a key, or a buff value conflicts with the
 *   one another record loaded
 * @throws {ImportError} `"record <slug> is already loaded; pass --replace
 *   to load it again"` if the record owns rows and `replace` isn't set
 */
export function importRecord(
  store: Store,
  recordDir: string,
  opts: ImportOptions = {},
): ImportResult {
  const plan = readRecord(recordDir);
  const { counts, warnings } = writeRecord(store, plan, opts.replace ?? false);
  return { counts, warnings: [...plan.warnings, ...warnings] };
}
