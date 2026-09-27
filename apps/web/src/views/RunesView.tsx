import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { decksQuery, runeBuildsQuery } from "../api/queries";
import type { ModeSection } from "../app/modes";
import { DataTable } from "../components/DataTable";
import { QueryResult } from "../components/QueryResult";
import { runeBuildColumns } from "../components/RuneBuilds";
import { ViewHeader } from "../components/ViewHeader";
import { optionalText } from "../lib/search";

/** The runes view's search params: a deck slug and a text query, both optional. */
export interface RunesSearch {
  deck?: string;
  q?: string;
}

/**
 * Reads the runes view's search params.
 * @param search - the router's decoded query values
 * @returns the deck and text query, each dropped when unusable
 */
export function validateRunesSearch(search: Record<string, unknown>): RunesSearch {
  return { deck: optionalText(search.deck), q: optionalText(search.q) };
}

/** Props for {@link RunesView}. */
export interface RunesViewProps {
  /** The mode whose rune builds, decks and copy the view shows. */
  mode: ModeSection;
  /** The current search params. */
  search: RunesSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: RunesSearch) => void;
}

/**
 * The rune-builds table: per cookie its rune lines, the reason (with any
 * disputed view beneath it), the decks it applies to and its sources. The
 * deck select and the text filter live in the URL as `?deck=` and `?q=`.
 */
export function RunesView({ mode, search, onSearch }: RunesViewProps) {
  const { deck = "", q = "" } = search;
  const sources = useSourceIndex();
  const runes = useQuery(runeBuildsQuery(mode.scope));
  const deckNames = useQuery({
    ...decksQuery(mode.scope),
    select: (decks) => new Map(decks.map((d) => [d.id, d.nameEn])),
  }).data;
  const deckName = (id: string) => deckNames?.get(id) ?? id;

  return (
    <>
      <ViewHeader title={mode.copy.runes?.title ?? "Runes"} lede={mode.copy.runes?.lede} />
      <QueryResult query={runes} resource="rune builds">
        {(rows) => (
          <DataTable
            columns={runeBuildColumns({ whyHeader: "Target / why", deckName, sources })}
            rows={rows}
            rowKey={(r) => r.id}
            empty="No rune builds recorded yet."
            filter={{
              value: q,
              onChange: (v) => onSearch({ q: v }),
              text: (r) => `${JSON.stringify(r)} ${r.en ?? ""}`,
              placeholder: "Filter by cookie or stat (e.g. 시커, haste)",
            }}
            select={{
              label: "All decks",
              options: [...new Set(rows.flatMap((r) => r.decks))].map(
                (id) => [id, deckName(id)] as const,
              ),
              value: deck,
              onChange: (v) => onSearch({ deck: v }),
              test: (r, v) => r.decks.includes(v),
            }}
          />
        )}
      </QueryResult>
    </>
  );
}
