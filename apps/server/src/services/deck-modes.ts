import type { GameMode } from "@crumble/schema";

/**
 * The rule that a row with a game mode names only decks of that mode: the
 * API's content writes and the record importer both enforce it, with this
 * message.
 *
 * @param entity - what the row is, as the message names it, e.g. `"counter"`
 * @param mode - the row's game mode
 * @param deckId - the deck the row names
 * @param deckMode - that deck's game mode, or `undefined` when it isn't known
 * @returns the message naming the mismatch, or `undefined` when the modes
 *   agree or the deck's mode isn't known
 */
export function deckModeMismatch(
  entity: string,
  mode: GameMode,
  deckId: string,
  deckMode: GameMode | undefined,
): string | undefined {
  if (deckMode === undefined || deckMode === mode) return undefined;
  return `${entity} mode ${mode} doesn't match deck ${deckId}'s mode ${deckMode}`;
}
