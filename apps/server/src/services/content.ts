import type { CitedEntity } from "@crumble/schema";
import { NotFoundError, UnknownRefsError } from "../errors";
import type { AnyFilters, ContentKey, FiltersOf, Registry, RowOf, ValuesOf } from "../registry";
import { specOf } from "../registry";
import type { Repos, Store } from "../repos";
import type { TableRepo } from "../repos/table-repo";
import { assertSourcesExist } from "./citations";
import type { Cited } from "./citations";
import { applyFilters, filtersNeedGlossary } from "./filters";
import type { NameRef } from "./names";
import { createNameResolver } from "./names";

/**
 * CRUD over a cited-content table: every row carries the source ids that
 * back it, and every write keeps the citation set consistent with the row.
 *
 * @typeParam Row - the shape of a selected row
 * @typeParam Values - the column values accepted on create, in full, and on
 *   update, as a partial patch
 * @typeParam View - what reads and writes return: the row with its
 *   `sources`, plus any fields the type adds
 * @typeParam Filter - the list filters, by name
 */
export interface ContentService<
  Row,
  Values,
  View = Cited<Row>,
  Filter extends object = Record<never, never>,
> {
  /**
   * Returns every view, in the table's list order.
   * @param filter - the list filter values to apply, when given; an absent
   *   value doesn't filter
   */
  list(filter?: Filter): View[];
  /**
   * Returns the view of the row with `id`.
   * @param id - the row's primary key
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: number): View;
  /**
   * Inserts a row and cites it.
   * @param values - the column values
   * @param sources - the source ids that back the row
   * @throws {UnknownRefsError} if any `sources` id, or any id a declared
   *   reference column holds, doesn't exist; no row is written
   */
  create(values: Values, sources: string[]): View;
  /**
   * Updates the row with `id`, merging in `patch`.
   * @param id - the row's primary key
   * @param patch - the column values to merge in
   * @param sources - when given, replaces the row's citations; when
   *   omitted, the existing citations are kept
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws {UnknownRefsError} if any `sources` id, or a referenced id,
   *   doesn't exist
   */
  update(id: number, patch: Partial<Values>, sources?: string[]): View;
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
  /** The list filters `list` applies, by name. */
  filters?: AnyFilters;
  /** A Korean-name column whose English gloss each view carries as `en`. */
  gloss?: string;
}

/**
 * Builds a {@link ContentService} over one cited-content table.
 *
 * Every write runs inside `store.transaction`: it checks the cited sources
 * exist, runs `spec.checkRefs`, writes the row, then replaces its
 * citations. `update` only touches citations when `sources` is given. A
 * view is the row, then `sources`, then `en` when `spec.gloss` names a
 * column.
 *
 * @param store - the store to persist through
 * @param spec - the table and entity this service manages
 * @returns the service
 */
export function createContentService<
  Row extends { id: number },
  Values,
  View = Cited<Row>,
  Filter extends object = Record<never, never>,
>(store: Store, spec: ContentServiceSpec<Row, Values>): ContentService<Row, Values, View, Filter> {
  const { entity, table, checkRefs, filters, gloss } = spec;
  const usesGlossary = gloss !== undefined || filtersNeedGlossary(filters);

  const resolver = (repos: Repos) =>
    usesGlossary ? createNameResolver(repos.glossary.list()) : undefined;
  const toView = (row: Row, sources: string[], resolve?: (name: string) => NameRef): View =>
    (gloss !== undefined && resolve
      ? { ...row, sources, en: resolve(String((row as Record<string, unknown>)[gloss])).en }
      : { ...row, sources }) as View;
  const withSources = (repos: Repos, row: Row): View => {
    const sources = repos.citations.sourcesFor(entity, [String(row.id)]).get(String(row.id)) ?? [];
    return toView(row, sources, resolver(repos));
  };

  return {
    list: (filter) => {
      const repos = store.repos;
      const rows = table(repos).list();
      const sourcesById = repos.citations.sourcesFor(
        entity,
        rows.map((row) => String(row.id)),
      );
      const resolve = resolver(repos);
      const views = rows.map((row) => toView(row, sourcesById.get(String(row.id)) ?? [], resolve));
      return applyFilters(views, filters, filter as Record<string, string | undefined>, resolve);
    },
    get: (id) => {
      const repos = store.repos;
      const row = table(repos).get(id);
      if (!row) throw new NotFoundError(entity, id);
      return withSources(repos, row);
    },
    // `store.transaction`'s return type is gated on `T extends Promise<any>
    // ? never : T`, which doesn't resolve while `T` (here `View`) is still
    // generic inside this function — the same naked-generic limitation
    // documented on `Store.transaction` itself. The inner `as never` and
    // outer `as View` restore the real, still-synchronous, return type.
    create: (values, sources) =>
      store.transaction((repos) => {
        assertSourcesExist(repos, sources);
        checkRefs?.(repos, values);
        const row = table(repos).insert(values);
        repos.citations.replace(entity, String(row.id), sources);
        return toView(row, sources, resolver(repos)) as never;
      }) as View,
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
        if (!sources) return withSources(repos, row) as never;
        repos.citations.replace(entity, String(row.id), sources);
        return toView(row, sources, resolver(repos)) as never;
      }) as View,
    remove: (id) =>
      store.transaction((repos) => {
        const repo = table(repos);
        if (!repo.get(id)) throw new NotFoundError(entity, id);
        repos.citations.removeAll(entity, String(id));
        repo.remove(id);
      }),
  };
}

