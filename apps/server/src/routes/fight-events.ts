import { fightEventInput, fightEventPatch } from "@crumble/schema";
import { Hono } from "hono";
import { z } from "zod";
import type { FightEventService } from "../services/fight-events";
import { idParam, validate } from "./validate";

/** Query params accepted by `GET /`: an optional boss to filter by. */
const listQuery = z.object({ boss: z.string().min(1).optional() });

/**
 * Builds the CRUD router for `fight-events`: the same verbs as the generic
 * content router, with `GET /` in elapsed-time order and filterable by
 * `?boss`.
 *
 * @param svc - the fight event service the router delegates to
 * @returns a Hono sub-app mountable with `.route()`
 */
export function fightEventsRouter(svc: FightEventService) {
  return new Hono()
    .get("/", validate("query", listQuery), (c) => {
      const { boss } = c.req.valid("query");
      return c.json(svc.list(boss ? { boss } : undefined));
    })
    .get("/:id", validate("param", idParam), (c) => {
      const { id } = c.req.valid("param");
      return c.json(svc.get(id));
    })
    .post("/", validate("json", fightEventInput), (c) => {
      const { sources, ...values } = c.req.valid("json");
      return c.json(svc.create(values, sources), 201);
    })
    .patch("/:id", validate("param", idParam), validate("json", fightEventPatch), (c) => {
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
