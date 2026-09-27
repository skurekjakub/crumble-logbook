import type { SourceInput, SourcePatch, SourceRow, SourceSite } from "@crumble/schema";
import { ConflictError, NotFoundError } from "../errors";
import type { Repos, Store } from "../repos";

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
   * @param site - restrict the list to this site, when given
   */
  list(site?: SourceSite): SourceRow[];
  /**
   * Returns the source with `id`, with its citing-row count.
   * @param id - the source's `<site>:<key>` id
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: string): SourceView;
  /**
   * Inserts a source, deriving `site` from `input.id`'s prefix.
   * @throws {ConflictError} if `input.id` already exists
   */
  create(input: SourceInput): SourceRow;
  /**
   * Updates the source with `id`, merging in `patch`.
   * @param id - the source's `<site>:<key>` id
   * @throws {NotFoundError} if `id` doesn't exist
   */
  update(id: string, patch: SourcePatch): SourceRow;
  /**
   * Deletes the source with `id`.
   * @param id - the source's `<site>:<key>` id
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws {ConflictError} `"source <id> is cited by N rows"` if any
   *   citation or ranking row still references `id`
   */
  remove(id: string): void;
}

/** Returns how many citation and ranking rows reference `id`, combined. */
function citedByCount(repos: Repos, id: string): number {
  return repos.citations.countForSource(id) + repos.rankings.countForSource(id);
}

/**
 * Builds a {@link SourcesService} over `store`.
 * @param store - the store to persist through
 */
export function createSourcesService(store: Store): SourcesService {
  return {
    list: (site) => store.repos.sources.list(site),
    get: (id) => {
      const repos = store.repos;
      const row = repos.sources.get(id);
      if (!row) throw new NotFoundError("source", id);
      return { ...row, citedBy: citedByCount(repos, id) };
    },
    create: (input) =>
      store.transaction((repos) => {
        if (repos.sources.get(input.id))
          throw new ConflictError(`source already exists: ${input.id}`);
        const site = input.id.split(":")[0] as SourceSite;
        return repos.sources.insert({ ...input, site }) as never;
      }) as SourceRow,
    update: (id, patch) =>
      store.transaction((repos) => {
        if (!repos.sources.get(id)) throw new NotFoundError("source", id);
        const row =
          Object.keys(patch).length > 0 ? repos.sources.update(id, patch) : repos.sources.get(id);
        if (!row) throw new NotFoundError("source", id);
        return row as never;
      }) as SourceRow,
    remove: (id) =>
      store.transaction((repos) => {
        if (!repos.sources.get(id)) throw new NotFoundError("source", id);
        const citedBy = citedByCount(repos, id);
        if (citedBy > 0) throw new ConflictError(`source ${id} is cited by ${citedBy} rows`);
        repos.sources.remove(id);
      }),
  };
}
