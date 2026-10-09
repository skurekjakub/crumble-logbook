import type { CitedEntity, GameMode, ObsoleteEntity } from "@crumble/schema";
import { OBSOLESCENCE, isObsoleteEntity, obsolescenceKey } from "@crumble/schema";
import { ConflictError, NotFoundError, UnknownRefsError } from "../errors";
import type {
  AnyFilters,
  ContentKey,
  DeckDungeon,
  FiltersOf,
  LinkTarget,
  LinkedRow,
  Registry,
  RowOf,
  ValuesOf,
} from "../registry";
import { CONTENT_KEYS, specOf } from "../registry";
import type { Repos, Store } from "../repos";
import type { TableRepo } from "../repos/table-repo";
import { assertSourcesExist } from "./citations";
import type { Cited } from "./citations";
import { deckModeMismatch } from "./deck-modes";
import { applyFilters, filtersNeedGlossary } from "./filters";
import type { NameResolver } from "./names";
import { createNameResolver, recordsOf } from "./names";

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
   *
   * @param filter - the list filter values to apply, when given; an absent
   *   value doesn't filter
   */
  list(filter?: Filter): View[];
  /**
   * Returns the view of the row with `id`.
   *
   * @param id - the row's primary key
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: number): View;
  /**
   * Inserts a row and cites it.
   *
   * @param values - the column values
   * @param sources - the source ids that back the row
   * @throws {UnknownRefsError} if any `sources` id, or any id a declared
   *   reference column holds, doesn't exist; no row is written
   * @throws whatever `spec.checkRow` throws for the written row; no row is
   *   kept
   */
  create(values: Values, sources: string[]): View;
  /**
   * Updates the row with `id`, merging in `patch`.
   *
   * @param id - the row's primary key
   * @param patch - the column values to merge in
   * @param sources - when given, replaces the row's citations; when
   *   omitted, the existing citations are kept
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws {UnknownRefsError} if any `sources` id, or a referenced id,
   *   doesn't exist
   * @throws whatever `spec.checkRow` or `spec.checkDetach` throws for the
   *   updated row; the row is left as it was
   */
  update(id: number, patch: Partial<Values>, sources?: string[]): View;
  /**
   * Deletes the row with `id`, its citations and any research record's
   * claim to it.
   *
   * @param id - the row's primary key
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws whatever `spec.checkDetach` throws for the row; nothing is deleted
   */
  remove(id: number): void;
}

/** Configuration for {@link createContentService}. */
export interface ContentServiceSpec<Row extends { id: number }, Values> {
  /** The `CitedEntity` this table's rows are cited under. */
  entity: CitedEntity;
  /** Selects this content's table repo out of `repos`. */
  table: (repos: Repos) => TableRepo<Row, Values>;
  /**
   * Validates cross-table references in `values` before a write, beyond
   * plain source citations (e.g. a score's `deckId`).
   *
   * @throws to reject the write
   */
  checkRefs?: (repos: Repos, values: Partial<Values>) => void;
  /**
   * Validates a row as written (column defaults applied, a patch merged in)
   * against other tables, inside the write's transaction.
   *
   * @throws to reject the write; the transaction rolls back
   */
  checkRow?: (repos: Repos, row: Row) => void;
  /**
   * Validates that a row may change or go, given the rows that depend on
   * it, inside the write's transaction: before a delete (`after`
   * undefined) and after an update.
   *
   * @throws to reject the write; the transaction rolls back
   */
  checkDetach?: (repos: Repos, before: Row, after: Row | undefined) => void;
  /**
   * The source ids a row names inside its columns. The row is cited to
   * them as well as to its own `sources`.
   *
   * @param row - the row
   * @returns the source ids
   */
  innerSources?: (row: Row) => string[];
  /**
   * Columns read from a row's other columns, set on the row after every
   * write, before `checkRow` runs.
   *
   * @param row - the written row
   * @returns the derived columns' values
   */
  derive?: (row: Row) => Partial<Row>;
  /** The list filters `list` applies, by name. */
  filters?: AnyFilters;
  /** A Korean-name column whose English gloss each view carries as `en`. */
  gloss?: string;
  /** The table's entity when its rows carry the obsolete lifecycle: views then carry `obsoleteSources`. */
  lifecycle?: ObsoleteEntity | undefined;
}

