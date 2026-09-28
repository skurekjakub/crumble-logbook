/**
 * What the PvP modes' sections share: the views' copy that doesn't depend on
 * the mode, and the sub-tab list.
 *
 * @module
 */
import { modeTab } from "./links";
import type { SectionTab, SharedView, ViewCopy } from "./types";

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
 * A PvP mode's sub-tabs.
 *
 * @param mode - the mode's id, its first path segment
 * @returns the tabs, overview first
 */
export function pvpTabs(mode: "arena" | "rumble"): SectionTab[] {
  return [
    modeTab(mode, "overview", "Overview", "/$mode"),
    modeTab(mode, "teams", "Teams", "/$mode/teams"),
    modeTab(mode, "counters", "Counters", "/$mode/counters"),
    modeTab(mode, "usage", "Usage", "/$mode/usage"),
    modeTab(mode, "runes", "Sugar runes", "/$mode/runes"),
    modeTab(mode, "gear", "Gear", "/$mode/gear"),
    modeTab(mode, "mechanics", "Mechanics", "/$mode/mechanics"),
    modeTab(mode, "timeline", "Timeline", "/$mode/timeline"),
  ];
}
