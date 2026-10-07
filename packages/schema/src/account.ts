/**
 * The account audit's files, as `pnpm import:account` reads them: an
 * account snapshot (`account/snapshots/<date>.json`) and a roadmap
 * (`account/roadmap-<date>.json`); `account/README.md` describes both. The
 * audit's shape is still settling, so the schemas read it loosely, under a
 * few names for a field, and normalise it on parse: a figure becomes text,
 * runes, pets and resources become short chips, a lineup's cookies get
 * their level, stars and runes from the snapshot's cookie list, and any
 * field they don't map is kept under `extra`. Screenshots (`screens`
 * lists, `screenshot…` fields, image paths) are dropped everywhere: they
 * stay local. The schemas fail
 * only where nothing usable is left: a cookie with no name, a roadmap item
 * with no action or an unknown priority.
 *
 * @module
 */
import { z } from "zod";
import type { AccountPriority, GameMode } from "./enums";
import { ACCOUNT_PRIORITY } from "./enums";
import type * as t from "./tables";
import type { AccountParked, AccountPet, AccountRef, AccountResource } from "./tables/account";

/** A row selected from `account_snapshots`. */
export type AccountSnapshotRow = typeof t.accountSnapshots.$inferSelect;
/** A row selected from `account_lineups`. */
export type AccountLineupRow = typeof t.accountLineups.$inferSelect;
/** A row selected from `account_cookies`. */
export type AccountCookieRow = typeof t.accountCookies.$inferSelect;
/** A row selected from `account_roadmaps`. */
export type AccountRoadmapRow = typeof t.accountRoadmaps.$inferSelect;
/** A row selected from `account_roadmap_items`. */
export type AccountRoadmapItemRow = typeof t.accountRoadmapItems.$inferSelect;

/** A plain JSON object, as the loose schemas pass one through. */
type Obj = Record<string, unknown>;

/**
 * The fields the import never keeps, the screenshots behind a section,
 * which stay local: `screen`, `screens` and any field whose name starts
 * with `screenshot`, in any case.
 */
const SCREEN_FIELD = /^(?:screens?$|screenshot)/i;

/** A path to an image file, which the import never keeps either. */
const IMAGE_FILE = /\.(?:png|jpe?g|webp|gif|bmp|avif|heic|tiff?)$/i;

/** The fields that date a section, which no chip shows. */
const DATING = ["capturedAt", "captured_at"];

/**
 * Reports whether a value is a plain JSON object (not an array or null).
 *
 * @param value - any parsed JSON value
 * @returns `true` for an object
 */
function isObj(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Reports whether a value is a string naming an image file
 * (`arena-def.jpg`), as a screenshot's path does.
 *
 * @param value - any parsed JSON value
 * @returns `true` for an image path
 */
function isImagePath(value: unknown): boolean {
  return typeof value === "string" && IMAGE_FILE.test(value.trim());
}

/**
 * Removes every screenshot from a value, at any depth: the fields named
 * like one (`screen`, `screens`, `screenshot…`), and any string ending in
 * an image extension, as a field's value or a list's entry.
 *
 * @param value - any parsed JSON value
 * @returns the value without them
 */
export function withoutScreens(value: unknown): unknown {
  if (Array.isArray(value)) return value.filter((v) => !isImagePath(v)).map(withoutScreens);
  if (!isObj(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, inner]) => !SCREEN_FIELD.test(key) && !isImagePath(inner))
      .map(([key, inner]) => [key, withoutScreens(inner)]),
  );
}

/**
 * Reads a figure as text: a string as it is (trimmed), a number or a
 * boolean as written.
 *
 * @param value - the value
 * @returns the text, or `null` for nothing, an empty string or a non-scalar
 */
export function textOf(value: unknown): string | null {
  if (typeof value === "string") return value.trim() === "" ? null : value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}

/**
 * The first of an object's fields, by name, that holds a figure.
 *
 * @param obj - the object
 * @param names - the field names to try, in order
 * @returns that field's value as text, or `null` when none holds one
 */
function pick(obj: Obj, names: readonly string[]): string | null {
  for (const name of names) {
    const value = textOf(obj[name]);
    if (value !== null) return value;
  }
  return null;
}

/** The fields an object's chip leads with: what it is. */
const HEAD = ["name", "set", "item", "label", "kr", "en", "type", "stat", "key", "id"] as const;

/**
 * Words one object as a single chip: its slot, what it is, then its grade,
 * level, stars, enhancement and value (`weapon: Sword SSR Lv.3 5★ +12`).
 *
 * @param obj - the object
 * @param head - what it is, from its {@link HEAD} field
 * @returns the chip
 */
