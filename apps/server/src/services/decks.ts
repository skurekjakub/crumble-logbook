import type {
  DeckCookieRow,
  DeckDailyDungeonRow,
  DeckDailyRunInput,
  DeckInput,
  DeckNoteKind,
  DeckPatch,
  DeckRow,
} from "@crumble/schema";
import { OBSOLESCENCE, dailyDeckProblem, obsolescenceKey, withRunPowers } from "@crumble/schema";
import { ConflictError, NotFoundError, UnknownRefsError } from "../errors";
import type { FiltersOf } from "../registry";
import { REGISTRY } from "../registry";
import type { Repos, Store } from "../repos";
import type { DeckDailyRunInsert } from "../repos/decks";
import { assertSourcesExist } from "./citations";
import type { Cited } from "./citations";
import { deckRefProblem } from "./content";
import { deckModeChangeConflict } from "./deck-modes";
import { applyFilters } from "./filters";
import type { NameRef } from "./names";
import { createNameResolver, recordsOf } from "./names";

/** A daily dungeon deck's run facts as returned to callers, its captain glossed. */
export type DailyRunView = Omit<DeckDailyDungeonRow, "deckId" | "captainKr"> & {
  captain: NameRef | null;
};

/**
 * A deck as returned to callers: its cookies and pets carry a resolved
 * English gloss alongside their stored Korean name (the deck's own record's
 * glossary entries first), `atkOrder` is resolved from a raw name list to
 * {@link NameRef}s (or stays `null`), `dailyDungeon` holds a daily dungeon
 * deck's run facts (`null` for any other deck), and the row carries its
 * citing sources, and the sources that say why it became obsolete
 * (`obsoleteSources`, empty while it is current).
 */
export type DeckView = Omit<Cited<DeckRow>, "atkOrder"> & {
  cookies: Array<Omit<DeckCookieRow, "deckId"> & { en: string | null }>;
  pets: NameRef[];
  notes: Array<{ kind: DeckNoteKind; text: string }>;
  atkOrder: NameRef[] | null;
  dailyDungeon: DailyRunView | null;
  obsoleteSources: string[];
};

/**
 * CRUD over the decks aggregate: the deck row, its ordered cookies, pets and
 * notes, a daily dungeon deck's run facts, and its citations, with Korean
 * names resolved to English via the glossary on every read. A deck keeps
 * the daily dungeon rules (`dailyDeckProblem`), and its run facts name a
 * stored daily dungeon.
 */
export interface DeckService {
  /**
   * Returns every deck view, ordered by `position` then `id`.
   *
   * @param filter - the registry's list filters for decks (`mode`), each
   *   applied when given
   */
  list(filter?: FiltersOf<"decks">): DeckView[];
  /**
   * Returns the deck view for `id`.
   *
   * @param id - the deck's slug id
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: string): DeckView;
  /**
   * Inserts a deck with its cookies, pets, notes and citations.
   *
   * @param input - the deck and its children; `position` defaults to the
   *   next free position when omitted
   * @throws {ConflictError} if `input.id` already exists
   * @throws {UnknownRefsError} if any cited source id, or the daily dungeon
   *   the run facts name, doesn't exist
   */
  create(input: DeckInput): DeckView;
  /**
   * Updates the deck with `id`, merging in `patch`. Only the children whose
   * key is present in `patch` (`cookies`, `pets`, `notes`, `dailyDungeon`)
   * are replaced; an absent key leaves that child unchanged, while an
   * empty array (or a `null` run) clears it. Citations are replaced only
   * when `patch.sources` is given.
   *
   * @param id - the deck's slug id
   * @param patch - the fields and children to change
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws {UnknownRefsError} if any cited source id, or the daily dungeon
   *   the run facts name, doesn't exist
   * @throws {ConflictError} if `patch.mode` would leave a mode-bound row
   *   (a counter edge, a stage or dungeon row) naming a deck of another
   *   mode, if the patched deck would break the daily dungeon rules, or if
   *   new run facts would leave a row naming the deck breaking its own
   *   rule (a clear of a dungeon the deck no longer runs); nothing is
   *   written
   */
  update(id: string, patch: DeckPatch): DeckView;
  /**
   * Deletes the deck with `id` and its citations. Its cookies, pets, notes
   * and run facts cascade; any score referencing it keeps its row with `deckId` set
   * to `null` (both via the schema's foreign keys). A deck a counter edge
   * names is kept: delete or repoint the edges first. Its obsolete reason's
   * citations go with it.
   *
   * @param id - the deck's slug id
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws {ConflictError} `"deck <id> is named by N counter edges"` if any
   *   counter edge names `id` as its team or beaten-by deck
   * @throws {ConflictError} `"deck <id> is named as the successor of <ids>"`
   *   if another deck names it as `supersededBy`
   */
  remove(id: string): void;
}

