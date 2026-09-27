import { Hono } from "hono";
import { ConflictError, NotFoundError, UnknownRefsError } from "./errors";
import { REGISTRY as R } from "./registry";
import { crudRouter } from "./routes/content";
import { exportRouter } from "./routes/export";
import { glossaryRouter } from "./routes/glossary";
import { rankingsRouter } from "./routes/rankings";
import { recordsRouter } from "./routes/records";
import { sourcesRouter } from "./routes/sources";
import type { Services } from "./services";
import { contentEndpoints as endpoints } from "./services/content";

/**
 * Builds the server's Hono app: every registered type's routes under
 * `/api` at its registry path, the export, and a shared error mapping.
 *
 * The `.route()` calls stay spelled out, one per type, so `AppType` keeps
 * each route's request and response types; `test/registry.test.ts` checks
 * that every registered path is mounted.
 *
 * `NotFoundError` maps to 404, `UnknownRefsError` to 422, `ConflictError` to
 * 409; anything else is logged with `console.error` and maps to 500.
 *
 * @param services - the service set every route delegates to
 * @returns the assembled Hono app
 */
export function createApp(services: Services) {
  return new Hono()
    .basePath("/api")
    .route(R.mechanics.path, crudRouter(endpoints(services.mechanics), R.mechanics))
    .route(R.rngFactors.path, crudRouter(endpoints(services.rngFactors), R.rngFactors))
    .route(R.timeline.path, crudRouter(endpoints(services.timeline), R.timeline))
    .route(R.takeaways.path, crudRouter(endpoints(services.takeaways), R.takeaways))
    .route(R.gearRecs.path, crudRouter(endpoints(services.gearRecs), R.gearRecs))
    .route(
      R.recommendations.path,
      crudRouter(endpoints(services.recommendations), R.recommendations),
    )
    .route(R.scores.path, crudRouter(endpoints(services.scores), R.scores))
    .route(R.fightEvents.path, crudRouter(endpoints(services.fightEvents), R.fightEvents))
    .route(R.buffValues.path, crudRouter(endpoints(services.buffValues), R.buffValues))
    .route(R.counters.path, crudRouter(endpoints(services.counters), R.counters))
    .route(R.usageStats.path, crudRouter(endpoints(services.usageStats), R.usageStats))
    .route(R.decks.path, crudRouter(services.decks, R.decks))
    .route(R.runeBuilds.path, crudRouter(services.runeBuilds, R.runeBuilds))
    .route(R.sources.path, sourcesRouter(services.sources))
    .route(R.glossary.path, glossaryRouter(services.glossary))
    .route(R.rankings.path, rankingsRouter(services.rankings))
    .route(R.researchRecords.path, recordsRouter(services.records))
    .route("/export", exportRouter(services.export))
    .onError((err, c) => {
      if (err instanceof NotFoundError) {
        return c.json({ error: "not_found" as const, message: err.message }, 404);
      }
      if (err instanceof UnknownRefsError) {
        return c.json({ error: "unknown_refs" as const, kind: err.kind, ids: err.ids }, 422);
      }
      if (err instanceof ConflictError) {
        return c.json({ error: "conflict" as const, message: err.message }, 409);
      }
      console.error(err);
      return c.json({ error: "internal" as const }, 500);
    });
}

/** The full type of the app built by {@link createApp}, for the `hc` typed client. */
export type AppType = ReturnType<typeof createApp>;
