import { z } from "zod";
import {
  buffValueInsert,
  counterInsert,
  deckCookieInsert,
  deckInsert,
  deckNoteInsert,
  deckSlug,
  fightEventInsert,
  gearRecInsert,
  glossaryInsert,
  mechanicInsert,
  nameList,
  recommendationInsert,
  rngFactorInsert,
  runeBuildInsert,
  scoreInsert,
  sourceId,
  sourceInsert,
  takeawayInsert,
  timelineEventInsert,
  usageStatInsert,
} from "./zod";

/** A non-empty list of source ids a submitted entity must cite. */
export const sourceIds = z.array(sourceId).min(1, "cite at least one source");

/**
 * The create input and the patch of a cited content type, from its table's
 * insert schema. The input drops the server-assigned `id` and requires the
 * `sources` the row cites; the patch makes every field optional, `sources`
 * included, and still rejects an empty `sources`.
 *
 * @typeParam Shape - the insert schema's fields, `id` among them
 * @typeParam Config - the insert schema's object config
 * @param insert - the table's insert schema
 * @returns `input` and `patch`
 */
function citedInputs<
  Shape extends z.core.$ZodShape & { id: z.core.$ZodType },
  Config extends z.core.$ZodObjectConfig,
>(insert: z.ZodObject<Shape, Config>) {
  // zod's `omit` checks the mask against the shape's keys, which a generic shape can't resolve.
  const idOnly = { id: true } as { id: true } & Record<Exclude<"id", keyof Shape>, never>;
  const fields = insert.omit(idOnly);
  return {
    input: fields.extend({ sources: sourceIds }),
    patch: fields.partial().extend({ sources: sourceIds.optional() }),
  };
}

/**
 * Input for creating a source. `site` is derived server-side from the id
 * prefix (`dc:`/`nv:`/`web:`), so it isn't accepted from the client.
 */
export const sourceInput = sourceInsert.omit({ site: true });
/** Output of {@link sourceInput}. */
export type SourceInput = z.output<typeof sourceInput>;

/** Patch for updating a source. `id` is immutable; every other field is optional. */
export const sourcePatch = sourceInput.omit({ id: true }).partial();
/** Output of {@link sourcePatch}. */
export type SourcePatch = z.output<typeof sourcePatch>;

/** Input for creating or replacing a glossary entry, keyed by `kr`. */
export const glossaryInput = glossaryInsert;
/** Output of {@link glossaryInput}. */
export type GlossaryInput = z.output<typeof glossaryInput>;

const mechanic = citedInputs(mechanicInsert);
/** Input for creating a mechanic writeup, with the sources that support it. */
export const mechanicInput = mechanic.input;
/** Output of {@link mechanicInput}. */
export type MechanicInput = z.output<typeof mechanicInput>;
/** Patch for updating a mechanic writeup. `sources`, if given, must be non-empty. */
export const mechanicPatch = mechanic.patch;
/** Output of {@link mechanicPatch}. */
export type MechanicPatch = z.output<typeof mechanicPatch>;

const rngFactor = citedInputs(rngFactorInsert);
/** Input for creating an RNG factor writeup, with the sources that support it. */
export const rngFactorInput = rngFactor.input;
/** Output of {@link rngFactorInput}. */
export type RngFactorInput = z.output<typeof rngFactorInput>;
/** Patch for updating an RNG factor writeup. `sources`, if given, must be non-empty. */
export const rngFactorPatch = rngFactor.patch;
/** Output of {@link rngFactorPatch}. */
export type RngFactorPatch = z.output<typeof rngFactorPatch>;

const timelineEvent = citedInputs(timelineEventInsert);
/** Input for creating a timeline event, with the sources that support it. */
export const timelineEventInput = timelineEvent.input;
/** Output of {@link timelineEventInput}. */
export type TimelineEventInput = z.output<typeof timelineEventInput>;
/** Patch for updating a timeline event. `sources`, if given, must be non-empty. */
export const timelineEventPatch = timelineEvent.patch;
/** Output of {@link timelineEventPatch}. */
export type TimelineEventPatch = z.output<typeof timelineEventPatch>;

const takeaway = citedInputs(takeawayInsert);
/** Input for creating a takeaway, with the sources that support it. */
export const takeawayInput = takeaway.input;
/** Output of {@link takeawayInput}. */
export type TakeawayInput = z.output<typeof takeawayInput>;
/** Patch for updating a takeaway. `sources`, if given, must be non-empty. */
export const takeawayPatch = takeaway.patch;
/** Output of {@link takeawayPatch}. */
export type TakeawayPatch = z.output<typeof takeawayPatch>;

const gearRec = citedInputs(gearRecInsert);
/** Input for creating a gear recommendation, with the sources that support it. */
export const gearRecInput = gearRec.input;
/** Output of {@link gearRecInput}. */
export type GearRecInput = z.output<typeof gearRecInput>;
/** Patch for updating a gear recommendation. `sources`, if given, must be non-empty. */
export const gearRecPatch = gearRec.patch;
/** Output of {@link gearRecPatch}. */
export type GearRecPatch = z.output<typeof gearRecPatch>;

const recommendation = citedInputs(recommendationInsert);
/** Input for creating a recommendation, with the sources that support it. */
export const recommendationInput = recommendation.input;
/** Output of {@link recommendationInput}. */
export type RecommendationInput = z.output<typeof recommendationInput>;
/** Patch for updating a recommendation. `sources`, if given, must be non-empty. */
export const recommendationPatch = recommendation.patch;
/** Output of {@link recommendationPatch}. */
export type RecommendationPatch = z.output<typeof recommendationPatch>;

