/**
 * Pure helpers for a timed fight: where a moment sits on the fight track,
 * the in-game countdown, marker rows, and the labels built from them.
 *
 * @module
 */

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
 * The fight's length: the time of the event that states it, else the time
 * of the latest timed event.
 *
 * @param events - the fight's events; `/api/fight-events` rows fit as they are
 * @param lengthEvent - the key of the event that states the length
 * @returns seconds; 0 when no event is timed
 */
export function fightLength(
  events: readonly { event: string; tElapsed: number | null }[],
  lengthEvent: string,
): number {
  const stated = events.find((e) => e.event === lengthEvent)?.tElapsed;
  if (stated != null) return stated;
  return events.reduce((latest, e) => Math.max(latest, e.tElapsed ?? 0), 0);
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
 * Assigns each position a row so that positions on the same row are at
 * least `minGap` apart: each takes the lowest row that is clear.
 *
 * @param positions - positions in ascending order, in any one unit
 * @param minGap - the smallest gap, in that unit, two positions on one row may have
 * @returns the row index (0 = top) for each position, in input order
 */
export function staggerRows(positions: readonly number[], minGap: number): number[] {
  const rowEnds: number[] = [];
  return positions.map((x) => {
    let row = rowEnds.findIndex((end) => x - end >= minGap);
    if (row === -1) row = rowEnds.length;
    rowEnds[row] = x;
    return row;
  });
}

/**
 * Assigns each fight marker a row by where it renders: markers whose
 * centres sit closer than one marker's width on the track go on separate rows.
 *
 * @param times - moments in ascending order, in seconds since the fight began
 * @param length - the fight's length in seconds
 * @param trackPx - the track's rendered width in pixels
 * @param markerPx - the space one marker needs, in pixels
 * @returns the row index (0 = top) for each moment, in input order
 */
export function markerRows(
  times: readonly number[],
  length: number,
  trackPx: number,
  markerPx: number,
): number[] {
  return staggerRows(
    times.map((t) => (trackPercent(t, length) / 100) * trackPx),
    markerPx,
  );
}

/**
 * A lethal pattern's card title, named the way the community names it: by
 * the in-game countdown when it lands ("The 17 s super-jump wipe").
 *
 * @param name - the pattern's name, lower case, e.g. `slam`
 * @param tElapsed - when its anchor event happens, or null when unknown
 * @param length - the fight's length in seconds
 * @returns the title; just the capitalised name when there's no time
 */
export function survivalTitle(name: string, tElapsed: number | null, length: number): string {
  if (tElapsed == null) return name.charAt(0).toUpperCase() + name.slice(1);
  return `The ${secondsLeft(tElapsed, length)} s ${name}`;
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
