import type { CaptureRow } from "@crumble/schema";
import { captures } from "@crumble/schema";
import type { InferInsertModel } from "drizzle-orm";
import { asc } from "drizzle-orm";
import type { Db } from "../db/client";

/** Insert payload for {@link CapturesRepo.insertMany}. */
export type CaptureInsert = InferInsertModel<typeof captures>;

/** The capture-ledger lines of every loaded record. */
export interface CapturesRepo {
  /**
   * Lists every capture, ordered by record, then path.
   *
   * @returns the rows
   */
  list(): CaptureRow[];
  /**
   * Inserts every row in `rows`.
   *
   * @param rows - the ledger lines to insert; `[]` inserts nothing
   * @throws if a row repeats a record's path or misses a NOT NULL column
   */
  insertMany(rows: CaptureInsert[]): void;
}

/**
 * Builds a {@link CapturesRepo}.
 *
 * @param db - database or transaction handle
 * @returns the repo
 */
export function createCapturesRepo(db: Db): CapturesRepo {
  return {
    /** @inheritdoc */
    list: () =>
      db.select().from(captures).orderBy(asc(captures.recordSlug), asc(captures.path)).all(),
    /** @inheritdoc */
    insertMany: (rows) => {
      if (rows.length > 0) db.insert(captures).values(rows).run();
    },
  };
}