/**
 * Builds a {@link ContentService} over one cited-content table.
 *
 * Every write runs inside `store.transaction`: it checks the cited sources
 * exist, runs `spec.checkRefs`, writes the row, sets its `spec.derive`
 * columns, runs `spec.checkRow` on it, then replaces its citations: its
 * own `sources` and the ones `spec.innerSources` reads from the row. An
 * `update` without `sources` keeps the row's citations, trading the inner
 * sources the row named before for the ones it names now (a source it
 * cited both itself and inside a list it no longer names goes with the
 * list). A view is the row, then `sources` (its citations), then
 * `obsoleteSources` (the sources of its obsolete reason) when
 * `spec.lifecycle` names its entity, then `en` when `spec.gloss` names a
 * column, glossed with the row's own record's entries first. Deleting a
 * row deletes its obsolete reason's citations with it. The obsolete
 * lifecycle is the record importer's alone: the API's inputs leave it
 * out, and a caller of these writes must not pass it, since they would
 * store a reason without the citations the import gives it.
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
  const { entity, table, checkRefs, checkRow, checkDetach, derive, filters, gloss, lifecycle } =
    spec;
  const usesGlossary = gloss !== undefined || filtersNeedGlossary(filters);

  /**
   * The sources a row names inside its columns.
   *
   * @param row - the row
   * @returns the source ids, `[]` for a type that names none
   */
  const inner = (row: Row): string[] => spec.innerSources?.(row) ?? [];

  /**
   * A written row's citations: its own sources and the ones it names inside.
   *
   * @param repos - the write's repos
   * @param row - the written row
   * @param own - the row's own sources
   * @returns the citations stored: the own sources first, then the inner ones
   */
  const cite = (repos: Repos, row: Row, own: readonly string[]): string[] => {
    const all = [...new Set([...own, ...inner(row)])];
    repos.citations.replace(entity, String(row.id), all);
    return all;
  };

  /**
   * Sets a written row's derived columns, when `derive` names any whose
   * values differ.
   *
   * @param repo - the table's repo, in the write's transaction
   * @param row - the written row
   * @returns the row with its derived columns
   */
  const withDerived = (repo: TableRepo<Row, Values>, row: Row): Row => {
    if (!derive) return row;
    const derived = derive(row);
    const stale = Object.entries(derived).some(
      ([column, value]) => (row as Record<string, unknown>)[column] !== value,
    );
    return stale ? (repo.update(row.id, derived as Partial<Values>) ?? row) : row;
  };

  /**
   * Builds the name resolver views are glossed with.
   *
   * @param repos - the repos to read the glossary from
   * @returns the resolver, or `undefined` when neither `gloss` nor a filter needs the glossary
   */
  const resolver = (repos: Repos) =>
    usesGlossary ? createNameResolver(repos.glossary.list()) : undefined;
  /**
   * Reads the sources that say why each of `rows` became obsolete.
   *
   * @param repos - the repos to read citations from
   * @param rows - the rows
   * @returns each row's id → its reason's sources; empty for a table without the lifecycle
   */
  const reasonsOf = (repos: Repos, rows: readonly Row[]): Map<number, string[]> => {
    if (lifecycle === undefined) return new Map();
    const cited = repos.citations.sourcesFor(
      OBSOLESCENCE,
      rows.map((row) => obsolescenceKey(lifecycle, row.id)),
    );
    return new Map(
      rows.map((row) => [row.id, cited.get(obsolescenceKey(lifecycle, row.id)) ?? []]),
    );
  };
  /**
   * Builds a row's view.
   *
   * @param row - the row
   * @param sources - the row's cited source ids
   * @param reasons - the sources of the row's obsolete reason
   * @param resolve - the glossary resolver; without one, the view has no `en`
   * @returns the row with `sources`, `obsoleteSources` when the table has
   *   the obsolete lifecycle, and `en` when `gloss` names a column
   */
  const toView = (row: Row, sources: string[], reasons: string[], resolve?: NameResolver): View => {
    const view: Record<string, unknown> = { ...row, sources };
    if (lifecycle !== undefined) view.obsoleteSources = reasons;
    if (gloss !== undefined && resolve) {
      view.en = resolve(String((row as Record<string, unknown>)[gloss]), recordsOf(row)).en;
    }
    return view as View;
  };
  /**
   * Builds a row's view with its stored citations.
   *
   * @param repos - the repos to read citations and the glossary from
   * @param row - the row
   * @returns the row's view
   */
  const withSources = (repos: Repos, row: Row): View => {
    const sources = repos.citations.sourcesFor(entity, [String(row.id)]).get(String(row.id)) ?? [];
    return toView(row, sources, reasonsOf(repos, [row]).get(row.id) ?? [], resolver(repos));
  };

  return {
    /** @inheritdoc */
    list: (filter) => {
      const repos = store.repos;
      const rows = table(repos).list();
      const sourcesById = repos.citations.sourcesFor(
        entity,
        rows.map((row) => String(row.id)),
      );
      const resolve = resolver(repos);
      const reasons = reasonsOf(repos, rows);
      const views = rows.map((row) =>
        toView(row, sourcesById.get(String(row.id)) ?? [], reasons.get(row.id) ?? [], resolve),
      );
      return applyFilters(views, filters, filter as Record<string, string | undefined>, resolve);
    },
    /** @inheritdoc */
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
    /** @inheritdoc */
    create: (values, sources) =>
      store.transaction((repos) => {
        assertSourcesExist(repos, sources);
        checkRefs?.(repos, values);
        const repo = table(repos);
        const row = withDerived(repo, repo.insert(values));
        checkRow?.(repos, row);
        return toView(row, cite(repos, row, sources), [], resolver(repos)) as never;
      }),
    /** @inheritdoc */
    update: (id, patch, sources) =>
      store.transaction((repos) => {
        if (sources) assertSourcesExist(repos, sources);
        checkRefs?.(repos, patch);
        const repo = table(repos);
        const before = repo.get(id);
        if (!before) throw new NotFoundError(entity, id);
        // A patch with no columns (replacing only the citations) has
        // nothing for `UPDATE ... SET` to set, which drizzle rejects; keep
        // the row as it was instead of writing an empty update.
        const written = Object.keys(patch).length > 0 ? repo.update(id, patch) : before;
        if (!written) throw new NotFoundError(entity, id);
        const row = withDerived(repo, written);
        checkRow?.(repos, row);
        checkDetach?.(repos, before, row);
        const reasons = reasonsOf(repos, [row]).get(row.id) ?? [];
        if (sources) {
          return toView(row, cite(repos, row, sources), reasons, resolver(repos)) as never;
        }
        if (!spec.innerSources) return withSources(repos, row) as never;
        const cited = repos.citations.sourcesFor(entity, [String(id)]).get(String(id)) ?? [];
        const dropped = new Set(inner(before));
        const own = cited.filter((source) => !dropped.has(source));
        return toView(row, cite(repos, row, own), reasons, resolver(repos)) as never;
      }),
    /** @inheritdoc */
    remove: (id) =>
      store.transaction((repos) => {
        const repo = table(repos);
        const row = repo.get(id);
        if (!row) throw new NotFoundError(entity, id);
        checkDetach?.(repos, row, undefined);
        repos.citations.removeAll(entity, String(id));
        if (lifecycle !== undefined) {
          repos.citations.removeAll(OBSOLESCENCE, obsolescenceKey(lifecycle, id));
        }
        repos.factClaims.removeFor({ entity, entityId: String(id) });
        repo.remove(id);
      }),
  };
}

