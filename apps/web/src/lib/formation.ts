/** A formation position: row 1 is the top row, column 1 the back line. */
export interface SlotPosition {
  row: number;
  col: number;
}

/** Columns a formation row always has, as the in-game formation screen shows them. */
export const FORMATION_COLUMNS = 6;

/**
 * Reads a deck cookie's slot, written `row<R>-<C>` (e.g. `row2-6`).
 *
 * @param slot - the slot as stored, or null
 * @returns its row and column, or null for null, other text, or a zero index
 */
export function parseSlot(slot: string | null | undefined): SlotPosition | null {
  const match = /^row(\d+)-(\d+)$/.exec(slot?.trim() ?? "");
  if (!match) return null;
  const row = Number(match[1]);
  const col = Number(match[2]);
  return row > 0 && col > 0 ? { row, col } : null;
}

/** A formation laid out as a grid, and the entries that name no position. */
export interface FormationGrid<T> {
  /** Rows top to bottom, each with its columns back to front; `null` is an empty cell. */
  rows: (T | null)[][];
  /** Entries without a readable slot, or whose cell another entry already took, in input order. */
  unplaced: T[];
}

/**
 * Lays entries out by their slots: as many rows as the lowest slotted row,
 * and {@link FORMATION_COLUMNS} columns or more if a slot lies further out.
 *
 * @param entries - entries in any order
 * @param slotOf - an entry's slot text
 * @returns the grid (no rows when no entry has a slot) and the unplaced entries
 */
export function formationGrid<T>(
  entries: readonly T[],
  slotOf: (entry: T) => string | null | undefined,
): FormationGrid<T> {
  const placed = entries.map((entry) => ({ entry, at: parseSlot(slotOf(entry)) }));
  const slotted = placed.filter((p) => p.at !== null);
  const rowCount = Math.max(0, ...slotted.map((p) => p.at!.row));
  const colCount = Math.max(FORMATION_COLUMNS, ...slotted.map((p) => p.at!.col));
  const rows: (T | null)[][] = Array.from({ length: rowCount }, () =>
    Array.from({ length: colCount }, () => null),
  );
  const unplaced: T[] = [];
  for (const { entry, at } of placed) {
    const row = at ? rows[at.row - 1]! : undefined;
    if (row && row[at!.col - 1] === null) row[at!.col - 1] = entry;
    else unplaced.push(entry);
  }
  return { rows, unplaced };
}
