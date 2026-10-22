/**
 * Values the records store in both languages at once, such as a glossary
 * entry's element ("불/Fire") or class ("방어/Tank").
 *
 * @module
 */

/**
 * The English half of a "Korean/English" value; a value without a slash is
 * kept whole, so a name only stored in one language still shows.
 *
 * @param value - the value as stored, e.g. `불/Fire`; null when unknown
 * @returns the English half, e.g. `Fire`, or null for a null or empty value
 */
export function englishHalf(value: string | null): string | null {
  if (!value) return null;
  const slash = value.lastIndexOf("/");
  return slash < 0 ? value : value.slice(slash + 1).trim() || value;
}
