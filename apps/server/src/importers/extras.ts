/**
 * The extra blocks a record's `import.json` may carry besides its curated
 * collections: captures that aren't curated JSON, each with its own schema
 * and reader. A new capture type is an entry here; the manifest schema and
 * the reader pick it up.
 *
 * @module
 */
import { z } from "zod";
import { buffValuesSpec, insertBuffValues, readBuffValues } from "./buff-values";
import { fightEventsSpec, readFightEvents } from "./fight-events";
import { insertCaptures, ledgerSpec, readCaptures } from "./ledger";
import { rankingSpec, readRankings } from "./rankings";
import type { WriteStep } from "./steps";
import { insertCited } from "./steps";

/** What an extra block's reader can see of the record besides its block. */
export interface ExtraContext {
  /** Absolute path to the record directory. */
  recordDir: string;
  /** Every curated source id. */
  sourceIds: ReadonlySet<string>;
  /** Every curated glossary `kr`. */
  glossaryKrs: ReadonlySet<string>;
}

/**
 * One extra block of `import.json`.
 *
 * @typeParam S - the block's schema; an optional block's schema accepts `undefined`
 */
export interface Extra<S extends z.ZodType> {
  /** The block's schema, as a field of the manifest's strict object. */
  schema: S;
  /**
   * Reads, validates and maps what the block names into write steps, doing
   * every file read now, so the write phase only writes.
   *
   * @param spec - the validated block
   * @param context - the record directory and the curated ids the block's rows may cite
   * @returns the block's write steps, in order
   * @throws {ImportError} naming the file (and row) of the first failure
   */
  read(spec: NonNullable<z.output<S>>, context: ExtraContext): WriteStep[];
}

/**
 * Declares an extra block, inferring its schema type.
 *
 * @param extra - the block
 * @returns the same block
 */
function extra<S extends z.ZodType>(extra: Extra<S>): Extra<S> {
  return extra;
}

/**
 * Every extra block, by its key in `import.json`, in write order: each
 * block's steps run after the curated collections' and the blocks before it.
 */
export const EXTRAS = {
  rankings: extra({
    schema: z.array(rankingSpec),
    read: (specs, { recordDir, sourceIds }) => [readRankings(recordDir, specs, sourceIds)],
  }),
  fightEvents: extra({
    schema: fightEventsSpec.optional(),
    read: (spec, { recordDir, sourceIds }) => [
      insertCited("fightEvents", readFightEvents(recordDir, spec, sourceIds)),
    ],
  }),
  buffValues: extra({
    schema: buffValuesSpec.optional(),
    read: (spec, { recordDir, sourceIds, glossaryKrs }) => [
      insertBuffValues(spec.file, readBuffValues(recordDir, spec, sourceIds, glossaryKrs)),
    ],
  }),
  ledger: extra({
    schema: ledgerSpec.optional(),
    read: (_spec, { recordDir }) => [insertCaptures(readCaptures(recordDir))],
  }),
};

/** The extra blocks by manifest key. */
type Extras = typeof EXTRAS;

/** An extra block's key in `import.json`. */
export type ExtraName = keyof Extras;

/** Each extra block's schema, by manifest key: the fields they add to the manifest's strict object. */
export const EXTRA_SHAPE = Object.fromEntries(
  Object.entries(EXTRAS).map(([name, block]) => [name, block.schema]),
) as { [N in ExtraName]: Extras[N]["schema"] };
