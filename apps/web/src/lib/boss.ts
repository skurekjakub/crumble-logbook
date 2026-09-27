/**
 * Pure helpers for the boss screen: the fight track's scale, and the pivot of
 * per-grade buff values into star columns.
 */

/** One skill grade's buff value; `/api/buff-values` rows fit as they are. */
export interface BuffValueLike {
  cookieKr: string;
  en: string | null;
  effectType: string;
  fromStar: number;
  valuePct: number;
  maxStack: number | null;
  /** What the value is a percentage of: `Fixed`, or the caster's ATK or HP. */
  base: string;
  scalesWithCasterAmp: boolean;
  sources: readonly string[];
}

/**
 * Where a moment sits on the fight track, as a percentage of its width.
 *
 * @param t - seconds since the fight began
 * @param length - the fight's length in seconds
 * @returns 0 at the start, 100 at the end; times outside the fight clamp to an end
 */
export function trackPercent(t: number, length: number): number {
  return Math.min(100, Math.max(0, (t / length) * 100));
}

/**
 * The in-game countdown at a moment: the HUD counts down, and the community
 * names patterns by that remaining time ("the 17 s wipe").
 *
 * @param t - seconds since the fight began
 * @param length - the fight's length in seconds
 * @returns seconds left on the timer
 */
export function secondsLeft(t: number, length: number): number {
  return length - t;
}

/**
 * When an event happens, in words: elapsed time and the in-game countdown.
 *
 * @param tElapsed - seconds since the fight began, or null for an event off the clock
 * @param length - the fight's length in seconds
 * @returns "43 s · 17 s left", or "Off the clock"
 */
export function whenLabel(tElapsed: number | null, length: number): string {
  if (tElapsed == null) return "Off the clock";
  return `${tElapsed} s · ${secondsLeft(tElapsed, length)} s left`;
}

/**
 * Assigns each moment a row so that markers on the same row are at least
 * `minGap` seconds apart: each takes the lowest row that is clear.
 *
 * @param times - moments in ascending order, in seconds
 * @param minGap - the smallest gap, in seconds, two markers on one row may have
 * @returns the row index (0 = top) for each moment, in input order
 */
export function staggerRows(times: readonly number[], minGap: number): number[] {
  const rowEnds: number[] = [];
  return times.map((t) => {
    let row = rowEnds.findIndex((end) => t - end >= minGap);
    if (row === -1) row = rowEnds.length;
    rowEnds[row] = t;
    return row;
  });
}

/**
 * A fight event's key as a label: `super_jump_wipe` → "Super jump wipe".
 *
 * @param event - the stored event key
 * @returns the key in sentence case, underscores as spaces
 */
