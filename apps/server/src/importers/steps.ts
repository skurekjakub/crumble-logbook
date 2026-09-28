import type { ObsoleteEntity } from "@crumble/schema";
import { OBSOLESCENCE, isObsoleteEntity, obsolescenceKey } from "@crumble/schema";
import type { ContentKey, ValuesOf } from "../registry";
import { specOf } from "../registry";
import type { Repos } from "../repos";
import type { TableRepo } from "../repos/table-repo";

/** A curated row's `obsolete` block, as the write steps use it. */
export interface ObsoleteValues {
  /** Since when the row is no longer current, `YYYY-MM-DD`. */
  since: string;
  /** Why. */
  reason: string;
  /** The curated source ids that say so. */
  sources: readonly string[];
}

/** Column values ready to insert, with the source ids the row cites. */
export interface CitedValues<V> {
  /** The row's column values. */
  values: V;
  /** The curated source ids the row cites. */
  sources: readonly string[];
  /** The row's `obsolete` block, when it is obsolete. */
  obsolete?: ObsoleteValues | undefined;
}

/** What a write step knows besides the repos: the record it writes, and where findings go. */
export interface WriteContext {
  /** The slug of the record being written; every row a step writes is owned by it. */
  record: string;
  /**
   * Records a non-fatal finding about the database as the step found it,
   * such as a shared row another record already loaded.
   *
   * @param message - the finding, for a human
   */
  warn(message: string): void;
}

/**
 * One step of an import's write phase: writes already read, validated and
 * mapped rows through the import transaction's repos, owned by the
 * context's record. A step does no I/O of its own, so a failure inside it
 * is a database error or a conflict with rows another record loaded.
 */
export type WriteStep = (repos: Repos, context: WriteContext) => void;

/**
 * The lifecycle column values of a curated row.
 *
 * @param obsolete - the row's `obsolete` block, or `undefined` for a current row
 * @returns `obsoleteSince` and `obsoleteReason`, both `null` for a current row
 */
export function lifecycleColumns(obsolete: ObsoleteValues | undefined): {
  obsoleteSince: string | null;
  obsoleteReason: string | null;
} {
  return { obsoleteSince: obsolete?.since ?? null, obsoleteReason: obsolete?.reason ?? null };
}

/**
 * Cites why a row became obsolete, under its obsolescence key; does nothing
 * for a current row.
 *
 * @param repos - the write's repos
 * @param entity - the row's cited entity
 * @param id - the row's id
 * @param obsolete - the row's `obsolete` block, or `undefined` for a current row
 */
export function citeObsolescence(
  repos: Repos,
  entity: ObsoleteEntity,
  id: string | number,
  obsolete: ObsoleteValues | undefined,
): void {
  if (obsolete) {
    repos.citations.replace(OBSOLESCENCE, obsolescenceKey(entity, id), [...obsolete.sources]);
  }
}

/**
 * A step inserting rows of a registered content type, in order, each owned
 * by the record being written and cited to its sources under the type's
 * registered entity. A row with an `obsolete` block gets the lifecycle
 * columns and its reason's citations.
 *
 * @param key - the content type's registry key
 * @param rows - the rows, with their sources and any `obsolete` block
 * @returns the step
 * @throws `Error`, when the step runs, if a row has an `obsolete` block and
 *   the type has no obsolete lifecycle
 */
export function insertCited<K extends ContentKey>(
  key: K,
  rows: readonly CitedValues<ValuesOf<K>>[],
): WriteStep {
  const entity = specOf(key).entity!;
  return (repos, { record }) => {
    const repo = repos[key] as unknown as TableRepo<{ id: number }, ValuesOf<K>>;
    for (const { values, sources, obsolete } of rows) {
      if (obsolete && !isObsoleteEntity(entity)) {
        throw new Error(`${entity} rows have no obsolete lifecycle`);
      }
      const lifecycle = obsolete ? lifecycleColumns(obsolete) : {};
      const row = repo.insert({ ...values, ...lifecycle, recordSlug: record });
      repos.citations.replace(entity, String(row.id), [...sources]);
      if (obsolete && isObsoleteEntity(entity)) citeObsolescence(repos, entity, row.id, obsolete);
    }
  };
}
