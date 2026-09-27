import type { BuffValueInput, BuffValueRow, Values } from "@crumble/schema";
import type { Store } from "../repos";
import type { Cited } from "./citations";
import { createContentService } from "./content";
import { createNameResolver, normalizeName } from "./names";

/**
 * A buff value as returned to callers: its sources, and the cookie's
 * English gloss from the glossary (`null` if unresolved).
 */
export type BuffValueView = Cited<BuffValueRow> & { en: string | null };

/** CRUD over `buff_values`, with each cookie's name resolved on read. */
export interface BuffValueService {
  /**
   * Returns every buff value, ordered by cookie, effect type, then skill
   * grade.
   * @param filter - restrict the list to one cookie, when given. `cookie`
   *   matches a row's stored `cookieKr`, or any other name (a shorthand,
   *   the English name) the glossary resolves to the same English name,
   *   case- and whitespace-insensitively
   */
  list(filter?: { cookie?: string }): BuffValueView[];
  /**
   * Returns the buff value with `id`.
   * @throws {NotFoundError} if `id` doesn't exist
   */
  get(id: number): BuffValueView;
  /**
   * Inserts a buff value and cites it.
   * @throws {UnknownRefsError} if any source id doesn't exist; nothing is
   *   written
   */
  create(values: Values<BuffValueInput>, sources: string[]): BuffValueView;
  /**
   * Updates the buff value with `id`; `sources`, when given, replaces its
   * citations.
   * @throws {NotFoundError} if `id` doesn't exist
   * @throws {UnknownRefsError} if any `sources` id doesn't exist
   */
  update(id: number, patch: Partial<Values<BuffValueInput>>, sources?: string[]): BuffValueView;
  /**
   * Deletes the buff value with `id` and its citations.
   * @throws {NotFoundError} if `id` doesn't exist
   */
  remove(id: number): void;
}

/**
 * Builds a {@link BuffValueService} over `store`.
 * @param store - the store to persist through
 */
export function createBuffValueService(store: Store): BuffValueService {
  const content = createContentService<BuffValueRow, Values<BuffValueInput>>(store, {
    entity: "buff_value",
    table: (repos) => repos.buffValues,
  });
  const resolver = () => createNameResolver(store.repos.glossary.list());
  const withEn = (resolve: ReturnType<typeof resolver>, row: Cited<BuffValueRow>) => ({
    ...row,
    en: resolve(row.cookieKr).en,
  });

  return {
    list: (filter) => {
      const resolve = resolver();
      const views = content.list().map((row) => withEn(resolve, row));
      if (filter?.cookie === undefined) return views;
      const key = normalizeName(filter.cookie);
      const en = resolve(filter.cookie).en;
      return views.filter(
        (view) => normalizeName(view.cookieKr) === key || (en !== null && view.en === en),
      );
    },
    get: (id) => withEn(resolver(), content.get(id)),
    create: (values, sources) => withEn(resolver(), content.create(values, sources)),
    update: (id, patch, sources) => withEn(resolver(), content.update(id, patch, sources)),
    remove: (id) => content.remove(id),
  };
}
