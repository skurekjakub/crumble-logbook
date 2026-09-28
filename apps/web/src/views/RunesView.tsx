import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { decksQuery, runeBuildsQuery } from "../api/queries";
import type { RuneBuild } from "../api/types";
import type { ModeSection } from "../app/modes";
import type { TableFilter, TableSelect } from "../components/DataTable";
import { applyFilters, TableTools } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { ErrorBox } from "../components/ErrorBox";
import { QueryResult } from "../components/QueryResult";
import { RuneCard } from "../components/RuneBuilds";
import { optionalText } from "../lib/search";
import { ModeViewHeader } from "./ModeViewHeader";

/** The runes view's search params: a deck slug and a text query, both optional. */
export interface RunesSearch {
  deck?: string;
  q?: string;
}

/**
 * Reads the runes view's search params.
 *
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
 * The rune builds as one card per cookie: the reason leads, then the rune
 * lines, any disputed view, the decks it applies to and its sources. The
 * deck select and the text filter live in the URL as `?deck=` and `?q=`.
 * A failed deck list is reported; the cards then name decks by id.
 *
 * @param props - the mode, the search params and their setter
 * @returns the runes view
 */
export function RunesView({ mode, search, onSearch }: RunesViewProps) {
  const { deck = "", q = "" } = search;
  const sources = useSourceIndex();
  const runes = useQuery(runeBuildsQuery(mode.scope));
  const decks = useQuery({
    ...decksQuery(mode.scope),
    select: (list) => new Map(list.map((d) => [d.id, d.nameEn])),
  });
  /**
   * Names a deck in English.
   *
   * @param id - the deck's id
   * @returns its English name, or the id when unknown
   */
  const deckName = (id: string) => decks.data?.get(id) ?? id;

  return (
    <>
      <ModeViewHeader mode={mode} view="runes" fallbackTitle="Runes" />
      {decks.isError ? <ErrorBox resource="decks" error={decks.error} /> : null}
      <QueryResult query={runes} resource="rune builds">
        {(rows) => {
          const filter: TableFilter<RuneBuild> = {
            value: q,
            onChange: (v) => onSearch({ q: v }),
            text: (r) => `${JSON.stringify(r)} ${r.en ?? ""}`,
            placeholder: "Filter by cookie or stat (e.g. 시커, haste)",
          };
          const select: TableSelect<RuneBuild> = {
            name: "Deck",
            label: "All decks",
            options: [...new Set(rows.flatMap((r) => r.decks))].map(
              (id) => [id, deckName(id)] as const,
            ),
            value: deck,
            onChange: (v) => onSearch({ deck: v }),
            test: (r, v) => r.decks.includes(v),
          };
          const kept = applyFilters(rows, filter, select);
          return (
            <>
              <TableTools filter={filter} select={select} />
              {kept.length ? (
                <div className="grid g2">
                  {kept.map((b) => (
                    <RuneCard
                      key={b.id}
                      build={b}
                      sources={sources}
                      headingLevel={3}
                      deckName={deckName}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState>
                  {rows.length ? "Nothing matches." : "No rune builds recorded yet."}
                </EmptyState>
              )}
            </>
          );
        }}
      </QueryResult>
    </>
  );
}
