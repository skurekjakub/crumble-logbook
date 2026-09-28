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
 * Arena (아레나), Rumble Arena (와글와글 아레나), stage pushing (main
 * stages and the Dimensional Rift), Crumble Dungeon (크럼블 던전, the
 * score attack against the Holy Golden Drop), or team power growth
 * (전투력: what raises the power the game shows for a lineup, and at what
 * cost). The first is the default of every `mode` column.
 */
export const GAME_MODE = [
  "guild_conquest",
  "arena",
  "rumble_arena",
  "stage",
  "crumble_dungeon",
  "team_power",
] as const;
export type GameMode = (typeof GAME_MODE)[number];

/** Where a power source's power counts: main stages, the Dimensional Rift, Arena, Guild Conquest. */
export const POWER_PLACE = ["stage", "rift", "arena", "conquest"] as const;
export type PowerPlace = (typeof POWER_PLACE)[number];

/**
 * What a power source's materials cost: nothing (`free`), time a free
 * player waits out (`time_gated`), money (`paid`), or free and paid
 * routes to the same materials (`mixed`).
 */
export const COST_TYPE = ["free", "time_gated", "paid", "mixed"] as const;
export type CostType = (typeof COST_TYPE)[number];

/**
 * How a team-power figure is known: a player's own before/after figure
 * (`posted`), a figure stated without a measurement (`claimed`), or a
 * research record's arithmetic on posted or game-data figures (`inferred`).
 */
export const DATA_POINT_KIND = ["posted", "claimed", "inferred"] as const;
export type DataPointKind = (typeof DATA_POINT_KIND)[number];

/** The spender a package suits: a light, medium or heavy (`whale`) spender, or none. */
export const PACKAGE_TIER = ["light", "medium", "whale", "none"] as const;
export type PackageTier = (typeof PACKAGE_TIER)[number];

/** Which route a spending step is on: a free player's or a paying one's. */
export const SPEND_ROUTE = ["free", "paid"] as const;
export type SpendRoute = (typeof SPEND_ROUTE)[number];

/**
 * What a ranked step's place rests on: a posted team-power gain
 * (`posted`), a figure stated without a measurement (`claimed`), a gain
 * nobody measured (`unmeasured`), or the community's stated order alone
 * (`community`).
 */
export const STEP_BASIS = ["posted", "claimed", "unmeasured", "community"] as const;
export type StepBasis = (typeof STEP_BASIS)[number];

/**
 * What a spending order covers: one account stage (`stage`), or one
 * account's ranking of every power source and package (`ranked`).
 */
export const SPENDING_ORDER_KIND = ["stage", "ranked"] as const;
export type SpendingOrderKind = (typeof SPENDING_ORDER_KIND)[number];

/**
 * What a documented Crumble Dungeon score was shown on: the result screen
 * of one run (`run`), a weekly board's entry for the week's best run
 * (`weekly-best`), or a claim naming a score without showing it (`claim`).
 */
export const DUNGEON_BOARD = ["run", "weekly-best", "claim"] as const;
export type DungeonBoard = (typeof DUNGEON_BOARD)[number];

/** What backs a documented Crumble Dungeon score: a screenshot, a video, or text alone. */
export const RUN_EVIDENCE = ["screenshot", "video", "text"] as const;
export type RunEvidence = (typeof RUN_EVIDENCE)[number];

/**
 * Whether a documented Crumble Dungeon score is shown or only claimed:
 * `verified` when a screenshot or video shows it, `claim` when text alone
 * states it. Read from the evidence on every write, never given.
 */
export const RUN_STANDING = ["verified", "claim"] as const;
export type RunStanding = (typeof RUN_STANDING)[number];

/**
 * Why a cookie is kept out of Crumble Dungeon's first 40: it charges off
 * and drags the healers after it (`charger`), its summons spread the
 * formation (`summoner`), it takes Pomegranate's beam through the
 * Projectile Speed synergy (`projectile-speed`), or its buff overwrites a
 * stacked one (`buff-overwrite`).
 */
export const EXCLUSION_CLASS = [
  "charger",
  "summoner",
  "projectile-speed",
  "buff-overwrite",
] as const;
export type ExclusionClass = (typeof EXCLUSION_CLASS)[number];

/**
 * Where an exclusion stands: players keep the cookie out (`excluded`),
 * they disagree (`disputed`), or a patch removed the reason (`patched`).
 */
export const EXCLUSION_STATUS = ["excluded", "disputed", "patched"] as const;
export type ExclusionStatus = (typeof EXCLUSION_STATUS)[number];

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
  "dungeon_run",
  "dungeon_lineup",
  "dungeon_exclusion",
  "power_source",
  "power_data_point",
  "package",
  "price_tier",
  "spending_order",
  "spending_step",
  "growth_curve",
  "planner_step",
] as const;
export type CitedEntity = (typeof CITED_ENTITY)[number];
