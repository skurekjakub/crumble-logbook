import { Hono } from "hono";
import { z } from "zod";
import type { RecordsService } from "../services/records";
import { validate } from "./validate";

/** A `:slug` path parameter. */
const slugParam = z.object({ slug: z.string().min(1) });

/**
 * Builds the read-only router for `records`: `GET /` and `GET /:slug`.
 *
 * @param svc - the records service the router delegates to
 * @returns a Hono sub-app mountable with `.route()`
 */
export function recordsRouter(svc: RecordsService) {
  return new Hono()
    .get("/", (c) => c.json(svc.list()))
    .get("/:slug", validate("param", slugParam), (c) => {
      const { slug } = c.req.valid("param");
      return c.json(svc.get(slug));
    });
}
