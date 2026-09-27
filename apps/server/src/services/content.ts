import type { CitedEntity } from "@crumble/schema";
import { NotFoundError } from "../errors";
import type { Repos, Store } from "../repos";
import type { TableRepo } from "../repos/table-repo";
import { assertSourcesExist } from "./citations";
import type { Cited } from "./citations";

/**
 * CRUD over a cited-content table: every row carries the source ids that
 * back it, and every write keeps the citation set consistent with the row.
 *
 * @typeParam Row - the shape of a selected row
 * @typeParam Values - the column values accepted on create, in full, and on
 *   update, as a partial patch
 */
export interface ContentService<Row, Values> {
  /** Returns every row, each with its `sources`, in the table's list order. */
  list(): Cited<Row>[];
  /**
   * Returns the row with `id`, with its `sources`.
   * @param id - the row's primary key
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: number): Cited<Row>;
  /**
   * Inserts a row and cites it.
   * @param values - the column values
   * @param sources - the source ids that back the row
   * @throws {UnknownRefsError} if any `sources` id doesn't exist; no row is
   *   written
   */
  create(values: Values, sources: string[]): Cited<Row>;
  /**
   * Updates the row with `id`, merging in `patch`.
   * @param id - the row's primary key
   * @param patch - the column values to merge in
   * @param sources - when given, replaces the row's citations; when
   *   omitted, the existing citations are kept
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws {UnknownRefsError} if any `sources` id doesn't exist
   */
  update(id: number, patch: Partial<Values>, sources?: string[]): Cited<Row>;
  /**
   * Deletes the row with `id` and its citations.
   * @param id - the row's primary key
   * @throws {NotFoundError} if `id` doesn't exist
   */
  remove(id: number): void;
}

/** Configuration for {@link createContentService}. */
export interface ContentServiceSpec<Row extends { id: number }, Values> {
  /** The `CitedEntity` this table's rows are cited under. */
  entity: CitedEntity;
  /** Selects this content's table repo out of `repos`. */
  table(repos: Repos): TableRepo<Row, Values>;
  /**
   * Validates cross-table references in `values` before a write, beyond
   * plain source citations (e.g. a score's `deckId`).
   * @throws to reject the write
   */
  checkRefs?(repos: Repos, values: Partial<Values>): void;
}

/**
 * Builds a {@link ContentService} over one cited-content table.
 *
 * Every write runs inside `store.transaction`: it checks the cited sources
 * exist, runs `spec.checkRefs`, writes the row, then replaces its
 * citations. `update` only touches citations when `sources` is given.
 *
 * @param store - the store to persist through
 * @param spec - the table and entity this service manages
 * @returns the service
 */
export function createContentService<Row extends { id: number }, Values>(
  store: Store,
  spec: ContentServiceSpec<Row, Values>,
): ContentService<Row, Values> {
  const { entity, table, checkRefs } = spec;

  const withSources = (repos: Repos, row: Row): Cited<Row> => {
    const sources = repos.citations.sourcesFor(entity, [String(row.id)]).get(String(row.id)) ?? [];
    return { ...row, sources };
  };

  return {
    list: () => {
      const repos = store.repos;
      const rows = table(repos).list();
      const sourcesById = repos.citations.sourcesFor(
        entity,
        rows.map((row) => String(row.id)),
      );
      return rows.map((row) => ({ ...row, sources: sourcesById.get(String(row.id)) ?? [] }));
    },
    get: (id) => {
      const repos = store.repos;
      const row = table(repos).get(id);
      if (!row) throw new NotFoundError(entity, id);
      return withSources(repos, row);
    },
    // `store.transaction`'s return type is gated on `T extends Promise<any>
    // ? never : T`, which doesn't resolve while `T` (here `Cited<Row>`) is
    // still generic inside this function — the same naked-generic limitation
    // documented on `Store.transaction` itself. The inner `as never` and
    // outer `as Cited<Row>` restore the real, still-synchronous, return type.
    create: (values, sources) =>
      store.transaction((repos) => {
        assertSourcesExist(repos, sources);
        checkRefs?.(repos, values);
        const row = table(repos).insert(values);
        repos.citations.replace(entity, String(row.id), sources);
        return { ...row, sources } as never;
      }) as Cited<Row>,
    update: (id, patch, sources) =>
      store.transaction((repos) => {
        if (sources) assertSourcesExist(repos, sources);
        checkRefs?.(repos, patch);
        const repo = table(repos);
        // A patch with no columns (replacing only the citations) has
        // nothing for `UPDATE ... SET` to set, which drizzle rejects; read
        // the row back instead of writing an empty update.
        const row = Object.keys(patch as object).length > 0 ? repo.update(id, patch) : repo.get(id);
        if (!row) throw new NotFoundError(entity, id);
        if (sources) repos.citations.replace(entity, String(row.id), sources);
        const finalSources =
          sources ?? repos.citations.sourcesFor(entity, [String(row.id)]).get(String(row.id)) ?? [];
        return { ...row, sources: finalSources } as never;
      }) as Cited<Row>,
    remove: (id) =>
      store.transaction((repos) => {
        const repo = table(repos);
        if (!repo.get(id)) throw new NotFoundError(entity, id);
        repos.citations.removeAll(entity, String(id));
        repo.remove(id);
      }),
  };
}
