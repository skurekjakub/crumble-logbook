import { Hono } from "hono";
import { z } from "zod";
import type { CookieService } from "../services/cookies";
import { validate } from "./validate";

/** A `:key` path parameter: a cookie's key. */
const keyParam = z.object({ key: z.string().min(1) });

/**
 * Builds the read-only router for `cookies`: `GET /` (the cookie index)
 * and `GET /:key` (one cookie's page; 404 for an unknown key).
 *
 * @param svc - the cookies service the router delegates to
 * @returns a Hono sub-app mountable with `.route()`
 */
export function cookiesRouter(svc: CookieService) {
  return new Hono()
    .get("/", (c) => c.json(svc.list()))
    .get("/:key", validate("param", keyParam), (c) => c.json(svc.get(c.req.valid("param").key)));
}
