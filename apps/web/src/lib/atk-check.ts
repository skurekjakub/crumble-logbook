/**
 * The ATK-order check of a boss screen, judged from a deck's recorded
 * order: whether the beam catcher sits below every ranked cookie, and
 * whether the pet whose bonus the order counts on is in the deck.
 *
 * @module
 */

/** How a check reads: it holds, it doesn't, or the deck doesn't say. */
export type CheckState = "pass" | "fail" | "unknown";

/** What the check reads of a deck; `/api/decks` rows fit as they are. */
export interface AtkCheckDeck {
  atkOrder: readonly { kr: string }[] | null;
  cookies: readonly { cookieKr: string }[];
  pets: readonly { kr: string }[];
}

/**
 * Whether the beam catcher sits below every ranked cookie: it passes when
 * the catcher is outside the recorded ATK order or last in it, fails when a
 * ranked cookie comes after it, and is unknown when the deck has no catcher
 * or no order.
 *
 * @param deck - the deck
 * @param catcherKr - the catcher's Korean name, as the deck stores it
 * @returns the check's state
 */
export function catcherCheck(deck: AtkCheckDeck, catcherKr: string): CheckState {
  const order = deck.atkOrder ?? [];
  if (!order.length || !deck.cookies.some((c) => c.cookieKr === catcherKr)) return "unknown";
  const at = order.findIndex((c) => c.kr === catcherKr);
  return at === -1 || at === order.length - 1 ? "pass" : "fail";
}

/**
 * The ranked cookies above the catcher: the recorded order without the catcher.
 *
 * @typeParam C - an order entry
 * @param order - the recorded ATK order, highest first
 * @param catcherKr - the catcher's Korean name
 * @returns the order with the catcher left out
 */
export function rankedAbove<C extends { kr: string }>(order: readonly C[], catcherKr: string): C[] {
  return order.filter((c) => c.kr !== catcherKr);
}

/**
 * Whether the pet whose in-battle ATK bonus the order counts on is in the deck.
 *
 * @param deck - the deck
 * @param petKr - the pet's Korean name
 * @returns `pass` when the deck brings it, else `fail`
 */
export function petCheck(deck: AtkCheckDeck, petKr: string): CheckState {
  return deck.pets.some((p) => p.kr === petKr) ? "pass" : "fail";
}
