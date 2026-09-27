/** Categorical series slots in `tokens.css` (`--s1` … `--s5`); later decks share `--s0`. */
export const SERIES_SLOTS = 5;

/** What {@link deckSeries} reads from a deck. */
export interface SeriesDeck {
  id: string;
  nameEn: string;
}

/** Display name and chart colour per deck id. */
export interface DeckSeries {
  /**
   * The deck's English name.
   * @param id - a deck id, or null for a score with no deck
   * @returns the name; the id itself for an unknown deck, "Other" for null
   */
  name(id: string | null): string;
  /**
   * The deck's series colour, stable per deck whatever the view filters.
   * @param id - a deck id, or null for a score with no deck
   * @returns a `var(--sN)` reference by display order; `var(--s0)` past the
   *   series slots, for an unknown deck, or for null
   */
  color(id: string | null): string;
}

/**
 * Builds deck names and series colours from the decks in display order.
 *
 * @param decks - every deck, in display order (as `/api/decks` returns them)
 * @returns name and colour lookups
 */
export function deckSeries(decks: readonly SeriesDeck[]): DeckSeries {
  const order = new Map(decks.map((d, i) => [d.id, { i, name: d.nameEn }]));
  return {
    name: (id) => (id == null ? "Other" : (order.get(id)?.name ?? id)),
    color: (id) => {
      const i = id == null ? undefined : order.get(id)?.i;
      return i != null && i < SERIES_SLOTS ? `var(--s${i + 1})` : "var(--s0)";
    },
  };
}