/**
 * Groups rows with a `deckId` field by that field, preserving each group's row order.
 *
 * @param rows - the rows to group
 * @returns deck id → that deck's rows
 */
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
 * Maps a deck's run facts as submitted onto their columns.
 *
 * @param run - the run facts, or `null` for a deck without any
 * @returns the columns, the powers in billions read from the posted texts, or `null`
 */
function dailyRunValues(run: DeckDailyRunInput | null): DeckDailyRunInsert | null {
  return run === null ? null : withRunPowers(run);
}

/**
 * Builds the view of a deck's stored run facts.
 *
 * @param run - the stored row
 * @param resolve - glosses a Korean name for the deck's record
 * @returns the facts, the captain glossed (`null` when none is named)
 */
function runView(run: DeckDailyDungeonRow, resolve: (name: string) => NameRef): DailyRunView {
  const { deckId: _deckId, captainKr, ...facts } = run;
  return { ...facts, captain: captainKr === null ? null : resolve(captainKr) };
}

/**
 * Checks that the daily dungeon a deck's run facts name is stored.
 *
 * @param repos - the write's repos
 * @param run - the run facts, or `null` for a deck without any
 * @throws {UnknownRefsError} `"dailyDungeons"` naming the slug when no daily dungeon has it
 */
function assertDungeonExists(repos: Repos, run: { dungeon: string } | null): void {
  if (run === null) return;
  if (!repos.dailyDungeons.list().some((dungeon) => dungeon.slug === run.dungeon)) {
    throw new UnknownRefsError("dailyDungeons", [run.dungeon]);
  }
}

/**
 * Builds a {@link DeckService} over `store`.
 *
 * @param store - the store to persist through
 * @returns the service
 */
