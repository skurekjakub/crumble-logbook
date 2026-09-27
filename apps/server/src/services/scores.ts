import type { ScoreInput, ScoreRow, Values } from "@crumble/schema";
import { UnknownRefsError } from "../errors";
import type { Store } from "../repos";
import type { Cited } from "./citations";
import { createContentService } from "./content";

/** A score row with its sources and its computed damage/power ratio. */
export type ScoreView = Cited<ScoreRow> & { ratio: number | null };

/**
 * Computes the damage ÷ power ratio ("배") for a score, for display only —
 * it is never stored, and never used to rank scores.
 *
 * @param damageG - damage dealt, in billions
 * @param powerG - team power, in billions, or `null` if unrecorded
 * @returns `Math.round(damageG / powerG)`, or `null` if either value isn't
 *   strictly positive
 */
export function ratio(damageG: number, powerG: number | null): number | null {
  if (powerG == null || damageG <= 0 || powerG <= 0) return null;
  return Math.round(damageG / powerG);
}

/** CRUD over `scores`, with the damage/power ratio attached to every view. */
export interface ScoreService {
  /**
   * Returns every score, sorted by `damageG` descending.
   * @param filter - restrict the list to a single deck, when given
   */
  list(filter?: { deck?: string }): ScoreView[];
  /**
   * Returns the score with `id`.
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: number): ScoreView;
  /**
   * Inserts a score and cites it.
   * @throws {UnknownRefsError} if any source id doesn't exist (`"sources"`),
   *   or a non-null `deckId` doesn't exist (`"decks"`)
   */
  create(values: Values<ScoreInput>, sources: string[]): ScoreView;
  /**
   * Updates the score with `id`.
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws {UnknownRefsError} for an unknown `sources` or `deckId`
   */
  update(id: number, patch: Partial<Values<ScoreInput>>, sources?: string[]): ScoreView;
  /**
   * Deletes the score with `id` and its citations.
   * @throws {NotFoundError} if `id` doesn't exist
   */
  remove(id: number): void;
}

/**
 * Builds a {@link ScoreService} over `store`.
 * @param store - the store to persist through
 */
export function createScoreService(store: Store): ScoreService {
  const content = createContentService<ScoreRow, Values<ScoreInput>>(store, {
    entity: "score",
    table: (repos) => repos.scores,
    checkRefs: (repos, values) => {
      if (values.deckId != null && !repos.decks.exists(values.deckId)) {
        throw new UnknownRefsError("decks", [values.deckId]);
      }
    },
  });

  const withRatio = (row: Cited<ScoreRow>): ScoreView => ({ ...row, ratio: ratio(row.damageG, row.powerG) });

  return {
    list: (filter) =>
      content
        .list()
        .filter((row) => !filter?.deck || row.deckId === filter.deck)
        .map(withRatio)
        .sort((a, b) => b.damageG - a.damageG),
    get: (id) => withRatio(content.get(id)),
    create: (values, sources) => withRatio(content.create(values, sources)),
    update: (id, patch, sources) => withRatio(content.update(id, patch, sources)),
    remove: (id) => content.remove(id),
  };
}
