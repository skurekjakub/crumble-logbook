/**
 * Zod schemas for the curated dataset files (the legacy dashboard's
 * `data/*.json`, copied into a record's `curated/` directory). Field names
 * are the files' own snake_case names; `seed/map.ts` maps them onto table
 * rows. Every schema except the glossary's rejects unknown fields, so a
 * field the importer doesn't map fails loudly instead of being dropped.
 *
 * @module
 */
import {
  CONFIDENCE,
  DECK_STATUS,
  GEAR_CONTEXT,
  GLOSSARY_KIND,
  deckSlug,
  isoDate,
  sourceId,
} from "@crumble/schema";
import { z } from "zod";

/** The source ids a curated row cites: at least one. */
const cited = z.array(z.string()).min(1);

/** One cookie slot of a curated deck. Needs a `level` or a `level_rule` (or both). */
export const seedDeckCookie = z
  .strictObject({
    kr: z.string().min(1),
    level: z.string().min(1).optional(),
    level_rule: z.string().min(1).optional(),
    stars: z.string().min(1).optional(),
    why: z.string().min(1),
  })
  .refine((c) => c.level !== undefined || c.level_rule !== undefined, {
    message: "a deck cookie needs a level or a level_rule",
    path: ["level"],
  });
/** Output of {@link seedDeckCookie}. */
export type SeedDeckCookie = z.output<typeof seedDeckCookie>;

/** One entry of `decks.json`. */
export const seedDeck = z.strictObject({
  id: deckSlug,
  name_en: z.string().min(1),
  name_kr: z.string().optional(),
  status: z.enum(DECK_STATUS),
  ceiling: z.string().optional(),
  summary: z.string().optional(),
  cookies: z.array(seedDeckCookie).min(1),
  atk_order: z.array(z.string().min(1)).optional(),
  atk_order_note: z.string().optional(),
  pets: z.array(z.string().min(1)).optional(),
  perks: z.string().optional(),
  formation: z.string().optional(),
  substitutions: z.array(z.string().min(1)).optional(),
  rng: z.string().optional(),
  unorthodox: z.array(z.string().min(1)).optional(),
  sources: cited,
});
/** Output of {@link seedDeck}. */
export type SeedDeck = z.output<typeof seedDeck>;

/** One entry of `runes.json`: a cookie's rune lines and the decks they apply to. */
export const seedRune = z.strictObject({
  cookie: z.string().min(1),
  lines: z.string().min(1),
  why: z.string().min(1),
  decks: z.array(z.string()).default([]),
  disputed: z.string().optional(),
  sources: cited,
});
/** Output of {@link seedRune}. */
export type SeedRune = z.output<typeof seedRune>;

/** One entry of `gear.json`. `slot` is a dashed name such as `top-left`. */
export const seedGear = z.strictObject({
  slot: z.string().min(1),
  substats: z.string().min(1),
  why: z.string().min(1),
  context: z.enum(GEAR_CONTEXT),
  sources: cited,
});
/** Output of {@link seedGear}. */
export type SeedGear = z.output<typeof seedGear>;

/** One entry of `scores.json`, in billions (G). `power_g` and `deck` may be `null`. */
export const seedScore = z.strictObject({
  damage_g: z.number().positive(),
  power_g: z.number().positive().nullable(),
  deck: z.string().nullable(),
  verified: z.boolean(),
  date: isoDate.nullish(),
  season: z.number().int().positive().nullish(),
  player: z.string().nullish(),
  note: z.string().optional(),
  sources: cited,
});
/** Output of {@link seedScore}. */
export type SeedScore = z.output<typeof seedScore>;

/** One entry of `mechanics.json`. */
export const seedMechanic = z.strictObject({
  title: z.string().min(1),
  body: z.string().min(1),
  confidence: z.enum(CONFIDENCE),
  sources: cited,
});
/** Output of {@link seedMechanic}. */
export type SeedMechanic = z.output<typeof seedMechanic>;

/** One entry of `rng.json`. */
export const seedRng = z.strictObject({
  factor: z.string().min(1),
  effect: z.string().min(1),
  mitigation: z.string().optional(),
  sources: cited,
});
/** Output of {@link seedRng}. */
export type SeedRng = z.output<typeof seedRng>;

/** One entry of `timeline.json`. */
export const seedTimeline = z.strictObject({
  date: isoDate,
  event: z.string().min(1),
  sources: cited,
});
/** Output of {@link seedTimeline}. */
export type SeedTimeline = z.output<typeof seedTimeline>;

/** One entry of `takeaways.json`; the array order is the ranking. */
export const seedTakeaway = z.strictObject({
  text: z.string().min(1),
  detail: z.string().optional(),
  sources: cited,
});
/** Output of {@link seedTakeaway}. */
export type SeedTakeaway = z.output<typeof seedTakeaway>;

/**
 * `meta.json`: the record's header copy plus the "for your account"
 * recommendation (`you`). `record`, `footer` and `gear_slot_names` are
 * dashboard UI copy; they're accepted but not imported.
 */
export const seedMeta = z.strictObject({
  updated: isoDate,
  season: z.string().min(1),
  lede: z.string().optional(),
  caveat: z.string().optional(),
  record: z.string().optional(),
  footer: z.string().optional(),
  gear_slot_names: z.record(z.string(), z.string()).optional(),
  you: z.strictObject({
    summary: z.string().min(1),
    changes: z.array(z.string().min(1)).min(1),
    sources: cited,
  }),
});
/** Output of {@link seedMeta}. */
export type SeedMeta = z.output<typeof seedMeta>;

/**
 * One value of `sources.json`. `date` is kept loose (the dashboard tolerated
 * `"?"`), and `signal` is either `"relevance N/3"` or a free-text note.
 */
export const seedSource = z.strictObject({
  url: z.string().min(1),
  title: z.string().nullish(),
  title_en: z.string().nullish(),
  date: z.string().nullish(),
  signal: z.string().nullish(),
});
/** Output of {@link seedSource}. */
export type SeedSource = z.output<typeof seedSource>;

/** `sources.json`: a record from `<site>:<key>` source id to its entry. */
export const seedSources = z.record(sourceId, seedSource);
/** Output of {@link seedSources}. */
export type SeedSources = z.output<typeof seedSources>;

/**
 * One entry of `glossary.json`. The known fields are typed; every other
 * field (skills, resource keys, provenance notes, …) passes through the
 * catchall so the import can keep it. Empty `element`/`class`/`rarity`
 * strings are accepted here and mapped to `null` later.
 */
export const seedGlossaryEntry = z
  .object({
    kr: z.string().min(1),
    kr_short: z.array(z.string().min(1)).default([]),
    en: z.string().nullable(),
    kind: z.enum(GLOSSARY_KIND),
    element: z.string().optional(),
    class: z.string().optional(),
    rarity: z.string().optional(),
  })
  .catchall(z.unknown());
/** Output of {@link seedGlossaryEntry}. */
export type SeedGlossaryEntry = z.output<typeof seedGlossaryEntry>;