function objectChip(obj: Obj, head: string): string {
  const level = pick(obj, ["level", "lv"]);
  const stars = pick(obj, ["stars", "star"]);
  const plus = pick(obj, ["plus", "enhance", "enhancement"]);
  const parts = [
    head,
    pick(obj, ["grade", "rarity", "tier"]),
    level === null ? null : /^\d+$/.test(level) ? `Lv.${level}` : level,
    stars === null ? null : /^\d+$/.test(stars) ? `${stars}★` : stars,
    plus === null ? null : /^\d+$/.test(plus) ? `+${plus}` : plus,
    pick(obj, ["value", "amount"]),
  ].filter((part) => part !== null);
  const slot = pick(obj, ["slot", "part"]);
  return `${slot === null ? "" : `${slot}: `}${parts.join(" ")}`;
}

/**
 * Words any value as short chips: a figure is one chip, a list a chip per
 * entry, an object that says what it is one chip (see `objectChip`), and
 * any other object a chip per field (`key: value`), its dating left out.
 *
 * @param value - the value, of any JSON shape
 * @returns the chips, in order; `[]` for nothing
 */
export function chipsOf(value: unknown): string[] {
  const text = textOf(value);
  if (text !== null) return [text];
  if (Array.isArray(value)) return value.flatMap(chipsOf);
  if (!isObj(value)) return [];
  const head = pick(value, HEAD);
  if (head !== null) return [objectChip(value, head)];
  return Object.entries(value)
    .filter(([key]) => !DATING.includes(key))
    .flatMap(([key, inner]) => chipsOf(inner).map((chip) => `${key}: ${chip}`));
}

/**
 * Words a section's value as one line: a figure as it is, a list's
 * figures joined by ` · `, and an object's figures (its readings in
 * order) joined by ` → `, its notes and dating left out.
 *
 * @param value - the value as written
 * @returns the line, or `null` for nothing (a value that wasn't read)
 */
function lineOf(value: unknown): string | null {
  const text = textOf(value);
  if (text !== null) return text;
  if (Array.isArray(value)) return value.flatMap(chipsOf).join(" · ") || null;
  if (!isObj(value)) return null;
  const readings = Object.entries(value)
    .filter(([key, inner]) => !DATING.includes(key) && typeof inner === "number")
    .map(([, inner]) => String(inner));
  return readings.length > 0 ? readings.join(" → ") : chipsOf(value).join(" · ") || null;
}

/**
 * The object without the named fields, for `extra`: what the schema
 * doesn't map, kept as written.
 *
 * @param obj - the object
 * @param mapped - the fields the schema maps
 * @returns the remaining fields
 */
function rest(obj: Obj, mapped: readonly string[]): Obj {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !mapped.includes(key)));
}

/**
 * A schema that parses a list with `list` and anything else with `other`,
 * reporting the chosen schema's own issues (where a union would report
 * only that no option matched).
 *
 * @param list - the schema for a list
 * @param other - the schema for any other value
 * @returns the combined schema
 */
function listOr<L extends z.ZodType, O extends z.ZodType>(list: L, other: O) {
  return z.unknown().transform((value, ctx): z.output<L> | z.output<O> => {
    const parsed = Array.isArray(value) ? list.safeParse(value) : other.safeParse(value);
    if (parsed.success) return parsed.data;
    for (const issue of parsed.error.issues) {
      ctx.addIssue({ code: "custom", message: issue.message, path: [...issue.path] });
    }
    return z.NEVER;
  });
}

/** A game resource key: `cookie` or `pet`, then digits. */
const RESOURCE_KEY = /^(?:cookie|pet)\d+$/;

/** The fields a cookie may name itself by, most specific first. */
const COOKIE_NAME = ["kr", "key", "name", "cookie", "en", "id"] as const;

/** The fields a cookie's game resource key may sit under. */
const COOKIE_KEY = ["resourceKey", "resource_key", "key", "id"] as const;

/** The fields of a cookie the schema maps, besides its name. */
const COOKIE_FIELDS = [
  "resourceKey",
  "resource_key",
  "level",
  "lv",
  "stars",
  "star",
  "skillLevel",
  "skill_level",
  "skillTier",
  "skill",
  "power",
  "promotion",
  "gear",
  "runes",
  "rune",
  "pet",
] as const;

/**
 * The game resource key an object names, when one of its key fields holds one.
 *
 * @param obj - a cookie or pet
 * @returns the key, or `null`
 */
function resourceKeyOf(obj: Obj): string | null {
  for (const field of COOKIE_KEY) {
    const value = textOf(obj[field]);
    if (value !== null && RESOURCE_KEY.test(value)) return value;
  }
  return null;
}

/** Rune stats whose short label isn't their words title-cased. */
const RUNE_STAT_LABEL: Record<string, string> = { critRate: "CRIT%", dmgReduction: "DR" };

/** Words a rune stat's label writes in capitals, as the game does. */
const STAT_ABBREVIATIONS = new Set(["atk", "def", "hp", "crit", "dmg", "amp", "res", "spd"]);

