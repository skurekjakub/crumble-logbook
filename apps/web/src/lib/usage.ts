/**
 * Usage-figure display helpers: competition ranks for a bar list, and the
 * caveat a sample's rows repeat, said once.
 *
 * @module
 */

/**
 * Ranks shares the way a leaderboard does: equal shares share a rank, and
 * the next share skips past them (97, 97, 94 → 1, 1, 3).
 *
 * @param pcts - the shares, in display order
 * @returns each share's rank, in the same order
 */
export function shareRanks(pcts: readonly number[]): number[] {
  return pcts.map((p) => 1 + pcts.filter((q) => q > p).length);
}

/**
 * The sources each row cites beyond those most of its sample's rows cite,
 * so a row repeats no chip its sample line already carries for it.
 *
 * @param rows - a sample's rows, each with the sources it cites
 * @returns each row's own sources, in its order; empty for a row that adds none
 */
export function ownSources(rows: ReadonlyArray<{ sources: readonly string[] }>): string[][] {
  const counts = new Map<string, number>();
  for (const r of rows) for (const s of new Set(r.sources)) counts.set(s, (counts.get(s) ?? 0) + 1);
  /**
   * Whether most of the rows cite a source.
   *
   * @param s - the source id
   * @returns true when at least half the rows cite it
   */
  const shared = (s: string) => (counts.get(s) ?? 0) * 2 >= rows.length;
  return rows.map((r) => r.sources.filter((s) => !shared(s)));
}

/** A sample's notes with the one its rows repeat lifted out. */
export interface HoistedNotes {
  /** The note several rows share, said once for the sample; null when none repeats. */
  common: string | null;
  /** Each row's note with the common one taken out; null when nothing is left. */
  rest: (string | null)[];
}

/**
 * Lifts out the note a sample's rows repeat: the most frequent note found
 * on at least two rows. A row whose note is that note keeps nothing, and a
 * row whose note starts with it keeps only what follows.
 *
 * @param notes - each row's note, in display order; null for none
 * @returns the common note and what each row keeps
 */
export function hoistNote(notes: readonly (string | null)[]): HoistedNotes {
  const counts = new Map<string, number>();
  for (const n of notes) if (n) counts.set(n, (counts.get(n) ?? 0) + 1);
  let common: string | null = null;
  let best = 1;
  for (const [n, count] of counts) {
    if (count > best) {
      common = n;
      best = count;
    }
  }
  if (common == null) return { common: null, rest: [...notes] };
  const lead = common;
  return {
    common,
    rest: notes.map((n) => {
      if (n == null || n === lead) return null;
      return n.startsWith(`${lead} `) ? n.slice(lead.length + 1) : n;
    }),
  };
}
