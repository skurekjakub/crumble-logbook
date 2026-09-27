import type { DeckCookieRow, DeckInput, DeckNoteKind, DeckPatch, DeckRow } from "@crumble/schema";
import { ConflictError, NotFoundError } from "../errors";
import type { Repos, Store } from "../repos";
import { assertSourcesExist } from "./citations";
import type { Cited } from "./citations";
import type { NameRef } from "./names";
import { createNameResolver } from "./names";

/**
 * A deck as returned to callers: its cookies and pets carry a resolved
 * English gloss alongside their stored Korean name, `atkOrder` is resolved
 * from a raw name list to {@link NameRef}s (or stays `null`), and the row
 * carries its citing sources.
 */
export type DeckView = Omit<Cited<DeckRow>, "atkOrder"> & {
  cookies: Array<Omit<DeckCookieRow, "deckId"> & { en: string | null }>;
  pets: NameRef[];
  notes: Array<{ kind: DeckNoteKind; text: string }>;
  atkOrder: NameRef[] | null;
};

/**
 * CRUD over the decks aggregate: the deck row, its ordered cookies, pets and
 * notes, and its citations, with Korean names resolved to English via the
 * glossary on every read.
 */
export interface DeckService {
  /** Returns every deck view, ordered by `position` then `id`. */
  list(): DeckView[];
  /**
   * Returns the deck view for `id`.
   * @param id - the deck's slug id
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: string): DeckView;
  /**
   * Inserts a deck with its cookies, pets, notes and citations.
   * @param input - the deck and its children; `position` defaults to the
   *   next free position when omitted
   * @throws {ConflictError} if `input.id` already exists
   * @throws {UnknownRefsError} if any cited source id doesn't exist
   */
  create(input: DeckInput): DeckView;
  /**
   * Updates the deck with `id`, merging in `patch`. Only the children whose
   * key is present in `patch` (`cookies`, `pets`, `notes`) are replaced; an
   * absent key leaves that child list unchanged, while an empty array
   * clears it. Citations are replaced only when `patch.sources` is given.
   *
   * @param id - the deck's slug id
   * @param patch - the fields and children to change
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws {UnknownRefsError} if any cited source id doesn't exist
   */
  update(id: string, patch: DeckPatch): DeckView;
  /**
   * Deletes the deck with `id` and its citations. Its cookies, pets and
   * notes cascade; any score referencing it keeps its row with `deckId` set
   * to `null` (both via the schema's foreign keys).
   * @param id - the deck's slug id
   * @throws {NotFoundError} if `id` doesn't exist
   */
  remove(id: string): void;
}

/** Groups rows with a `deckId` field by that field, preserving each group's row order. */
function groupByDeckId<T extends { deckId: string }>(rows: T[]): Map<string, T[]> {
  const result = new Map<string, T[]>();
  for (const row of rows) {
    const group = result.get(row.deckId);
    if (group) group.push(row);
    else result.set(row.deckId, [row]);
  }
  return result;
}

/**
 * Builds a {@link DeckService} over `store`.
 * @param store - the store to persist through
 */
export function createDeckService(store: Store): DeckService {
  const toViews = (repos: Repos, rows: DeckRow[]): DeckView[] => {
    const ids = rows.map((row) => row.id);
    const resolve = createNameResolver(repos.glossary.list());
    const cookiesByDeck = groupByDeckId(repos.decks.cookies(ids));
    const petsByDeck = groupByDeckId(repos.decks.pets(ids));
    const notesByDeck = groupByDeckId(repos.decks.notes(ids));
    const sourcesById = repos.citations.sourcesFor("deck", ids);
    return rows.map((row) => ({
      ...row,
      sources: sourcesById.get(row.id) ?? [],
      atkOrder: row.atkOrder ? row.atkOrder.map(resolve) : null,
      cookies: (cookiesByDeck.get(row.id) ?? []).map(({ deckId: _deckId, ...cookie }) => ({
        ...cookie,
        en: resolve(cookie.cookieKr).en,
      })),
      pets: (petsByDeck.get(row.id) ?? []).map((pet) => resolve(pet.petKr)),
      notes: (notesByDeck.get(row.id) ?? []).map((note) => ({ kind: note.kind, text: note.text })),
    }));
  };

  return {
    list: () => {
      const repos = store.repos;
      return toViews(repos, repos.decks.list());
    },
    get: (id) => {
      const repos = store.repos;
      const row = repos.decks.get(id);
      if (!row) throw new NotFoundError("deck", id);
      return toViews(repos, [row])[0]!;
    },
    // See `ContentService.create`'s implementation for why the inner return
    // is cast `as never` and the outer call `as DeckView`: `Store.transaction`
    // can't infer its type parameter through its own conditional return type.
    create: (input) =>
      store.transaction((repos) => {
        if (repos.decks.exists(input.id))
          throw new ConflictError(`deck already exists: ${input.id}`);
        assertSourcesExist(repos, input.sources);
        const { cookies, pets, notes, sources, position, ...values } = input;
        const row = repos.decks.insert({
          ...values,
          position: position ?? repos.decks.nextPosition(),
        });
        repos.decks.replaceCookies(row.id, cookies);
        repos.decks.replacePets(row.id, pets);
        repos.decks.replaceNotes(row.id, notes);
        repos.citations.replace("deck", row.id, sources);
        return toViews(repos, [row])[0] as never;
      }) as DeckView,
    update: (id, patch) =>
      store.transaction((repos) => {
        if (!repos.decks.exists(id)) throw new NotFoundError("deck", id);
        const { cookies, pets, notes, sources, ...values } = patch;
        if (sources !== undefined) assertSourcesExist(repos, sources);
        const row =
          Object.keys(values).length > 0 ? repos.decks.update(id, values) : repos.decks.get(id);
        if (!row) throw new NotFoundError("deck", id);
        if (cookies !== undefined) repos.decks.replaceCookies(id, cookies);
        if (pets !== undefined) repos.decks.replacePets(id, pets);
        if (notes !== undefined) repos.decks.replaceNotes(id, notes);
        if (sources !== undefined) repos.citations.replace("deck", id, sources);
        return toViews(repos, [row])[0] as never;
      }) as DeckView,
    remove: (id) =>
      store.transaction((repos) => {
        if (!repos.decks.exists(id)) throw new NotFoundError("deck", id);
        repos.citations.removeAll("deck", id);
        repos.decks.remove(id);
      }),
  };
}
