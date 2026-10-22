/**
 * What a mode's Best setup page picks: the deck it leads with, and each of
 * that deck's cookies' rune builds. `/api` rows fit these shapes as they are.
 *
 * @module
 */
import type { Lifecycle } from "./obsolete";
import { isCurrent } from "./obsolete";

/** A deck as Best setup ranks it. */
export interface SetupDeck extends Lifecycle {
  id: string;
  /** The record's own order for the mode, by the mode's measure (never by 배). */
  position: number;
  /** The deck's tier, e.g. `meta` or `alt`. */
  status: string;
}

/** A cookie as a deck slot or a rune build names it. */
export interface CookieRef {
  /** The name as stored: Korean, or forum shorthand. */
  cookieKr: string;
  /** The glossary's English name, or null when unresolved. */
  en: string | null;
}

/** A rune build as Best setup matches it to a deck's cookie. */
export interface SetupRune extends CookieRef {
  /** The ids of the decks it's linked to; empty for a build for every deck. */
  decks: readonly string[];
}

/**
 * The deck a mode's Best setup leads with: the current `meta` deck with the
 * lowest position, the record having ordered positions by the mode's measure.
 *
 * @param decks - the mode's decks, in any order
 * @param skip - ids of decks shown elsewhere on the page, such as the Rift's
 * @returns the deck, or undefined when no current deck is `meta`
 */
export function leadDeck<D extends SetupDeck>(
  decks: readonly D[],
  skip: readonly string[] = [],
): D | undefined {
  return decks
    .filter((d) => isCurrent(d) && d.status === "meta" && !skip.includes(d.id))
    .reduce<D | undefined>(
      (best, d) => (!best || d.position < best.position ? d : best),
      undefined,
    );
}

/**
 * Whether two names are the same cookie: by English name when both have
 * one, so a shorthand meets the full name, else by the stored name.
 *
 * @param a - a name
 * @param b - another name
 * @returns `true` for the same cookie
 */
export function sameCookie(a: CookieRef, b: CookieRef): boolean {
  return a.en && b.en ? a.en === b.en : a.cookieKr === b.cookieKr;
}

/**
 * A deck cookie's rune builds: those linked to the deck, else those linked
 * to no deck.
 *
 * @param cookie - the deck's cookie
 * @param deckId - the deck's id
 * @param builds - the mode's current rune builds
 * @returns the builds, in list order; empty when the cookie has neither kind
 */
export function runesFor<R extends SetupRune>(
  cookie: CookieRef,
  deckId: string,
  builds: readonly R[],
): R[] {
  const own = builds.filter((b) => sameCookie(b, cookie));
  const linked = own.filter((b) => b.decks.includes(deckId));
  return linked.length ? linked : own.filter((b) => !b.decks.length);
}
