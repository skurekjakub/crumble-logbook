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

/**
 * A short label for a research record, for a chip or a select: its number
 * and the mode it's filed under ("002-pvp-meta" filed under Arena →
 * "002 Arena").
 *
 * @param slug - the record's slug
 * @param records - the loaded records, each with the mode it's filed under
 * @param modes - the mode sections, each with its label and game mode
 * @returns the label; the number alone when the record or its mode isn't known,
 *   and the slug when it has no number
 */
export function recordLabel(
  slug: string,
  records: ReadonlyArray<{ slug: string; mode: string }>,
  modes: ReadonlyArray<{ label: string; scope: { mode: string } }>,
): string {
  const number = /^\d+/.exec(slug)?.[0] ?? slug;
  const mode = records.find((r) => r.slug === slug)?.mode;
  const section = modes.find((m) => m.scope.mode === mode);
  return section ? `${number} ${section.label}` : number;
}

/** An index with no sources, for use before `/api/sources` has loaded. */
export const EMPTY_SOURCES: SourceIndex = new Map();
