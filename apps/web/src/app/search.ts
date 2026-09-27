import { useNavigate } from "@tanstack/react-router";
import { mergeSearch } from "../lib/search";

/**
 * A setter for the current route's search params: it merges a patch into
 * them (see `mergeSearch`) and replaces the history entry, so filtering a
 * view doesn't add a back-button step per keystroke.
 *
 * @typeParam S - the route's validated search params
 * @returns a function applying a patch to the current search params
 */
export function useSearchPatch<S extends object>(): (patch: Partial<S>) => void {
  const navigate = useNavigate();
  return (patch) =>
    void navigate({
      to: ".",
      // The router types `prev` per destination; `"."` is the current route,
      // whose search params are `S`.
      search: ((prev: S) => mergeSearch(prev, patch)) as never,
      replace: true,
    });
}
