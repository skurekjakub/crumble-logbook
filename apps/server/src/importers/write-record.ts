import { ImportError } from "../errors";
import type { TableKey } from "../registry";
import { TABLE_KEYS, recordColumnOf, specOf } from "../registry";
import type { Repos, Store } from "../repos";
import type { RecordPlan } from "./read-record";

/** Rows an import inserted, per registered table, keyed by the table's registry name. */
export type ImportCounts = Record<TableKey, number>;

/** What {@link writeRecord} did. */
export interface WriteResult {
  /** Rows the import inserted, per table. */
  counts: ImportCounts;
  /** Findings the write steps reported, such as shared rows another record already loaded. */
  warnings: string[];
}

/** The tables whose rows a research record owns, in registry order. */
const OWNED_KEYS = TABLE_KEYS.filter((key) => recordColumnOf(key) !== undefined);

/**
 * Deletes the rows record `slug` owns, children before parents, with the
 * citations of every cited row among them, then restarts every table's id
 * counter past its highest id left. Child rows (deck cookies, rune build
 * decks) go with their parents. A shared row that another record's rows
 * still reference, such as a source they cite, stays, still owned by
 * `slug`.
 */
function clearRecord(repos: Repos, slug: string): void {
  for (const key of [...OWNED_KEYS].reverse()) {
    const { entity } = specOf(key);
    if (entity) repos.citations.removeFor(entity, repos.tables.ownedIds(key, slug));
    repos.tables.clearOwned(key, slug);
  }
  for (const key of TABLE_KEYS) repos.tables.restartIds(key);
}

/** Every registered table's row count. */
function countAll(repos: Repos): ImportCounts {
  return Object.fromEntries(
    TABLE_KEYS.map((key) => [key, repos.tables.count(key)]),
  ) as ImportCounts;
}

/**
 * Writes a read record in one transaction, next to the rows other records
 * own. A record that is already loaded is refused unless `replace` is set,
 * in which case the rows it owns are cleared first (see the registry's
 * `recordColumnOf`), and every table's id counter restarts past its
 * highest id left. Then the plan's steps run in order, every row they
 * write owned by the record.
 *
 * @param store - the store to write to
 * @param plan - the record, read and validated by `readRecord`
 * @param replace - clear the record's own rows first, instead of refusing
 * @returns the rows inserted per table, and the steps' warnings
 * @throws {ImportError} `"record <slug> is already loaded; pass --replace to
 *   load it again"` if any table has a row the record owns and `replace`
 *   isn't set
 * @throws whatever a step throws (a constraint violation, or a conflict
 *   with a row another record loaded), after rolling back every write, the
 *   clears and the id counter resets included
 */
export function writeRecord(store: Store, plan: RecordPlan, replace: boolean): WriteResult {
  const { slug } = plan;
  // See `DeckService.create`'s implementation for why the inner return is
  // cast `as never` and the outer call `as WriteResult`.
  return store.transaction((repos) => {
    if (OWNED_KEYS.some((key) => repos.tables.countOwned(key, slug) > 0)) {
      if (!replace) {
        throw new ImportError(
          "<db>",
          null,
          `record ${slug} is already loaded; pass --replace to load it again`,
        );
      }
      clearRecord(repos, slug);
    }
    const before = countAll(repos);
    const warnings: string[] = [];
    const context = { record: slug, warn: (message: string) => void warnings.push(message) };
    for (const step of plan.steps) step(repos, context);
    const after = countAll(repos);
    const counts = Object.fromEntries(TABLE_KEYS.map((key) => [key, after[key] - before[key]]));
    return { counts, warnings } as never;
  }) as WriteResult;
}
