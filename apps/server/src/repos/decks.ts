import type {
  DeckCookieRow,
  DeckNoteKind,
  DeckNoteRow,
  DeckPetRow,
  DeckRow,
} from "@crumble/schema";
import { counters, deckCookies, deckNotes, deckPets, decks } from "@crumble/schema";
import type { InferInsertModel } from "drizzle-orm";
import { asc, count, eq, inArray, max, or } from "drizzle-orm";
import type { Db } from "../db/client";

/** Insert payload for {@link DecksRepo.insert} and {@link DecksRepo.update}. */
export type DeckInsert = InferInsertModel<typeof decks>;

/** A single cookie slot, without the `id`/`deckId`/`position` the repo assigns. */
export type DeckCookieInsert = Omit<
  InferInsertModel<typeof deckCookies>,
  "id" | "deckId" | "position"
>;

/** A single note, without the `id`/`deckId`/`position` the repo assigns. */
export type DeckNoteInsert = { kind: DeckNoteKind; text: string };

/**
 * CRUD over `decks` and its ordered children (`deck_cookies`, `deck_pets`,
 * `deck_notes`). Children are always replaced as a whole list, positioned by
 * array index; there is no per-child update.
 */
export interface DecksRepo {
  /** Returns every deck, ordered by `position` then `id`. */
  list(): DeckRow[];
  /**
   * Returns the deck with `id`, or `undefined` if there is none.
   *
   * @param id - the deck's slug id
   */
  get(id: string): DeckRow | undefined;
  /**
   * Reports whether a deck with `id` exists.
   *
   * @param id - the deck's slug id
   * @returns `true` if a matching row exists, else `false`
   */
  exists(id: string): boolean;
  /**
   * Returns the ids in `ids` that don't exist in `decks`.
   *
   * @param ids - candidate deck ids
   * @returns the absent ids, in their input order; `[]` if `ids` is empty
   *   or every id exists
   */
  missing(ids: string[]): string[];
  /**
   * Inserts a deck.
   *
   * @throws if `id` already exists or a NOT NULL column is missing
   */
  insert(row: DeckInsert): DeckRow;
  /**
   * Updates the deck with `id`, merging in `patch`.
   *
   * @returns the updated row, or `undefined` if `id` doesn't exist
   */
  update(id: string, patch: Partial<DeckInsert>): DeckRow | undefined;
  /**
   * Deletes the deck with `id`. Its cookies, pets and notes cascade; any
   * score referencing it has its `deckId` set to `null` (both enforced by
   * the schema's foreign keys, not by this method).
   *
   * @param id - the deck's slug id
   * @returns `true` if a row was deleted, `false` if `id` didn't exist
   */
  remove(id: string): boolean;
  /** Returns one past the highest existing `position`, or `0` if `decks` is empty. */
  nextPosition(): number;
  /**
   * Returns the cookie slots of `deckIds`, ordered by deck then `position`.
   *
   * @param deckIds - deck ids to look up; `[]` returns `[]`
   */
  cookies(deckIds: string[]): DeckCookieRow[];
  /**
   * Returns the pet slots of `deckIds`, ordered by deck then `position`.
   *
   * @param deckIds - deck ids to look up; `[]` returns `[]`
   */
  pets(deckIds: string[]): DeckPetRow[];
  /**
   * Returns the notes of `deckIds`, ordered by deck then `position`.
   *
   * @param deckIds - deck ids to look up; `[]` returns `[]`
   */
  notes(deckIds: string[]): DeckNoteRow[];
  /**
   * Replaces every cookie slot of `deckId` with `cookies`, positioned by
   * array index.
   *
   * @param deckId - the deck to replace cookies for
   * @param cookies - the new cookie slots, in placement order
   */
  replaceCookies(deckId: string, cookies: DeckCookieInsert[]): void;
  /**
   * Replaces every pet slot of `deckId` with `pets`, positioned by array
   * index.
   *
   * @param deckId - the deck to replace pets for
   * @param pets - the new pets' Korean names, in placement order
   */
  replacePets(deckId: string, pets: string[]): void;
  /**
   * Replaces every note of `deckId` with `notes`, positioned by array index.
   *
   * @param deckId - the deck to replace notes for
   * @param notes - the new notes, in display order
   */
  replaceNotes(deckId: string, notes: DeckNoteInsert[]): void;
  /** Returns the number of decks. */
  count(): number;
  /**
   * Returns how many counter edges name the deck `id`, on either side
   * (`teamDeckId` or `beatenByDeckId`).
   *
   * @param id - the deck's slug id
   */
  counterEdges(id: string): number;
  /**
   * Returns the ids of the decks that name `id` as the deck that superseded them.
   *
   * @param id - the deck's slug id
   * @returns their ids, sorted; `[]` when none does
   */
  supersededDecks(id: string): string[];
  /** Returns every cookie slot across every deck, ordered by deck then `position`. */
  allCookies(): DeckCookieRow[];
}

