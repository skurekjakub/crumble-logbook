/**
 * The obsolete lifecycle in the web app: telling current recommendation
 * rows from obsolete ones, and rows that name a deck by that deck's state.
 * `/api` rows fit these shapes as they are.
 *
 * @module
 */

/**
 * A row with the obsolete lifecycle: `obsoleteSince` is unset or null while
 * it is current; an obsolete row says why and cites the sources that say so.
 */
export interface Lifecycle {
  obsoleteSince?: string | null;
  obsoleteReason?: string | null;
  obsoleteSources?: readonly string[];
}

/** A deck as the lifecycle helpers and the obsolete notices read it. */
export interface LifecycleDeck extends Lifecycle {
  id: string;
  /** Its English name, where a notice or a group names it. */
  nameEn?: string;
  /** The deck that superseded it, when one did. */
  supersededBy?: string | null;
}

/**
 * Reports whether a row is a current recommendation.
 *
 * @param row - the row
 * @returns `true` when it has no `obsoleteSince`
 */
export function isCurrent(row: Lifecycle): boolean {
  return row.obsoleteSince == null;
}

/**
 * Orders obsolete rows the most recently obsoleted first.
 *
 * @param a - a row
 * @param b - another row
 * @returns a negative number when `a` became obsolete after `b`
 */
function bySinceDesc(a: Lifecycle, b: Lifecycle): number {
  return (b.obsoleteSince ?? "").localeCompare(a.obsoleteSince ?? "");
}

/**
 * Splits rows into the current ones, in their order, and the obsolete ones,
 * the most recently obsoleted first (ties keep their order).
 *
 * @param rows - the rows, in list order
 * @returns `current` and `obsolete`
 */
export function splitObsolete<T extends Lifecycle>(
  rows: readonly T[],
): { current: T[]; obsolete: T[] } {
  return {
    current: rows.filter(isCurrent),
    obsolete: rows.filter((row) => !isCurrent(row)).sort(bySinceDesc),
  };
}

/**
 * Splits rows that name a deck by that deck's state: a row whose deck is
 * obsolete is obsolete; a row with no deck, or with a deck `decks` doesn't
 * list, stays current.
 *
 * @param rows - the rows, in list order
 * @param decks - the decks the rows may name
 * @returns `current` and `obsolete`, each in list order
 */
export function splitByDeck<T extends { deckId: string | null }>(
  rows: readonly T[],
  decks: readonly LifecycleDeck[],
): { current: T[]; obsolete: T[] } {
  const retired = new Set(decks.filter((deck) => !isCurrent(deck)).map((deck) => deck.id));
  return {
    current: rows.filter((row) => row.deckId === null || !retired.has(row.deckId)),
    obsolete: rows.filter((row) => row.deckId !== null && retired.has(row.deckId)),
  };
}

/**
 * Groups the rows that name an obsolete deck by that deck, the most
 * recently obsoleted deck first.
 *
 * @param rows - the rows, in list order
 * @param decks - the decks the rows may name
 * @returns one group per obsolete deck some row names, its rows in list order
 */
export function groupByObsoleteDeck<T extends { deckId: string | null }, D extends LifecycleDeck>(
  rows: readonly T[],
  decks: readonly D[],
): Array<{ deck: D; rows: T[] }> {
  return splitObsolete(decks)
    .obsolete.map((deck) => ({ deck, rows: rows.filter((row) => row.deckId === deck.id) }))
    .filter((group) => group.rows.length > 0);
}
