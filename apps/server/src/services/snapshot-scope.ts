import type { TableKey } from "../registry";
import { TABLE_KEYS, recordColumnOf } from "../registry";
import type { Snapshot } from "./export";

/** A research record whose owned rows differ between two snapshots. */
export interface RecordChange {
  /** The record's slug. */
  record: string;
  /** The tables its rows differ in, in registry order. */
  tables: TableKey[];
}

/**
 * Collects the rows each record owns in `snapshot`, per table, each as
 * JSON without an integer `id`: import order assigns those, so a record
 * that gains or loses a row renumbers every later record's rows.
 *
 * @param snapshot - the snapshot
 * @returns record slug → table → the owned rows' JSON, sorted
 */
function ownedContent(snapshot: Snapshot): Map<string, Map<TableKey, string[]>> {
  const result = new Map<string, Map<TableKey, string[]>>();
  const tables = snapshot.tables as Partial<Record<TableKey, Array<Record<string, unknown>>>>;
  for (const key of TABLE_KEYS) {
    const owner = recordColumnOf(key);
    if (owner === undefined) continue;
    for (const row of tables[key] ?? []) {
      const record = row[owner];
      if (typeof record !== "string") continue;
      const { id, ...rest } = row;
      const content = JSON.stringify(typeof id === "number" ? rest : row);
      const byTable = result.get(record) ?? new Map<TableKey, string[]>();
      byTable.set(key, [...(byTable.get(key) ?? []), content]);
      result.set(record, byTable);
    }
  }
  for (const byTable of result.values()) for (const rows of byTable.values()) rows.sort();
  return result;
}

/**
 * Lists the research records whose owned rows differ between two
 * snapshots, compared by content, integer ids aside.
 *
 * @param before - the earlier snapshot
 * @param after - the later snapshot
 * @returns each record whose rows differ, sorted by slug, with the tables they differ in
 */
export function changedRecords(before: Snapshot, after: Snapshot): RecordChange[] {
  const was = ownedContent(before);
  const is = ownedContent(after);
  const records = [...new Set([...was.keys(), ...is.keys()])].sort();
  return records.flatMap((record) => {
    const tables = TABLE_KEYS.filter(
      (key) =>
        JSON.stringify(was.get(record)?.get(key) ?? []) !==
        JSON.stringify(is.get(record)?.get(key) ?? []),
    );
    return tables.length > 0 ? [{ record, tables }] : [];
  });
}
