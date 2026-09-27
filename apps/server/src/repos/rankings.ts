import type { RankingBoard, RankingRow } from "@crumble/schema";
import { rankings } from "@crumble/schema";
import type { InferInsertModel } from "drizzle-orm";
import { and, asc, count, eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { resetIds } from "./sequence";

/** Insert payload for {@link RankingsRepo.insertMany}. */
export type RankingInsert = InferInsertModel<typeof rankings>;

/** Filter accepted by {@link RankingsRepo.list}. */
export interface RankingsFilter {
  /** Restrict to this season, when given. */
  season?: number;
  /** Restrict to this board, when given. */
  board?: RankingBoard;
}

/** One board+season's latest capture, summarized for {@link RankingsRepo.seasons}. */
export interface RankingSeason {
  /** The leaderboard the capture is from. */
  board: RankingBoard;
  /** The season number, or `null` for a board with no seasons (e.g. `power`). */
  season: number | null;
  /** How many rows the latest capture for this board+season holds. */
  count: number;
  /** The latest capture's timestamp for this board+season. */
  capturedAt: string;
}

/** Captured crumb.gg leaderboard entries, keyed by board, season and rank. */
export interface RankingsRepo {
  /**
   * Lists rankings ordered by board, then season, then rank.
   * @param filter - restrict by `season` and/or `board`, when given
   */
  list(filter?: RankingsFilter): RankingRow[];
  /**
   * Summarizes each board+season combination using only its latest capture
   * (the row group with the greatest `capturedAt`).
   * @returns one entry per board+season, unordered
   */
  seasons(): RankingSeason[];
  /**
   * Inserts every row in `rows`.
   * @param rows - the ranking rows to insert; `[]` inserts nothing
   * @returns the inserted rows, in `rows`' order
   * @throws if any row violates the board+season+rank+capturedAt unique
   *   index, a NOT NULL column, or the `sourceId` foreign key
   */
  insertMany(rows: RankingInsert[]): RankingRow[];
  /** Returns how many ranking rows reference `sourceId`. */
  countForSource(sourceId: string): number;
  /** Returns the total number of ranking rows. */
  count(): number;
  /** Deletes every ranking row and resets the ranking id counter. */
  clear(): void;
}

/**
 * Builds a {@link RankingsRepo}.
 * @param db - database or transaction handle
 */
export function createRankingsRepo(db: Db): RankingsRepo {
  return {
    list: (filter) => {
      const conditions = [];
      if (filter?.season !== undefined) conditions.push(eq(rankings.season, filter.season));
      if (filter?.board !== undefined) conditions.push(eq(rankings.board, filter.board));
      const query = db.select().from(rankings).$dynamic();
      return (conditions.length > 0 ? query.where(and(...conditions)) : query)
        .orderBy(asc(rankings.board), asc(rankings.season), asc(rankings.rank))
        .all();
    },
    seasons: () => {
      const groups = db
        .select({
          board: rankings.board,
          season: rankings.season,
          capturedAt: rankings.capturedAt,
          n: count(),
        })
        .from(rankings)
        .groupBy(rankings.board, rankings.season, rankings.capturedAt)
        .all();
      // Keep only the greatest `capturedAt` group per board+season: a later
      // capture is a fresh scrape, and its row count is what "the season"
      // means today.
      const latest = new Map<string, RankingSeason>();
      for (const group of groups) {
        const key = `${group.board}:${group.season}`;
        const current = latest.get(key);
        if (!current || group.capturedAt > current.capturedAt) {
          latest.set(key, {
            board: group.board,
            season: group.season,
            count: group.n,
            capturedAt: group.capturedAt,
          });
        }
      }
      return [...latest.values()];
    },
    insertMany: (rows) => {
      if (rows.length === 0) return [];
      return db.insert(rankings).values(rows).returning().all();
    },
    countForSource: (sourceId) =>
      db.select({ n: count() }).from(rankings).where(eq(rankings.sourceId, sourceId)).get()!.n,
    count: () => db.select({ n: count() }).from(rankings).get()!.n,
    clear: () => {
      db.delete(rankings).run();
      resetIds(db, rankings);
    },
  };
}