export function eventLabel(event: string): string {
  const words = event.replaceAll("_", " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Buffs that land on the caster only, keyed `<cookieKr>|<effectType>`. The
 * `buff_values` table has no target column; the Sugar Pocket capture names
 * this effect's skill asset `skill_c0532_s09_01_ selfbuff`.
 */
const SELF_ONLY = new Set(["실론나이트 쿠키|DefensePointMultiplier"]);

/**
 * Whether a buff lands on the caster alone rather than on the team.
 *
 * @param cookieKr - the caster's stored Korean name
 * @param effectType - the buff's effect type
 */
export function isSelfOnly(cookieKr: string, effectType: string): boolean {
  return SELF_ONLY.has(`${cookieKr}|${effectType}`);
}

/**
 * Whether an effect's value is an application chance (a debuff's base
 * chance to land) rather than the size of a buff.
 *
 * @param effectType - the stored effect type
 */
export function isChance(effectType: string): boolean {
  return effectType.endsWith("Chance");
}

/** Display names for the effect types the buff table knows. */
const EFFECT_NAMES: Readonly<Record<string, string>> = {
  AbilityAmplifyAddition: "Skill amp +",
  AttackPointAddition: "ATK +",
  AttackPointMultiplier: "ATK % +",
  CriticalRateAddition: "Crit rate +",
  CriticalDamageRateAddition: "Crit dmg +",
  BossDamageRateAddition: "Boss DMG +",
  DefensePointMultiplier: "DEF % +",
  DefensePointReductionChance: "DEF shred",
};

/** What a value is a share of, for bases other than a fixed percentage. */
const BASE_NAMES: Readonly<Record<string, string>> = {
  CastersAttackPoint: "share of the caster's ATK",
  CastersHealthPoint: "share of the caster's HP",
};

/**
 * An effect in words, e.g. "Boss DMG +" or "ATK + (share of the caster's ATK)".
 *
 * @param effectType - the stored effect type; an unknown one is shown as is
 * @param base - what the value is a percentage of (`Fixed` adds nothing)
 * @returns the label; chances end in ": application chance"
 */
export function effectLabel(effectType: string, base: string): string {
  const name = EFFECT_NAMES[effectType] ?? effectType;
  if (isChance(effectType)) return `${name}: application chance`;
  const of = BASE_NAMES[base];
  return of ? `${name} (${of})` : name;
}

/** One cookie's effect across every star, as a row of the buff table. */
export interface BuffStarRow {
  /** `<cookieKr>|<effectType>`, unique per row. */
  key: string;
  cookieKr: string;
  en: string | null;
  effectType: string;
  base: string;
  scalesWithCasterAmp: boolean;
  /** The highest grade's stack limit. */
  maxStack: number | null;
  /** The buff lands on the caster only (see {@link isSelfOnly}). */
  selfOnly: boolean;
  /** The value is an application chance (see {@link isChance}). */
  chance: boolean;
  /** Value in percent by the star count its grade starts at. */
  byStar: Record<number, number>;
  /** Every source cited by any of the row's grades, first-seen order. */
  sources: string[];
}

/**
 * The star counts the buff table needs a column for.
 *
 * @param rows - buff values
 * @returns each distinct `fromStar`, ascending
 */
export function buffStars(rows: readonly Pick<BuffValueLike, "fromStar">[]): number[] {
  return [...new Set(rows.map((r) => r.fromStar))].sort((a, b) => a - b);
}

/**
 * A star column's heading: "5★", and "9★+" for the last column, which holds
 * every star count from there up.
 *
 * @param star - the column's star count
 * @param stars - every column's star count, ascending
 */
export function starLabel(star: number, stars: readonly number[]): string {
  return star === stars.at(-1) ? `${star}★+` : `${star}★`;
}

/**
 * Pivots per-grade buff values into one row per cookie and effect, with each
 * grade's value under the star count it starts at. Team buffs come first and
 * self-only buffs last; within each group rows keep the input's order.
 *
 * @param rows - buff values, as `/api/buff-values` returns them
 * @returns the table rows
 */
export function pivotBuffs(rows: readonly BuffValueLike[]): BuffStarRow[] {
  const byKey = new Map<string, BuffStarRow>();
  for (const r of rows) {
    const key = `${r.cookieKr}|${r.effectType}`;
    let row = byKey.get(key);
    if (!row) {
      row = {
        key,
        cookieKr: r.cookieKr,
        en: r.en,
        effectType: r.effectType,
        base: r.base,
        scalesWithCasterAmp: r.scalesWithCasterAmp,
        maxStack: r.maxStack,
        selfOnly: isSelfOnly(r.cookieKr, r.effectType),
        chance: isChance(r.effectType),
        byStar: {},
        sources: [],
      };
      byKey.set(key, row);
    }
    row.byStar[r.fromStar] = r.valuePct;
    if (r.fromStar >= Math.max(...Object.keys(row.byStar).map(Number))) row.maxStack = r.maxStack;
    for (const s of r.sources) if (!row.sources.includes(s)) row.sources.push(s);
  }
  const all = [...byKey.values()];
  return [...all.filter((r) => !r.selfOnly), ...all.filter((r) => r.selfOnly)];
}

/**
 * A percentage for the buff table: `70` → "70%", `46.5` → "46.5%".
 *
 * @param v - the value in percent, or undefined for a star with no value
 * @returns the text, or "–" when there is no value
 */
export function formatPct(v: number | undefined): string {
  return v == null ? "–" : `${Number(v.toFixed(2))}%`;
}
