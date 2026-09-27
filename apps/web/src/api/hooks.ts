import { useQuery } from "@tanstack/react-query";
import type { SourceIndex } from "../lib/sources";
import { EMPTY_SOURCES, indexSources } from "../lib/sources";
import { sourcesQuery } from "./queries";

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
