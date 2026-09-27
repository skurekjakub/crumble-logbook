import { deckInput, deckPatch, deckSlug } from "@crumble/schema";
import { Hono } from "hono";
import { z } from "zod";
import type { DeckService } from "../services/decks";
import { validate } from "./validate";

/** A `:id` path parameter, validated as a deck slug. */
const idParam = z.object({ id: deckSlug });

/**
 * Builds the CRUD router for `decks`: `GET /`, `GET /:id`, `POST /` (201),
 * `PATCH /:id`, `DELETE /:id` (204). `:id` is a deck slug, not a numeric id.
 *
 * @param svc - the deck service the router delegates to
 * @returns a Hono sub-app mountable with `.route()`
 */
export function decksRouter(svc: DeckService) {
  return new Hono()
    .get("/", (c) => c.json(svc.list()))
    .get("/:id", validate("param", idParam), (c) => {
      const { id } = c.req.valid("param");
      return c.json(svc.get(id));
    })
    .post("/", validate("json", deckInput), (c) => {
      const input = c.req.valid("json");
      return c.json(svc.create(input), 201);
    })
    .patch("/:id", validate("param", idParam), validate("json", deckPatch), (c) => {
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
