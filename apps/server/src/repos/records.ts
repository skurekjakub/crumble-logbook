import type { RecordModeRow, ResearchRecordRow } from "@crumble/schema";
import { recordModes, researchRecords } from "@crumble/schema";
import type { InferInsertModel } from "drizzle-orm";
import { asc, count, eq } from "drizzle-orm";
import type { Db } from "../db/client";

/** Insert/upsert payload for {@link RecordsRepo.upsert}. */
export type RecordInsert = InferInsertModel<typeof researchRecords>;

/** One mode a record covers, without the record it belongs to. */
export type RecordModeInsert = Omit<RecordModeRow, "recordSlug">;

/**
 * The research records (one row per investigated question), keyed by
 * `slug`, and the game modes each covers (`record_modes`).
 */
export interface RecordsRepo {
  /** Lists every research record, ordered by `slug`. */
  list(): ResearchRecordRow[];
  /**
   * Returns the record with `slug`, or `undefined` if there is none.
   *
   * @param slug - the record's slug
   */
  get(slug: string): ResearchRecordRow | undefined;
  /**
   * Inserts a research record, or updates it in place if its `slug` already
   * exists.
   *
   * @param row - the record to write
   * @returns the written row
   */
  upsert(row: RecordInsert): ResearchRecordRow;
  /** Returns the number of research records. */
  count(): number;
  /** Lists every record's covered modes, ordered by record slug then mode. */
  modes(): RecordModeRow[];
  /**
   * Replaces the modes record `slug` covers with `modes`.
   *
   * @param slug - the record's slug
   * @param modes - the modes, each with its lede and caveat; `[]` clears them
   * @throws if `slug` isn't a research record, or a mode repeats
   */
  replaceModes(slug: string, modes: readonly RecordModeInsert[]): void;
}

/**
 * Builds a {@link RecordsRepo}.
 *
 * @param db - database or transaction handle
 * @returns the repo
 */
export function createRecordsRepo(db: Db): RecordsRepo {
  return {
    /** @inheritdoc */
    list: () => db.select().from(researchRecords).orderBy(asc(researchRecords.slug)).all(),
    /** @inheritdoc */
    get: (slug) => db.select().from(researchRecords).where(eq(researchRecords.slug, slug)).get(),
    /** @inheritdoc */
    upsert: (row) =>
      db
        .insert(researchRecords)
        .values(row)
        .onConflictDoUpdate({ target: researchRecords.slug, set: row })
        .returning()
        .get(),
    /** @inheritdoc */
    count: () => db.select({ n: count() }).from(researchRecords).get()!.n,
    /** @inheritdoc */
    modes: () =>
      db
        .select()
        .from(recordModes)
        .orderBy(asc(recordModes.recordSlug), asc(recordModes.mode))
        .all(),
    /** @inheritdoc */
    replaceModes: (slug, modes) => {
      db.delete(recordModes).where(eq(recordModes.recordSlug, slug)).run();
      if (modes.length > 0) {
        db.insert(recordModes)
          .values(modes.map((mode) => ({ ...mode, recordSlug: slug })))
          .run();
      }
    },
  };
}