/**
 * What a registered content type's reads and writes return: the row, its
 * `sources`, `obsoleteSources` when the type has the obsolete lifecycle,
 * and `en` when the type glosses a name column.
 */
export type ContentView<K extends ContentKey> = Cited<RowOf<K>> &
  (Registry[K]["content"] extends { gloss: string } ? { en: string | null } : unknown) &
  (RowOf<K> extends { obsoleteSince: string | null } ? { obsoleteSources: string[] } : unknown);

/** The service of the registered content type `K`. */
export type RegisteredService<K extends ContentKey> = ContentService<
  RowOf<K>,
  ValuesOf<K>,
  ContentView<K>,
  FiltersOf<K>
>;

/**
 * The slugs a link column holds: its one slug, its list of them, or none.
 *
 * @param value - the column's value
 * @returns the slugs
 */
function slugsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/**
 * Finds rows by slug in the repos of a write, for a registry `check`.
 *
 * @param repos - the write's repos
 * @returns the lookup
 */
function linkedIn(repos: Repos): LinkedRow {
  return (target, slug) =>
    (repos[target].list() as Array<Record<string, unknown>>).find((r) => r.slug === slug);
}

/**
 * Finds the daily dungeon a deck runs in the repos of a write, for a registry `check`.
 *
 * @param repos - the write's repos
 * @returns the lookup
 */
