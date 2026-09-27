import type { RuneBuildDeckRow, RuneBuildRow } from "@crumble/schema";
import { runeBuildDecks, runeBuilds } from "@crumble/schema";
import type { InferInsertModel } from "drizzle-orm";
import { asc, count, eq, inArray } from "drizzle-orm";
import type { Db } from "../db/client";

/** Insert/patch payload for {@link RuneBuildsRepo.insert} and `.update`. */
export type RuneBuildInsert = InferInsertModel<typeof runeBuilds>;

/**
 * CRUD over `rune_builds` and its m:n link to `decks` (`rune_build_decks`).
 * The linked decks are always replaced as a whole, unordered set.
 */
export interface RuneBuildsRepo {
  /** Returns every rune build, ordered by `id`. */
  list(): RuneBuildRow[];
  /**
   * Returns the rune build with `id`, or `undefined` if there is none.
   * @param id - the rune build's numeric id
   */
  get(id: number): RuneBuildRow | undefined;
  /**
   * Inserts a rune build.
   * @throws if a NOT NULL column is missing
   */
  insert(row: RuneBuildInsert): RuneBuildRow;
  /**
   * Updates the rune build with `id`, merging in `patch`.
   * @returns the updated row, or `undefined` if `id` doesn't exist
   */
  update(id: number, patch: Partial<RuneBuildInsert>): RuneBuildRow | undefined;
  /**
   * Deletes the rune build with `id`. Its deck links cascade (enforced by
   * the schema's foreign key, not by this method).
   * @param id - the rune build's numeric id
   * @returns `true` if a row was deleted, `false` if `id` didn't exist
   */
  remove(id: number): boolean;
  /**
   * Groups the deck ids linked to each of `ids`.
   * @param ids - rune build ids to look up
   * @returns a map from rune build id to its sorted deck ids; ids with no
   *   linked decks are absent from the map; `ids` of `[]` returns an empty
   *   map
   */
  decksFor(ids: number[]): Map<number, string[]>;
  /**
   * Replaces every deck link of `id` with `deckIds`.
   * @param id - the rune build to replace links for
   * @param deckIds - the decks to link; duplicates are removed
   * @throws if any `deckIds` entry doesn't exist in `decks`
   */
  replaceDecks(id: number, deckIds: string[]): void;
  /** Returns the number of rune builds. */
  count(): number;
  /** Deletes every rune build, and (via cascade) every deck link. */
  clear(): void;
  /** Returns every deck link across every rune build, ordered by rune build then deck; for export. */
  allLinks(): RuneBuildDeckRow[];
}

/**
 * Builds a {@link RuneBuildsRepo}.
 * @param db - database or transaction handle
 */
export function createRuneBuildsRepo(db: Db): RuneBuildsRepo {
  return {
    list: () => db.select().from(runeBuilds).orderBy(asc(runeBuilds.id)).all(),
    get: (id) => db.select().from(runeBuilds).where(eq(runeBuilds.id, id)).get(),
    insert: (row) => db.insert(runeBuilds).values(row).returning().get(),
    update: (id, patch) => db.update(runeBuilds).set(patch).where(eq(runeBuilds.id, id)).returning().get(),
    remove: (id) => db.delete(runeBuilds).where(eq(runeBuilds.id, id)).returning({ id: runeBuilds.id }).all().length > 0,
    decksFor: (ids) => {
      const result = new Map<number, string[]>();
      if (ids.length === 0) return result;
      const rows = db
        .select({ runeBuildId: runeBuildDecks.runeBuildId, deckId: runeBuildDecks.deckId })
        .from(runeBuildDecks)
        .where(inArray(runeBuildDecks.runeBuildId, ids))
        .all();
      for (const row of rows) {
        const list = result.get(row.runeBuildId);
        if (list) list.push(row.deckId);
        else result.set(row.runeBuildId, [row.deckId]);
      }
      for (const list of result.values()) list.sort();
      return result;
    },
    replaceDecks: (id, deckIds) => {
      db.delete(runeBuildDecks).where(eq(runeBuildDecks.runeBuildId, id)).run();
      const distinct = [...new Set(deckIds)];
      if (distinct.length > 0) {
        db.insert(runeBuildDecks)
          .values(distinct.map((deckId) => ({ runeBuildId: id, deckId })))
          .run();
      }
    },
    count: () => db.select({ n: count() }).from(runeBuilds).get()!.n,
    clear: () => {
      db.delete(runeBuilds).run();
    },
    allLinks: () =>
      db.select().from(runeBuildDecks).orderBy(asc(runeBuildDecks.runeBuildId), asc(runeBuildDecks.deckId)).all(),
  };
}
