/**
 * The data API as a Vercel function: an in-memory database seeded from the
 * committed snapshot, which the bundle carries, served read-only. Each
 * instance seeds its own copy on cold start, so a write could never
 * persist; `POST`, `PATCH` and `DELETE` answer 405 instead. Bundled by
 * `cli/build-vercel.ts`, which also places the migrations the bundle
 * reads next to it.
 */
import { getRequestListener } from "@hono/node-server";
import snapshot from "../../../data/snapshot.json" with { type: "json" };
import { createApp } from "./app";
import { openDb } from "./db/client";
import { createStore } from "./repos";
import { createServices } from "./services";
import type { Snapshot } from "./services/export";
import { restoreSnapshot } from "./services/export";

const store = createStore(openDb(":memory:"));
restoreSnapshot(store, snapshot as unknown as Snapshot);
const app = createApp(createServices(store));

/**
 * Answers a request with the app, or 405 for anything but a read.
 *
 * @param request - the incoming request
 * @returns the app's response, or 405 with an `Allow` header
 */
function readOnly(request: Request): Response | Promise<Response> {
  if (request.method === "GET" || request.method === "HEAD") return app.fetch(request);
  return Response.json(
    { error: "this deployment is read-only" },
    { status: 405, headers: { Allow: "GET, HEAD" } },
  );
}

export default getRequestListener(readOnly);
