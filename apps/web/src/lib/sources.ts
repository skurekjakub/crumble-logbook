/** What a source chip needs to know about a source. */
export interface SourceLink {
  url: string;
  title: string | null;
}

/** Source id → link data, built once from the `/api/sources` list and passed to {@link SourceChips}. */
export type SourceIndex = ReadonlyMap<string, SourceLink>;

/** Display prefix per source-id prefix. */
const PREFIX: ReadonlyArray<readonly [string, string]> = [
  ["nv:", "Naver "],
  ["dc:", "DC "],
  ["web:", ""],
];

/**
 * Short label for a source id: "dc:76135" → "DC 76135", "nv:43653" →
 * "Naver 43653", "web:crumbgg:patches" → "crumbgg:patches".
 *
 * @param id - a `<site>:<key>` source id
 * @returns the label; an id with an unknown prefix is returned unchanged
 */
export function sourceLabel(id: string): string {
  const match = PREFIX.find(([p]) => id.startsWith(p));
  return match ? match[1] + id.slice(match[0].length) : id;
}

/**
 * Indexes a source list by id.
 *
 * @param rows - sources as `/api/sources` returns them
 * @returns a map from source id to its URL and title
 */
export function indexSources(
  rows: ReadonlyArray<{ id: string; url: string; title?: string | null }>,
): SourceIndex {
  return new Map(rows.map((r) => [r.id, { url: r.url, title: r.title ?? null }]));
}

/**
 * Every source some rows cite, for rows that share their sources, such as
 * a table's rows loaded from one file.
 *
 * @param rows - rows with sources
 * @returns the distinct source ids, sorted
 */
export function citedBy(rows: ReadonlyArray<{ sources: readonly string[] }>): string[] {
  return [...new Set(rows.flatMap((r) => r.sources))].sort();
}

/** An index with no sources, for use before `/api/sources` has loaded. */
export const EMPTY_SOURCES: SourceIndex = new Map();
