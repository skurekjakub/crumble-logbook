/**
 * Cookie and pet icons: which game resource key a name maps to, where the
 * icon file is served from, and what a missing icon falls back to.
 *
 * The keys come from the glossary (`extra.resource_key`, the game's own
 * resource id, e.g. `cookie0038` or `pet4001`), so the mapping is derived
 * from the data at runtime. The files are committed in
 * `apps/web/public/icons/`, served at `/icons/`; `pnpm icons:fetch` adds
 * new ones from crumb.gg.
 *
 * @module
 */

/** A cookie's element, as the fallback badge colours it. */
export type CookieElement = "fire" | "water" | "grass" | "light" | "dark";

/** What an icon needs to know about a name. */
export interface IconEntry {
  /** The game resource key, e.g. `cookie0038`; null when the glossary has none. */
  key: string | null;
  /** The element, for the fallback badge's colour; null when unknown or a pet. */
  element: CookieElement | null;
}

/** Name → icon entry, keyed by lower-cased English name, Korean name and every shorthand. */
export type IconIndex = ReadonlyMap<string, IconEntry>;

/** An index that knows no names: every icon falls back to its badge. */
export const EMPTY_ICONS: IconIndex = new Map();

/** The glossary fields the index reads; a `/api/glossary` row fits as it is. */
export interface IconGlossaryEntry {
  kr: string;
  en: string | null;
  kind: string;
  shorthand: readonly string[];
  element: string | null;
  extra: unknown;
}

/** The URL folder the icons are served from (Vite's `public/icons`). */
export const ICON_DIR = "/icons";

/** A resource key as the game names one: `cookie` or `pet`, then digits. */
const KEY = /^(?:cookie|pet)\d+$/;

/**
 * Reads the game resource key out of a glossary entry's `extra`.
 *
 * @param extra - the entry's `extra` object, of any shape
 * @returns the key, or null when `extra` has no well-formed `resource_key`
 */
export function resourceKey(extra: unknown): string | null {
  if (typeof extra !== "object" || extra === null || !("resource_key" in extra)) return null;
  const key = extra.resource_key;
  return typeof key === "string" && KEY.test(key) ? key : null;
}

/**
 * Reads a glossary element ("불/Fire", "Water") as a {@link CookieElement}.
 *
 * @param raw - the element as stored, or null
 * @returns the element, or null when it names none
 */
export function elementOf(raw: string | null): CookieElement | null {
  const m = raw?.toLowerCase().match(/fire|water|grass|light|dark/);
  return m ? (m[0] as CookieElement) : null;
}

/**
 * Builds the icon index from glossary entries of the `cookie` and `pet`
 * kinds; other kinds are skipped. When two entries claim a name, the first
 * one keeps it.
 *
 * @param entries - glossary rows, in the API's order
 * @returns the index
 */
export function buildIconIndex(entries: readonly IconGlossaryEntry[]): IconIndex {
  const index = new Map<string, IconEntry>();
  for (const e of entries) {
    if (e.kind !== "cookie" && e.kind !== "pet") continue;
    const entry: IconEntry = { key: resourceKey(e.extra), element: elementOf(e.element) };
    for (const name of [e.en?.toLowerCase(), e.kr, ...e.shorthand]) {
      if (name && !index.has(name)) index.set(name, entry);
    }
  }
  return index;
}

/**
 * Finds a name's icon entry: by its English name first (the API glosses a
 * row with its own record's entries, so the English is the reliable key
 * where one Korean shorthand means different cookies in different records),
 * then by the Korean name or shorthand as stored.
 *
 * @param index - the icon index
 * @param kr - the name as stored
 * @param en - the glossary's English for it, or null
 * @returns the entry, or undefined when the index doesn't know the name
 */
export function lookupIcon(index: IconIndex, kr: string, en: string | null): IconEntry | undefined {
  return (en ? index.get(en.toLowerCase()) : undefined) ?? index.get(kr.trim());
}

/**
 * The served path of a resource key's icon file.
 *
 * @param key - a resource key, e.g. `cookie0038`
 * @returns e.g. `/icons/cookie0038.webp`
 */
export function iconSrc(key: string): string {
  return `${ICON_DIR}/${key}.webp`;
}

/**
 * Up to two letters for a fallback badge: the initials of the first two
 * words of the short English name ("Milk" → "Mi", "Moon Rabbit" → "MR"),
 * or the first Korean syllable.
 *
 * @param name - the name to abbreviate, English or Korean
 * @returns the badge text; "?" for an empty name
 */
export function initials(name: string): string {
  const words = shortName(name)
    .split(/[\s·]+/)
    .filter((w) => /^[\p{L}\p{N}]/u.test(w));
  if (!words.length) return "?";
  const first = words[0]!;
  // Korean names are plain syllables, so the first code point is the first syllable.
  if (!/^[A-Za-z0-9]/.test(first)) return String.fromCodePoint(first.codePointAt(0)!);
  if (words.length === 1) return first.slice(0, 2);
  return (first[0]! + words[1]![0]!).toUpperCase();
}

/**
 * A short English name for tables and chips: the trailing " Cookie" goes
 * ("Brightseeker Cookie" → "Brightseeker"), and an alternate form keeps its
 * base name and the last word of its title ("Milk Cookie's Crunchy Strong
 * Pediatrician" → "Milk · Pediatrician"). Other names are kept as they are.
 *
 * @param en - the full English name
 * @returns the short name
 */
export function shortName(en: string): string {
  const alt = en.match(/^(.+?) Cookie's (.+)$/);
  if (alt) return `${alt[1]!} · ${alt[2]!.split(/\s+/).at(-1)!}`;
  return en.replace(/ Cookie$/, "");
}
