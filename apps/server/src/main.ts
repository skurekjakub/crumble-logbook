/**
 * Serves the data API: opens (and migrates) `config.dbPath`, builds the app
 * over it and listens on `config.port`, logging the URL once listening. When
 * the database file doesn't exist yet, it is created and seeded from
 * `config.snapshotPath` first. Run via `pnpm dev` (with the web app),
 * `pnpm dev:server` (watch mode) or `pnpm --filter @crumble/server start`.
 * Exits with the underlying error if the database can't be opened, the
 * snapshot can't be restored, or the port is taken.
 */
import { existsSync, readFileSync } from "node:fs";
import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { dbPath, port, snapshotPath } from "./config";
import { openDb } from "./db/client";
import { createStore } from "./repos";
import { createServices } from "./services";
import type { Snapshot } from "./services/export";
import { restoreSnapshot } from "./services/export";

const seed = !existsSync(dbPath);
const store = createStore(openDb(dbPath));
if (seed) {
  restoreSnapshot(store, JSON.parse(readFileSync(snapshotPath, "utf-8")) as Snapshot);
  console.log(`seeded ${dbPath} from ${snapshotPath}`);
}
const app = createApp(createServices(store));

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`crumble-logbook API on http://localhost:${info.port}/api (db: ${dbPath})`);
});