/**
 * Builds a {@link DecksRepo}.
 *
 * @param db - database or transaction handle
 * @returns the repo
 */
export function createDecksRepo(db: Db): DecksRepo {
  return {
    /** @inheritdoc */
    list: () => db.select().from(decks).orderBy(asc(decks.position), asc(decks.id)).all(),
    /** @inheritdoc */
    get: (id) => db.select().from(decks).where(eq(decks.id, id)).get(),
    /** @inheritdoc */
    exists: (id) =>
      db.select({ id: decks.id }).from(decks).where(eq(decks.id, id)).get() !== undefined,
    /** @inheritdoc */
    missing: (ids) => {
      if (ids.length === 0) return [];
      const found = new Set(
        db
          .select({ id: decks.id })
          .from(decks)
          .where(inArray(decks.id, ids))
          .all()
          .map((r) => r.id),
      );
      return ids.filter((id) => !found.has(id));
    },
    /** @inheritdoc */
    insert: (row) => db.insert(decks).values(row).returning().get(),
    /** @inheritdoc */
    update: (id, patch) => db.update(decks).set(patch).where(eq(decks.id, id)).returning().get(),
    /** @inheritdoc */
    remove: (id) =>
      db.delete(decks).where(eq(decks.id, id)).returning({ id: decks.id }).all().length > 0,
    /** @inheritdoc */
    nextPosition: () => {
      const row = db
        .select({ max: max(decks.position) })
        .from(decks)
        .get();
      return row?.max == null ? 0 : row.max + 1;
    },
    /** @inheritdoc */
    cookies: (deckIds) => {
      if (deckIds.length === 0) return [];
      return db
        .select()
        .from(deckCookies)
        .where(inArray(deckCookies.deckId, deckIds))
        .orderBy(asc(deckCookies.deckId), asc(deckCookies.position))
        .all();
    },
    /** @inheritdoc */
    pets: (deckIds) => {
      if (deckIds.length === 0) return [];
      return db
        .select()
        .from(deckPets)
        .where(inArray(deckPets.deckId, deckIds))
        .orderBy(asc(deckPets.deckId), asc(deckPets.position))
        .all();
    },
    /** @inheritdoc */
    notes: (deckIds) => {
      if (deckIds.length === 0) return [];
      return db
        .select()
        .from(deckNotes)
        .where(inArray(deckNotes.deckId, deckIds))
        .orderBy(asc(deckNotes.deckId), asc(deckNotes.position))
        .all();
    },
    /** @inheritdoc */
    replaceCookies: (deckId, cookies) => {
      db.delete(deckCookies).where(eq(deckCookies.deckId, deckId)).run();
      if (cookies.length > 0) {
        db.insert(deckCookies)
          .values(cookies.map((cookie, position) => ({ ...cookie, deckId, position })))
          .run();
      }
    },
    /** @inheritdoc */
    replacePets: (deckId, pets) => {
      db.delete(deckPets).where(eq(deckPets.deckId, deckId)).run();
      if (pets.length > 0) {
        db.insert(deckPets)
          .values(pets.map((petKr, position) => ({ petKr, deckId, position })))
          .run();
      }
    },
    /** @inheritdoc */
    replaceNotes: (deckId, notes) => {
      db.delete(deckNotes).where(eq(deckNotes.deckId, deckId)).run();
      if (notes.length > 0) {
        db.insert(deckNotes)
          .values(notes.map((note, position) => ({ ...note, deckId, position })))
          .run();
      }
    },
    /** @inheritdoc */
    count: () => db.select({ n: count() }).from(decks).get()!.n,
    /** @inheritdoc */
    counterEdges: (id) =>
      db
        .select({ n: count() })
        .from(counters)
        .where(or(eq(counters.teamDeckId, id), eq(counters.beatenByDeckId, id)))
        .get()!.n,
    /** @inheritdoc */
    supersededDecks: (id) =>
      db
        .select({ id: decks.id })
        .from(decks)
        .where(eq(decks.supersededBy, id))
        .orderBy(asc(decks.id))
        .all()
        .map((row) => row.id),
    /** @inheritdoc */
    allCookies: () =>
      db
        .select()
        .from(deckCookies)
        .orderBy(asc(deckCookies.deckId), asc(deckCookies.position))
        .all(),
  };
}