/**
 * A rune stat as a short label: `skillAmp` → `Skill AMP`, `atkAmp` →
 * `ATK AMP`, `critRate` → `CRIT%`. A stat already in words keeps them,
 * its abbreviations capitalised.
 *
 * @param stat - the stat as the snapshot names it, in camelCase, snake_case or words
 * @returns the label
 */
export function runeStatLabel(stat: string): string {
  const known = RUNE_STAT_LABEL[stat];
  if (known !== undefined) return known;
  return stat
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter((word) => word !== "")
    .map((word) => {
      const lower = word.toLowerCase();
      return STAT_ABBREVIATIONS.has(lower)
        ? lower.toUpperCase()
        : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/**
 * Words a cookie's runes as chips: rune lines that name a `stat` are
 * summed per stat under its short label (`Skill Haste 21 ×5`), in the
 * order the stats first appear. Only lines whose value is a number count
 * toward the sum and its `×N`; lines whose value wasn't read (null, or
 * text) show as `+N?` after it, or as `?` when none of the stat's lines
 * was read. Runes of any other shape become chips as they are.
 *
 * @param value - the runes as written
 * @returns the chips
 */
export function runeChips(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((r) => isObj(r) && textOf(r.stat) !== null)) {
    return chipsOf(value);
  }
  const byStat = new Map<string, { sum: number; read: number; unread: number }>();
  for (const rune of value as Obj[]) {
    const stat = textOf(rune.stat)!;
    const entry = byStat.get(stat) ?? { sum: 0, read: 0, unread: 0 };
    if (typeof rune.value === "number") {
      entry.sum += rune.value;
      entry.read += 1;
    } else {
      entry.unread += 1;
    }
    byStat.set(stat, entry);
  }
  return [...byStat].map(([stat, { sum, read, unread }]) => {
    const label = runeStatLabel(stat);
    if (read === 0) return `${label} ?${unread > 1 ? ` ×${unread}` : ""}`;
    const total = Math.round(sum * 100) / 100;
    return `${label} ${total}${read > 1 ? ` ×${read}` : ""}${unread > 0 ? ` +${unread}?` : ""}`;
  });
}

/** One cookie of an account lineup, normalised. */
export interface AccountCookieInput {
  /** The name or glossary key the snapshot gives, as written. */
  name: string;
  /** The game resource key, when given (or when the name is one). */
  resourceKey: string | null;
  level: string | null;
  stars: string | null;
  /** The skill level, or the star-gated skill tier when that is what was read. */
  skillLevel: string | null;
  power: string | null;
  promotion: string | null;
  /** The gear, a chip per piece. */
  gear: string[];
  /** The runes, a chip per stat (see {@link runeChips}). */
  runes: string[];
  /** The pet, as one line. */
  pet: string | null;
  /** The cookie's fields other than its name and figures, as written. */
  extra: Obj;
}

/**
 * Normalises one cookie object.
 *
 * @param obj - the cookie, its details from the snapshot's cookie list merged in
 * @param name - its name, from {@link COOKIE_NAME}
 * @returns the cookie
 */
function toCookie(obj: Obj, name: string): AccountCookieInput {
  return {
    name,
    resourceKey: resourceKeyOf(obj),
    level: pick(obj, ["level", "lv"]),
    stars: pick(obj, ["stars", "star"]),
    skillLevel: pick(obj, ["skillLevel", "skill_level", "skillTier", "skill"]),
    power: pick(obj, ["power"]),
    promotion: pick(obj, ["promotion"]),
    gear: chipsOf(obj.gear),
    runes: runeChips(obj.runes ?? obj.rune),
    pet: chipsOf(obj.pet).join(" · ") || null,
    extra: rest(obj, [
      ...COOKIE_NAME.filter((field) => textOf(obj[field]) === name),
      ...COOKIE_FIELDS,
    ]),
  };
}

/**
 * One cookie as a snapshot writes it: a bare name, or an object naming it
 * by its glossary key or id (`kr`, `key`, `name`, `cookie`, `en` or `id`),
 * with an optional `resourceKey`, and optional `level`, `stars`,
 * `skillLevel` (or `skillTier`), `power`, `promotion`, `gear`, `runes` and
 * `pet` of any shape. Parses to the cookie's object and name; the
 * snapshot schema completes it from the cookie list.
 */
export const accountCookieFile = z
  .union([z.string().min(1), z.looseObject({})])
  .transform((raw, ctx): { obj: Obj; name: string } => {
    const obj: Obj = typeof raw === "string" ? { name: raw } : raw;
    const name = pick(obj, COOKIE_NAME);
    if (name === null) {
      ctx.addIssue({
        code: "custom",
        message: `a cookie needs a name: one of ${COOKIE_NAME.join(", ")}`,
      });
      return z.NEVER;
    }
    return { obj, name };
  });

/** A parsed cookie before the snapshot completes it. */
type RawCookie = z.output<typeof accountCookieFile>;

/** One lineup of a snapshot, normalised. */
export interface AccountLineupInput {
  /** The snapshot's key for the lineup, e.g. `arena_def`. */
  lineup: string;
  /** A label the snapshot gives it, when it gives one. */
  label: string | null;
  /** The game mode it plays in, from its `mode` or its key. */
  gameMode: GameMode | null;
  /** The lineup's team power, as written. */
  power: string | null;
  /** The captain's name or key. */
  captain: string | null;
  /** The lineup's pets, by name. */
  pets: string[];
  gearPreset: string | null;
  /** The research deck it matches, when the snapshot names one. */
  deck: AccountRef | null;
  /** What the snapshot says instead of listing the cookies. */
  note: string | null;
  cookies: AccountCookieInput[];
  /** The lineup's other fields, as written. */
  extra: Obj;
}

/** The fields a lineup's cookies may sit under. */
const LINEUP_COOKIES = ["cookies", "rows", "team", "members", "lineup"] as const;

/** The fields a lineup's key may sit under, in a list of lineups. */
const LINEUP_KEY = ["key", "id", "mode"] as const;

/** The fields of a lineup the schema maps, besides its cookies. */
const LINEUP_FIELDS = [
  ...LINEUP_KEY,
  "label",
  "name",
  "title",
  "power",
  "teamPower",
  "team_power",
  "captain",
  "pets",
  "gearPreset",
  "gear_preset",
  "matchesDeck",
  "deck",
  "rowsNote",
  "note",
] as const;

/** A list of cookies, or of rows of cookies. */
const cookieList = z.array(listOr(z.array(accountCookieFile), accountCookieFile));

/** A lineup's cookies: a list (of cookies, or of rows of cookies) or a note in their place. */
const lineupCookies = z
  .unknown()
  .transform((value, ctx): Array<RawCookie | RawCookie[]> | string => {
    if (typeof value === "string") return value;
    const parsed = cookieList.safeParse(value);
    if (parsed.success) return parsed.data;
    for (const issue of parsed.error.issues) {
      ctx.addIssue({ code: "custom", message: issue.message, path: [...issue.path] });
    }
    return z.NEVER;
  });

/** A lineup, parsed but not yet completed from the cookie list. */
interface RawLineup {
  lineup: string;
  /** The lineup as written. */
  obj: Obj;
  /** Its cookies, flattened, or the note written in their place. */
  cookies: RawCookie[] | string;
}

/**
 * A lineup as a snapshot writes it: a list of cookies, or an object
 * holding them under `cookies` or `rows` (a list, or a list of rows), or
 * a note in their place (`"same as arena_def"` reuses that lineup's cookies).
 */
const lineupBody = listOr(
  cookieList,
  z.looseObject(
    Object.fromEntries(LINEUP_COOKIES.map((field) => [field, lineupCookies.optional()])),
  ),
);

/**
 * Reads one lineup.
 *
 * @param key - the snapshot's key for it
 * @param body - the lineup as parsed
 * @returns the lineup, its cookies flattened
 */
function toRawLineup(key: string, body: z.output<typeof lineupBody>): RawLineup {
  if (Array.isArray(body)) return { lineup: key, obj: {}, cookies: body.flat() };
  const listed = LINEUP_COOKIES.map((field) => body[field]).find((v) => v !== undefined);
  return {
    lineup: key,
    obj: body,
    cookies: typeof listed === "string" ? listed : (listed ?? []).flat(),
  };
}

/**
 * A snapshot's lineups: an object keyed by lineup (`{ "arena_def": ... }`),
 * or a list whose entries each name themselves (`key`, `id` or `mode`).
 */
const lineupsFile = listOr(
  z.array(
    z.looseObject({}).transform((obj, ctx) => {
      const key = pick(obj, LINEUP_KEY);
      if (key === null) {
        ctx.addIssue({
          code: "custom",
          message: `a lineup in a list needs its key: one of ${LINEUP_KEY.join(", ")}`,
        });
        return z.NEVER;
      }
      const body = lineupBody.safeParse(obj);
      if (!body.success) {
        for (const issue of body.error.issues) {
          ctx.addIssue({ code: "custom", message: issue.message, path: [...issue.path] });
        }
        return z.NEVER;
      }
      return toRawLineup(key, body.data);
    }),
  ),
  z
    .record(z.string(), lineupBody)
    .transform((byKey) => Object.entries(byKey).map(([key, body]) => toRawLineup(key, body))),
);

/**
 * Indexes the snapshot's cookie list (`cookies.list`, or `cookies` as a
 * list) by every name and key each cookie gives.
 *
 * @param value - the snapshot's `cookies`
 * @returns name or key → the cookie's object
 */
function cookieIndex(value: unknown): Map<string, Obj> {
  const list = Array.isArray(value) ? value : isObj(value) ? value.list : undefined;
  const index = new Map<string, Obj>();
  if (!Array.isArray(list)) return index;
  for (const cookie of list) {
    if (!isObj(cookie)) continue;
    for (const field of [...COOKIE_NAME, ...COOKIE_KEY]) {
      const name = textOf(cookie[field]);
      if (name !== null && !index.has(name)) index.set(name, cookie);
    }
  }
  return index;
}

/**
 * The lineup key a `same as <key>` note names, its trailing punctuation
 * left out (`same as arena_def.` names `arena_def`).
 *
 * @param text - the note written in place of a lineup's cookies
 * @returns the key, or `null` when the note isn't a `same as`
 */
export function sameAsKey(text: string): string | null {
  const key = /^\s*same as\s+(\S+)/i.exec(text)?.[1]?.replace(/[.,;:!?)\]}"']+$/, "");
  return key ? key : null;
}

/**
 * Follows a lineup's `same as <key>` note to the cookies it copies,
 * through any chain of `same as` notes.
 *
 * @param from - the lineup whose note it is
 * @param key - the key its note names
 * @param byKey - every lineup, by key
 * @returns the cookies, or why the chain names none
 */
function followSameAs(
  from: string,
  key: string,
  byKey: ReadonlyMap<string, RawLineup>,
): { cookies: RawCookie[] } | { miss: string } {
  const seen = new Set([from]);
  for (let next = key; ;) {
    if (seen.has(next)) return { miss: `loops back to ${next}` };
    seen.add(next);
    const target = byKey.get(next);
    if (target === undefined) return { miss: `names no lineup ${next}` };
    if (Array.isArray(target.cookies)) return { cookies: target.cookies };
    const further = sameAsKey(target.cookies);
    if (further === null) return { miss: `leads to ${next}, which lists no cookies` };
    next = further;
  }
}

/** A snapshot's lineups, completed, and what couldn't be completed. */
interface CompletedLineups {
  lineups: AccountLineupInput[];
  /** A line per `same as` note that names no lineup's cookies. */
  issues: string[];
}

/**
 * Completes a snapshot's lineups: each cookie gets the details the cookie
 * list holds for it (its own fields win), and a lineup whose cookies are
 * written as `same as <key>` gets that lineup's cookies, following a chain
 * of such notes. A note that names no lineup's cookies stays as the
 * lineup's note, and is reported.
 *
 * @param raw - the lineups as parsed
 * @param index - the cookie list, by name and key
 * @returns the lineups and the notes that named none
 */
function completeLineups(raw: readonly RawLineup[], index: Map<string, Obj>): CompletedLineups {
  /**
   * Completes one parsed cookie from the cookie list.
   *
   * @param cookie - the cookie as the lineup writes it
   * @returns the cookie
   */
  const complete = ({ obj, name }: RawCookie): AccountCookieInput => {
    const key = resourceKeyOf(obj);
    const details = (key === null ? undefined : index.get(key)) ?? index.get(name) ?? {};
    return toCookie({ ...details, ...obj }, name);
  };
  const byKey = new Map(raw.map((lineup) => [lineup.lineup, lineup]));
  const issues: string[] = [];
  const lineups = raw.map(({ lineup, obj, cookies }): AccountLineupInput => {
    const text = typeof cookies === "string" ? cookies : null;
    const same = text === null ? null : sameAsKey(text);
    const followed = same === null ? null : followSameAs(lineup, same, byKey);
    if (followed !== null && "miss" in followed) {
      issues.push(`lineups.${lineup}: "${text}" ${followed.miss}; kept as its note`);
    }
    const listed = Array.isArray(cookies)
      ? cookies
      : followed !== null && "cookies" in followed
        ? followed.cookies
        : [];
    const written = pick(obj, ["rowsNote", "note"]);
    const unlisted = typeof cookies === "string" && listed.length === 0 ? cookies : null;
    const captain = obj.captain;
    const deck = refOf(obj.matchesDeck ?? obj.deck);
    return {
      lineup,
      label: pick(obj, ["label", "name", "title"]),
      gameMode: lineupMode(pick(obj, ["mode"]) ?? lineup),
      power: pick(obj, ["power", "teamPower", "team_power"]),
      captain: isObj(captain)
        ? (resourceKeyOf(captain) ?? pick(captain, COOKIE_NAME))
        : textOf(captain),
      pets: chipsOf(obj.pets),
      gearPreset: pick(obj, ["gearPreset", "gear_preset"]),
      deck: deck && deck.entity === null ? { ...deck, entity: "deck" } : deck,
      note: [written, unlisted].filter((part) => part !== null).join(" · ") || null,
      cookies: listed.map(complete),
      extra: rest(obj, [...LINEUP_COOKIES, ...LINEUP_FIELDS]),
    };
  });
  return { lineups, issues };
}

/**
 * Normalises a pets list: a list of names or objects, an object holding
 * one under `list`, or an object keyed by name.
 *
 * @param value - the pets as written
 * @returns one entry per pet
 */
function petsOf(value: unknown): AccountPet[] {
  const list = isObj(value) && Array.isArray(value.list) ? value.list : value;
  const entries: Array<[string | null, unknown]> = Array.isArray(list)
    ? list.map((pet) => [null, pet])
    : isObj(list)
      ? Object.entries(list)
      : [];
  return entries.flatMap(([key, pet]) => {
    const obj: Obj = isObj(pet)
      ? pet
      : { name: key ?? pet, ...(key === null ? {} : { value: pet }) };
    const name = key ?? pick(obj, ["name", "kr", "en", "key", "id"]);
    if (name === null) return [];
    const stars = pick(obj, ["stars", "star"]);
    const level = pick(obj, ["level", "lv"]);
    const promotion = pick(obj, ["promotion"]);
    const mapped = ["name", "kr", "en", "key", "id", "resourceKey", "resource_key"];
    const figures = ["rarity", "grade", "stars", "star", "level", "lv", "promotion"];
    return [
      {
        name,
        key: resourceKeyOf(obj),
        chips: [
          pick(obj, ["rarity", "grade"]),
          stars === null ? null : /^\d+$/.test(stars) ? `${stars}★` : stars,
          level === null ? null : /^\d+$/.test(level) ? `Lv.${level}` : level,
          promotion === null ? null : `promo ${promotion}`,
        ].filter((chip) => chip !== null),
        detail: lineOf(Object.values(rest(obj, [...mapped, ...figures, ...DATING]))) ?? null,
      },
    ];
  });
}

/**
 * Normalises a section of figures (the resources, the account's own): an
 * object of name → value, or a list of `{ name, value }` (or `amount`,
 * `count`) objects. A value that wasn't read (`null`) is left out; the
 * snapshot lists it under `unread`.
 *
 * @param value - the section as written
 * @returns one entry per figure read
 */
function figuresOf(value: unknown): AccountResource[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      if (!isObj(entry)) return [];
      const name = pick(entry, ["name", "kr", "key", "id", "resource"]);
      const amount = pick(entry, ["value", "amount", "count", "qty"]);
      return name === null || amount === null ? [] : [{ name, value: amount }];
    });
  }
  if (!isObj(value)) return [];
  return Object.entries(value)
    .filter(([name]) => !DATING.includes(name))
    .flatMap(([name, amount]) => {
      const line = lineOf(amount);
      return line === null ? [] : [{ name, value: line }];
    });
}

