import {
  gearRecInput,
  gearRecPatch,
  mechanicInput,
  mechanicPatch,
  recommendationInput,
  recommendationPatch,
  rngFactorInput,
  rngFactorPatch,
  takeawayInput,
  takeawayPatch,
  timelineEventInput,
  timelineEventPatch,
} from "@crumble/schema";
import { Hono } from "hono";
import { ConflictError, NotFoundError, UnknownRefsError } from "./errors";
import { contentRouter } from "./routes/content";
import { decksRouter } from "./routes/decks";
import { exportRouter } from "./routes/export";
import { glossaryRouter } from "./routes/glossary";
import { rankingsRouter } from "./routes/rankings";
import { recordsRouter } from "./routes/records";
import { runeBuildsRouter } from "./routes/rune-builds";
import { scoresRouter } from "./routes/scores";
import { sourcesRouter } from "./routes/sources";
import type { Services } from "./services";

/**
 * Builds the server's Hono app: the cited-content and score routes under
 * `/api`, and a shared error mapping.
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
    .route(
      "/mechanics",
      contentRouter(services.mechanics, { input: mechanicInput, patch: mechanicPatch }),
    )
    .route(
      "/rng-factors",
      contentRouter(services.rngFactors, { input: rngFactorInput, patch: rngFactorPatch }),
    )
    .route(
      "/timeline",
      contentRouter(services.timeline, { input: timelineEventInput, patch: timelineEventPatch }),
    )
    .route(
      "/takeaways",
      contentRouter(services.takeaways, { input: takeawayInput, patch: takeawayPatch }),
    )
    .route(
      "/gear-recs",
      contentRouter(services.gearRecs, { input: gearRecInput, patch: gearRecPatch }),
    )
    .route(
      "/recommendations",
      contentRouter(services.recommendations, {
        input: recommendationInput,
        patch: recommendationPatch,
      }),
    )
    .route("/scores", scoresRouter(services.scores))
    .route("/decks", decksRouter(services.decks))
    .route("/rune-builds", runeBuildsRouter(services.runeBuilds))
    .route("/sources", sourcesRouter(services.sources))
    .route("/glossary", glossaryRouter(services.glossary))
    .route("/rankings", rankingsRouter(services.rankings))
    .route("/records", recordsRouter(services.records))
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
