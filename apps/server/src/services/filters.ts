import type { AnyFilters as Filters, AnyListFilter } from "../registry";
import type { NameRef } from "./names";
import { normalizeName } from "./names";

/**
 * Whether any of `filters` needs the glossary to match.
 * @param filters - a type's declared list filters
 */
export function filtersNeedGlossary(filters: Filters | undefined): boolean {
  return Object.values(filters ?? {}).some((filter) => "sameName" in filter.match);
}

/** The view field a filter match reads. */
function matchField(match: AnyListFilter["match"]): string {
  if ("equals" in match) return match.equals;
  if ("sameName" in match) return match.sameName;
  return match.includes;
}

/**
 * Keeps the views that every given filter value matches, as each filter's
 * declared match says (see the registry's `FilterMatch`).
 *
 * @param views - the views, in list order
 * @param filters - the type's declared list filters, by query param name
 * @param values - the requested values, by the same names; an absent or
 *   `undefined` value doesn't filter
 * @param resolve - the glossary resolver; `sameName` filters need it
 * @returns the matching views, in their original order
 * @throws `Error` if a `sameName` filter is given a value and no `resolve`
 */
export function applyFilters<View>(
  views: View[],
  filters: Filters | undefined,
  values: Readonly<Record<string, string | undefined>> | undefined,
  resolve?: (name: string) => NameRef,
): View[] {
  const tests = Object.entries(filters ?? {}).flatMap(([name, { match }]) => {
    const value = values?.[name];
    if (value === undefined) return [];
    const field = (view: View) => (view as Record<string, unknown>)[matchField(match)];
    if ("equals" in match) return [(view: View) => field(view) === value];
    if ("includes" in match) return [(view: View) => (field(view) as unknown[]).includes(value)];
    if (!resolve) throw new Error(`filter "${name}" matches names and needs the glossary`);
    const key = normalizeName(value);
    const en = resolve(value).en;
    return [
      (view: View) => {
        const stored = String(field(view));
        return normalizeName(stored) === key || (en !== null && resolve(stored).en === en);
      },
    ];
  });
  return tests.length === 0 ? views : views.filter((view) => tests.every((test) => test(view)));
}
