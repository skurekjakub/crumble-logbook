import { RANKING_BOARD } from "@crumble/schema";
import { Hono } from "hono";
import { z } from "zod";
import type { RankingsService } from "../services/rankings";
import { validate } from "./validate";

/** Query params accepted by `GET /`: an optional season and/or board to filter by. */
const listQuery = z.object({
  season: z.coerce.number().int().optional(),
  board: z.enum(RANKING_BOARD).optional(),
});

/**
 * Builds the read-only router for `rankings`: `GET /` (optionally filtered
 * by `?season` and `?board`, rows in rank order) and `GET /seasons` (each
 * board+season's latest capture).
 *
 * @param svc - the rankings service the router delegates to
 * @returns a Hono sub-app mountable with `.route()`
 */
export function rankingsRouter(svc: RankingsService) {
  return new Hono()
    .get("/", validate("query", listQuery), (c) => {
      const { season, board } = c.req.valid("query");
      return c.json(svc.list({ season, board }));
    })
    .get("/seasons", (c) => c.json(svc.seasons()));
}
