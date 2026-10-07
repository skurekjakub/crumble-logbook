/**
 * The account view's pure rules: how roadmap items group by priority, and
 * how a payoff or a cost reads as a verdict.
 *
 * @module
 */

/** A roadmap item's priority, in the order the view shows the groups. */
export const PRIORITIES = ["now", "next", "later"] as const;

/** A roadmap item's priority. */
export type Priority = (typeof PRIORITIES)[number];

/** How large a payoff or a cost reads: high, medium or low. */
export type Size = "high" | "medium" | "low";

/** A badge's verdict colour, as the pill tones name them. */
export type Tone = "good" | "warn" | "bad" | "quiet";

/**
 * Groups items by priority, in {@link PRIORITIES} order, each group in the
 * roadmap's order; a priority with no item is left out.
 *
 * @param items - the roadmap's items, in its order
 * @returns each non-empty group with its priority
 */
export function byPriority<T extends { priority: Priority }>(
  items: readonly T[],
): Array<{ priority: Priority; items: T[] }> {
  return PRIORITIES.flatMap((priority) => {
    const group = items.filter((item) => item.priority === priority);
    return group.length > 0 ? [{ priority, items: group }] : [];
  });
}

/**
 * Reads how large a payoff or cost is from its wording, when it says.
 *
 * @param text - the payoff or cost as written, e.g. `high`, `low (free)`
 * @returns the size, or `null` when the text names none
 */
export function sizeOf(text: string | null): Size | null {
  if (text === null) return null;
  const t = text.toLowerCase();
  if (/\b(high|big|large|major|huge)\b/.test(t)) return "high";
  if (/\b(med|medium|moderate|mid)\b/.test(t)) return "medium";
  if (/\b(low|small|minor|tiny|free|none)\b/.test(t)) return "low";
  return null;
}

/**
 * The verdict colour of a payoff: a high payoff is good, a low one quiet.
 *
 * @param text - the payoff as written
 * @returns the tone; `quiet` when the text names no size
 */
export function payoffTone(text: string | null): Tone {
  if (text === null || /unmeasured|unknown|small/i.test(text)) return "quiet";
  const size = sizeOf(text);
  if (size === "high") return "good";
  if (size === "medium") return "warn";
  if (size === "low") return "quiet";
  return /\+\d|\d+\s*%/.test(text) ? "good" : "quiet";
}

/**
 * The verdict colour of a cost: free or low is good, paid or high is bad,
 * any other cost a caution.
 *
 * @param text - the cost as written
 * @returns the tone; `quiet` without a cost
 */
export function costTone(text: string | null): Tone {
  if (text === null) return "quiet";
  if (/^\s*free\b/i.test(text)) return "good";
  if (/\b(paid|pulls?|gacha|whale)\b/i.test(text)) return "bad";
  const size = sizeOf(text);
  return size === "low" ? "good" : size === "high" ? "bad" : "warn";
}

/** The suffixes a large figure is shortened with, as the game writes power: K, M, G, T. */
const SUFFIXES = [
  [1e12, "T"],
  [1e9, "G"],
  [1e6, "M"],
  [1e3, "K"],
] as const;

/**
 * Shortens a whole number of five or more digits the way the game writes
 * power (`47810542000` → `47.8G`), to three significant figures.
 *
 * @param n - the number
 * @returns the short form; a smaller number as written
 */
export function compactNumber(n: number): string {
  if (Math.abs(n) < 1e4) return String(n);
  const [size, suffix] = SUFFIXES.find(([s]) => Math.abs(n) >= s)!;
  return `${Number((n / size).toPrecision(3))}${suffix}`;
}

/**
 * Shortens every run of five or more digits in a text (`1120000000000 →
 * 132360000000` → `1.12T → 132G`), leaving the rest as written.
 *
 * @param text - a figure as stored
 * @returns the text with its large numbers shortened
 */
export function compactFigures(text: string): string {
  return text.replace(/\d{5,}/g, (digits) => compactNumber(Number(digits)));
}

/**
 * Words a camelCase or snake_case field name as a label (`combatPower` →
 * `Combat power`).
 *
 * @param key - the field name
 * @returns the label
 */
export function humanize(key: string): string {
  const words = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * The lead clause of a payoff or cost, for its badge: the text up to its
 * first `;` or sentence end, cut at a word to about `max` characters.
 *
 * @param text - the payoff or cost as written
 * @param max - the characters the badge holds; 28 when omitted
 * @returns the lead clause, with `…` when cut
 */
export function leadClause(text: string, max = 28): string {
  const lead = text.split(/;|\.(?:\s|$)|,\s/)[0]!.trim() || text;
  if (lead.length <= max) return lead;
  const cut = lead.slice(0, max).replace(/\s+\S*$/, "");
  return `${cut || lead.slice(0, max)}…`;
}

/** A payoff's size, as a roadmap item may state it. */
export type PayoffSize = "big" | "medium" | "small";

/** Each stated payoff size's badge text and tone. */
const SIZE_BADGE: Record<PayoffSize, { text: string; tone: Tone }> = {
  big: { text: "Big", tone: "good" },
  medium: { text: "Medium", tone: "warn" },
  small: { text: "Small", tone: "quiet" },
};

/** A payoff or cost badge: what it reads, its colour, and the text it leaves out. */
export interface GaugeView {
  /** The badge's text. */
  text: string;
  tone: Tone;
  /** What the badge doesn't show of the payoff or cost, for the row's detail line; `null` for nothing. */
  rest: string | null;
}

/**
 * Words a payoff or cost as a badge. A payoff whose size the roadmap
 * states reads as that size, its text left for the detail line; any other
 * reads as its lead clause, coloured by its wording, and leaves the
 * detail line only what the lead clause doesn't already say.
 *
 * @param kind - whether it is the payoff or the cost
 * @param text - the payoff or cost as written
 * @param size - the payoff's stated size; ignored for a cost
 * @returns the badge and the text it leaves out
 */
export function gauge(
  kind: "payoff" | "cost",
  text: string,
  size: PayoffSize | null = null,
): GaugeView {
  if (kind === "payoff" && size !== null) return { ...SIZE_BADGE[size], rest: text };
  const whole = text.trim();
  const lead = leadClause(whole);
  const cut = lead.endsWith("…") && !whole.startsWith(lead);
  const after = whole
    .slice(lead.length)
    .replace(/^\s*[;.,]\s*/, "")
    .trim();
  return {
    text: lead,
    tone: kind === "payoff" ? payoffTone(text) : costTone(text),
    rest: cut ? whole : after || null,
  };
}

/**
 * A reading's time as a short label: the `HH:MM` of an ISO date-time, any
 * other text as written.
 *
 * @param at - when the figure was read, e.g. `2026-10-07T17:13:00+02:00`
 * @returns the label, e.g. `17:13`
 */
export function readingTime(at: string): string {
  return /^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/.exec(at)?.[1] ?? at;
}

/**
 * A level or star figure as its badge reads: `Lv.80`, `7★`; free text as
 * written.
 *
 * @param value - the figure as stored, or null
 * @param kind - which figure it is
 * @returns the badge text, or null for none
 */
export function figure(value: string | null, kind: "level" | "stars" | "skill"): string | null {
  if (value === null || value === "") return null;
  if (!/^\d+$/.test(value)) return value;
  return kind === "level" ? `Lv.${value}` : kind === "stars" ? `${value}★` : `S${value}`;
}
