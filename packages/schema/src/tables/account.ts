import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ACCOUNT_PRIORITY, GAME_MODE } from "../enums";

/*
 * The reader's own game account: dated snapshots of what the account holds
 * (a lineup per mode, the pets, the resources, what the audit couldn't
 * read) and dated roadmaps of what to improve next. No research record
 * owns these rows: `pnpm import:account` loads them from `account/`, each
 * snapshot or roadmap keyed by its file's name, so older ones stay loaded
 * next to the latest for an audit to compare against.
 */

/** One pet the account owns, as the snapshot names it, with what else it says about it. */
export interface AccountPet {
  /** The pet's name or glossary key, as the snapshot gives it. */
  name: string;
  /** The game resource key (`pet4001`), when the snapshot gives one. */
  key: string | null;
  /** Its rarity, stars and promotion, each as a short chip. */
  chips: string[];
  /** What else the snapshot says about it (its effects), as one line. */
  detail: string | null;
}

/** A parked avenue of a roadmap: one the audit looked at and set aside, and why. */
export interface AccountParked {
  /** The avenue, as the roadmap names it. */
  avenue: string;
  /** Why it is parked, in a line. */
  why: string | null;
  refs: AccountRef[];
}

/** One resource balance, as the snapshot names and states it. */
export interface AccountResource {
  /** The resource, as the snapshot names it. */
  name: string;
  /** The amount, as the snapshot writes it. */
  value: string;
  /**
   * When the amount was read, for one read again later than its section
   * (its `capturedAt`, or `later` when it gives none); absent otherwise.
   */
  at?: string;
}

/**
 * Where a roadmap item points: a research record's row (a deck, say) by
 * its record and id, or a bare id when the roadmap names no record.
 */
export interface AccountRef {
  /** The research record's slug, e.g. `002-pvp-meta`; null when not named. */
  record: string | null;
  /** The kind of row the id names (`deck`, a cited entity), when the roadmap says. */
  entity: string | null;
  /** The row's id within its kind, e.g. a deck slug. */
  id: string;
  /** A label the roadmap gives the reference, when it gives one. */
  label: string | null;
}

/**
 * One account snapshot: what the account held when the audit read it.
 * `id` is the file's name without `.json` (`2026-10-07`), and `date` the
 * day it leads with.
 */
export const accountSnapshots = sqliteTable("account_snapshots", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  capturedAt: text("captured_at"),
  /** The file it was imported from, relative to `account/`. */
  file: text("file").notNull(),
  /** The account's own figures (level, combat power, rank), as the snapshot writes them. */
  profile: text("profile", { mode: "json" })
    .$type<AccountResource[]>()
    .notNull()
    .$defaultFn(() => []),
  pets: text("pets", { mode: "json" })
    .$type<AccountPet[]>()
    .notNull()
    .$defaultFn(() => []),
  resources: text("resources", { mode: "json" })
    .$type<AccountResource[]>()
    .notNull()
    .$defaultFn(() => []),
  /** What the audit couldn't read, one short line each. */
  unread: text("unread", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []),
  /** Every top-level field of the file the import doesn't map, kept as written. */
  extra: text("extra", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .$defaultFn(() => ({})),
});

/**
 * One lineup of a snapshot: the team the account runs in one mode.
 * `lineup` is the snapshot's own key for it (`arena`, `rift`), and
 * `gameMode` the app's game mode it maps to, when one does.
 */
export const accountLineups = sqliteTable("account_lineups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => accountSnapshots.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  lineup: text("lineup").notNull(),
  label: text("label"),
  gameMode: text("game_mode", { enum: GAME_MODE }),
  /** The lineup's team power, as the snapshot writes it. */
  power: text("power"),
  /** The captain's name or glossary key, when the snapshot names one. */
  captain: text("captain"),
  /** The lineup's pets, by name, in order. */
  pets: text("pets", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []),
  /** The gear preset the lineup plays with, as the snapshot names it. */
  gearPreset: text("gear_preset"),
  /** The research deck the lineup matches, when the snapshot names one. */
  deck: text("deck", { mode: "json" }).$type<AccountRef>(),
  /** What the snapshot says about the lineup's cookies when it doesn't list them. */
  note: text("note"),
  extra: text("extra", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .$defaultFn(() => ({})),
});

/**
 * One cookie of a lineup, in formation order: its name or glossary key as
 * the snapshot gives it, its level, stars and skill level, and its gear,
 * runes and pet as short chips.
 */
export const accountCookies = sqliteTable("account_cookies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lineupId: integer("lineup_id")
    .notNull()
    .references(() => accountLineups.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  name: text("name").notNull(),
  /** The game resource key (`cookie0038`), when the snapshot gives one. */
  resourceKey: text("resource_key"),
  level: text("level"),
  stars: text("stars"),
  skillLevel: text("skill_level"),
  /** The cookie's own power, as the snapshot writes it. */
  power: text("power"),
  promotion: text("promotion"),
  gear: text("gear", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []),
  runes: text("runes", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []),
  pet: text("pet"),
  extra: text("extra", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .$defaultFn(() => ({})),
});

/**
 * One roadmap: the ordered improvements an audit recommends. `id` is the
 * file's name without `.json` and the `roadmap-` prefix.
 */
export const accountRoadmaps = sqliteTable("account_roadmaps", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  file: text("file").notNull(),
  /** The snapshot the roadmap was written from, when it says. */
  snapshotId: text("snapshot_id"),
  /** The roadmap's verdict on the account, in a line or two. */
  verdict: text("verdict"),
  /** The avenues the audit looked at and set aside. */
  parked: text("parked", { mode: "json" })
    .$type<AccountParked[]>()
    .notNull()
    .$defaultFn(() => []),
  extra: text("extra", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .$defaultFn(() => ({})),
});

/**
 * One roadmap item, in the roadmap's order: when to do it (`priority`),
 * the area it improves, the action in a line, why, its payoff and cost,
 * and the research rows it points at.
 */
export const accountRoadmapItems = sqliteTable("account_roadmap_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roadmapId: text("roadmap_id")
    .notNull()
    .references(() => accountRoadmaps.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  priority: text("priority", { enum: ACCOUNT_PRIORITY }).notNull(),
  area: text("area"),
  action: text("action").notNull(),
  why: text("why"),
  payoff: text("payoff"),
  cost: text("cost"),
  refs: text("refs", { mode: "json" })
    .$type<AccountRef[]>()
    .notNull()
    .$defaultFn(() => []),
  extra: text("extra", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .$defaultFn(() => ({})),
});
