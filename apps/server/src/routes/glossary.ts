import { GAME_MODE, GLOSSARY_KIND, glossaryInput } from "@crumble/schema";
import { Hono } from "hono";
import { z } from "zod";
import type { GlossaryService } from "../services/glossary";
import { validate } from "./validate";

/** Query params accepted by `GET /`: an optional kind to filter by. */
const listQuery = z.object({ kind: z.enum(GLOSSARY_KIND).optional() });

/**
 * Query params accepted by `GET /resolve`: the name to resolve, and
 * optionally the game mode whose records' entries win a contested name.
 */
const resolveQuery = z.object({ name: z.string().min(1), mode: z.enum(GAME_MODE).optional() });

/**
 * Builds the router for `glossary`: `GET /` (optionally filtered by
 * `?kind`), `GET /resolve?name=&mode=` (a single {@link NameRef}), and
 * `POST /` (`glossaryInput`, upserted by `kr`, 200).
 *
 * @param svc - the glossary service the router delegates to
 * @returns a Hono sub-app mountable with `.route()`
 */
export function glossaryRouter(svc: GlossaryService) {
  return new Hono()
    .get("/", validate("query", listQuery), (c) => {
      const { kind } = c.req.valid("query");
      return c.json(svc.list(kind));
    })
    .get("/resolve", validate("query", resolveQuery), (c) => {
      const { name, mode } = c.req.valid("query");
      return c.json(svc.resolve(name, mode));
    })
    .post("/", validate("json", glossaryInput), (c) => {
      const input = c.req.valid("json");
      return c.json(svc.upsert(input), 200);
    });
}
