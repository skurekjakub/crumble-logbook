import { ImportError } from "../errors";
import type { TableKey } from "../registry";
import { TABLE_KEYS } from "../registry";
import type { Store } from "../repos";
import type { RecordPlan } from "./read-record";

/** Rows per registered table after an import, keyed by the table's registry name. */
export type ImportCounts = Record<TableKey, number>;

/**
 * Writes a read record in one transaction: refuses a database that already
 * has content unless `replace` is set, in which case every registered table
 * is cleared first (in reverse registry order, children before parents)
 * with its id counter reset; then runs the plan's steps in order.
 *
 * @param store - the store to write to
 * @param plan - the record, read and validated by `readRecord`
 * @param replace - clear every registered table first, instead of refusing
 * @returns every registered table's row count after the writes
 * @throws {ImportError} `"database already has content; pass --replace to
 *   load record <slug> over it"` if any registered table has rows and
 *   `replace` isn't set
 * @throws whatever a step throws (a constraint violation), after rolling
 *   back every write, the clears and the id counter resets included
 */
export function writeRecord(store: Store, plan: RecordPlan, replace: boolean): ImportCounts {
  // See `DeckService.create`'s implementation for why the inner return is
  // cast `as never` and the outer call `as ImportCounts`.
  return store.transaction((repos) => {
    if (TABLE_KEYS.some((key) => repos.tables.count(key) > 0)) {
      if (!replace) {
        throw new ImportError(
          "<db>",
          null,
          `database already has content; pass --replace to load record ${plan.slug} over it`,
        );
      }
      for (const key of [...TABLE_KEYS].reverse()) repos.tables.clear(key);
    }
    for (const step of plan.steps) step(repos);
    return Object.fromEntries(TABLE_KEYS.map((key) => [key, repos.tables.count(key)])) as never;
  }) as ImportCounts;
}
