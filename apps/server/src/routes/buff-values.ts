import { buffValueInput, buffValuePatch } from "@crumble/schema";
import { Hono } from "hono";
import { z } from "zod";
import type { BuffValueService } from "../services/buff-values";
import { idParam, validate } from "./validate";

/** Query params accepted by `GET /`: an optional cookie name to filter by. */
const listQuery = z.object({ cookie: z.string().min(1).optional() });

/**
 * Builds the CRUD router for `buff-values`: the same verbs as the generic
 * content router, with `GET /` filterable by `?cookie` (the stored Korean
 * name, a glossary shorthand or the English name).
 *
 * @param svc - the buff value service the router delegates to
 * @returns a Hono sub-app mountable with `.route()`
 */
export function buffValuesRouter(svc: BuffValueService) {
  return new Hono()
    .get("/", validate("query", listQuery), (c) => {
      const { cookie } = c.req.valid("query");
      return c.json(svc.list(cookie ? { cookie } : undefined));
    })
    .get("/:id", validate("param", idParam), (c) => {
      const { id } = c.req.valid("param");
      return c.json(svc.get(id));
    })
    .post("/", validate("json", buffValueInput), (c) => {
      const { sources, ...values } = c.req.valid("json");
      return c.json(svc.create(values, sources), 201);
    })
    .patch("/:id", validate("param", idParam), validate("json", buffValuePatch), (c) => {
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
