/**
 * Game facts several records can load: rows keyed by what they describe
 * rather than by who loaded them, so a later record's identical row is the
 * same fact and a differing one is a conflict.
 *
 * @module
 */
import { ImportError } from "../errors";
import type { ContentKey, ValuesOf } from "../registry";
import { specOf } from "../registry";
import type { TableRepo } from "../repos/table-repo";
import type { CitedValues, WriteStep } from "./steps";

/** How a content type's rows are compared as shared facts. */
export interface SharedFacts<K extends ContentKey> {
  /** The content type's registry key. */
  key: K;
  /** The capture's record-relative path, as a conflict error names it. */
  file: string;
  /** The fields that identify a fact: rows equal on all of them describe the same thing. */
  identity: readonly (keyof ValuesOf<K>)[];
  /** The fields two records' versions of one fact must agree on. */
  facts: readonly (keyof ValuesOf<K>)[];
  /** Column defaults the table fills for a field a row leaves out, so a comparison sees the stored value. */
  defaults?: Partial<ValuesOf<K>>;
  /**
   * Names a conflicting row for the error.
   *
   * @param values - the incoming row
   * @returns the error's row (e.g. `<cookie> grade 3`) and what the row is (e.g. `buff value (effect type X)`)
   */
  describe(values: ValuesOf<K>): { row: string; what: string };
}

/**
 * A step writing rows of a content type as shared game facts: a row whose
 * identity no record has loaded is inserted, owned by the record being
 * written and cited to its sources; a row another record already loaded is
 * skipped when its facts agree.
 *
 * @typeParam K - the content type's registry key
 * @param spec - the content type and how its rows are compared
 * @param rows - the rows, with their sources
 * @returns the step
 * @throws {ImportError} (from the step) naming `spec.file` and the row, if a
 *   row's facts differ from the ones another record loaded; the import then
 *   writes nothing
 */
export function insertSharedFacts<K extends ContentKey>(
  spec: SharedFacts<K>,
  rows: ReadonlyArray<CitedValues<ValuesOf<K>>>,
): WriteStep {
  return factsStep(spec, rows, true);
}

/**
 * A step writing rows of an ownerless content type (one with no record
 * column) as game facts: a row whose identity isn't stored yet is inserted
 * and cited to its sources, owned by no record, so no record's re-import
 * clears it; a stored row is skipped when its facts agree.
 *
 * @typeParam K - the content type's registry key
 * @param spec - the content type and how its rows are compared
 * @param rows - the rows, with their sources
 * @returns the step
 * @throws {ImportError} (from the step) naming `spec.file` and the row, if a
 *   row's facts differ from the stored game fact; the import then writes
 *   nothing
 */
export function insertGameFacts<K extends ContentKey>(
  spec: SharedFacts<K>,
  rows: ReadonlyArray<CitedValues<ValuesOf<K>>>,
): WriteStep {
  return factsStep(spec, rows, false);
}

/**
 * Builds the step behind {@link insertSharedFacts} and {@link insertGameFacts}.
 *
 * @typeParam K - the content type's registry key
 * @param spec - the content type and how its rows are compared
 * @param rows - the rows, with their sources
 * @param owned - whether an inserted row is owned by the record being written
 * @returns the step
 */
function factsStep<K extends ContentKey>(
  spec: SharedFacts<K>,
  rows: ReadonlyArray<CitedValues<ValuesOf<K>>>,
  owned: boolean,
): WriteStep {
  const entity = specOf(spec.key).entity!;
  /**
   * Builds the identity key of a row.
   *
   * @param v - the row, stored or incoming
   * @returns the identity fields' values, joined by `|`
   */
  const identityOf = (v: Partial<Record<keyof ValuesOf<K>, unknown>>) =>
    spec.identity.map((field) => String(v[field])).join("|");
  return (repos, { record }) => {
    type Stored = { id: number; recordSlug: string | null } & Record<keyof ValuesOf<K>, unknown>;
    const repo = repos[spec.key] as unknown as TableRepo<Stored, ValuesOf<K>>;
    const loaded = new Map(repo.list().map((row) => [identityOf(row), row]));
    for (const { values, sources } of rows) {
      const existing = loaded.get(identityOf(values));
      if (existing) {
        const incoming: Partial<ValuesOf<K>> = { ...spec.defaults, ...values };
        if (spec.facts.every((field) => existing[field] === (incoming[field] ?? null))) continue;
        const { row, what } = spec.describe(values);
        const holder = owned
          ? `the one record ${existing.recordSlug ?? "(none)"} loaded`
          : "the stored game fact";
        throw new ImportError(spec.file, row, `${what} conflicts with ${holder}`);
      }
      const row = repo.insert(owned ? { ...values, recordSlug: record } : values);
      repos.citations.replace(entity, String(row.id), [...sources]);
    }
  };
}
