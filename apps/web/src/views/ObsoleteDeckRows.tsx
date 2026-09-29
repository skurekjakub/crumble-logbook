import type { Key } from "react";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { ObsoleteNotice } from "../components/ObsoleteNotice";
import type { SourceIndex } from "../lib/sources";

/** An obsolete deck as its group reads it. */
export interface RetiredDeck {
  id: string;
  nameEn: string;
  obsoleteSince?: string | null;
  obsoleteReason?: string | null;
  obsoleteSources?: readonly string[];
}

/** Props for {@link ObsoleteDeckRows}. */
export interface ObsoleteDeckRowsProps<T> {
  /** Each obsolete deck's rows, the most recently obsoleted deck first (see `groupByObsoleteDeck`). */
  groups: ReadonlyArray<{ deck: RetiredDeck; rows: readonly T[] }>;
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
}

/**
 * The results of each obsolete deck, set apart from a page's ranking: the
 * deck's name, its obsolete notice, and its rows in the page's table layout.
 *
 * @param props - the groups, the table's columns and row key, and the source index
 * @returns one labelled section per deck
 */
export function ObsoleteDeckRows<T>({
  groups,
  columns,
  rowKey,
  sources,
}: ObsoleteDeckRowsProps<T>) {
  return (
    <>
      {groups.map(({ deck, rows }) => (
        <section key={deck.id} aria-label={`${deck.nameEn}, obsolete`}>
          <h4>{deck.nameEn}</h4>
          <ObsoleteNotice
            since={deck.obsoleteSince ?? ""}
            reason={deck.obsoleteReason ?? null}
            sources={deck.obsoleteSources ?? []}
            sourceIndex={sources}
          />
          <DataTable columns={columns} rows={rows} rowKey={rowKey} layout="stack" />
        </section>
      ))}
    </>
  );
}
