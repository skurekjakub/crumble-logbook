import type { RuneBuildInput, RuneBuildPatch, RuneBuildRow } from "@crumble/schema";
import { OBSOLESCENCE, obsolescenceKey } from "@crumble/schema";
import { NotFoundError, UnknownRefsError } from "../errors";
import type { FiltersOf } from "../registry";
import { REGISTRY } from "../registry";
import type { Repos, Store } from "../repos";
import { assertSourcesExist } from "./citations";
import type { Cited } from "./citations";
import { applyFilters } from "./filters";
import { createNameResolver, recordsOf } from "./names";

/**
 * A rune build as returned to callers: its cookie carries a resolved English
 * gloss alongside its stored Korean name (the build's own record's glossary
 * entries first), it lists the decks it applies to (by id, not resolved
 * further), and the sources that say why it became obsolete, empty while
 * it is current.
 */
export type RuneBuildView = Cited<RuneBuildRow> & {
  en: string | null;
  decks: string[];
  obsoleteSources: string[];
};

/**
 * CRUD over the rune build aggregate: the rune build row, its m:n links to
 * decks, and its citations, with the cookie's Korean name resolved to
 * English via the glossary on every read.
 */
export interface RuneBuildService {
  /**
   * Returns every rune build view, ordered by `id`.
   *
   * @param filter - the registry's list filters, each applied when given:
   *   `deck` keeps the rune builds linked to that deck, `mode` those of
   *   that game mode
   */
  list(filter?: FiltersOf<"runeBuilds">): RuneBuildView[];
  /**
   * Returns the rune build view for `id`.
   *
   * @param id - the rune build's numeric id
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: number): RuneBuildView;
  /**
   * Inserts a rune build with its deck links and citations.
   *
   * @param input - the rune build, the decks it applies to, and its sources
   * @throws {UnknownRefsError} if any cited source id doesn't exist
   *   (`"sources"`), or any linked deck id doesn't exist (`"decks"`)
   */
  create(input: RuneBuildInput): RuneBuildView;
  /**
   * Updates the rune build with `id`, merging in `patch`. Deck links are
   * replaced only when `patch.decks` is given; an absent `decks` leaves the
   * existing links unchanged. Citations are replaced only when
   * `patch.sources` is given.
   *
   * @param id - the rune build's numeric id
   * @param patch - the fields, deck links and sources to change
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws {UnknownRefsError} if any cited source id doesn't exist
   *   (`"sources"`), or any linked deck id doesn't exist (`"decks"`)
   */
  update(id: number, patch: RuneBuildPatch): RuneBuildView;
  /**
   * Deletes the rune build with `id`, its deck links and its citations,
   * its obsolete reason's among them.
   *
   * @param id - the rune build's numeric id
   * @throws {NotFoundError} if `id` doesn't exist
   */
  remove(id: number): void;
}

/**
 * Verifies that every id in `deckIds` is a known deck.
 *
 * @param repos - repos to check against
 * @param deckIds - candidate deck ids
 * @throws {UnknownRefsError} naming every id in `deckIds` that doesn't
 *   exist, `kind` `"decks"`
 */
function assertDecksExist(repos: Repos, deckIds: string[]): void {
  const missing = repos.decks.missing(deckIds);
  if (missing.length > 0) throw new UnknownRefsError("decks", missing);
}

/**
 * Builds a {@link RuneBuildService} over `store`.
 *
 * @param store - the store to persist through
 * @returns the service
 */
export function createRuneBuildService(store: Store): RuneBuildService {
  /**
   * Builds the views of `rows`, with their decks, citations and English cookie names.
   *
   * @param repos - the repos to read decks, citations and the glossary from
   * @param rows - the rune build rows
   * @returns one view per row, in `rows` order
   */
  const toViews = (repos: Repos, rows: RuneBuildRow[]): RuneBuildView[] => {
    const ids = rows.map((row) => row.id);
    const resolve = createNameResolver(repos.glossary.list());
    const decksById = repos.runeBuilds.decksFor(ids);
    const sourcesById = repos.citations.sourcesFor("rune_build", ids.map(String));
    const reasonsById = repos.citations.sourcesFor(
      OBSOLESCENCE,
      ids.map((id) => obsolescenceKey("rune_build", id)),
    );
    return rows.map((row) => ({
      ...row,
      sources: sourcesById.get(String(row.id)) ?? [],
      obsoleteSources: reasonsById.get(obsolescenceKey("rune_build", row.id)) ?? [],
      en: resolve(row.cookieKr, recordsOf(row)).en,
      decks: decksById.get(row.id) ?? [],
    }));
  };

  return {
    /** @inheritdoc */
    list: (filter) => {
      const repos = store.repos;
      return applyFilters(
        toViews(repos, repos.runeBuilds.list()),
        REGISTRY.runeBuilds.filters,
        filter,
      );
    },
    /** @inheritdoc */
    get: (id) => {
      const repos = store.repos;
      const row = repos.runeBuilds.get(id);
      if (!row) throw new NotFoundError("rune_build", id);
      return toViews(repos, [row])[0]!;
    },
    // See `DeckService.create`'s implementation for why the inner return is
    // cast `as never` and the outer call `as RuneBuildView`: `Store.transaction`
    // can't infer its type parameter through its own conditional return type.
    /** @inheritdoc */
    create: (input) =>
      store.transaction((repos) => {
        assertSourcesExist(repos, input.sources);
        assertDecksExist(repos, input.decks);
        const { decks, sources, ...values } = input;
        const row = repos.runeBuilds.insert(values);
        repos.runeBuilds.replaceDecks(row.id, decks);
        repos.citations.replace("rune_build", String(row.id), sources);
        return toViews(repos, [row])[0] as never;
      }),
    /** @inheritdoc */
    update: (id, patch) =>
      store.transaction((repos) => {
        if (!repos.runeBuilds.get(id)) throw new NotFoundError("rune_build", id);
        const { decks, sources, ...values } = patch;
        if (sources !== undefined) assertSourcesExist(repos, sources);
        if (decks !== undefined) assertDecksExist(repos, decks);
        const row =
          Object.keys(values).length > 0
            ? repos.runeBuilds.update(id, values)
            : repos.runeBuilds.get(id);
        if (!row) throw new NotFoundError("rune_build", id);
        if (decks !== undefined) repos.runeBuilds.replaceDecks(id, decks);
        if (sources !== undefined) repos.citations.replace("rune_build", String(id), sources);
        return toViews(repos, [row])[0] as never;
      }),
    /** @inheritdoc */
    remove: (id) =>
      store.transaction((repos) => {
        if (!repos.runeBuilds.get(id)) throw new NotFoundError("rune_build", id);
        repos.citations.removeAll("rune_build", String(id));
        repos.citations.removeAll(OBSOLESCENCE, obsolescenceKey("rune_build", id));
        repos.runeBuilds.remove(id);
      }),
  };
}
