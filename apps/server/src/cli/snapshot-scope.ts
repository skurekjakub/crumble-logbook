/**
 * Reports which research records' rows a change to `data/snapshot.json`
 * touches, by content, against the snapshot at a git revision. Run via
 * `pnpm db:scope <rev> [<record slug> ...]`: prints each changed record
 * with its tables, and exits 1 when a record not named among the slugs
 * changed, 2 on a usage error.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { repoRoot, snapshotPath } from "../config";
import type { Snapshot } from "../services/export";
import { changedRecords } from "../services/snapshot-scope";

const [rev, ...named] = process.argv.slice(2);
if (rev === undefined) {
  console.error("usage: pnpm db:scope <rev> [<record slug> ...]");
  process.exit(2);
}
const before = JSON.parse(
  execFileSync("git", ["show", `${rev}:data/snapshot.json`], {
    cwd: repoRoot,
    encoding: "utf-8",
    maxBuffer: 1 << 30,
  }),
) as Snapshot;
const after = JSON.parse(readFileSync(snapshotPath, "utf-8")) as Snapshot;
const changes = changedRecords(before, after);
for (const { record, tables } of changes) console.log(`${record}: ${tables.join(", ")}`);
const unexpected = changes.filter((change) => !named.includes(change.record));
if (unexpected.length > 0) {
  console.error(
    `rows changed for records not named: ${unexpected.map((c) => c.record).join(", ")}`,
  );
  process.exit(1);
}