/**
 * Normalises what the audit couldn't read: each entry as one line (an
 * object's fields joined by ` · `).
 *
 * @param value - the list as written
 * @returns one line per entry
 */
function unreadOf(value: unknown): string[] {
  const list = Array.isArray(value) ? value : value == null ? [] : [value];
  return list.flatMap((entry) => {
    const line = isObj(entry) ? Object.values(entry).flatMap(chipsOf).join(" · ") : textOf(entry);
    return line ? [line] : [];
  });
}

/**
 * Reads the account's own figures: the scalar fields under `account` (or
 * `profile`), its dating left out. A later reading under `later` (with its
 * own `capturedAt`) replaces the figures it read again, each marked with
 * the time it was read, and adds any it read anew.
 *
 * @param file - the snapshot file
 * @returns one entry per figure, in the order they are written
 */
function profileOf(file: Obj): AccountResource[] {
  const section = isObj(file.account) ? file.account : isObj(file.profile) ? file.profile : null;
  if (section === null) return [];
  /**
   * Lists an object's scalar figures, its dating left out.
   *
   * @param obj - the section or its later reading
   * @returns name and value per figure
   */
  const scalars = (obj: Obj): AccountResource[] =>
    Object.entries(obj).flatMap(([name, value]) => {
      const text = DATING.includes(name) ? null : textOf(value);
      return text === null ? [] : [{ name, value: text }];
    });
  const figures = scalars(section);
  if (!isObj(section.later)) return figures;
  const at = pick(section.later, DATING) ?? "later";
  for (const figure of scalars(section.later)) {
    const index = figures.findIndex((f) => f.name === figure.name);
    if (index === -1) figures.push({ ...figure, at });
    else figures[index] = { ...figure, at };
  }
  return figures;
}