/**
 * What a registered content type's reads and writes return: the row, its
 * `sources`, and `en` when the type glosses a name column.
 */
export type ContentView<K extends ContentKey> = Cited<RowOf<K>> &
  (Registry[K]["content"] extends { gloss: string } ? { en: string | null } : unknown);

/** The service of the registered content type `K`. */
export type RegisteredService<K extends ContentKey> = ContentService<
  RowOf<K>,
  ValuesOf<K>,
  ContentView<K>,
  FiltersOf<K>
>;

/**
 * Builds the {@link ContentService} of a registered content type from its
 * registry entry: its entity, table repo, list filters, glossed column,
 * and reference columns (each id checked to exist before a write).
 *
 * @param store - the store to persist through
 * @param key - the type's registry key
 * @returns the service
 */
export function registeredService<K extends ContentKey>(
  store: Store,
  key: K,
): RegisteredService<K> {
  const { entity, content, filters } = specOf(key);
  const refColumns = Object.keys(content?.refs ?? {});
  return createContentService<{ id: number }, Record<string, unknown>>(store, {
    entity: entity!,
    table: (repos) => repos[key] as unknown as TableRepo<{ id: number }, Record<string, unknown>>,
    filters,
    gloss: content?.gloss,
    checkRefs: (repos, values) => {
      for (const column of refColumns) {
        const id = values[column];
        if (typeof id === "string" && !repos.decks.exists(id)) {
          throw new UnknownRefsError("decks", [id]);
        }
      }
    },
  }) as unknown as RegisteredService<K>;
}

/**
 * The shape the generic CRUD router drives: create and update take the
 * whole request body, `sources` included.
 *
 * @typeParam Id - the `:id` path parameter's parsed type
 * @typeParam Input - the parsed `POST` body
 * @typeParam Patch - the parsed `PATCH` body
 * @typeParam View - what reads and writes return
 * @typeParam Filter - the list filters, by name
 */
export interface CrudEndpoints<Id, Input, Patch, View, Filter> {
  /** Returns every view, filtered by `filter`'s given values. */
  list(filter?: Filter): View[];
  /**
   * Returns the view for `id`.
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: Id): View;
  /** Creates a row (or aggregate) from `input`. */
  create(input: Input): View;
  /**
   * Updates the row (or aggregate) with `id` from `patch`.
   * @throws {NotFoundError} if `id` doesn't exist
   */
  update(id: Id, patch: Patch): View;
  /**
   * Deletes the row (or aggregate) with `id`.
   * @throws {NotFoundError} if `id` doesn't exist
   */
  remove(id: Id): void;
}

/**
 * Adapts a {@link ContentService} to {@link CrudEndpoints}: `sources` is
 * split off the request body and passed alongside the column values.
 *
 * @param svc - the content service
 * @returns the endpoints, delegating to `svc`
 */
export function contentEndpoints<Row, Values, View, Filter extends object>(
  svc: ContentService<Row, Values, View, Filter>,
): CrudEndpoints<
  number,
  Values & { sources: string[] },
  Partial<Values> & { sources?: string[] },
  View,
  Filter
> {
  return {
    list: (filter) => svc.list(filter),
    get: (id) => svc.get(id),
    create: ({ sources, ...values }) => svc.create(values as Values, sources),
    update: (id, { sources, ...values }) => svc.update(id, values as Partial<Values>, sources),
    remove: (id) => svc.remove(id),
  };
}
