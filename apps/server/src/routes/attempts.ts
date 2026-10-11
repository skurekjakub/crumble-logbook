import { Hono } from "hono";
import type { AttemptsService } from "../services/attempts";

/**
 * Builds the read-only router for the Guild Conquest macro's attempts: `GET /`, every recorded
 * attempt with its curve, and the macro's pace rule.
 *
 * @param svc - the attempts service the router delegates to
 * @returns a Hono sub-app mountable with `.route()`
 */
export function attemptsRouter(svc: AttemptsService) {
  return new Hono().get("/", (c) => c.json(svc.list()));
}
