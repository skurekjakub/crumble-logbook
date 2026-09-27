import type { FightEventInput, FightEventRow, Values } from "@crumble/schema";
import type { Store } from "../repos";
import type { Cited } from "./citations";
import { createContentService } from "./content";

/** A fight event with the source ids that back it. */
export type FightEventView = Cited<FightEventRow>;

/** CRUD over `fight_events`, listed in elapsed-time order. */
export interface FightEventService {
  /**
   * Returns every fight event in elapsed-time order, events with no time
   * last.
   * @param filter - restrict the list to a single boss, when given
   */
  list(filter?: { boss?: string }): FightEventView[];
  /**
   * Returns the fight event with `id`.
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: number): FightEventView;
  /**
   * Inserts a fight event and cites it.
   * @throws {UnknownRefsError} if any source id doesn't exist; nothing is
   *   written
   */
  create(values: Values<FightEventInput>, sources: string[]): FightEventView;
  /**
   * Updates the fight event with `id`; `sources`, when given, replaces its
   * citations.
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws {UnknownRefsError} if any `sources` id doesn't exist
   */
  update(id: number, patch: Partial<Values<FightEventInput>>, sources?: string[]): FightEventView;
  /**
   * Deletes the fight event with `id` and its citations.
   * @throws {NotFoundError} if `id` doesn't exist
   */
  remove(id: number): void;
}

/**
 * Builds a {@link FightEventService} over `store`.
 * @param store - the store to persist through
 */
export function createFightEventService(store: Store): FightEventService {
  const content = createContentService<FightEventRow, Values<FightEventInput>>(store, {
    entity: "fight_event",
    table: (repos) => repos.fightEvents,
  });
  return {
    list: (filter) =>
      content.list().filter((row) => filter?.boss === undefined || row.boss === filter.boss),
    get: (id) => content.get(id),
    create: (values, sources) => content.create(values, sources),
    update: (id, patch, sources) => content.update(id, patch, sources),
    remove: (id) => content.remove(id),
  };
}
