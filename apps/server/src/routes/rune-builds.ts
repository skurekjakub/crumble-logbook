import { deckSlug, runeBuildInput, runeBuildPatch } from "@crumble/schema";
import { Hono } from "hono";
import { z } from "zod";
import type { RuneBuildService } from "../services/rune-builds";
import { idParam, validate } from "./validate";

/** Query params accepted by `GET /`: an optional deck slug to filter by. */
const listQuery = z.object({ deck: deckSlug.optional() });

/**
 * Builds the CRUD router for `rune-builds`: `GET /` (optionally filtered by
 * `?deck`), `GET /:id`, `POST /` (201), `PATCH /:id`, `DELETE /:id` (204).
 * `:id` is the rune build's numeric id.
 *
 * @param svc - the rune build service the router delegates to
 * @returns a Hono sub-app mountable with `.route()`
 */
export function runeBuildsRouter(svc: RuneBuildService) {
  return new Hono()
    .get("/", validate("query", listQuery), (c) => {
      const { deck } = c.req.valid("query");
      return c.json(svc.list(deck ? { deck } : undefined));
    })
    .get("/:id", validate("param", idParam), (c) => {
      const { id } = c.req.valid("param");
      return c.json(svc.get(id));
    })
    .post("/", validate("json", runeBuildInput), (c) => {
      const input = c.req.valid("json");
      return c.json(svc.create(input), 201);
    })
    .patch("/:id", validate("param", idParam), validate("json", runeBuildPatch), (c) => {
      const { id } = c.req.valid("param");
      const patch = c.req.valid("json");
      return c.json(svc.update(id, patch));
    })
    .delete("/:id", validate("param", idParam), (c) => {
      const { id } = c.req.valid("param");
      svc.remove(id);
      return c.body(null, 204);
    });
}
