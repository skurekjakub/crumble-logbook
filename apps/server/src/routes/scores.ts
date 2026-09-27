import { deckSlug, scoreInput, scorePatch } from "@crumble/schema";
import { Hono } from "hono";
import { z } from "zod";
import type { ScoreService } from "../services/scores";
import { idParam, validate } from "./validate";

/** Query params accepted by `GET /`: an optional deck slug to filter by. */
const listQuery = z.object({ deck: deckSlug.optional() });

/**
 * Builds the CRUD router for `scores`: the same verbs as the generic
 * content router, plus a `deck` filter on `GET /`.
 *
 * @param svc - the score service the router delegates to
 * @returns a Hono sub-app mountable with `.route()`
 */
export function scoresRouter(svc: ScoreService) {
  return new Hono()
    .get("/", validate("query", listQuery), (c) => {
      const { deck } = c.req.valid("query");
      return c.json(svc.list(deck ? { deck } : undefined));
    })
    .get("/:id", validate("param", idParam), (c) => {
      const { id } = c.req.valid("param");
      return c.json(svc.get(id));
    })
    .post("/", validate("json", scoreInput), (c) => {
      const { sources, ...values } = c.req.valid("json");
      return c.json(svc.create(values, sources), 201);
    })
    .patch("/:id", validate("param", idParam), validate("json", scorePatch), (c) => {
      const { id } = c.req.valid("param");
      const { sources, ...values } = c.req.valid("json");
      return c.json(svc.update(id, values, sources));
    })
    .delete("/:id", validate("param", idParam), (c) => {
      const { id } = c.req.valid("param");
      svc.remove(id);
      return c.body(null, 204);
    });
}
