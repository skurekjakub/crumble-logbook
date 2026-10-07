/**
 * The daily dungeon board's rules: which dungeon is shown, which decks run
 * it, how they rank (stage reached first, never a ratio), which one is the
 * best on full auto, and how a run's auto and an element read. Pure; the
 * rows come from the API.
 *
 * @module
 */

/** How far a run plays itself, as the API gives it. */
export type Auto = "full" | "semi" | "manual";

/** The badge each auto value shows, verdict first. */
export const AUTO_BADGE: Readonly<
  Record<Auto, { label: string; tone: "good" | "warn" | "quiet" }>
> = {
  full: { label: "AUTO", tone: "good" },
  semi: { label: "SEMI-AUTO", tone: "warn" },
  manual: { label: "MANUAL", tone: "quiet" },
};

/** Each auto value's place when stages tie: full auto first. */
const AUTO_RANK: Readonly<Record<Auto, number>> = { full: 0, semi: 1, manual: 2 };

/** A daily dungeon as the board picks one: by its slug. */
export interface DungeonRef {
  slug: string;
}

/**
 * The dungeon a board shows: the one the URL names, else the first.
 *
 * @param dungeons - the dungeons, in the record's order
 * @param slug - the slug the URL names, when it names one
 * @returns the dungeon, or undefined when there are none
 */
export function pickDungeon<D extends DungeonRef>(
  dungeons: readonly D[],
  slug: string | undefined,
): D | undefined {
  return dungeons.find((d) => d.slug === slug) ?? dungeons[0];
}

/** A deck as the board ranks it: its run facts, its place in the record's list and its lifecycle. */
export interface RankedDeck {
  position: number;
  obsoleteSince?: string | null;
  dailyDungeon: {
    dungeon: string;
    auto: Auto;
    stage: number | null;
    powerG: number | null;
  } | null;
}

/**
 * The current decks that run a dungeon, ranked: furthest stage first (a
 * deck with no stage last), then full auto before semi-auto before manual,
 * then lowest power, then the record's order. Never by a ratio.
 *
 * @param decks - every deck of the mode
 * @param dungeon - the dungeon's slug
 * @returns the dungeon's current decks, ranked
 */
export function rankDecks<D extends RankedDeck>(decks: readonly D[], dungeon: string): D[] {
  return decks
    .filter((d) => d.dailyDungeon?.dungeon === dungeon && d.obsoleteSince == null)
    .sort((a, b) => {
      const x = a.dailyDungeon!;
      const y = b.dailyDungeon!;
      return (
        (y.stage ?? -1) - (x.stage ?? -1) ||
        AUTO_RANK[x.auto] - AUTO_RANK[y.auto] ||
        (x.powerG ?? Infinity) - (y.powerG ?? Infinity) ||
        a.position - b.position
      );
    });
}

/**
 * Splits ranked decks into the hero, the furthest full-auto deck, and the rest.
 *
 * @param ranked - a dungeon's decks, as {@link rankDecks} ranks them
 * @returns the hero (undefined when no deck runs on full auto) and the
 *   other decks, still ranked
 */
export function splitHero<D extends RankedDeck>(
  ranked: readonly D[],
): { hero: D | undefined; rest: D[] } {
  const hero = ranked.find((d) => d.dailyDungeon?.auto === "full");
  return { hero, rest: ranked.filter((d) => d !== hero) };
}

/** The elements the tokens tint, by their English name in lower case. */
const ELEMENTS = ["fire", "water", "grass", "light", "dark"] as const;

/**
 * The element token an element's name reads as: `Fire`, `불/Fire` and
 * `불` all read as fire.
 *
 * @param name - the element as the record names it
 * @returns the element's token name, or undefined for one the tokens don't tint
 */
export function elementKey(name: string | null | undefined): string | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase();
  const korean: Readonly<Record<string, string>> = {
    불: "fire",
    물: "water",
    풀: "grass",
    빛: "light",
    어둠: "dark",
  };
  return (
    ELEMENTS.find((e) => lower.includes(e)) ??
    Object.entries(korean).find(([kr]) => name.startsWith(kr))?.[1]
  );
}

/**
 * A yes/no/unknown fact as a chip's verdict.
 *
 * @param value - the fact, `null` when the record doesn't know
 * @returns `yes`, `no` or `unknown`
 */
export function factVerdict(value: boolean | null): "yes" | "no" | "unknown" {
  if (value === null) return "unknown";
  return value ? "yes" : "no";
}
