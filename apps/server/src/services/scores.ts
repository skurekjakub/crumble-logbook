import type { ScoreInput, ScoreRow, Values } from "@crumble/schema";
import type { FiltersOf } from "../registry";
import type { Store } from "../repos";
import type { Cited } from "./citations";
import type { ContentService } from "./content";
import { registeredService } from "./content";

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

/**
 * CRUD over `scores`, listed by damage descending (the registry's order),
 * filterable by `deck`, with the damage/power ratio attached to every view.
 * A non-null `deckId` must name an existing deck (`UnknownRefsError`
 * `"decks"` otherwise).
 */
export type ScoreService = ContentService<
  ScoreRow,
  Values<ScoreInput>,
  ScoreView,
  FiltersOf<"scores">
>;

/**
 * Builds a {@link ScoreService} over `store`.
 *
 * @param store - the store to persist through
 * @returns the service
 */
export function createScoreService(store: Store): ScoreService {
  const content = registeredService(store, "scores");
  /**
   * Attaches a score's damage/power ratio.
   *
   * @param row - the score with its sources
   * @returns the score's view
   */
  const withRatio = (row: Cited<ScoreRow>): ScoreView => ({
    ...row,
    ratio: ratio(row.damageG, row.powerG),
  });
  return {
    /** @inheritdoc */
    list: (filter) => content.list(filter).map(withRatio),
    /** @inheritdoc */
    get: (id) => withRatio(content.get(id)),
    /** @inheritdoc */
    create: (values, sources) => withRatio(content.create(values, sources)),
    /** @inheritdoc */
    update: (id, patch, sources) => withRatio(content.update(id, patch, sources)),
    /** @inheritdoc */
    remove: (id) => content.remove(id),
  };
}
