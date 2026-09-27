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

/** Confidence assigned to a mechanic writeup. */
export const CONFIDENCE = ["high", "medium", "low"] as const;
export type Confidence = (typeof CONFIDENCE)[number];

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
] as const;
export type CitedEntity = (typeof CITED_ENTITY)[number];
