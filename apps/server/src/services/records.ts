import type { GameMode, RecordModeRow, ResearchRecordRow } from "@crumble/schema";
import { GAME_MODE } from "@crumble/schema";
import { NotFoundError } from "../errors";
import type { FiltersOf } from "../registry";
import { REGISTRY } from "../registry";
import type { Repos, Store } from "../repos";
import { applyFilters } from "./filters";

/**
 * A research record as returned to callers: its row, plus each game mode
 * it covers with that mode's own lede and caveat, in `GAME_MODE` order
 * (`[]` for a record that lists none).
 */
export type RecordView = ResearchRecordRow & { modes: Omit<RecordModeRow, "recordSlug">[] };

/** Read access to the research records: one per investigated question. */
export interface RecordsService {
  /**
   * Lists every research record, ordered by `slug`.
   * @param filter - the registry's list filters for records, each applied
   *   when given: `mode` keeps the records filed under that mode
   */
  list(filter?: FiltersOf<"researchRecords">): RecordView[];
  /**
   * Returns the record with `slug`.
   * @param slug - the record's slug
   * @throws {NotFoundError} if `slug` doesn't exist
   */
  get(slug: string): RecordView;
}

/**
 * Lists the records that cover `mode`: those filed under it and those that
 * list it among their modes.
 *
 * @param repos - the repos to read
 * @param mode - the game mode
 * @returns the records' slugs, ordered by slug
 */
export function recordsCovering(repos: Repos, mode: GameMode): string[] {
  const listed = new Set(
    repos.records.modes().flatMap((m) => (m.mode === mode ? [m.recordSlug] : [])),
  );
  return repos.records
    .list()
    .filter((record) => record.mode === mode || listed.has(record.slug))
    .map((record) => record.slug);
}

/**
 * Builds the views of `rows`, attaching each record's modes.
 * @param repos - the repos to read the modes from
 * @param rows - the record rows
 */
function toViews(repos: Repos, rows: ResearchRecordRow[]): RecordView[] {
  const modes = repos.records.modes();
  const rank = (mode: GameMode) => GAME_MODE.indexOf(mode);
  return rows.map((row) => ({
    ...row,
    modes: modes
      .filter((m) => m.recordSlug === row.slug)
      .sort((a, b) => rank(a.mode) - rank(b.mode))
      .map(({ recordSlug: _recordSlug, ...mode }) => mode),
  }));
}

/**
 * Builds a {@link RecordsService} over `store`.
 * @param store - the store to read through
 */
export function createRecordsService(store: Store): RecordsService {
  return {
    list: (filter) => {
      const repos = store.repos;
      return applyFilters(
        toViews(repos, repos.records.list()),
        REGISTRY.researchRecords.filters,
        filter,
      );
    },
    get: (slug) => {
      const repos = store.repos;
      const row = repos.records.get(slug);
      if (!row) throw new NotFoundError("research record", slug);
      return toViews(repos, [row])[0]!;
    },
  };
}