export function createDeckService(store: Store): DeckService {
  /**
   * Builds the views of `rows`, with their slots, notes, citations and English names.
   *
   * @param repos - the repos to read children, citations and the glossary from
   * @param rows - the deck rows
   * @returns one view per row, in `rows` order
   */
  const toViews = (repos: Repos, rows: DeckRow[]): DeckView[] => {
    const ids = rows.map((row) => row.id);
    const resolve = createNameResolver(repos.glossary.list());
    const cookiesByDeck = groupByDeckId(repos.decks.cookies(ids));
    const petsByDeck = groupByDeckId(repos.decks.pets(ids));
    const notesByDeck = groupByDeckId(repos.decks.notes(ids));
    const runsByDeck = new Map(repos.decks.dailyRuns(ids).map((run) => [run.deckId, run]));
    const sourcesById = repos.citations.sourcesFor("deck", ids);
    const reasonsById = repos.citations.sourcesFor(
      OBSOLESCENCE,
      ids.map((id) => obsolescenceKey("deck", id)),
    );
    return rows.map((row) => {
      const records = recordsOf(row);
      const run = runsByDeck.get(row.id);
      return {
        ...row,
        sources: sourcesById.get(row.id) ?? [],
        obsoleteSources: reasonsById.get(obsolescenceKey("deck", row.id)) ?? [],
        atkOrder: row.atkOrder ? row.atkOrder.map((name) => resolve(name, records)) : null,
        cookies: (cookiesByDeck.get(row.id) ?? []).map(({ deckId: _deckId, ...cookie }) => ({
          ...cookie,
          en: resolve(cookie.cookieKr, records).en,
        })),
        pets: (petsByDeck.get(row.id) ?? []).map((pet) => resolve(pet.petKr, records)),
        notes: (notesByDeck.get(row.id) ?? []).map((note) => ({
          kind: note.kind,
          text: note.text,
        })),
        dailyDungeon: run ? runView(run, (name) => resolve(name, records)) : null,
      };
    });
  };

  return {
    /** @inheritdoc */
    list: (filter) => {
      const repos = store.repos;
      return applyFilters(toViews(repos, repos.decks.list()), REGISTRY.decks.filters, filter);
    },
    /** @inheritdoc */
    get: (id) => {
      const repos = store.repos;
      const row = repos.decks.get(id);
      if (!row) throw new NotFoundError("deck", id);
      return toViews(repos, [row])[0]!;
    },
    // See `ContentService.create`'s implementation for why the inner return
    // is cast `as never` and the outer call `as DeckView`: `Store.transaction`
    // can't infer its type parameter through its own conditional return type.
    /** @inheritdoc */
    create: (input) =>
      store.transaction((repos) => {
        if (repos.decks.exists(input.id))
          throw new ConflictError(`deck already exists: ${input.id}`);
        assertSourcesExist(repos, input.sources);
        const { cookies, pets, notes, dailyDungeon, sources, position, ...values } = input;
        assertDungeonExists(repos, dailyDungeon ?? null);
        const row = repos.decks.insert({
          ...values,
          position: position ?? repos.decks.nextPosition(),
        });
        repos.decks.replaceCookies(row.id, cookies);
        repos.decks.replacePets(row.id, pets);
        repos.decks.replaceNotes(row.id, notes);
        repos.decks.replaceDailyRun(row.id, dailyRunValues(dailyDungeon ?? null));
        repos.citations.replace("deck", row.id, sources);
        return toViews(repos, [row])[0] as never;
      }),
    /** @inheritdoc */
    update: (id, patch) =>
      store.transaction((repos) => {
        if (!repos.decks.exists(id)) throw new NotFoundError("deck", id);
        const { cookies, pets, notes, dailyDungeon, sources, ...values } = patch;
        if (sources !== undefined) assertSourcesExist(repos, sources);
        if (dailyDungeon !== undefined) assertDungeonExists(repos, dailyDungeon);
        if (values.mode !== undefined) {
          const conflict = deckModeChangeConflict(repos, id, values.mode);
          if (conflict) throw new ConflictError(conflict);
        }
        const row =
          Object.keys(values).length > 0 ? repos.decks.update(id, values) : repos.decks.get(id);
        if (!row) throw new NotFoundError("deck", id);
        if (cookies !== undefined) repos.decks.replaceCookies(id, cookies);
        if (pets !== undefined) repos.decks.replacePets(id, pets);
        if (notes !== undefined) repos.decks.replaceNotes(id, notes);
        if (dailyDungeon !== undefined) {
          repos.decks.replaceDailyRun(id, dailyRunValues(dailyDungeon));
        }
        const problem = dailyDeckProblem({
          mode: row.mode,
          cookies: repos.decks.cookies([id]).map((cookie) => cookie.cookieKr),
          run: repos.decks.dailyRuns([id])[0] ?? null,
        });
        if (problem) throw new ConflictError(`deck ${id}: ${problem}`);
        if (dailyDungeon !== undefined) {
          const naming = deckRefProblem(repos, id);
          if (naming) throw new ConflictError(naming);
        }
        if (sources !== undefined) repos.citations.replace("deck", id, sources);
        return toViews(repos, [row])[0] as never;
      }),
    /** @inheritdoc */
    remove: (id) =>
      store.transaction((repos) => {
        if (!repos.decks.exists(id)) throw new NotFoundError("deck", id);
        const edges = repos.decks.counterEdges(id);
        if (edges > 0) throw new ConflictError(`deck ${id} is named by ${edges} counter edges`);
        const superseded = repos.decks.supersededDecks(id);
        if (superseded.length > 0) {
          throw new ConflictError(
            `deck ${id} is named as the successor of ${superseded.join(", ")}`,
          );
        }
        repos.citations.removeAll("deck", id);
        repos.citations.removeAll(OBSOLESCENCE, obsolescenceKey("deck", id));
        repos.decks.remove(id);
      }),
  };
}
