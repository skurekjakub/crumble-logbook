import type { ResearchRecordRow } from "@crumble/schema";
import { researchRecords } from "@crumble/schema";
import type { InferInsertModel } from "drizzle-orm";
import { asc, count, eq } from "drizzle-orm";
import type { Db } from "../db/client";

/** Insert/upsert payload for {@link RecordsRepo.upsert}. */
export type RecordInsert = InferInsertModel<typeof researchRecords>;

/** The research records (one row per investigated question), keyed by `slug`. */
export interface RecordsRepo {
  /** Lists every research record, ordered by `slug`. */
  list(): ResearchRecordRow[];
  /**
   * Returns the record with `slug`, or `undefined` if there is none.
   * @param slug - the record's slug
   */
  get(slug: string): ResearchRecordRow | undefined;
  /**
   * Inserts a research record, or updates it in place if its `slug` already
   * exists.
   * @param row - the record to write
   * @returns the written row
   */
  upsert(row: RecordInsert): ResearchRecordRow;
  /** Returns the number of research records. */
  count(): number;
}

/**
 * Builds a {@link RecordsRepo}.
 * @param db - database or transaction handle
 */
export function createRecordsRepo(db: Db): RecordsRepo {
  return {
    list: () => db.select().from(researchRecords).orderBy(asc(researchRecords.slug)).all(),
    get: (slug) => db.select().from(researchRecords).where(eq(researchRecords.slug, slug)).get(),
    upsert: (row) =>
      db
        .insert(researchRecords)
        .values(row)
        .onConflictDoUpdate({ target: researchRecords.slug, set: row })
        .returning()
        .get(),
    count: () => db.select({ n: count() }).from(researchRecords).get()!.n,
  };
}
