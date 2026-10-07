import { ConflictError } from "../errors";
import type { Repos, Store } from "../repos";
import type { RegisteredService } from "./content";
import { registeredService } from "./content";

/**
 * CRUD over `daily_dungeons`, as the registry declares it, plus the rule
 * that a daily dungeon a deck runs keeps its slug: it can't be deleted or
 * renamed while a deck's run facts name it. A clear naming it is held by
 * the registry's own link.
 */
export type DailyDungeonService = RegisteredService<"dailyDungeons">;

/**
 * Builds a {@link DailyDungeonService} over `store`.
 *
 * @param store - the store to persist through
 * @returns the service
 */
export function createDailyDungeonService(store: Store): DailyDungeonService {
  const content = registeredService(store, "dailyDungeons");
  /**
   * Refuses to let the daily dungeon `id` lose its slug while a deck runs it.
   *
   * @param repos - the repos to read through
   * @param id - the daily dungeon's id
   * @param what - the change refused, as the message names it
   * @throws {ConflictError} naming the first deck that runs the dungeon
   */
  const assertNotRun = (repos: Repos, id: number, what: string): void => {
    const slug = repos.dailyDungeons.get(id)?.slug;
    if (slug === undefined) return;
    const [deck] = repos.decks.runningDungeon(slug);
    if (deck !== undefined) {
      throw new ConflictError(`daily_dungeon ${slug} can't ${what}: deck ${deck} runs it`);
    }
  };
  return {
    ...content,
    /** @inheritdoc */
    update: (id, patch, sources) => {
      const before = store.repos.dailyDungeons.get(id);
      if (patch.slug !== undefined && before !== undefined && patch.slug !== before.slug) {
        assertNotRun(store.repos, id, "change its slug");
      }
      return content.update(id, patch, sources);
    },
    /** @inheritdoc */
    remove: (id) => {
      assertNotRun(store.repos, id, "be deleted");
      content.remove(id);
    },
  };
}