/** An account snapshot, normalised. */
export interface AccountSnapshotInput {
  capturedAt: string | null;
  /** The account's own figures (see `profileOf`). */
  profile: AccountResource[];
  lineups: AccountLineupInput[];
  pets: AccountPet[];
  resources: AccountResource[];
  unread: string[];
  /** The file's top-level fields the schema doesn't map, as written, screenshots left out. */
  extra: Obj;
  /**
   * What the file says that couldn't be read as meant, a line each: a
   * `same as` note that names no lineup's cookies. Reported, never stored.
   */
  issues: string[];
}

/** The top-level fields of a snapshot the schema maps. */
const SNAPSHOT_FIELDS = [
  "capturedAt",
  "captured_at",
  "account",
  "profile",
  "cookies",
  "lineups",
  "pets",
  "resources",
  "unread",
] as const;

/**
 * An account snapshot file: `capturedAt` (or `captured_at`), `account`,
 * `lineups`, `cookies` (the list the lineups' cookies are completed
 * from), `pets`, `resources` and `unread`, every one optional; any other
 * field is kept under `extra`, and screenshots are dropped (see
 * {@link withoutScreens}).
 */
export const accountSnapshotFile = z.preprocess(
  withoutScreens,
  z.looseObject({ lineups: lineupsFile.optional() }).transform((file): AccountSnapshotInput => {
    const { lineups, issues } = completeLineups(file.lineups ?? [], cookieIndex(file.cookies));
    return {
      capturedAt: pick(file, ["capturedAt", "captured_at"]),
      profile: profileOf(file),
      lineups,
      pets: petsOf(file.pets),
      resources: figuresOf(file.resources),
      unread: unreadOf(file.unread),
      extra: rest(file, SNAPSHOT_FIELDS),
      issues,
    };
  }),
);

