import type { ContentKey, ValuesOf } from "../registry";
import { specOf } from "../registry";
import type { Repos } from "../repos";
import type { TableRepo } from "../repos/table-repo";

/** Column values ready to insert, with the source ids the row cites. */
export interface CitedValues<V> {
  /** The row's column values. */
  values: V;
  /** The curated source ids the row cites. */
  sources: readonly string[];
}

/**
 * One step of an import's write phase: writes already read, validated and
 * mapped rows through the import transaction's repos. A step does no I/O
 * of its own, so a failure inside it can only be a database error.
 */
export type WriteStep = (repos: Repos) => void;

/**
 * A step inserting rows of a registered content type, in order, each cited
 * to its sources under the type's registered entity.
 *
 * @param key - the content type's registry key
 * @param rows - the rows, with their sources
 * @returns the step
 */
export function insertCited<K extends ContentKey>(
  key: K,
  rows: readonly CitedValues<ValuesOf<K>>[],
): WriteStep {
  const entity = specOf(key).entity!;
  return (repos) => {
    const repo = repos[key] as unknown as TableRepo<{ id: number }, ValuesOf<K>>;
    for (const { values, sources } of rows) {
      const row = repo.insert(values);
      repos.citations.replace(entity, String(row.id), [...sources]);
    }
  };
}
