import { useQuery } from "@tanstack/react-query";
import type { IconIndex } from "../lib/cookie-icons";
import { buildIconIndex, EMPTY_ICONS } from "../lib/cookie-icons";
import type { SourceIndex } from "../lib/sources";
import { EMPTY_SOURCES, indexSources } from "../lib/sources";
import { glossaryQuery, sourcesQuery } from "./queries";

/**
 * The source index for `SourceChips`, from the one shared, unfiltered
 * `/api/sources` query.
 *
 * @returns id → URL/title; empty while loading or if the query failed, so
 *   chips then render unlinked rather than blocking the view
 */
export function useSourceIndex(): SourceIndex {
  const { data } = useQuery({ ...sourcesQuery(), select: indexSources });
  return data ?? EMPTY_SOURCES;
}

/**
 * The cookie and pet icon index for `CookieIcon`, built from the one
 * shared, unfiltered `/api/glossary` query.
 *
 * @returns name → icon entry; empty while loading or if the query failed,
 *   so names then show their badges rather than blocking the view
 */
export function useIconIndex(): IconIndex {
  const { data } = useQuery({ ...glossaryQuery(), select: buildIconIndex });
  return data ?? EMPTY_ICONS;
}