/**
 * The last segment of a path, without its extension.
 *
 * @param file - e.g. `curated/runes.json`
 * @returns e.g. `runes`
 */
function baseName(file: string): string {
  return file
    .split("/")
    .at(-1)!
    .replace(/\.[^.]+$/, "");
}

/**
 * Reads a roadmap reference: an object (`record` or `recordSlug`, `entity`
 * or `kind`, and `id`, `deck`, `slug` or a record `file`), or a string
 * `<record>#<id>`, `<record>#<entity>:<id>` or a bare `<id>`.
 *
 * @param value - the reference as written
 * @returns the reference, or `null` when it names nothing
 */
export function refOf(value: unknown): AccountRef | null {
  if (typeof value === "string") {
    const [first, second] = value.split("#", 2) as [string, string | undefined];
    const target = second ?? first;
    const typed = /^([a-z_]+):(.+)$/.exec(target);
    return {
      record: second === undefined ? null : first || null,
      entity: typed ? typed[1]! : null,
      id: typed ? typed[2]! : target,
      label: null,
    };
  }
  if (!isObj(value)) return null;
  const record = pick(value, ["record", "recordSlug", "record_slug"]);
  const label = pick(value, ["label", "name", "title"]);
  const deck = pick(value, ["deck"]);
  const id = deck ?? pick(value, ["id", "slug", "entityId", "entity_id"]);
  if (id !== null) {
    return {
      record,
      entity: deck !== null ? "deck" : pick(value, ["entity", "kind", "type"]),
      id,
      label,
    };
  }
  const file = pick(value, ["file", "path"]);
  if (file !== null) return { record, entity: "file", id: file, label: label ?? baseName(file) };
  return record === null ? null : { record, entity: "record", id: record, label };
}