const score = citedInputs(scoreInsert);
/** Input for creating a score, with the sources that support it. */
export const scoreInput = score.input;
/** Output of {@link scoreInput}. */
export type ScoreInput = z.output<typeof scoreInput>;
/** Patch for updating a score. `sources`, if given, must be non-empty. */
export const scorePatch = score.patch;
/** Output of {@link scorePatch}. */
export type ScorePatch = z.output<typeof scorePatch>;

const fightEvent = citedInputs(fightEventInsert);
/** Input for creating a fight event, with the sources that support it. */
export const fightEventInput = fightEvent.input;
/** Output of {@link fightEventInput}. */
export type FightEventInput = z.output<typeof fightEventInput>;
/** Patch for updating a fight event. `sources`, if given, must be non-empty. */
export const fightEventPatch = fightEvent.patch;
/** Output of {@link fightEventPatch}. */
export type FightEventPatch = z.output<typeof fightEventPatch>;

const buffValue = citedInputs(buffValueInsert);
/** Input for creating a buff value, with the sources that support it. */
export const buffValueInput = buffValue.input;
/** Output of {@link buffValueInput}. */
export type BuffValueInput = z.output<typeof buffValueInput>;
/** Patch for updating a buff value. `sources`, if given, must be non-empty. */
export const buffValuePatch = buffValue.patch;
/** Output of {@link buffValuePatch}. */
export type BuffValuePatch = z.output<typeof buffValuePatch>;

const counter = citedInputs(counterInsert);
/**
 * Input for creating a counter edge, with the sources that support it. A
 * deck can't counter itself: `teamDeckId` and `beatenByDeckId` must differ.
 * `citedInputs` omits before this refine: zod 4 rejects `.omit()` on a
 * refined object.
 */
export const counterInput = counter.input.refine((c) => c.teamDeckId !== c.beatenByDeckId, {
  message: "a deck can't be its own counter",
  path: ["beatenByDeckId"],
});
/** Output of {@link counterInput}. */
export type CounterInput = z.output<typeof counterInput>;
/** Patch for updating a counter edge. `sources`, if given, must be non-empty. */
export const counterPatch = counter.patch;
/** Output of {@link counterPatch}. */
export type CounterPatch = z.output<typeof counterPatch>;

const usageStat = citedInputs(usageStatInsert);
/** Input for creating a usage figure, with the sources that support it. */
export const usageStatInput = usageStat.input;
/** Output of {@link usageStatInput}. */
export type UsageStatInput = z.output<typeof usageStatInput>;
/** Patch for updating a usage figure. `sources`, if given, must be non-empty. */
export const usageStatPatch = usageStat.patch;
/** Output of {@link usageStatPatch}. */
export type UsageStatPatch = z.output<typeof usageStatPatch>;

/**
 * Input for a single deck cookie slot. `id`, `deckId` and `position` are
 * assigned by the service, not the client. Enforces the same level-or-rule
 * invariant as the `deck_cookies_level_or_rule` CHECK constraint: the omit
 * runs before the refine because zod 4 rejects `.omit()`/`.pick()` on an
 * already-refined object.
 */
export const deckCookieInput = deckCookieInsert
  .omit({ id: true, deckId: true, position: true })
  .refine((c) => c.level != null || c.levelRule != null, {
    message: "a deck cookie needs a level or a level rule",
    path: ["level"],
  });
/** Output of {@link deckCookieInput}. */
export type DeckCookieInput = z.output<typeof deckCookieInput>;

/** Input for a single deck note: its kind and text, without positioning or foreign keys. */
export const deckNoteInput = deckNoteInsert.pick({ kind: true, text: true });
/** Output of {@link deckNoteInput}. */
export type DeckNoteInput = z.output<typeof deckNoteInput>;

/**
 * The deck fields shared, unmodified, by {@link deckInput} and
 * {@link deckPatch}. Carries no `.default()`s, so `.partial()`-ing it (for
 * the patch) never injects a default value into a payload that omitted the
 * field.
 */
const deckFields = deckInsert.omit({ id: true, position: true }).extend({
  position: z.number().int().min(0).optional(),
  cookies: z.array(deckCookieInput).min(1),
  pets: nameList,
  notes: z.array(deckNoteInput),
  sources: sourceIds,
});

/**
 * Input for creating a deck. `id` must be a lowercase slug; `pets` and
 * `notes` default to `[]` when omitted.
 */
export const deckInput = deckFields.extend({
  id: deckSlug,
  pets: nameList.default([]),
  notes: z.array(deckNoteInput).default([]),
});
/** Output of {@link deckInput}. */
export type DeckInput = z.output<typeof deckInput>;

/** Patch for updating a deck. Every field is optional; omitted fields stay unset. */
export const deckPatch = deckFields.partial();
/** Output of {@link deckPatch}. */
export type DeckPatch = z.output<typeof deckPatch>;

/**
 * Input for creating a rune build: the decks it applies to and the sources
 * that support it. `decks` defaults to `[]` when omitted.
 */
export const runeBuildInput = runeBuildInsert.omit({ id: true }).extend({
  decks: z.array(deckSlug).default([]),
  sources: sourceIds,
});
/** Output of {@link runeBuildInput}. */
export type RuneBuildInput = z.output<typeof runeBuildInput>;

/** Patch for updating a rune build. Every field, including `decks` and `sources`, is optional. */
export const runeBuildPatch = runeBuildInsert
  .omit({ id: true })
  .extend({ decks: z.array(deckSlug), sources: sourceIds })
  .partial();
/** Output of {@link runeBuildPatch}. */
export type RuneBuildPatch = z.output<typeof runeBuildPatch>;

/** The column values of an input without its citations. */
export type Values<I> = Omit<I, "sources">;
