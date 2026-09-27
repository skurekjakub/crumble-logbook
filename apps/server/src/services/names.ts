import type { GlossaryRow } from "@crumble/schema";

/** A name paired with the glossary's resolution of it. */
export interface NameRef {
  /** The name exactly as it appeared in the source data. */
  kr: string;
  /** The matched glossary entry's English gloss, or `null` if unresolved. */
  en: string | null;
}

/** The fields of a glossary entry that it can be looked up by. */
export type LookupEntry = Pick<GlossaryRow, "kr"> & {
  shorthand?: readonly string[];
  en?: string | null;
};

/**
 * Collapses case and whitespace differences for glossary lookup keys: the
 * key {@link createNameResolver} indexes and looks up a name under.
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
 * Builds a resolver from a glossary snapshot: each entry is indexed under
 * its {@link lookupKeys}. When two entries share a key, the later one in
 * `entries` wins.
 *
 * @param entries - the glossary rows to index
 * @returns a function mapping a name, as written, to a {@link NameRef}. The
 *   returned `kr` is always `name` unchanged; `en` is the matched entry's
 *   gloss (itself possibly `null`), or `null` if `name` matches no entry
 *   under any of its keys
 */
export function createNameResolver(entries: readonly LookupEntry[]): (name: string) => NameRef {
  const byKey = new Map<string, string | null>();
  for (const entry of entries) {
    for (const key of lookupKeys(entry)) byKey.set(key, entry.en ?? null);
  }
  return (name) => ({ kr: name, en: byKey.get(normalizeName(name)) ?? null });
}
