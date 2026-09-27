/**
 * Dumps a full JSON snapshot of `config.dbPath` to `config.snapshotPath`, the
 * committed, diffable history of the data. Run via `pnpm db:export`. Prints
 * the row count written for every table.
 */
import { writeFileSync } from "node:fs";
import { dbPath, snapshotPath } from "../config";
import { openDb } from "../db/client";
import { createStore } from "../repos";
import { exportSnapshot } from "../services/export";

const store = createStore(openDb(dbPath));
const snapshot = exportSnapshot(store);
writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 1)}\n`);
for (const [table, rows] of Object.entries(snapshot.tables)) {
  console.log(`${table}: ${rows.length}`);
}
