import { useQuery } from "@tanstack/react-query";
import type { GlossaryKindFilter } from "../api/queries";
import { glossaryQuery } from "../api/queries";
import type { GlossaryEntry } from "../api/types";
import type { Column } from "../components/DataTable";
import { Clamp } from "../components/Clamp";
import { CookieName } from "../components/CookieName";
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

/**
 * An entry's name: a cookie or pet with its portrait and short English name
 * over the Korean (the full English in the tooltip); any other term in
 * English, cut to a line, over the Korean; the Korean alone when it has no
 * English.
 *
 * @param props - the entry
 * @returns the name
 */
function EntryName({ entry }: { entry: GlossaryEntry }) {
  if (entry.kind === "cookie" || entry.kind === "pet") {
    return <CookieName kr={entry.kr} en={entry.en} />;
  }
  return (
    <span className="name-stack term">
      <span className="en">
        {entry.en ? (
          <Clamp lines={1} perLine={50}>
            {entry.en}
          </Clamp>
        ) : (
          entry.kr
        )}
      </span>
      {entry.en ? <span className="kr">{entry.kr}</span> : null}
    </span>
  );
}

const COLUMNS: Column<GlossaryEntry>[] = [
  {
    header: "Name",
    cell: (g) => <EntryName entry={g} />,
    className: "wide gloss-name",
  },
  {
    header: "Shorthand",
    cell: (g) =>
      g.shorthand.length ? (
        <span className="chips">
          {g.shorthand.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </span>
      ) : null,
    className: "gloss-short",
  },
  {
    header: "Kind",
    cell: (g) => <span className={`kind k-${g.kind}`}>{KIND_LABELS[g.kind]}</span>,
    className: "gloss-kind",
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
        lede={[
          "Korean names and forum shorthand, mapped to the English client.",
          "Search any of them: Korean, shorthand or English.",
        ]}
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
            layout="stack"
          />
        )}
      </QueryResult>
    </>
  );
}
