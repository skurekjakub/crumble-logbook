/**
 * The stage-pushing section: its tabs, view copy, rules card and the stage
 * screens (bracket calculator, zone board, clears, Dimensional Rift).
 *
 * @module
 */
import { modeLink, modeTab } from "./links";
import type { ModeSection } from "./types";

/** Stage pushing: main stages and the Dimensional Rift (차원의 이면), under-powered. */
export const STAGE = {
  id: "stage",
  kind: "mode",
  label: "Stage",
  labelKr: "스테이지",
  title: "Stage Pushing Logbook",
  to: "/stage",
  link: modeLink("stage"),
  recordSlug: "003-stage-pushing-meta",
  lede: null,
  stamp: ["updated", "sources", "decks"],
  tabs: [
    modeTab("stage", "overview", "Overview", "/$mode"),
    modeTab("stage", "brackets", "Bracket calculator", "/$mode/brackets"),
    modeTab("stage", "teams", "Teams", "/$mode/teams"),
    modeTab("stage", "zones", "Zones & bosses", "/$mode/zones"),
    modeTab("stage", "clears", "Clears", "/$mode/clears"),
    modeTab("stage", "rift", "Dimensional Rift", "/$mode/rift"),
    modeTab("stage", "usage", "Usage", "/$mode/usage"),
    modeTab("stage", "runes", "Sugar runes", "/$mode/runes"),
    modeTab("stage", "gear", "Gear", "/$mode/gear"),
    modeTab("stage", "mechanics", "Mechanics", "/$mode/mechanics"),
    modeTab("stage", "timeline", "Timeline", "/$mode/timeline"),
  ],
  scope: { mode: "stage" },
  placeholder: null,
  copy: {
    overview: {
      title: "How the pushers get through",
      lede: "How stages work, then the load-bearing findings, each with the posts it stands on.",
    },
    decks: {
      title: "Teams",
      lede: "The teams the record documents clearing stages under-powered, as their owners post them. Every cookie carries its level or level rule and why it's there; a deck's swaps say what changes per boss.",
    },
    usage: {
      title: "Usage",
      lede: "How often each cookie and pet appears in community-shared stage decks on crumblehub. These are shared decks, most of them from before the 2026-09-23 easing, not a ranking of what clears.",
    },
    runes: {
      title: "Sugar runes",
      lede: 'Stage rune lines per cookie. "All" means every line rolls the same stat. Disputed rows are where posters disagreed; both sides are kept.',
    },
    gear: {
      title: "Gear substats",
      lede: "Laid out like the equipment screen. Notes that apply to the whole set, such as which preset to wear, are under the board.",
    },
    mechanics: {
      title: "Mechanics",
      lede: "What players measured or datamined about the power gate, accuracy and focus, the zones and the bosses. Confidence reflects how well each point is sourced. The mode's rules are on its overview.",
    },
    timeline: {
      title: "How the push moved",
      lede: "Patches, the stage easing, the Rift's opening and the clears that followed, oldest first.",
    },
  },
  boss: null,
  leaderboard: null,
  rules: { title: "How stages work", highlight: null },
  stage: {
    brackets: {
      title: "Bracket calculator",
      lede: "Type your team power as the formation screen shows it. Each chapter's last stage then shows the share of damage you keep there and the power the next bracket takes, from the power gate's table and the stage's recommended power.",
      topic: "power-gate",
    },
    zones: {
      title: "Zones and boss slots",
      lede: "Chapters cycle through the zone layouts below; from chapter 169 each layout's boss slots are fixed. Each slot says what to bring and how low a bracket it has been cleared at.",
      topic: "zones",
      fixedFrom: 169,
    },
    clears: {
      title: "Clears",
      lede: "Documented attempts at the low brackets. The clears the record accepts are ranked furthest stage first and, at one stage, lowest power first; failures and the claims it leaves unverified or rejects follow, each under its own heading. Team power is as posted; before the 2026-09-23 easing, recommended power was higher from 169-1 to 328-30.",
      topic: "brackets-practice",
    },
    rift: {
      title: "Dimensional Rift",
      lede: "The seasonal, boss-only mode past 328-30: its rules, seasons and levels, the bosses players report per level, and the decks they bring. Type your power as the Rift shows it to place yourself on the levels.",
      topic: "rift",
      decks: ["rift-shred"],
      mentions: ["Rift", "차원", "이면"],
    },
    reach: [100, 75, 55, 35, 15],
  },
  dungeon: null,
  teamPower: null,
} as const satisfies ModeSection;
