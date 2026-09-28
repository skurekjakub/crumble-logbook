import { useQuery } from "@tanstack/react-query";
import type { SourceSiteFilter } from "../api/queries";
import { sourcesQuery } from "../api/queries";
import type { Source } from "../api/types";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { QueryResult } from "../components/QueryResult";
import { ViewHeader } from "../components/ViewHeader";
import { optionalKey, optionalText } from "../lib/search";
import { sourceLabel } from "../lib/sources";

/** Select label per site; the keys are every site `?site=` accepts. */
const SITE_LABELS: Record<SourceSiteFilter, string> = { dc: "DC", nv: "Naver", web: "Web" };

/** The sources view's search params: a site to narrow to and a title search. */
export interface SourcesSearch {
  site?: SourceSiteFilter;
  q?: string;
}

/**
 * Reads the sources view's search params.
 *
 * @param search - the router's decoded query values
 * @returns the site and title search, each dropped when unusable
 */
export function validateSourcesSearch(search: Record<string, unknown>): SourcesSearch {
  return { site: optionalKey(search.site, SITE_LABELS), q: optionalText(search.q) };
}

/**
 * Orders sources newest first, undated last, then by id.
 *
 * @param a - a source
 * @param b - another source
 * @returns negative, zero or positive, as for `Array.prototype.sort`
 */
function newestFirst(a: Source, b: Source): number {
  if (a.date !== b.date) {
    if (a.date == null) return 1;
    if (b.date == null) return -1;
    return b.date.localeCompare(a.date);
  }
  return a.id.localeCompare(b.id);
}

const COLUMNS: Column<Source>[] = [
  {
    header: "Source",
    /**
     * Renders the source's id as a link to its URL.
     *
     * @param s - the source
     * @returns the link
     */
    cell: (s) => (
      <a href={s.url} target="_blank" rel="noopener">
        {sourceLabel(s.id)}
      </a>
    ),
    className: "n source-id",
  },
  {
    header: "Title",
    /**
     * Renders the source's title, with its English title beside it when known.
     *
     * @param s - the source
     * @returns the titles
     */
    cell: (s) => (
      <>
        {s.title ?? ""}
        {s.titleEn && <span className="muted"> {s.titleEn}</span>}
      </>
    ),
    className: "wide source-title",
  },
  {
    header: "Date",
    /**
     * Renders the source's date.
     *
     * @param s - the source
     * @returns the date, or empty
     */
    cell: (s) => s.date ?? "",
    className: "n",
  },
  {
    header: "Relevance",
    /**
     * Renders the source's relevance.
     *
     * @param s - the source
     * @returns the relevance, or empty
     */
    cell: (s) => s.relevance ?? "",
    className: "n",
  },
  {
    header: "Capture",
    // Truncated from the left, so the file name stays in view; the full path is the tooltip.
    /**
     * Renders the path of the source's raw capture.
     *
     * @param s - the source
     * @returns the path, or nothing when there's no capture
     */
    cell: (s) =>
      s.capturePath && (
        <span className="capture" title={s.capturePath}>
          <span className="mono" dir="ltr">
            {s.capturePath}
          </span>
        </span>
      ),
    className: "wide source-capture",
  },
];

/** Props for {@link SourcesView}. */
export interface SourcesViewProps {
  /** The current search params. */
  search: SourcesSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: SourcesSearch) => void;
}

/**
 * Every cited source, newest first, filterable by site (`?site=`) and title (`?q=`).
 *
 * @param props - the search params and their setter
 * @returns the sources view
 */
export function SourcesView({ search: { site, q }, onSearch }: SourcesViewProps) {
  const sources = useQuery(sourcesQuery({ site }));
  return (
    <>
      <ViewHeader
        title="Sources"
        lede="Every post this logbook cites. Raw captures are in the research record's evidence folder."
      />
      <QueryResult query={sources} resource="sources">
        {(rows) => (
          <DataTable
            columns={COLUMNS}
            rows={[...rows].sort(newestFirst)}
            rowKey={(s) => s.id}
            filter={{
              value: q ?? "",
              /**
               * Writes the query to `?q=`.
               *
               * @param v - the new query
               * @returns nothing
               */
              onChange: (v) => onSearch({ q: v }),
              /**
               * Builds a source's searchable text.
               *
               * @param s - the source
               * @returns its id, title and English title
               */
              text: (s) => `${s.id} ${s.title ?? ""} ${s.titleEn ?? ""}`,
              placeholder: "Search titles",
            }}
            select={{
              name: "Site",
              label: "All sites",
              options: Object.entries(SITE_LABELS),
              value: site ?? "",
              /**
               * Writes the site to `?site=`, dropping an unknown one.
               *
               * @param v - the selected site, or "" for all
               * @returns nothing
               */
              onChange: (v) => onSearch({ site: optionalKey(v, SITE_LABELS) }),
            }}
            empty={site ? "No sources from this site." : "No sources recorded yet."}
            layout="stack"
          />
        )}
      </QueryResult>
    </>
  );
}
