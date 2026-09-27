/**
 * Serves the data API: opens (and migrates) `config.dbPath`, builds the app
 * over it and listens on `config.port`, logging the URL once listening. Run
 * via `pnpm dev:server` (watch mode) or `pnpm --filter @crumble/server
 * start`. Exits with the underlying error if the database can't be opened
 * or the port is taken.
 */
import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { dbPath, port } from "./config";
import { openDb } from "./db/client";
import { createStore } from "./repos";
import { createServices } from "./services";

const app = createApp(createServices(createStore(openDb(dbPath))));

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`crumble-logbook API on http://localhost:${info.port}/api (db: ${dbPath})`);
});
