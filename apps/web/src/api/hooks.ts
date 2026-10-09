import { useQuery } from "@tanstack/react-query";
import type { IconIndex } from "../lib/cookie-icons";
import { buildIconIndex, EMPTY_ICONS } from "../lib/cookie-icons";
import type { SourceIndex } from "../lib/sources";
import { EMPTY_SOURCES, indexSources } from "../lib/sources";
import { dailyDungeonsQuery, glossaryQuery, sourcesQuery } from "./queries";
import type { DailyDungeon } from "./types";

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

/** No daily dungeons: what {@link useDailyDungeonIndex} gives while loading or after a failure. */
const NO_DUNGEONS: ReadonlyMap<string, DailyDungeon> = new Map();

/**
 * Indexes daily dungeons by slug.
 *
 * @param rows - the dungeons
 * @returns slug → dungeon
 */
function indexDungeons(rows: readonly DailyDungeon[]): ReadonlyMap<string, DailyDungeon> {
  return new Map(rows.map((row) => [row.slug, row]));
}

/**
 * The daily dungeons by slug, from the one shared `/api/daily-dungeons`
 * query, for a deck's run chips.
 *
 * @returns slug → dungeon; empty while loading or if the query failed, so
 *   a chip then names the dungeon by its slug rather than blocking the view
 */
export function useDailyDungeonIndex(): ReadonlyMap<string, DailyDungeon> {
  const { data } = useQuery({ ...dailyDungeonsQuery(), select: indexDungeons });
  return data ?? NO_DUNGEONS;
}
