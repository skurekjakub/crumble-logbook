import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import { z } from "zod";

/**
 * A positive integer `:id` path parameter, coerced from its string form.
 * Shared by every content and score route.
 */
export const idParam = z.object({ id: z.coerce.number().int().positive() });

/**
 * Wraps `@hono/zod-validator` so every route responds to a failed
 * validation the same way, listing every issue rather than just the first.
 *
 * @param target - which part of the request to validate (`"json"`,
 *   `"param"`, `"query"`, …)
 * @param schema - the zod schema to validate against
 * @returns Hono middleware; on failure, responds 400 with
 *   `{ error: "validation", issues: [{ path, message }] }`
 */
export function validate<Target extends keyof ValidationTargets, Schema extends z.ZodType>(
  target: Target,
  schema: Schema,
) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "validation" as const,
          issues: result.error.issues.map((issue) => ({
            path: issue.path.map(String),
            message: issue.message,
          })),
        },
        400,
      );
    }
  });
}
