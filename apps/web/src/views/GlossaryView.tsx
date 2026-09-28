import { useQuery } from "@tanstack/react-query";
import type { GlossaryKindFilter } from "../api/queries";
import { glossaryQuery } from "../api/queries";
import type { GlossaryEntry } from "../api/types";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { QueryResult } from "../components/QueryResult";
import { ViewHeader } from "../components/ViewHeader";
import { optionalKey, optionalText } from "../lib/search";

/** Display label per kind; the keys are every kind `?kind=` accepts. */
const KIND_LABELS: Record<GlossaryKindFilter, string> = {
  cookie: "cookie",
  pet: "pet",
  stat: "stat",
  gear_slot: "gear slot",
  term: "term",
};

/** The glossary's search params: a kind to narrow to and a name search. */
export interface GlossarySearch {
  kind?: GlossaryKindFilter;
  q?: string;
}

/**
 * Reads the glossary's search params.
 *
 * @param search - the router's decoded query values
 * @returns the kind and name search, each dropped when unusable
 */
export function validateGlossarySearch(search: Record<string, unknown>): GlossarySearch {
  return { kind: optionalKey(search.kind, KIND_LABELS), q: optionalText(search.q) };
}

const COLUMNS: Column<GlossaryEntry>[] = [
  {
    header: "Korean",
    cell: (g) => g.kr,
  },
  {
    header: "Shorthand",
    cell: (g) => g.shorthand.join(", "),
  },
  {
    header: "English",
    cell: (g) => g.en ?? <span className="muted">{g.kr}</span>,
  },
  {
    header: "Kind",
    cell: (g) => KIND_LABELS[g.kind],
    className: "n",
  },
];

/** Props for {@link GlossaryView}. */
export interface GlossaryViewProps {
  /** The current search params. */
  search: GlossarySearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: GlossarySearch) => void;
}

/**
 * Korean names and forum shorthand mapped to English, filterable by kind (`?kind=`) and name (`?q=`).
 *
 * @param props - the search params and their setter
 * @returns the glossary view
 */
export function GlossaryView({ search: { kind, q }, onSearch }: GlossaryViewProps) {
  const glossary = useQuery(glossaryQuery(kind));
  return (
    <>
      <ViewHeader
        title="Glossary"
        lede="Korean names and forum shorthand mapped to the English client."
      />
      <QueryResult query={glossary} resource="glossary">
        {(rows) => (
          <DataTable
            columns={COLUMNS}
            rows={rows}
            rowKey={(g) => g.kr}
            filter={{
              value: q ?? "",
              onChange: (v) => onSearch({ q: v }),
              text: (g) => [g.kr, ...g.shorthand, g.en ?? ""].join(" "),
              placeholder: "Search Korean or English",
            }}
            select={{
              name: "Kind",
              label: "All kinds",
              options: Object.entries(KIND_LABELS),
              value: kind ?? "",
              onChange: (v) => onSearch({ kind: optionalKey(v, KIND_LABELS) }),
            }}
            empty={kind ? "No glossary entries of this kind." : "No glossary entries yet."}
          />
        )}
      </QueryResult>
    </>
  );
}