/**
 * Reads a list of references (or one), keeping those that name something.
 *
 * @param value - the references as written
 * @returns the references
 */
function refsOf(value: unknown): AccountRef[] {
  return [value]
    .flat()
    .map(refOf)
    .filter((ref) => ref !== null);
}

/** How large a roadmap item's payoff is, as its badge shows it. */
export const ACCOUNT_SIZE = ["big", "medium", "small"] as const;
export type AccountSize = (typeof ACCOUNT_SIZE)[number];

/** The words a payoff's `size` may be written as, by the size each means. */
const SIZE_WORDS: Record<string, AccountSize> = {
  big: "big",
  large: "big",
  high: "big",
  medium: "medium",
  med: "medium",
  mid: "medium",
  small: "small",
  low: "small",
};

/**
 * Reads a roadmap item's payoff `size`: `big`, `medium` or `small` (or
 * `large`/`high`, `med`/`mid`, `low`), in any case.
 *
 * @param value - the size as written, or as kept under an item's `extra.size`
 * @returns the size, or `null` for none or a word it doesn't know
 */
export function accountSize(value: unknown): AccountSize | null {
  return typeof value === "string" ? (SIZE_WORDS[value.trim().toLowerCase()] ?? null) : null;
}

/** One roadmap item, normalised. */
export interface AccountRoadmapItemInput {
  priority: AccountPriority;
  area: string | null;
  action: string;
  why: string | null;
  payoff: string | null;
  cost: string | null;
  refs: AccountRef[];
  /**
   * The item's fields the schema doesn't map (its `rank`, say), as
   * written, and its payoff's `size`, normalised when {@link accountSize}
   * reads it.
   */
  extra: Obj;
}

