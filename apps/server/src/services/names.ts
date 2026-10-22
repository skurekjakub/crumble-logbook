import type { GlossaryKind, GlossaryRow } from "@crumble/schema";

/** A name paired with the glossary's resolution of it. */
export interface NameRef {
  /** The name exactly as it appeared in the source data. */
  kr: string;
  /** The matched glossary entry's English gloss, or `null` if unresolved. */
  en: string | null;
  /**
   * The cookie's key (see {@link cookieKey}) when the matched entry is a
   * cookie; `null` for any other entry, or when nothing matched.
   */
  key: string | null;
}

/**
 * The fields of a glossary entry that it can be looked up and keyed by,
 * and the record whose glossary it came from.
 */
export type LookupEntry = Pick<GlossaryRow, "kr"> & {
  shorthand?: readonly string[];
  en?: string | null;
  kind?: GlossaryKind;
  extra?: Readonly<Record<string, unknown>>;
  recordSlug?: string | null;
};

/**
 * Resolves a name, as written, to a {@link NameRef}.
 *
 * @param name - the name
 * @param records - the research records whose glossary entries win a key
 *   that several entries claim; omitted or empty, no record is preferred
 */
export type NameResolver = (name: string, records?: readonly string[]) => NameRef;

/**
 * Finds the glossary entry a name, as written, resolves to.
 *
 * @typeParam E - the entries' shape
 * @param name - the name
 * @param records - the research records whose glossary entries win a key
 *   that several entries claim; omitted or empty, no record is preferred
 */
export type EntryFinder<E extends LookupEntry> = (
  name: string,
  records?: readonly string[],
) => E | undefined;

/** A game resource key: `cookie` or `pet`, then digits. */
export const RESOURCE_KEY = /^(?:cookie|pet)\d+$/;

/**
 * Collapses case and whitespace differences for glossary lookup keys: the
 * key {@link createEntryFinder} indexes and looks up a name under.
 *
 * @param name - a name as written
 * @returns the trimmed, lower-cased name with whitespace runs collapsed to
 *   one space
 */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Lists the normalized keys a glossary entry is found under: its Korean
 * form, each shorthand, and its English gloss when it has one.
 *
 * @param entry - the entry
 * @returns the distinct keys, in that order
 */
export function lookupKeys(entry: LookupEntry): string[] {
  const names = [entry.kr, ...(entry.shorthand ?? []), ...(entry.en ? [entry.en] : [])];
  return [...new Set(names.map(normalizeName))];
}

/**
 * Reads the game resource key a glossary entry's `extra` holds.
 *
 * @param extra - the entry's unmapped fields
 * @returns its `resource_key` when that is a {@link RESOURCE_KEY}, else `null`
 */
export function resourceKeyOf(extra: Readonly<Record<string, unknown>> | undefined): string | null {
  const key = extra?.resource_key;
  return typeof key === "string" && RESOURCE_KEY.test(key) ? key : null;
}

/**
 * Turns a name into a URL-safe key: lower-cased, every run of characters
 * other than letters and digits (Hangul included) a single hyphen.
 *
 * @param name - the name
 * @returns the slug, e.g. `princess-bari-cookie` or `무명-쿠키`
 */
function slugOf(name: string): string {
  return name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The key a cookie's page and links use: its game resource key, else a slug
 * of its English name, else, when it has none, of its Korean name.
 *
 * @param entry - a glossary entry
 * @returns the key, or `null` when the entry isn't a cookie
 */
export function cookieKey(entry: LookupEntry): string | null {
  if (entry.kind !== "cookie") return null;
  return resourceKeyOf(entry.extra) ?? slugOf(entry.en || entry.kr);
}

/**
 * Builds an entry finder from a glossary snapshot: each entry is indexed
 * under its {@link lookupKeys}. When several entries share a key, the last
 * one in `entries` from one of the finder's `records` wins; failing that,
 * the last one in `entries`.
 *
 * @typeParam E - the entries' shape
 * @param entries - the glossary rows to index
 * @returns an {@link EntryFinder} answering with one of `entries`, or
 *   `undefined` when the name matches none under any of its keys
 */
export function createEntryFinder<E extends LookupEntry>(entries: readonly E[]): EntryFinder<E> {
  const byKey = new Map<string, E[]>();
  for (const entry of entries) {
    for (const key of lookupKeys(entry)) {
      const claimants = byKey.get(key);
      if (claimants) claimants.push(entry);
      else byKey.set(key, [entry]);
    }
  }
  return (name, records = []) => {
    const claimants = byKey.get(normalizeName(name)) ?? [];
    const preferred = claimants.filter(
      (entry) => entry.recordSlug != null && records.includes(entry.recordSlug),
    );
    return (preferred.length > 0 ? preferred : claimants).at(-1);
  };
}

/**
 * Builds a resolver from a glossary snapshot, over {@link createEntryFinder}.
 *
 * @param entries - the glossary rows to index
 * @returns a {@link NameResolver}. The returned `kr` is always `name`
 *   unchanged; `en` is the winning entry's gloss (itself possibly `null`),
 *   or `null` if `name` matches no entry; `key` is the winning entry's
 *   {@link cookieKey}
 */
export function createNameResolver(entries: readonly LookupEntry[]): NameResolver {
  const find = createEntryFinder(entries);
  return (name, records) => {
    const winner = find(name, records);
    return { kr: name, en: winner?.en ?? null, key: winner ? cookieKey(winner) : null };
  };
}

/**
 * The records a row's names resolve against first: the record that loaded
 * it, if any.
 *
 * @param row - a row, or view, that may carry a `recordSlug`
 * @returns `[recordSlug]`, or `[]` for a row no record owns
 */
export function recordsOf(row: unknown): string[] {
  const slug = (row as { recordSlug?: unknown } | null)?.recordSlug;
  return typeof slug === "string" ? [slug] : [];
}
