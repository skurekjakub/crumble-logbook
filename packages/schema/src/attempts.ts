/**
 * The Guild Conquest macro's attempts, as `GET /api/attempts` serves them: each run the macro
 * (`tools/conquest-macro`) recorded, with how it ended, its score when the pace was judged, its
 * final score and its score curve, and the pace rule the macro runs with.
 *
 * @module
 */
import { z } from "zod";

/**
 * How a run ended, as the macro's runs file names it: ended behind pace (`pruned`), played the
 * full fight (`kept-*`, including `kept-played-out`, a run behind pace that the macro plays out
 * on purpose), or cut short by the loop itself.
 */
export const ATTEMPT_END = [
  "pruned",
  "kept-on-pace",
  "kept-unjudged",
  "kept-end-failed",
  "kept-played-out",
  "stopped",
  "error",
  "no-results",
] as const;

/** One HUD reading: seconds left in the fight, and the score then. */
export const curvePointSchema = z.tuple([z.number().min(0), z.number().int().min(0)]);

/** One recorded run. */
export const attemptSchema = z.object({
  /** When ENTER was tapped, `YYYY-MM-DD HH:mm:ss` in the macro's local time; unique per run. */
  time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
  /** The run's number in the macro's log; it restarts when the macro does. */
  run: z.number().int().min(0),
  end: z.enum(ATTEMPT_END),
  /** The score when the countdown showed the rule's `checkAtS`; null when none was read. */
  paceScore: z.number().int().min(0).nullable(),
  /**
   * The BATTLE OVER final score; null when it wasn't read. For a `pruned` run it is the score
   * when End Battle was tapped, not a final.
   */
  finalScore: z.number().int().min(0).nullable(),
  /**
   * Whether the run plays out whatever its pace (the macro's every `PlayOutEvery`-th run), whose
   * finals are an unbiased draw of the fight's outcomes; null on rows written before the column.
   */
  sample: z.boolean().nullable(),
  /** The run's HUD readings, most seconds left first; empty when none were recorded. */
  curve: z.array(curvePointSchema),
});

/** The macro's pace rule, from its INI; a field is null when the INI doesn't set it. */
export const paceRuleSchema = z.object({
  /** The score a run must have at `checkAtS` seconds left; 0 when the check is off. */
  minScore: z.number().int().min(0).nullable(),
  checkAtS: z.number().min(0).nullable(),
});

/** What `GET /api/attempts` answers. */
export const attemptsSchema = z.object({
  /** Whether the macro's runs file was found; false where the macro never ran, e.g. the deployment. */
  available: z.boolean(),
  rule: paceRuleSchema,
  /** Oldest first. */
  attempts: z.array(attemptSchema),
});

export type AttemptEnd = (typeof ATTEMPT_END)[number];
export type CurvePoint = z.infer<typeof curvePointSchema>;
export type Attempt = z.infer<typeof attemptSchema>;
export type PaceRule = z.infer<typeof paceRuleSchema>;
export type Attempts = z.infer<typeof attemptsSchema>;
