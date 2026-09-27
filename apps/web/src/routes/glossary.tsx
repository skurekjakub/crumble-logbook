import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { GlossaryKindFilter } from "../api/queries";
import { glossaryQuery } from "../api/queries";
import type { GlossaryEntry } from "../api/types";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { QueryResult } from "../components/QueryResult";
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
interface GlossarySearch {
  kind?: GlossaryKindFilter;
  q?: string;
}

export const Route = createFileRoute("/glossary")({
  validateSearch: (search: Record<string, unknown>): GlossarySearch => ({
    kind: optionalKey(search.kind, KIND_LABELS),
    q: optionalText(search.q),
  }),
  component: GlossaryView,
});

const COLUMNS: Column<GlossaryEntry>[] = [
  { header: "Korean", cell: (g) => g.kr },
  { header: "Shorthand", cell: (g) => g.shorthand.join(", ") },
  {
    header: "English",
    cell: (g) => g.en ?? <span className="muted">{g.kr}</span>,
  },
  { header: "Kind", cell: (g) => KIND_LABELS[g.kind], className: "n" },
];

/** Korean names and forum shorthand mapped to English, filterable by kind (`?kind=`) and name (`?q=`). */
function GlossaryView() {
  const { kind, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const glossary = useQuery(glossaryQuery(kind));
  const setSearch = (patch: GlossarySearch) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <>
      <div>
        <h2>Glossary</h2>
        <p className="lede">Korean names and forum shorthand mapped to the English client.</p>
      </div>
      <QueryResult query={glossary} resource="glossary">
        {(rows) => (
          <DataTable
            columns={COLUMNS}
            rows={rows}
            rowKey={(g) => g.kr}
            filter={{
              value: q ?? "",
              onChange: (v) => setSearch({ q: v || undefined }),
              text: (g) => [g.kr, ...g.shorthand, g.en ?? ""].join(" "),
              placeholder: "Search Korean or English",
            }}
            select={{
              label: "All kinds",
              options: Object.entries(KIND_LABELS),
              value: kind ?? "",
              onChange: (v) => setSearch({ kind: optionalKey(v, KIND_LABELS) }),
            }}
            empty={kind ? "No glossary entries of this kind." : "No glossary entries yet."}
          />
        )}
      </QueryResult>
    </>
  );
}
