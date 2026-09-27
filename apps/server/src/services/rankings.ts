import type { RankingRow } from "@crumble/schema";
import type { RankingSeason, RankingsFilter } from "../repos/rankings";
import type { Store } from "../repos";

/** Read access to captured crumb.gg leaderboard entries. */
export interface RankingsService {
  /**
   * Lists rankings ordered by board, then season, then rank.
   * @param filter - restrict by `season` and/or `board`, when given
   */
  list(filter?: RankingsFilter): RankingRow[];
  /** Summarizes each board+season combination by its latest capture. */
  seasons(): RankingSeason[];
}

/**
 * Builds a {@link RankingsService} over `store`.
 * @param store - the store to read through
 */
export function createRankingsService(store: Store): RankingsService {
  return {
    list: (filter) => store.repos.rankings.list(filter),
    seasons: () => store.repos.rankings.seasons(),
  };
}
