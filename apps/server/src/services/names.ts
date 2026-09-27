import type { GlossaryRow } from "@crumble/schema";

/** A name paired with the glossary's resolution of it. */
export interface NameRef {
  /** The name exactly as it appeared in the source data. */
  kr: string;
  /** The matched glossary entry's English gloss, or `null` if unresolved. */
  en: string | null;
}

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
 * Builds a resolver from a glossary snapshot: each entry is indexed under
 * its Korean form, every one of its shorthands, and its English gloss (when
 * it has one), all case- and whitespace-insensitively.
 *
 * @param entries - the glossary rows to index
 * @returns a function mapping a name, as written, to a {@link NameRef}. The
 *   returned `kr` is always `name` unchanged; `en` is the matched entry's
 *   gloss (itself possibly `null`), or `null` if `name` matches no entry
 *   under any of its keys
 */
export function createNameResolver(entries: GlossaryRow[]): (name: string) => NameRef {
  const byKey = new Map<string, string | null>();
  for (const entry of entries) {
    byKey.set(normalizeName(entry.kr), entry.en);
    for (const shorthand of entry.shorthand) byKey.set(normalizeName(shorthand), entry.en);
    if (entry.en) byKey.set(normalizeName(entry.en), entry.en);
  }
  return (name) => ({ kr: name, en: byKey.get(normalizeName(name)) ?? null });
}
