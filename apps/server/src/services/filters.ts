import type { AnyFilters as Filters, AnyListFilter } from "../registry";
import type { NameResolver } from "./names";
import { normalizeName, recordsOf } from "./names";

/**
 * Whether any of `filters` needs the glossary to match.
 *
 * @param filters - a type's declared list filters
 * @returns `true` if any filter matches by `sameName`
 */
export function filtersNeedGlossary(filters: Filters | undefined): boolean {
  return Object.values(filters ?? {}).some((filter) => "sameName" in filter.match);
}

/**
 * Builds the test one filter value puts every view through.
 *
 * @param name - the filter's query param name
 * @param match - the filter's declared match
 * @param value - the requested value
 * @param resolve - the glossary resolver; `sameName` matches need it
 * @returns a predicate that is `true` for a view the value matches
 * @throws `Error` if `match` is `sameName` and there's no `resolve`
 */
function matcher<View>(
  name: string,
  match: AnyListFilter["match"],
  value: string,
  resolve: NameResolver | undefined,
): (view: View) => boolean {
  /**
   * Reads one column of a view.
   *
   * @param view - the view
   * @param column - the column's key
   * @returns the column's value
   */
  const field = (view: View, column: string) => (view as Record<string, unknown>)[column];
  if ("equals" in match) return (view) => field(view, match.equals) === value;
  if ("anyOf" in match)
    return (view) => match.anyOf.some((column) => field(view, column) === value);
  if ("includes" in match)
    return (view) => (field(view, match.includes) as unknown[]).includes(value);
  if ("isNull" in match) {
    const wanted = value === "true";
    return (view) => (field(view, match.isNull) == null) === wanted;
  }
  if (!resolve) throw new Error(`filter "${name}" matches names and needs the glossary`);
  const key = normalizeName(value);
  const en = resolve(value).en;
  return (view) => {
    const stored = String(field(view, match.sameName));
    return (
      normalizeName(stored) === key || (en !== null && resolve(stored, recordsOf(view)).en === en)
    );
  };
}

/**
 * Keeps the views that every given filter value matches, as each filter's
 * declared match says (see the registry's `FilterMatch`).
 *
 * @param views - the views, in list order
 * @param filters - the type's declared list filters, by query param name
 * @param values - the requested values, by the same names; an absent or
 *   `undefined` value doesn't filter
 * @param resolve - the glossary resolver; `sameName` filters need it. A
 *   stored name resolves against its view's own record first
 * @returns the matching views, in their original order
 * @throws `Error` if a `sameName` filter is given a value and no `resolve`
 */
export function applyFilters<View>(
  views: View[],
  filters: Filters | undefined,
  values: Readonly<Record<string, string | undefined>> | undefined,
  resolve?: NameResolver,
): View[] {
  const tests = Object.entries(filters ?? {}).flatMap(([name, { match }]) => {
    const value = values?.[name];
    return value === undefined ? [] : [matcher<View>(name, match, value, resolve)];
  });
  return tests.length === 0 ? views : views.filter((view) => tests.every((test) => test(view)));
}
