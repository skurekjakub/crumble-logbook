/**
 * Site a source was captured from: the Cookie Run: Kingdom Discord (`dc`),
 * a Naver cafe (`nv`), or a general web page (`web`).
 */
export const SOURCE_SITE = ["dc", "nv", "web"] as const;
export type SourceSite = (typeof SOURCE_SITE)[number];

/** Lifecycle status of a research record. */
export const RECORD_STATUS = ["active", "done"] as const;
export type RecordStatus = (typeof RECORD_STATUS)[number];

/** Kind of entity a glossary entry defines. */
export const GLOSSARY_KIND = ["cookie", "pet", "stat", "gear_slot", "term"] as const;
export type GlossaryKind = (typeof GLOSSARY_KIND)[number];

/** Meta tier of a deck. */
export const DECK_STATUS = ["meta", "alt", "niche", "legacy"] as const;
export type DeckStatus = (typeof DECK_STATUS)[number];

/** Kind of free-text note attached to a deck. */
export const DECK_NOTE_KIND = ["substitution", "unorthodox"] as const;
export type DeckNoteKind = (typeof DECK_NOTE_KIND)[number];

/** Gear slot a recommendation applies to. */
export const GEAR_SLOT = [
  "top_left",
  "top_right",
  "bottom_left",
  "bottom_right",
  "general",
] as const;
export type GearSlot = (typeof GEAR_SLOT)[number];

/** Game mode a gear recommendation is for. */
export const GEAR_CONTEXT = ["raid", "arena", "stage"] as const;
export type GearContext = (typeof GEAR_CONTEXT)[number];

/** Leaderboard a ranking entry was captured from. */
export const RANKING_BOARD = ["players", "guilds", "power"] as const;
export type RankingBoard = (typeof RANKING_BOARD)[number];

/**
 * Game mode research content is about: Guild Conquest (길드 토벌전), regular
 * Arena (아레나), Rumble Arena (와글와글 아레나), or stage pushing (main
 * stages and the Dimensional Rift). The first is the default of every
 * `mode` column.
 */
export const GAME_MODE = ["guild_conquest", "arena", "rumble_arena", "stage"] as const;
export type GameMode = (typeof GAME_MODE)[number];

/**
 * Which side of the 2026-09-23 stage easing a stage clear was made on: the
 * easing lowered recommended power and enemy stats from 169-1 to 328-30.
 */
export const STAGE_ERA = ["pre-easing", "post-easing"] as const;
export type StageEra = (typeof STAGE_ERA)[number];

/** How a documented stage attempt ended. */
export const CLEAR_RESULT = ["clear", "fail"] as const;
export type ClearResult = (typeof CLEAR_RESULT)[number];

/** Whether a stage attempt was played by hand or on auto. */
export const CLEAR_PLAY = ["manual", "auto"] as const;
export type ClearPlay = (typeof CLEAR_PLAY)[number];

/**
 * Whether a research record accepts a documented stage attempt as shown:
 * `accepted` when the record rests on it, `rejected` when the record
 * argues against it, `unverified` when it is only claimed and the record
 * neither rests on it nor rejects it.
 */
export const CLEAR_STANDING = ["accepted", "unverified", "rejected"] as const;
export type ClearStanding = (typeof CLEAR_STANDING)[number];

/** What backs a documented stage attempt: a screenshot of the result or formation, or text alone. */
export const CLEAR_EVIDENCE = ["screenshot", "text"] as const;
export type ClearEvidence = (typeof CLEAR_EVIDENCE)[number];

/**
 * What a usage figure counts: one cookie, a group of cookies that appear
 * together (`core`), one pet, or a whole team.
 */
export const USAGE_KIND = ["cookie", "core", "pet", "team"] as const;
export type UsageKind = (typeof USAGE_KIND)[number];

/** Confidence assigned to a mechanic writeup. */
export const CONFIDENCE = ["high", "medium", "low"] as const;
export type Confidence = (typeof CONFIDENCE)[number];

/**
 * What a buff's value is a fraction of: a fixed amount, or the caster's
 * ATK or HP. Mirrors the game data's `base` field.
 */
export const BUFF_BASE = ["Fixed", "CastersAttackPoint", "CastersHealthPoint"] as const;
export type BuffBase = (typeof BUFF_BASE)[number];

/** Who a buff lands on: the caster's whole team, or the caster alone (`self`). */
export const BUFF_TARGET = ["team", "self"] as const;
export type BuffTarget = (typeof BUFF_TARGET)[number];

/**
 * How a backfilled capture-ledger line knows its capture time: from the
 * capture's own `captured:` header line (`header`), from the post an image
 * belongs to (`post`), or only from the file's first commit (`git`). A line
 * written at capture time has none.
 */
export const CAPTURE_APPROX = ["header", "post", "git"] as const;
export type CaptureApprox = (typeof CAPTURE_APPROX)[number];

/** Entities that carry citations; `citations.entity` takes one of these. */
export const CITED_ENTITY = [
  "deck",
  "rune_build",
  "gear_rec",
  "score",
  "mechanic",
  "rng_factor",
  "timeline_event",
  "takeaway",
  "recommendation",
  "fight_event",
  "buff_value",
  "counter",
  "usage_stat",
  "power_bracket",
  "stage_chapter",
  "rift_level",
  "rift_season",
  "rift_unlock",
  "stage_zone_slot",
  "stage_clear",
  "rift_boss",
] as const;
export type CitedEntity = (typeof CITED_ENTITY)[number];
