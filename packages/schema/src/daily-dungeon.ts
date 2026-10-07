/**
 * The daily dungeon rules both the record importer and the API apply to a
 * deck: only a `daily_dungeon` deck has run facts, every one has them, and
 * its captain is one of its cookies.
 *
 * @module
 */
import type { GameMode } from "./enums";
import { postedPowerG } from "./power";

/**
 * Adds the power in billions a row's posted power gives, as a daily
 * dungeon deck's run facts and a daily dungeon clear store it.
 *
 * @param row - the row, with its power as posted (`null` or absent when the post gives none)
 * @returns the row with `powerG`: the posted power in billions, or `null`
 *   when there is no power or no figure in it
 */
export function withPowerG<T extends { power?: string | null | undefined }>(
  row: T,
): T & { powerG: number | null } {
  return { ...row, powerG: row.power == null ? null : postedPowerG(row.power) };
}

/**
 * Adds the powers in billions a daily dungeon deck's run facts give: its
 * team power's and its stage's recommended power's, each read from the
 * posted text.
 *
 * @param run - the run facts, with both powers as posted (`null` or absent when not given)
 * @returns the run facts with `powerG` and `recommendedPowerG`, each `null`
 *   when there is no power or no figure in it
 */
export function withRunPowers<
  T extends { power?: string | null | undefined; recommendedPower?: string | null | undefined },
>(run: T): T & { powerG: number | null; recommendedPowerG: number | null } {
  const recommended = run.recommendedPower;
  return {
    ...withPowerG(run),
    recommendedPowerG: recommended == null ? null : postedPowerG(recommended),
  };
}

/** What the daily dungeon rules read of a deck. */
export interface DailyDeckShape {
  /** The deck's game mode. */
  mode: GameMode;
  /** The Korean names of the deck's cookies. */
  cookies: readonly string[];
  /** The deck's run facts: the captain they name, or `null` when it has none. */
  run: { captainKr?: string | null | undefined } | null;
}

/**
 * Checks a deck against the daily dungeon rules: a `daily_dungeon` deck
 * names its run facts (the dungeon it runs and how far it plays itself), a
 * deck of any other mode names none, and a captain is one of the deck's
 * cookies.
 *
 * @param deck - the deck's mode, cookies and run facts
 * @returns what is wrong with the deck, or `undefined` when it keeps the rules
 */
export function dailyDeckProblem(deck: DailyDeckShape): string | undefined {
  const daily = deck.mode === "daily_dungeon";
  if (daily && deck.run === null) return "a daily_dungeon deck names its dungeon and auto";
  if (!daily && deck.run !== null) return `a ${deck.mode} deck has no daily dungeon run facts`;
  const captain = deck.run?.captainKr;
  if (captain != null && !deck.cookies.includes(captain)) {
    return `captain ${captain} is not one of the deck's cookies`;
  }
  return undefined;
}
