import { decks } from "@crumble/schema";
import { eq } from "drizzle-orm";
import type { Db } from "../db/client";

/**
 * Minimal read access to `decks`, just enough for other tables to validate a
 * `deckId` reference. Task 6 replaces this with the full `DecksRepo` (which
 * keeps `exists`).
 */
export interface DecksRepo {
  /**
   * Reports whether a deck with `id` exists.
   * @param id - the deck's slug id
   * @returns `true` if a matching row exists, else `false`
   */
  exists(id: string): boolean;
}

/**
 * Builds a {@link DecksRepo}.
 * @param db - database or transaction handle
 */
export function createDecksRepo(db: Db): DecksRepo {
  return {
    exists: (id) => db.select({ id: decks.id }).from(decks).where(eq(decks.id, id)).get() !== undefined,
  };
}