function deckDungeonIn(repos: Repos): DeckDungeon {
  return (deckId) => repos.decks.dailyRuns([deckId])[0]?.dungeon;
}

/**
 * Checks the rows that reference deck `deckId` against their registry
 * `check`, as the deck now stands: a deck write that would leave one
 * breaking its rule (a clear naming a deck that no longer runs its
 * dungeon, say) is refused by its caller.
 *
 * @param repos - the write's repos, the deck already written
 * @param deckId - the deck
 * @returns the message naming the first row that breaks its rule, or
 *   `undefined` when every row naming the deck keeps its rule
 */
export function deckRefProblem(repos: Repos, deckId: string): string | undefined {
  for (const key of CONTENT_KEYS) {
    const { content, entity } = specOf(key);
    const columns = Object.keys(content?.refs ?? {});
    if (!content?.check || columns.length === 0) continue;
    for (const row of repos[key].list() as Array<{ id: number } & Record<string, unknown>>) {
      if (!columns.some((column) => row[column] === deckId)) continue;
      const problem = content.check(row, linkedIn(repos), deckDungeonIn(repos));
      if (problem) {
        return `deck ${deckId} can't change so: ${entity!} ${String(row.id)} names it, and ${problem}`;
      }
    }
  }
  return undefined;
}

/**
 * The content types and columns that name rows of `target` by slug.
 *
 * @param target - a content type
 * @returns each naming type's key and link column
 */
function linksTo(target: ContentKey): Array<{ key: ContentKey; column: string }> {
  return CONTENT_KEYS.flatMap((key) =>
    Object.entries(specOf(key).content?.links ?? {})
      .filter(([, linkTarget]) => linkTarget === target)
      .map(([column]) => ({ key, column })),
  );
}

