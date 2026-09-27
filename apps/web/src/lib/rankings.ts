/** What {@link latestCapture} reads from a leaderboard row. */
export interface CapturedRow {
  rank: number;
  capturedAt: string;
}

/**
 * One capture of a leaderboard: the rows with the latest `capturedAt`, in
 * rank order. A board and season can hold several captures; mixing them
 * would repeat ranks.
 *
 * @param rows - rows of one board and season, any order
 * @returns the latest capture's rows sorted by rank; `[]` for no rows
 */
export function latestCapture<R extends CapturedRow>(rows: readonly R[]): R[] {
  const latest = rows.reduce<string | null>(
    (max, r) => (max == null || r.capturedAt > max ? r.capturedAt : max),
    null,
  );
  return rows.filter((r) => r.capturedAt === latest).sort((a, b) => a.rank - b.rank);
}

/** What {@link boardSeasons} reads from a `/api/rankings/seasons` entry. */
export interface SeasonEntry {
  board: string;
  season: number | null;
}

/**
 * The seasons captured for a board, newest first.
 *
 * @param seasons - `/api/rankings/seasons` entries
 * @param board - the board to list
 * @returns distinct season numbers, descending; seasonless captures are skipped
 */
export function boardSeasons(seasons: readonly SeasonEntry[], board: string): number[] {
  const found = seasons.flatMap((s) => (s.board === board && s.season != null ? [s.season] : []));
  return [...new Set(found)].sort((a, b) => b - a);
}
