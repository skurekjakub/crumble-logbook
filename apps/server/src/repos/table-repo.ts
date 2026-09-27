import type { InferInsertModel, InferSelectModel, SQL } from "drizzle-orm";
import { asc, count, desc, eq, sql } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import type { Db } from "../db/client";
import type { OrderKey } from "../registry";
import { resetIds } from "./sequence";

/** A drizzle SQLite table with an integer `id` primary key column. */
type IdTable = SQLiteTable & { id: SQLiteColumn };

/**
 * Translates a declared list order into drizzle `ORDER BY` terms.
 *
 * @param table - the table the columns belong to
 * @param keys - the order, most significant first; a `nullsLast` key sorts
 *   by `<column> is null` before the column itself
 * @returns the terms, for {@link createTableRepo}'s `orderBy`
 * @throws `Error` naming the column if `table` has no such column
 */
export function orderTerms<T extends SQLiteTable>(
  table: T,
  keys: readonly OrderKey<InferSelectModel<T>>[],
): (SQL | SQLiteColumn)[] {
  return keys.flatMap((key) => {
    const { column, desc: descending, nullsLast } = typeof key === "string" ? { column: key } : key;
    const col = (table as unknown as Record<string, SQLiteColumn | undefined>)[column];
    if (!col) throw new Error(`table has no column "${column}"`);
    const term = descending ? desc(col) : asc(col);
    return nullsLast ? [sql`${col} is null`, term] : [term];
  });
}

/**
 * Generic CRUD operations over a table with an integer `id` primary key.
 *
 * @typeParam Row - the shape of a selected row
 * @typeParam Insert - the shape accepted by `insert`
 */
export interface TableRepo<Row, Insert> {
  /** Returns every row, in the repo's configured order. */
  list(): Row[];
  /**
   * Returns the row with `id`, or `undefined` if there is none.
   * @param id - the row's primary key
   * @returns the matching row, or `undefined` if `id` doesn't exist
   */
  get(id: number): Row | undefined;
  /**
   * Inserts a row.
   * @throws if `values` violates a constraint (e.g. a unique index, a
   *   foreign key, or a NOT NULL column)
   */
  insert(values: Insert): Row;
  /**
   * Updates the row with `id`, merging in `patch`.
   * @returns the updated row, or `undefined` if `id` doesn't exist
   * @throws if the patch violates a constraint
   */
  update(id: number, patch: Partial<Insert>): Row | undefined;
  /**
   * Deletes the row with `id`.
   * @param id - the row's primary key
   * @returns `true` if a row was deleted, `false` if `id` didn't exist
   */
  remove(id: number): boolean;
  /** Returns the number of rows in the table. */
  count(): number;
  /** Deletes every row in the table and resets its id counter, so the next insert gets id 1. */
  clear(): void;
}

/**
 * Builds a {@link TableRepo} for a table with an integer `id` primary key.
 *
 * @param db - database or transaction handle
 * @param table - the drizzle table
 * @param orderBy - list order; defaults to ascending `id`
 * @returns the repo; `get`/`update` return `undefined` for an unknown id
 */
export function createTableRepo<T extends IdTable>(
  db: Db,
  table: T,
  orderBy: (SQL | SQLiteColumn)[] = [asc(table.id)],
): TableRepo<InferSelectModel<T>, InferInsertModel<T>> {
  type Row = InferSelectModel<T>;
  const base = table as SQLiteTable;
  return {
    list: () =>
      db
        .select()
        .from(base)
        .orderBy(...orderBy)
        .all() as Row[],
    get: (id) => db.select().from(base).where(eq(table.id, id)).get() as Row | undefined,
    insert: (values) =>
      db
        .insert(base)
        .values(values as InferInsertModel<SQLiteTable>)
        .returning()
        .get() as Row,
    update: (id, patch) =>
      db
        .update(base)
        .set(patch as Partial<InferInsertModel<SQLiteTable>>)
        .where(eq(table.id, id))
        .returning()
        .get() as Row | undefined,
    remove: (id) =>
      db.delete(base).where(eq(table.id, id)).returning({ id: table.id }).all().length > 0,
    count: () => db.select({ n: count() }).from(base).get()!.n,
    clear: () => {
      db.delete(base).run();
      resetIds(db, base);
    },
  };
}