/**
 * Builds the {@link ContentService} of a registered content type from its
 * registry entry: its entity, table repo, list filters, glossed column,
 * and reference columns (each id checked to exist before a write). A row
 * with a `mode` column must name only decks of its own mode, as written
 * (so an omitted `mode` is checked as its column default), and a row of a
 * type the registry files under one mode (`content.mode`) only decks of
 * that mode. A written row must also keep the entry's `content.check`, and
 * share its `content.unique` columns with no other row. Any of these
 * failing throws {@link ConflictError} and nothing is written. The
 * entry's `content.derive` columns are set on every write. Every slug a
 * `content.links` column names, and every source `content.innerSources`
 * reads from the values, must exist ({@link UnknownRefsError} otherwise),
 * and the row is cited to those sources too. A row another type's link
 * names can't be deleted or change its slug, and an update that would
 * leave a naming row breaking its own `content.check` is refused, so a
 * rule that reads a linked row holds whichever row is written
 * ({@link ConflictError}).
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
  const links = Object.entries(content?.links ?? {}) as Array<[string, LinkTarget]>;
  const unique: readonly string[] = content?.unique ?? [];
  const namedBy = linksTo(key);
  type AnyRow = { id: number } & Record<string, unknown>;
  return createContentService<AnyRow, Record<string, unknown>>(store, {
    entity: entity!,
    /** @inheritdoc */
    table: (repos) => repos[key],
    filters,
    gloss: content?.gloss,
    lifecycle: entity !== undefined && isObsoleteEntity(entity) ? entity : undefined,
    /** @inheritdoc */
    derive: (row) => content?.derive?.(row) ?? {},
    /** @inheritdoc */
    checkRefs: (repos, values) => {
      for (const column of refColumns) {
        const id = values[column];
        if (typeof id === "string" && !repos.decks.exists(id)) {
          throw new UnknownRefsError("decks", [id]);
        }
      }
      for (const [column, target] of links) {
        const slugs = new Set((repos[target].list() as AnyRow[]).map((row) => row.slug));
        const missing = slugsIn(values[column]).filter((slug) => !slugs.has(slug));
        if (missing.length > 0) throw new UnknownRefsError(target, [...new Set(missing)]);
      }
      const inner = content?.innerSources?.(values) ?? [];
      if (inner.length > 0) assertSourcesExist(repos, [...new Set(inner)]);
    },
    /** @inheritdoc */
    innerSources: (row) => content?.innerSources?.(row) ?? [],
    /** @inheritdoc */
    checkDetach: (repos, before, after) => {
      const slug = String(before.slug);
      const moved = !after || after.slug !== before.slug;
      for (const { key: other, column } of namedBy) {
        const naming = (repos[other].list() as AnyRow[]).filter((r) =>
          slugsIn(r[column]).includes(slug),
        );
        const otherEntity = specOf(other).entity!;
        if (moved && naming.length > 0) {
          const what = after ? "change its slug" : "be deleted";
          throw new ConflictError(
            `${entity!} ${slug} can't ${what}: ${otherEntity} ${naming[0]!.id} names it`,
          );
        }
        // Updated in place: the rows naming it must still keep their own rules.
        const content = specOf(other).content;
        for (const row of naming) {
          const problem = content?.check?.(row, linkedIn(repos), deckDungeonIn(repos));
          if (problem) {
            throw new ConflictError(
              `${entity!} ${slug} can't change so: ${otherEntity} ${row.id} names it, and ${problem}`,
            );
          }
        }
      }
    },
    /** @inheritdoc */
    checkRow: (repos, row) => {
      const problem = content?.check?.(row, linkedIn(repos), deckDungeonIn(repos));
      if (problem) throw new ConflictError(`${entity!} ${row.id}: ${problem}`);
      if (unique.length > 0) {
        const others = repos[key].list() as readonly AnyRow[];
        const twin = others.find(
          (other) => other.id !== row.id && unique.every((column) => other[column] === row[column]),
        );
        if (twin) {
          const values = unique.map((column) => `${column} ${String(row[column])}`).join(", ");
          throw new ConflictError(`${entity!} ${twin.id} already has ${values}`);
        }
      }
      const mode = (row as { mode?: GameMode }).mode ?? content?.mode;
      if (mode === undefined) return;
      for (const column of refColumns) {
        const id = row[column];
        if (typeof id !== "string") continue;
        const mismatch = deckModeMismatch(entity!, mode, id, repos.decks.get(id)?.mode);
        if (mismatch) throw new ConflictError(mismatch);
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
   *
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: Id): View;
  /** Creates a row (or aggregate) from `input`. */
  create(input: Input): View;
  /**
   * Updates the row (or aggregate) with `id` from `patch`.
   *
   * @throws {NotFoundError} if `id` doesn't exist
   */
  update(id: Id, patch: Patch): View;
  /**
   * Deletes the row (or aggregate) with `id`.
   *
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
    /** @inheritdoc */
    list: (filter) => svc.list(filter),
    /** @inheritdoc */
    get: (id) => svc.get(id),
    /** @inheritdoc */
    create: ({ sources, ...values }) => svc.create(values as Values, sources),
    /** @inheritdoc */
    update: (id, { sources, ...values }) => svc.update(id, values as Partial<Values>, sources),
    /** @inheritdoc */
    remove: (id) => svc.remove(id),
  };
}
