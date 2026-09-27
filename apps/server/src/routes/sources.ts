import { SOURCE_SITE, sourceId, sourceInput, sourcePatch } from "@crumble/schema";
import { Hono } from "hono";
import { z } from "zod";
import type { SourcesService } from "../services/sources";
import { validate } from "./validate";

/** A `:id` path parameter, validated as a `<site>:<key>` source id. */
const idParam = z.object({ id: sourceId });

/** Query params accepted by `GET /`: an optional site to filter by. */
const listQuery = z.object({ site: z.enum(SOURCE_SITE).optional() });

/**
 * Builds the CRUD router for `sources`: `GET /` (optionally filtered by
 * `?site`), `GET /:id`, `POST /` (201), `PATCH /:id`, `DELETE /:id` (204).
 * `:id` is a `<site>:<key>` string (e.g. `dc:76135`), sent URL-encoded
 * (`dc%3A76135`); Hono decodes path params before they reach `idParam`.
 *
 * @param svc - the sources service the router delegates to
 * @returns a Hono sub-app mountable with `.route()`
 */
export function sourcesRouter(svc: SourcesService) {
  return new Hono()
    .get("/", validate("query", listQuery), (c) => {
      const { site } = c.req.valid("query");
      return c.json(svc.list(site));
    })
    .get("/:id", validate("param", idParam), (c) => {
      const { id } = c.req.valid("param");
      return c.json(svc.get(id));
    })
    .post("/", validate("json", sourceInput), (c) => {
      const input = c.req.valid("json");
      return c.json(svc.create(input), 201);
    })
    .patch("/:id", validate("param", idParam), validate("json", sourcePatch), (c) => {
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
