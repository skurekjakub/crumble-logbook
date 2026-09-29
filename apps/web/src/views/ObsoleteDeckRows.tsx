import type { Key } from "react";
import type { ModeSection } from "../app/modes";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { ObsoleteNotice } from "../components/ObsoleteNotice";
import type { LifecycleDeck } from "../lib/obsolete";
import type { SourceIndex } from "../lib/sources";
import { DeckLink } from "./DeckLink";

/** Props for {@link ObsoleteDeckRows}. */
export interface ObsoleteDeckRowsProps<T> {
  /** Each obsolete deck's rows, the most recently obsoleted deck first (see `groupByObsoleteDeck`). */
  groups: ReadonlyArray<{ deck: LifecycleDeck; rows: readonly T[] }>;
  /** The columns of the page's ranked table. */
  columns: Column<T>[];
  /**
   * Keys a row.
   *
   * @param row - the row
   * @param index - its position in its group
   * @returns its React key
   */
  rowKey: (row: T, index: number) => Key;
  /** Id → URL/title for the source chips. */
  sources: SourceIndex;
  /** The mode whose decks page holds the successor's card. */
  mode: Pick<ModeSection, "id" | "tabs">;
  /**
   * Finds a deck of the mode, to name an obsolete deck's successor.
   *
   * @param id - the deck's id
   * @returns the deck, or `undefined` when it isn't listed
   */
  deck: (id: string) => LifecycleDeck | undefined;
}

/**
 * The results of each obsolete deck, set apart from a page's ranking: the
 * deck's name, its obsolete notice with a link to the deck that superseded
 * it, and its rows in the page's table layout.
 *
 * @param props - the groups, the table's columns and row key, the source index, the mode and a deck lookup
 * @returns one labelled section per deck
 */
export function ObsoleteDeckRows<T>({
  groups,
  columns,
  rowKey,
  sources,
  mode,
  deck: find,
}: ObsoleteDeckRowsProps<T>) {
  return (
    <>
      {groups.map(({ deck, rows }) => (
        <section key={deck.id} aria-label={`${deck.nameEn ?? deck.id}, obsolete`}>
          <h4>{deck.nameEn ?? deck.id}</h4>
          <ObsoleteNotice
            since={deck.obsoleteSince ?? ""}
            reason={deck.obsoleteReason ?? null}
            sources={deck.obsoleteSources ?? []}
            sourceIndex={sources}
            superseded={
              deck.supersededBy ? (
                <DeckLink mode={mode} id={deck.supersededBy} deck={find(deck.supersededBy)} />
              ) : null
            }
          />
          <DataTable columns={columns} rows={rows} rowKey={rowKey} layout="stack" />
        </section>
      ))}
    </>
  );
}
