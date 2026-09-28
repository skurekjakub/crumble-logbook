/**
 * What the PvP modes' sections share: the views' copy that doesn't depend on
 * the mode, and the sub-tab list.
 *
 * @module
 */
import type { SharedView, ViewCopy } from "./types";

/** The PvP views' copy that doesn't depend on the mode. */
export const PVP_COPY = {
  decks: {
    title: "Teams",
    lede: "The teams as their owners post them, laid out like the formation screen: two rows, back line on the left, front on the right (inferred from attack ranges). A team known only from an opponent's defense card has no slots and shows as a plain lineup. Stars are rarely readable in screenshots; ? marks an unknown.",
  },
  counters: {
    title: "Counters",
    lede: "Directed: each row is a team, each column a team that beats it, and each cell says under what conditions. A matchup that goes both ways is two cells with their own conditions. Shading follows confidence; hatched cells are unverified claims. Pick a cell for the mechanism and the posts.",
  },
  runes: {
    title: "Sugar runes",
    lede: 'PvP rune lines per cookie. "All" means every line rolls the same stat. Disputed rows are where posters disagreed; both sides are kept.',
  },
  gear: {
    title: "Gear substats",
    lede: "Laid out like the equipment screen. Notes that apply to the whole set, such as which preset to wear, are under the board.",
  },
  mechanics: {
    title: "Mechanics",
    lede: "What players measured or datamined, and how this logbook resolved conflicting claims. Confidence reflects how well each point is sourced. The mode's rules are on its overview.",
  },
  timeline: {
    title: "How the meta moved",
    lede: "Patches, new cookies, seasons and the teams that followed, oldest first.",
  },
} as const satisfies Partial<Record<SharedView, ViewCopy>>;

/**
 * A PvP mode's sub-tabs, under its path.
 *
 * @param to - the mode's path
 * @returns the tabs, overview first
 */
export function pvpTabs<const P extends "/arena" | "/rumble">(to: P) {
  return [
    { id: "overview", label: "Overview", to },
    { id: "teams", label: "Teams", to: `${to}/teams` },
    { id: "counters", label: "Counters", to: `${to}/counters` },
    { id: "usage", label: "Usage", to: `${to}/usage` },
    { id: "runes", label: "Sugar runes", to: `${to}/runes` },
    { id: "gear", label: "Gear", to: `${to}/gear` },
    { id: "mechanics", label: "Mechanics", to: `${to}/mechanics` },
    { id: "timeline", label: "Timeline", to: `${to}/timeline` },
  ] as const;
}
