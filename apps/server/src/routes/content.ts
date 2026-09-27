import { Hono } from "hono";
import type { z } from "zod";
import type { ContentService } from "../services/content";
import { idParam, validate } from "./validate";

/**
 * Builds the generic CRUD router for one cited-content service:
 * `GET /`, `GET /:id`, `POST /` (201), `PATCH /:id`, `DELETE /:id` (204).
 *
 * The request body's `sources` field is split from the rest of the columns
 * before it reaches the service: `values` goes to `create`/`update`, and
 * `sources` goes alongside it. `Input`/`Patch` carry their validated output
 * shape in their own type parameter (rather than leaving it at `z.ZodType`'s
 * default `unknown`), which is what lets the `z.output<Input>` casts below
 * resolve to something more useful than `unknown`.
 *
 * @typeParam Row - the shape of a selected row
 * @typeParam Values - the column values `svc` accepts, without `sources`
 * @typeParam Input - the zod schema for a `POST` body
 * @typeParam Patch - the zod schema for a `PATCH` body
 * @param svc - the service the router delegates to
 * @param schemas - the create (`input`) and update (`patch`) body schemas
 * @returns a Hono sub-app mountable with `.route()`
 */
export function contentRouter<
  Row extends { id: number },
  Values extends object,
  Input extends z.ZodType<Values & { sources: string[] }>,
  Patch extends z.ZodType<Partial<Values> & { sources?: string[] }>,
>(svc: ContentService<Row, Values>, schemas: { input: Input; patch: Patch }) {
  const { input, patch } = schemas;
  return new Hono()
    .get("/", (c) => c.json(svc.list()))
    .get("/:id", validate("param", idParam), (c) => {
      const { id } = c.req.valid("param");
      return c.json(svc.get(id));
    })
    .post("/", validate("json", input), (c) => {
      const { sources, ...values } = c.req.valid("json") as z.output<Input>;
      return c.json(svc.create(values as Values, sources), 201);
    })
    .patch("/:id", validate("param", idParam), validate("json", patch), (c) => {
      const { id } = c.req.valid("param");
      const { sources, ...values } = c.req.valid("json") as z.output<Patch>;
      return c.json(svc.update(id, values as unknown as Partial<Values>, sources));
    })
    .delete("/:id", validate("param", idParam), (c) => {
      const { id } = c.req.valid("param");
      svc.remove(id);
      return c.body(null, 204);
    });
}
