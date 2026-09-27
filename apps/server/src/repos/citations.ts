import type { CitationRow, CitedEntity } from "@crumble/schema";
import { citations } from "@crumble/schema";
import { and, count, eq, inArray } from "drizzle-orm";
import type { Db } from "../db/client";

/** Links from cited entities (decks, mechanics, …) to the sources that back them. */
export interface CitationsRepo {
  /**
   * Groups the sources cited by each of `entityIds` for `entity`.
   * @param entity - the cited entity kind
   * @param entityIds - entity ids to look up
   * @returns a map from entity id to its sorted, deduplicated source ids;
   *   entity ids with no citations are absent from the map; `entityIds`
   *   of `[]` returns an empty map
   */
  sourcesFor(entity: CitedEntity, entityIds: string[]): Map<string, string[]>;
  /**
   * Replaces every citation for `(entity, entityId)` with `sourceIds`.
   * @param entity - the cited entity kind
   * @param entityId - the specific entity's id
   * @param sourceIds - the sources to cite; duplicates are removed
   * @throws if any `sourceIds` entry doesn't exist in `sources`
   */
  replace(entity: CitedEntity, entityId: string, sourceIds: string[]): void;
  /**
   * Deletes every citation for `(entity, entityId)`.
   * @param entity - the cited entity kind
   * @param entityId - the specific entity's id
   */
  removeAll(entity: CitedEntity, entityId: string): void;
  /** Returns how many citations reference `sourceId`, across every entity. */
  countForSource(sourceId: string): number;
  /** Returns the total number of citations. */
  count(): number;
  /** Deletes every citation. */
  clear(): void;
  /** Returns every citation row. */
  all(): CitationRow[];
  /**
   * Inserts `rows` into `citations` as-is, preserving `id`. For restoring a
   * snapshot.
   * @param rows - full citation rows, including `id`; `[]` inserts nothing
   * @throws if any row's `sourceId` doesn't exist, or its `id` or
   *   (entity, entityId, sourceId) is already taken
   */
  insertRaw(rows: CitationRow[]): void;
}

/**
 * Builds a {@link CitationsRepo}.
 * @param db - database or transaction handle
 */
export function createCitationsRepo(db: Db): CitationsRepo {
  return {
    sourcesFor: (entity, entityIds) => {
      const result = new Map<string, string[]>();
      if (entityIds.length === 0) return result;
      const rows = db
        .select({ entityId: citations.entityId, sourceId: citations.sourceId })
        .from(citations)
        .where(and(eq(citations.entity, entity), inArray(citations.entityId, entityIds)))
        .all();
      for (const row of rows) {
        const list = result.get(row.entityId);
        if (list) list.push(row.sourceId);
        else result.set(row.entityId, [row.sourceId]);
      }
      for (const list of result.values()) list.sort();
      return result;
    },
    replace: (entity, entityId, sourceIds) => {
      db.delete(citations)
        .where(and(eq(citations.entity, entity), eq(citations.entityId, entityId)))
        .run();
      const distinct = [...new Set(sourceIds)];
      if (distinct.length > 0) {
        db.insert(citations)
          .values(distinct.map((sourceId) => ({ entity, entityId, sourceId })))
          .run();
      }
    },
    removeAll: (entity, entityId) => {
      db.delete(citations)
        .where(and(eq(citations.entity, entity), eq(citations.entityId, entityId)))
        .run();
    },
    countForSource: (sourceId) =>
      db.select({ n: count() }).from(citations).where(eq(citations.sourceId, sourceId)).get()!.n,
    count: () => db.select({ n: count() }).from(citations).get()!.n,
    clear: () => {
      db.delete(citations).run();
    },
    all: () => db.select().from(citations).all(),
    insertRaw: (rows) => {
      if (rows.length > 0) db.insert(citations).values(rows).run();
    },
  };
}
