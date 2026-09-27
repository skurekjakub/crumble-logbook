import { count, getTableColumns } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import type { Db } from "../db/client";
import type { RowOf, TableKey } from "../registry";
import { REGISTRY } from "../registry";
import { resetIds } from "./sequence";

/** Rows per multi-row insert, well under SQLite's bound-parameter limit for any registered table. */
const LOAD_CHUNK = 500;

/**
 * Whole-table operations over every registered table, by snapshot name:
 * what snapshots, restores and replace imports need, without a method per
 * table.
 */
export interface TablesRepo {
  /**
   * Returns every row of `key`, sorted ascending by its primary key (numbers
   * numerically, text by code unit, composite keys column by column),
   * independent of any list order.
   * @param key - the table's snapshot name
   */
  dump<K extends TableKey>(key: K): RowOf<K>[];
  /**
   * Inserts `rows` into `key` as they are, ids included.
   * @param key - the table's snapshot name
   * @param rows - full rows; `[]` inserts nothing
   * @throws if a row breaks a constraint (a taken id, a missing foreign key)
   */
  load<K extends TableKey>(key: K, rows: readonly RowOf<K>[]): void;
  /**
   * Returns the number of rows in `key`.
   * @param key - the table's snapshot name
   */
  count(key: TableKey): number;
  /**
   * Deletes every row of `key` and resets its id counter, so the next
   * insert gets id 1.
   * @param key - the table's snapshot name
   * @throws if a row of another table still references one of its rows
   */
  clear(key: TableKey): void;
}

/**
 * Returns the JS keys of `table`'s primary-key columns, in key order.
 * @param table - the table
 * @returns the single primary-key column, or a composite key's columns
 */
function primaryKey(table: SQLiteTable): string[] {
  const columns = Object.entries(getTableColumns(table)) as Array<[string, SQLiteColumn]>;
  const keyOf = (column: SQLiteColumn) => columns.find(([, c]) => c === column)![0];
  const composite = getTableConfig(table).primaryKeys[0];
  if (composite) return composite.columns.map(keyOf);
  return columns.filter(([, column]) => column.primary).map(([key]) => key);
}

/**
 * Compares two rows by the columns in `key`, in order.
 * @returns negative, zero or positive, as for `Array.prototype.sort`
 */
function compareBy(key: readonly string[]) {
  return (a: Record<string, unknown>, b: Record<string, unknown>): number => {
    for (const column of key) {
      const x = a[column];
      const y = b[column];
      const order =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x) < String(y)
            ? -1
            : String(x) > String(y)
              ? 1
              : 0;
      if (order !== 0) return order;
    }
    return 0;
  };
}

/**
 * Builds a {@link TablesRepo}.
 * @param db - database or transaction handle
 */
export function createTablesRepo(db: Db): TablesRepo {
  const tableOf = (key: TableKey) => REGISTRY[key].table as SQLiteTable;
  return {
    dump: (key) => {
      const table = tableOf(key);
      const rows = db.select().from(table).all() as Record<string, unknown>[];
      return rows.sort(compareBy(primaryKey(table))) as RowOf<typeof key>[];
    },
    load: (key, rows) => {
      const table = tableOf(key);
      for (let start = 0; start < rows.length; start += LOAD_CHUNK) {
        db.insert(table)
          .values(rows.slice(start, start + LOAD_CHUNK) as never[])
          .run();
      }
    },
    count: (key) => db.select({ n: count() }).from(tableOf(key)).get()!.n,
    clear: (key) => {
      const table = tableOf(key);
      db.delete(table).run();
      resetIds(db, table);
    },
  };
}
