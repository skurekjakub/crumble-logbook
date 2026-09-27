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
 * Arena (아레나) or Rumble Arena (와글와글 아레나). The first is the default of
 * every `mode` column.
 */
export const GAME_MODE = ["guild_conquest", "arena", "rumble_arena"] as const;
export type GameMode = (typeof GAME_MODE)[number];

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

/** Lifecycle status of a background job. */
export const JOB_STATUS = ["queued", "running", "done", "failed", "cancelled"] as const;
export type JobStatus = (typeof JOB_STATUS)[number];

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
] as const;
export type CitedEntity = (typeof CITED_ENTITY)[number];
