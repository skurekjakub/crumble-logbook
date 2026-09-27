import { z } from "zod";
import {
  deckCookieInsert,
  deckInsert,
  deckNoteInsert,
  deckSlug,
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
} from "./zod";

/** A non-empty list of source ids a submitted entity must cite. */
export const sourceIds = z.array(sourceId).min(1, "cite at least one source");

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

/** Input for creating a mechanic writeup, with the sources that support it. */
export const mechanicInput = mechanicInsert.omit({ id: true }).extend({ sources: sourceIds });
/** Output of {@link mechanicInput}. */
export type MechanicInput = z.output<typeof mechanicInput>;

/** Patch for updating a mechanic writeup. `sources`, if given, must be non-empty. */
export const mechanicPatch = mechanicInsert
  .omit({ id: true })
  .partial()
  .extend({ sources: sourceIds.optional() });
/** Output of {@link mechanicPatch}. */
export type MechanicPatch = z.output<typeof mechanicPatch>;

/** Input for creating an RNG factor writeup, with the sources that support it. */
export const rngFactorInput = rngFactorInsert.omit({ id: true }).extend({ sources: sourceIds });
/** Output of {@link rngFactorInput}. */
export type RngFactorInput = z.output<typeof rngFactorInput>;

/** Patch for updating an RNG factor writeup. `sources`, if given, must be non-empty. */
export const rngFactorPatch = rngFactorInsert
  .omit({ id: true })
  .partial()
  .extend({ sources: sourceIds.optional() });
/** Output of {@link rngFactorPatch}. */
export type RngFactorPatch = z.output<typeof rngFactorPatch>;

/** Input for creating a timeline event, with the sources that support it. */
export const timelineEventInput = timelineEventInsert
  .omit({ id: true })
  .extend({ sources: sourceIds });
/** Output of {@link timelineEventInput}. */
export type TimelineEventInput = z.output<typeof timelineEventInput>;

/** Patch for updating a timeline event. `sources`, if given, must be non-empty. */
export const timelineEventPatch = timelineEventInsert
  .omit({ id: true })
  .partial()
  .extend({ sources: sourceIds.optional() });
/** Output of {@link timelineEventPatch}. */
export type TimelineEventPatch = z.output<typeof timelineEventPatch>;

/** Input for creating a takeaway, with the sources that support it. */
export const takeawayInput = takeawayInsert.omit({ id: true }).extend({ sources: sourceIds });
/** Output of {@link takeawayInput}. */
export type TakeawayInput = z.output<typeof takeawayInput>;

/** Patch for updating a takeaway. `sources`, if given, must be non-empty. */
export const takeawayPatch = takeawayInsert
  .omit({ id: true })
  .partial()
  .extend({ sources: sourceIds.optional() });
/** Output of {@link takeawayPatch}. */
export type TakeawayPatch = z.output<typeof takeawayPatch>;

/** Input for creating a gear recommendation, with the sources that support it. */
export const gearRecInput = gearRecInsert.omit({ id: true }).extend({ sources: sourceIds });
/** Output of {@link gearRecInput}. */
export type GearRecInput = z.output<typeof gearRecInput>;

/** Patch for updating a gear recommendation. `sources`, if given, must be non-empty. */
export const gearRecPatch = gearRecInsert
  .omit({ id: true })
  .partial()
  .extend({ sources: sourceIds.optional() });
/** Output of {@link gearRecPatch}. */
export type GearRecPatch = z.output<typeof gearRecPatch>;

/** Input for creating a recommendation, with the sources that support it. */
export const recommendationInput = recommendationInsert
  .omit({ id: true })
  .extend({ sources: sourceIds });
/** Output of {@link recommendationInput}. */
export type RecommendationInput = z.output<typeof recommendationInput>;

/** Patch for updating a recommendation. `sources`, if given, must be non-empty. */
export const recommendationPatch = recommendationInsert
  .omit({ id: true })
  .partial()
  .extend({ sources: sourceIds.optional() });
/** Output of {@link recommendationPatch}. */
export type RecommendationPatch = z.output<typeof recommendationPatch>;

/** Input for creating a score, with the sources that support it. */
export const scoreInput = scoreInsert.omit({ id: true }).extend({ sources: sourceIds });
/** Output of {@link scoreInput}. */
export type ScoreInput = z.output<typeof scoreInput>;

/** Patch for updating a score. `sources`, if given, must be non-empty. */
export const scorePatch = scoreInsert
  .omit({ id: true })
  .partial()
  .extend({ sources: sourceIds.optional() });
/** Output of {@link scorePatch}. */
export type ScorePatch = z.output<typeof scorePatch>;

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
