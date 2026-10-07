/**
 * How a deck is named where space is short: a short name for matrix
 * headings and the few cookies whose portraits stand for the deck.
 *
 * @module
 */
import { shortName } from "./cookie-icons";

/** A cookie or pet name as a deck carries it: Korean as stored, glossary English or null. */
export interface FaceRef {
  kr: string;
  en: string | null;
}

/** What {@link deckFaces} reads from a deck; an `/api/decks` row fits as it is. */
export interface FacedDeck {
  nameEn: string;
  cookies: ReadonlyArray<{ cookieKr: string; en: string | null }>;
  atkOrder?: readonly FaceRef[] | null;
}

/** Name words too generic to tie a cookie to a deck's name. */
const GENERIC = new Set(["cookie", "deck", "the", "king", "queen", "version"]);

/**
 * A deck's name for a cramped heading: parenthesised asides and a trailing
 * "deck" go ("Standard 12 (Oven–Bari charge core)" → "Standard 12",
 * "Rye one-carry deck" → "Rye one-carry").
 *
 * @param nameEn - the deck's full English name
 * @returns the short name; the full name when shortening would leave nothing
 */
export function shortDeckName(nameEn: string): string {
  const short = nameEn
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+deck$/i, "")
    .trim();
  return short || nameEn;
}

/**
 * Splits a name into lower-cased words, at anything but a letter or digit.
 *
 * @param text - the name
 * @returns its words
 */
function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 0);
}

/**
 * The cookies whose portraits stand for a deck: those its English name
 * mentions ("Bari–Oven dive deck" → Princess Bari, Oven Wanderer), in the
 * order the name gives them; failing that, the head of its ATK order;
 * failing that, its first cookies.
 *
 * @param deck - the deck's English name, cookies and ATK order
 * @param max - how many faces to return; 3 when omitted
 * @returns up to `max` names, each once
 */
export function deckFaces(deck: FacedDeck, max = 3): FaceRef[] {
  const nameWords = words(deck.nameEn);
  const named = deck.cookies
    .map((c) => {
      const own = words(c.en ? shortName(c.en) : "").filter(
        (w) => w.length >= 3 && !GENERIC.has(w),
      );
      const at = Math.min(...own.map((w) => nameWords.indexOf(w)).filter((i) => i >= 0));
      return { face: { kr: c.cookieKr, en: c.en }, at };
    })
    .filter((m) => Number.isFinite(m.at))
    .sort((a, b) => a.at - b.at)
    .map((m) => m.face);
  const pool = named.length
    ? named
    : deck.atkOrder?.length
      ? deck.atkOrder
      : deck.cookies.map((c) => ({ kr: c.cookieKr, en: c.en }));
  const seen = new Set<string>();
  const faces: FaceRef[] = [];
  for (const f of pool) {
    if (seen.has(f.kr)) continue;
    seen.add(f.kr);
    faces.push({ kr: f.kr, en: f.en });
    if (faces.length === max) break;
  }
  return faces;
}
