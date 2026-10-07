/**
 * Loads the reader's account audits from `account/` (or `CRUMBLE_ACCOUNT`)
 * into `config.dbPath`. Run via `pnpm import:account [<id> ...] [--all]
 * [--replace]`: with no id it loads the latest snapshot
 * (`snapshots/<date>.json`) and the latest roadmap (`roadmap-<date>.json`)
 * by id; with ids, those files; with `--all`, every one. A snapshot or
 * roadmap already loaded is refused unless `--replace`. Prints what it
 * loaded, the rows per table and any warnings; exits 1 with the
 * `ImportError` message (file and reason) on a failed import, writing nothing.
 */
import { accountDir, dbPath } from "../config";
import { openDb } from "../db/client";
import { ImportError } from "../errors";
import { importAccount } from "../importers/account";
import { createStore } from "../repos";

const args = process.argv.slice(2);
const ids = args.filter((arg) => !arg.startsWith("--"));

try {
  const store = createStore(openDb(dbPath));
  const result = importAccount(store, accountDir, {
    all: args.includes("--all"),
    replace: args.includes("--replace"),
    ids,
  });
  console.log(`imported ${accountDir} into ${dbPath}`);
  console.log(`snapshots: ${result.snapshots.join(", ") || "(none)"}`);
  console.log(`roadmaps: ${result.roadmaps.join(", ") || "(none)"}`);
  for (const [table, count] of Object.entries(result.counts)) console.log(`${table}: ${count}`);
  for (const warning of result.warnings) console.warn(`warning: ${warning}`);
} catch (err) {
  if (err instanceof ImportError) console.error(err.message);
  else console.error(`import failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