/** The fields of a roadmap item the schema maps. */
const ITEM_FIELDS = ["priority", "area", "action", "why", "payoff", "cost", "refs", "ref"] as const;

/**
 * A roadmap item: `priority` (`now`, `next` or `later`, in any case),
 * `action`, and optional `area`, `why`, `payoff`, `cost`, `size` (how big
 * the payoff is: `big`, `medium` or `small`) and `refs` (or one `ref`). A
 * payoff or cost of any shape is worded as one line.
 */
export const accountRoadmapItemFile = z
  .looseObject({
    priority: z.preprocess(
      (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
      z.enum(ACCOUNT_PRIORITY),
    ),
    action: z.string().trim().min(1),
  })
  .transform((item): AccountRoadmapItemInput => {
    const size = accountSize(item.size);
    return {
      priority: item.priority,
      area: chipsOf(item.area).join(" · ") || null,
      action: item.action,
      why: chipsOf(item.why).join(" ") || null,
      payoff: chipsOf(item.payoff).join(" · ") || null,
      cost: chipsOf(item.cost).join(" · ") || null,
      refs: refsOf(item.refs ?? item.ref),
      extra: { ...rest(item, ITEM_FIELDS), ...(size === null ? {} : { size }) },
    };
  });

/**
 * Reads the parked avenues: a list of `{ avenue (or name), why, refs }`,
 * or of plain strings.
 *
 * @param value - the list as written
 * @returns one entry per avenue named
 */
function parkedOf(value: unknown): AccountParked[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry === "string") return [{ avenue: entry, why: null, refs: [] }];
    if (!isObj(entry)) return [];
    const avenue = pick(entry, ["avenue", "name", "action", "title"]);
    return avenue === null
      ? []
      : [{ avenue, why: chipsOf(entry.why).join(" ") || null, refs: refsOf(entry.refs) }];
  });
}

/** A roadmap, normalised. */
export interface AccountRoadmapInput {
  /** The snapshot it was written from, by id, when it says. */
  snapshotId: string | null;
  verdict: string | null;
  items: AccountRoadmapItemInput[];
  parked: AccountParked[];
  /** The file's top-level fields the schema doesn't map, as written. */
  extra: Obj;
}

/** The top-level fields of a roadmap the schema maps. */
const ROADMAP_FIELDS = [
  "items",
  "snapshot",
  "snapshotId",
  "snapshot_id",
  "basedOn",
  "based_on",
  "verdict",
  "parked",
];

/**
 * A roadmap file: a list of items in order, or an object with `items` and
 * optionally the snapshot it was written from (an id or the snapshot's
 * path), a `verdict` and the `parked` avenues; any other field is kept
 * under `extra`, and screenshots are dropped (see {@link withoutScreens}).
 */
export const accountRoadmapFile = z.preprocess(
  withoutScreens,
  listOr(
    z.array(accountRoadmapItemFile).transform((items): AccountRoadmapInput => ({
      snapshotId: null,
      verdict: null,
      items,
      parked: [],
      extra: {},
    })),
    z
      .looseObject({ items: z.array(accountRoadmapItemFile) })
      .transform((file): AccountRoadmapInput => {
        const snapshot = pick(file, [
          "snapshot",
          "snapshotId",
          "snapshot_id",
          "basedOn",
          "based_on",
        ]);
        return {
          snapshotId: snapshot === null ? null : baseName(snapshot),
          verdict: chipsOf(file.verdict).join(" ") || null,
          items: file.items,
          parked: parkedOf(file.parked),
          extra: rest(file, ROADMAP_FIELDS),
        };
      }),
  ),
);

/**
 * The game mode a snapshot's lineup is about, from its `mode` or its key,
 * when it names one the app has screens for: `arena`, `rumble`, `conquest`
 * (or `guild`, `raid`), `rift` or `stage`, `dungeon`, and the modes' own ids.
 *
 * @param key - the lineup's mode or key, in any case
 * @returns the game mode, or `null` for one that names none
 */
export function lineupMode(key: string): GameMode | null {
  const k = key.toLowerCase();
  // Before the Rumble test: "crumble" holds "rumble".
  if (/dungeon|golden|crumble|던전/.test(k)) return "crumble_dungeon";
  if (k.includes("rumble") || k.includes("와글")) return "rumble_arena";
  if (k.includes("arena") || k.includes("pvp") || k.includes("아레나")) return "arena";
  if (/conquest|guild|raid|토벌/.test(k)) return "guild_conquest";
  if (/rift|stage|story|차원|스테이지/.test(k)) return "stage";
  if (/team.?power|팀투/.test(k)) return "team_power";
  return null;
}
