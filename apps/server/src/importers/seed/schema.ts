/**
 * Zod schemas for the curated dataset files in a record's `curated/`
 * directory. Field names are the files' own snake_case names; `seed/map.ts`
 * maps them onto table rows. Every schema except the glossary's rejects unknown fields, so a
 * field the importer doesn't map fails loudly instead of being dropped.
 *
 * @module
 */
import type { GameMode } from "@crumble/schema";
import {
  CONFIDENCE,
  DECK_STATUS,
  GAME_MODE,
  GEAR_CONTEXT,
  GLOSSARY_KIND,
  USAGE_KIND,
  deckSlug,
  isoDate,
  sourceId,
} from "@crumble/schema";
import { z } from "zod";

/** The source ids a curated row cites: at least one. */
const cited = z.array(z.string()).min(1);

/**
 * The game mode a curated row is about. A row that doesn't state one is
 * filed under the record's mode (`import.json`'s `record.mode`); the import
 * fails, naming the file and row, when neither states it.
 */
const mode = z.enum(GAME_MODE).optional();

/**
 * A curated row with its game mode resolved: its own, or the record's.
 *
 * @typeParam T - the row as its schema outputs it
 */
export type Moded<T extends { mode?: GameMode | undefined }> = Omit<T, "mode"> & {
  mode: GameMode;
};

/** A percentage, 0-100. */
const percent = z.number().min(0).max(100);

/**
 * One cookie slot of a curated deck. Needs a `level` or a `level_rule` (or
 * both); `slot` is its formation position as displayed, when known.
 */
export const seedDeckCookie = z
  .strictObject({
    kr: z.string().min(1),
    slot: z.string().min(1).optional(),
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
  mode,
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
/** Output of {@link seedDeck}, with its mode resolved. */
export type SeedDeck = Moded<z.output<typeof seedDeck>>;

/** One entry of `runes.json`: a cookie's rune lines and the decks they apply to. */
export const seedRune = z.strictObject({
  mode,
  cookie: z.string().min(1),
  lines: z.string().min(1),
  why: z.string().min(1),
  decks: z.array(z.string()).default([]),
  disputed: z.string().optional(),
  sources: cited,
});
/** Output of {@link seedRune}, with its mode resolved. */
export type SeedRune = Moded<z.output<typeof seedRune>>;

/** One entry of `gear.json`. `slot` is a dashed name such as `top-left`. */
export const seedGear = z.strictObject({
  mode,
  slot: z.string().min(1),
  substats: z.string().min(1),
  why: z.string().min(1),
  context: z.enum(GEAR_CONTEXT),
  sources: cited,
});
/** Output of {@link seedGear}, with its mode resolved. */
export type SeedGear = Moded<z.output<typeof seedGear>>;

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

/** One entry of `mechanics.json`, or one rule of `meta.json`'s `modes`. */
export const seedMechanic = z.strictObject({
  mode,
  topic: z.string().min(1).optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  confidence: z.enum(CONFIDENCE),
  sources: cited,
});
/** Output of {@link seedMechanic}, with its mode resolved. */
export type SeedMechanic = Moded<z.output<typeof seedMechanic>>;

/** One entry of `rng.json`. */
export const seedRng = z.strictObject({
  mode,
  factor: z.string().min(1),
  effect: z.string().min(1),
  mitigation: z.string().optional(),
  sources: cited,
});
/** Output of {@link seedRng}, with its mode resolved. */
export type SeedRng = Moded<z.output<typeof seedRng>>;

/** One entry of `timeline.json`. */
export const seedTimeline = z.strictObject({
  mode,
  date: isoDate,
  event: z.string().min(1),
  sources: cited,
});
/** Output of {@link seedTimeline}, with its mode resolved. */
export type SeedTimeline = Moded<z.output<typeof seedTimeline>>;

/** One entry of `takeaways.json`; the array order is the ranking. */
export const seedTakeaway = z.strictObject({
  mode,
  text: z.string().min(1),
  detail: z.string().optional(),
  sources: cited,
});
/** Output of {@link seedTakeaway}, with its mode resolved. */
export type SeedTakeaway = Moded<z.output<typeof seedTakeaway>>;

/**
 * One entry of `counters.json`: a directed edge, `team` is beaten by
 * `beaten_by` (both deck ids), under `conditions`, because of `why`. `id`
 * becomes the edge's slug.
 */
export const seedCounter = z.strictObject({
  id: deckSlug,
  mode,
  team: deckSlug,
  beaten_by: deckSlug,
  conditions: z.string().min(1).optional(),
  why: z.string().min(1),
  confidence: z.enum(CONFIDENCE),
  sources: cited,
});
/** Output of {@link seedCounter}, with its mode resolved. */
export type SeedCounter = Moded<z.output<typeof seedCounter>>;

/**
 * One entry of `usage.json`: `subject`'s share of `sample`, captured
 * `captured_at`. `members` lists a core's or team's cookies;
 * `confirmed_pct`, when known, can't exceed `usage_pct`.
 */
export const seedUsage = z
  .strictObject({
    mode,
    kind: z.enum(USAGE_KIND),
    subject: z.string().min(1),
    members: z.array(z.string().min(1)).nullish(),
    usage_pct: percent,
    confirmed_pct: percent.nullish(),
    sample: z.string().min(1),
    captured_at: isoDate,
    note: z.string().min(1).nullish(),
    sources: cited,
  })
  .refine((u) => u.confirmed_pct == null || u.confirmed_pct <= u.usage_pct, {
    message: "confirmed_pct can't exceed usage_pct",
    path: ["confirmed_pct"],
  });
/** Output of {@link seedUsage}, with its mode resolved. */
export type SeedUsage = Moded<z.output<typeof seedUsage>>;

/**
 * One mode block of `meta.json`'s `modes`: the mode's header copy and its
 * rules. A rule's `mode`, when it states one, must be the block's.
 */
const seedMetaMode = z.strictObject({
  lede: z.string().min(1).optional(),
  caveat: z.string().min(1).optional(),
  rules: z.array(seedMechanic).default([]),
});

/**
 * `meta.json`: the record's header copy plus the "for your account"
 * recommendation (`you`), and, for a record covering several game modes,
 * each mode's copy and rules (`modes`). `record`, `footer`,
 * `gear_slot_names` and `formation_slots` are dashboard UI copy; they're
 * accepted but not imported.
 */
export const seedMeta = z.strictObject({
  updated: isoDate,
  season: z.string().min(1),
  lede: z.string().optional(),
  caveat: z.string().optional(),
  record: z.string().optional(),
  footer: z.string().optional(),
  gear_slot_names: z.record(z.string(), z.string()).optional(),
  formation_slots: z.string().optional(),
  you: z.strictObject({
    summary: z.string().min(1),
    changes: z.array(z.string().min(1)).min(1),
    sources: cited,
  }),
  modes: z.partialRecord(z.enum(GAME_MODE), seedMetaMode).optional(),
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
