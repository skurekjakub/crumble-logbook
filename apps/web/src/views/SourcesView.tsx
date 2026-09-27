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
 * @param search - the router's decoded query values
 * @returns the site and title search, each dropped when unusable
 */
export function validateSourcesSearch(search: Record<string, unknown>): SourcesSearch {
  return { site: optionalKey(search.site, SITE_LABELS), q: optionalText(search.q) };
}

/** Orders sources newest first, undated last, then by id. */
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
    cell: (s) => (
      <a href={s.url} target="_blank" rel="noopener">
        {sourceLabel(s.id)}
      </a>
    ),
    className: "n",
  },
  {
    header: "Title",
    cell: (s) => (
      <>
        {s.title ?? ""}
        {s.titleEn && <div className="muted">{s.titleEn}</div>}
      </>
    ),
  },
  { header: "Date", cell: (s) => s.date ?? "", className: "n" },
  { header: "Relevance", cell: (s) => s.relevance ?? "", className: "n" },
  {
    header: "Capture",
    cell: (s) => s.capturePath && <span className="mono">{s.capturePath}</span>,
  },
];

/** Props for {@link SourcesView}. */
export interface SourcesViewProps {
  /** The current search params. */
  search: SourcesSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: SourcesSearch) => void;
}

/** Every cited source, newest first, filterable by site (`?site=`) and title (`?q=`). */
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
              onChange: (v) => onSearch({ q: v }),
              text: (s) => `${s.id} ${s.title ?? ""} ${s.titleEn ?? ""}`,
              placeholder: "Search titles",
            }}
            select={{
              name: "Site",
              label: "All sites",
              options: Object.entries(SITE_LABELS),
              value: site ?? "",
              onChange: (v) => onSearch({ site: optionalKey(v, SITE_LABELS) }),
            }}
            empty={site ? "No sources from this site." : "No sources recorded yet."}
          />
        )}
      </QueryResult>
    </>
  );
}
