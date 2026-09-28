import type { CitedEntity, SourceInput, SourcePatch, SourceRow, SourceSite } from "@crumble/schema";
import { ConflictError, NotFoundError } from "../errors";
import type { FiltersOf } from "../registry";
import { recordColumnOf, REGISTRY, specOf, TABLE_KEYS } from "../registry";
import type { Repos, Store } from "../repos";
import { applyFilters } from "./filters";

/**
 * A source as listed: its row, plus the research records it belongs to,
 * sorted: the record that owns the row and every record whose own rows
 * cite it.
 */
export type SourceListView = SourceRow & { records: string[] };

/** A source row with the number of rows (citations and rankings) that reference it. */
export type SourceView = SourceRow & { citedBy: number };

/**
 * CRUD over `sources`: what everything else cites. `site` is never accepted
 * from a caller; it's derived from the `<site>:<key>` id prefix, which the
 * `sourceId` schema already constrains to `dc`, `nv` or `web`.
 */
export interface SourcesService {
  /**
   * Lists sources, dated newest first with null dates last, then by `id`.
   *
   * @param filter - the registry's list filters for sources, each applied
   *   when given: `site` keeps one site's sources, `record` those the record
   *   owns or cites
   */
  list(filter?: FiltersOf<"sources">): SourceListView[];
  /**
   * Returns the source with `id`, with its citing-row count.
   *
   * @param id - the source's `<site>:<key>` id
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: string): SourceView;
  /**
   * Inserts a source, deriving `site` from `input.id`'s prefix.
   *
   * @throws {ConflictError} if `input.id` already exists
   */
  create(input: SourceInput): SourceRow;
  /**
   * Updates the source with `id`, merging in `patch`.
   *
   * @param id - the source's `<site>:<key>` id
   * @throws {NotFoundError} if `id` doesn't exist
   */
  update(id: string, patch: SourcePatch): SourceRow;
  /**
   * Deletes the source with `id`.
   *
   * @param id - the source's `<site>:<key>` id
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws {ConflictError} `"source <id> is cited by N rows"` if any
   *   citation or ranking row still references `id`
   */
  remove(id: string): void;
}

/**
 * Returns how many citation and ranking rows reference `id`, combined.
 *
 * @param repos - the repos to count through
 * @param id - the source's `<site>:<key>` id
 * @returns the combined count
 */
function citedByCount(repos: Repos, id: string): number {
  return repos.citations.countForSource(id) + repos.rankings.countForSource(id);
}

/**
 * Maps each cited source to the records whose rows cite it, across every
 * registered cited table whose rows a record owns.
 *
 * @param repos - the repos to read
 * @returns source id → the citing records' slugs; sources no owned row cites are absent
 */
function citingRecords(repos: Repos): Map<string, Set<string>> {
  const owners = new Map<CitedEntity, Map<string, string>>();
  for (const key of TABLE_KEYS) {
    const { entity } = specOf(key);
    if (entity && recordColumnOf(key)) owners.set(entity, repos.tables.owners(key));
  }
  const bySource = new Map<string, Set<string>>();
  for (const { entity, entityId, sourceId } of repos.citations.all()) {
    const record = owners.get(entity)?.get(entityId);
    if (!record) continue;
    const records = bySource.get(sourceId) ?? new Set<string>();
    records.add(record);
    bySource.set(sourceId, records);
  }
  return bySource;
}

/**
 * Builds a {@link SourcesService} over `store`.
 *
 * @param store - the store to persist through
 * @returns the service
 */
export function createSourcesService(store: Store): SourcesService {
  return {
    /** @inheritdoc */
    list: (filter) => {
      const repos = store.repos;
      const citing = citingRecords(repos);
      const views = repos.sources.list().map((row) => {
        const records = new Set(citing.get(row.id));
        if (row.recordSlug) records.add(row.recordSlug);
        return { ...row, records: [...records].sort() };
      });
      return applyFilters(views, REGISTRY.sources.filters, filter);
    },
    /** @inheritdoc */
    get: (id) => {
      const repos = store.repos;
      const row = repos.sources.get(id);
      if (!row) throw new NotFoundError("source", id);
      return { ...row, citedBy: citedByCount(repos, id) };
    },
    /** @inheritdoc */
    create: (input) =>
      store.transaction((repos) => {
        if (repos.sources.get(input.id))
          throw new ConflictError(`source already exists: ${input.id}`);
        const site = input.id.split(":")[0] as SourceSite;
        return repos.sources.insert({ ...input, site }) as never;
      }),
    /** @inheritdoc */
    update: (id, patch) =>
      store.transaction((repos) => {
        if (!repos.sources.get(id)) throw new NotFoundError("source", id);
        const row =
          Object.keys(patch).length > 0 ? repos.sources.update(id, patch) : repos.sources.get(id);
        if (!row) throw new NotFoundError("source", id);
        return row as never;
      }),
    /** @inheritdoc */
    remove: (id) =>
      store.transaction((repos) => {
        if (!repos.sources.get(id)) throw new NotFoundError("source", id);
        const citedBy = citedByCount(repos, id);
        if (citedBy > 0) throw new ConflictError(`source ${id} is cited by ${citedBy} rows`);
        repos.sources.remove(id);
      }),
  };
}
