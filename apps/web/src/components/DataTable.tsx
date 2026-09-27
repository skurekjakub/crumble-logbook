import type { Key, ReactNode } from "react";

/** One column of a {@link DataTable}. */
export interface Column<T> {
  /** Header cell content. */
  header: ReactNode;
  /** Renders the row's cell. */
  cell: (row: T) => ReactNode;
  /** Class for the column's `<td>`s; `"n"` sets mono, tabular, no-wrap numbers. */
  className?: string;
}

/** A text filter whose value the caller owns (e.g. bound to a typed search param). */
export interface TableFilter<T> {
  /** The current query; rows whose text contains it (case-insensitive, trimmed) are kept. */
  value: string;
  /** Called with the new query on every edit. The table keeps no filter state of its own. */
  onChange: (value: string) => void;
  /** The row's searchable text. */
  text: (row: T) => string;
  /** Placeholder and accessible name of the search box; defaults to "Filter". */
  placeholder?: string;
}

/** A select filter whose value the caller owns. */
export interface TableSelect<T> {
  /** Accessible name, and the label of the "all" option (value ""). */
  label: string;
  /** `[value, label]` pairs. */
  options: ReadonlyArray<readonly [value: string, label: string]>;
  /** The selected value; "" means all. */
  value: string;
  /** Called with the new value on change. */
  onChange: (value: string) => void;
  /**
   * Keeps a row for a non-empty value. Omit it when the caller already
   * filters `rows` by this value (e.g. server-side via a query param).
   */
  test?: (row: T, value: string) => boolean;
}

/** Props for {@link DataTable}. */
export interface DataTableProps<T> {
  columns: ReadonlyArray<Column<T>>;
  rows: readonly T[];
  /** A stable React key per row. */
  rowKey: (row: T, index: number) => Key;
  /** Shows a search box above the table and filters rows by it. */
  filter?: TableFilter<T>;
  /** Shows a select next to the search box. */
  select?: TableSelect<T>;
  /** Message when `rows` is empty; defaults to "Nothing to show." */
  empty?: ReactNode;
}

/**
 * Keeps the rows whose text contains the query, case-insensitively.
 *
 * @param rows - the rows to filter
 * @param query - the query; surrounding whitespace is ignored, and an empty
 *   query keeps every row
 * @param text - a row's searchable text
 * @returns the kept rows, in input order
 */
export function filterRows<T>(rows: readonly T[], query: string, text: (row: T) => string): T[] {
  const q = query.trim().toLowerCase();
  return q ? rows.filter((r) => text(r).toLowerCase().includes(q)) : [...rows];
}

/**
 * A table with optional controlled text and select filters. With no rows it
 * shows `empty`; when the filters exclude every row it says "Nothing matches."
 */
export function DataTable<T>({ columns, rows, rowKey, filter, select, empty }: DataTableProps<T>) {
  let kept = filter ? filterRows(rows, filter.value, filter.text) : [...rows];
  if (select?.test && select.value) {
    const { test, value } = select;
    kept = kept.filter((r) => test(r, value));
  }
  const message = rows.length === 0 ? (empty ?? "Nothing to show.") : "Nothing matches.";
  const placeholder = filter?.placeholder ?? "Filter";

  return (
    <>
      {(filter || select) && (
        <div className="tools">
          {filter && (
            <input
              type="search"
              placeholder={placeholder}
              aria-label={placeholder}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
            />
          )}
          {select && (
            <select
              aria-label={select.label}
              value={select.value}
              onChange={(e) => select.onChange(e.target.value)}
            >
              <option value="">{select.label}</option>
              {select.options.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kept.length ? (
              kept.map((row, i) => (
                <tr key={rowKey(row, i)}>
                  {columns.map((c, j) => (
                    <td key={j} className={c.className}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="muted">
                  {message}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
