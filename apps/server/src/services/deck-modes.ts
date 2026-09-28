import type { GameMode } from "@crumble/schema";
import { CONTENT_KEYS, specOf } from "../registry";
import type { Repos } from "../repos";

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

/**
 * The same rule seen from the deck: whether giving deck `deckId` the mode
 * `mode` would leave a row of a mode-bound content type naming a deck of
 * another mode. A row is mode-bound when it has a `mode` column or its
 * type is filed under one mode (`content.mode`); its reference columns are
 * the ones the registry declares.
 *
 * @param repos - the repos to read the rows from
 * @param deckId - the deck
 * @param mode - the deck's new mode
 * @returns the message naming the first row it would break, or `undefined`
 *   when none names the deck under another mode
 */
export function deckModeChangeConflict(
  repos: Repos,
  deckId: string,
  mode: GameMode,
): string | undefined {
  for (const key of CONTENT_KEYS) {
    const { content, entity } = specOf(key);
    const columns = Object.keys(content?.refs ?? {});
    if (columns.length === 0) continue;
    for (const row of repos[key].list() as ReadonlyArray<Record<string, unknown>>) {
      const rowMode = (row.mode as GameMode | undefined) ?? content?.mode;
      if (rowMode === undefined || rowMode === mode) continue;
      if (columns.some((column) => row[column] === deckId)) {
        return `deck ${deckId} can't become ${mode}: ${entity!} ${String(row.id)} names it under mode ${rowMode}`;
      }
    }
  }
  return undefined;
}
