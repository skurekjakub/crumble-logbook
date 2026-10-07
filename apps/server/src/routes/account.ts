import { Hono } from "hono";
import { z } from "zod";
import type { AccountService } from "../services/account";
import { validate } from "./validate";

/** Query params accepted by `GET /`: the snapshot and roadmap to show, by id. */
const overviewQuery = z.object({
  snapshot: z.string().min(1).optional(),
  roadmap: z.string().min(1).optional(),
});

/**
 * Builds the read-only router for the reader's account: `GET /` returns
 * the latest snapshot and roadmap (or the ones `?snapshot=` and
 * `?roadmap=` name), and every loaded snapshot and roadmap by id.
 *
 * @param svc - the account service the router delegates to
 * @returns a Hono sub-app mountable with `.route()`
 */
export function accountRouter(svc: AccountService) {
  return new Hono().get("/", validate("query", overviewQuery), (c) =>
    c.json(svc.overview(c.req.valid("query"))),
  );
}
