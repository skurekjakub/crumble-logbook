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
    lede: [
      "Laid out like the formation screen: back line left, front right.",
      "A team seen only on a defense card shows as a plain lineup.",
      "? marks a star count no screenshot shows.",
    ],
  },
  counters: {
    title: "Counters",
    lede: [
      "Row: the team you face. Column: the team that beats it.",
      "Colour is confidence; hatched tiles are unverified claims.",
      "Expand a tile for the mechanism; its badge opens the posts.",
    ],
  },
  runes: {
    title: "Sugar runes",
    lede: [
      "PvP rune lines per cookie.",
      '"All" means every line rolls the same stat.',
      "Disputed rows keep both sides.",
    ],
  },
  gear: {
    title: "Gear substats",
    lede: [
      "Laid out like the equipment screen.",
      "Set-wide notes, such as which preset to wear, sit under the board.",
    ],
  },
  mechanics: {
    title: "Mechanics",
    lede: [
      "What players measured or datamined.",
      "Confidence shows how well each point is sourced.",
      "The mode's rules are on its overview.",
    ],
  },
  timeline: {
    title: "How the meta moved",
    lede: ["Patches, new cookies, seasons and the teams that followed, oldest first."],
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
