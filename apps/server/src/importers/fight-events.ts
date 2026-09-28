/**
 * The `fightEvents` block of a record's `import.json`: a boss fight's
 * timeline, read from an encounter extraction onto `fight_events` rows.
 *
 * @module
 */
import type { FightEventInput, Values } from "@crumble/schema";
import { CONFIDENCE, sourceId } from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import { parseFile, readJson } from "./files";
import type { CitedValues } from "./steps";

/**
 * The fight timeline to load into `fight_events`: an extraction JSON whose
 * `encounter.timeline` entries carry `t_seconds`, `event`, `detail`,
 * `sources` and `confidence`.
 *
 * An entry's `t_seconds` is seconds elapsed since the fight started, except
 * for the events named in `countdown`: those are timed by the in-game HUD,
 * which counts down from `fightSeconds`, and the `countdown` value (seconds
 * remaining) replaces the entry's `t_seconds`, becoming `fightSeconds −
 * value` elapsed. A `null` `t_seconds` stays `null`. `sourceAliases` maps a
 * source id as the extraction writes it onto a curated source id.
 */
export const fightEventsSpec = z.strictObject({
  file: z.string().min(1),
  boss: z.string().min(1),
  fightSeconds: z.number().positive(),
  countdown: z.record(z.string().min(1), z.number().nonnegative()).default({}),
  sourceAliases: z.record(z.string().min(1), sourceId).default({}),
});
/** The `fightEvents` block of an `import.json`. */
type FightEventsSpec = z.output<typeof fightEventsSpec>;

/** One entry of an extraction's `encounter.timeline`. */
const timelineEntry = z.strictObject({
  t_seconds: z.number().nullable(),
  event: z.string().min(1),
  detail: z.string().min(1),
  sources: z.array(z.string().min(1)).min(1),
  confidence: z.enum(CONFIDENCE),
});

/** The part of an encounter extraction the fight timeline import reads. */
const encounterFile = z.object({
  encounter: z.object({ timeline: z.array(timelineEntry) }),
});

/**
 * Reads the fight timeline a manifest names and maps it onto `fight_events`
 * rows, on the elapsed clock (see {@link fightEventsSpec} for how
 * `countdown` converts HUD-timed events).
 *
 * @param recordDir - absolute path to the record directory
 * @param spec - the manifest's `fightEvents` block
 * @param sourceIds - every curated source id
 * @returns one row per timeline entry, in file order, citing the entry's
 *   sources after `spec.sourceAliases` is applied
 * @throws {ImportError} naming `spec.file` if it's missing or malformed; if
 *   a `countdown` key names no timeline event, or more than one; or, naming
 *   the timeline row, if an elapsed time falls outside the fight or a
 *   source id isn't curated
 */
export function readFightEvents(
  recordDir: string,
  spec: FightEventsSpec,
  sourceIds: ReadonlySet<string>,
): Array<CitedValues<Values<FightEventInput>>> {
  const { timeline } = parseFile(
    spec.file,
    readJson(recordDir, spec.file),
    encounterFile,
  ).encounter;

  for (const event of Object.keys(spec.countdown)) {
    const matches = timeline.filter((entry) => entry.event === event).length;
    if (matches === 0) {
      throw new ImportError(
        spec.file,
        null,
        `countdown names event "${event}", which the timeline doesn't have`,
      );
    }
    if (matches > 1) {
      throw new ImportError(
        spec.file,
        null,
        `countdown names event "${event}", which the timeline has ${matches} times`,
      );
    }
  }

  return timeline.map((entry, index) => {
    const row = `timeline ${index}`;
    const remaining = spec.countdown[entry.event];
    const tElapsed = remaining === undefined ? entry.t_seconds : spec.fightSeconds - remaining;
    if (tElapsed !== null && (tElapsed < 0 || tElapsed > spec.fightSeconds)) {
      throw new ImportError(
        spec.file,
        row,
        `elapsed time ${tElapsed} s is outside the ${spec.fightSeconds} s fight`,
      );
    }
    const sources = [...new Set(entry.sources.map((id) => spec.sourceAliases[id] ?? id))];
    const unknown = sources.filter((id) => !sourceIds.has(id));
    if (unknown.length > 0) {
      throw new ImportError(spec.file, row, `unknown source ids: ${unknown.join(", ")}`);
    }
    return {
      values: {
        boss: spec.boss,
        tElapsed,
        event: entry.event,
        detail: entry.detail,
        confidence: entry.confidence,
      },
      sources,
    };
  });
}
