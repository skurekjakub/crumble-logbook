/**
 * The stage-pushing section: its tabs, view copy, rules card and the stage
 * screens (bracket calculator, zone board, clears, Dimensional Rift and its
 * clears at 15%).
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
    modeTab("stage", "rift-15", "Rift at 15%", "/$mode/rift-15"),
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
      lede: [
        "How stages work, then the findings that carry the push.",
        "Each finding links its posts.",
      ],
    },
    decks: {
      title: "Teams",
      lede: [
        "Teams documented clearing stages under-powered.",
        "Every cookie shows its level and why it's there.",
        "Swaps say what changes per boss.",
      ],
    },
    usage: {
      title: "Usage",
      lede: [
        "How often cookies and pets appear in shared crumblehub decks.",
        "Mostly pre-easing decks: popularity, not what clears.",
      ],
    },
    runes: {
      title: "Sugar runes",
      lede: [
        "Stage rune lines per cookie.",
        '"All": every line rolls the same stat.',
        "Disputed rows keep both sides.",
      ],
    },
    gear: {
      title: "Gear substats",
      lede: [
        "Laid out like the equipment screen.",
        "Set-wide notes, such as the preset to wear, sit under it.",
      ],
    },
    mechanics: {
      title: "Mechanics",
      lede: [
        "What players measured or datamined about stages.",
        "Confidence says how well each point is sourced.",
        "The mode's rules are on its overview.",
      ],
    },
    timeline: {
      title: "How the push moved",
      lede: ["Patches and the clears that followed, oldest first."],
    },
  },
  boss: null,
  leaderboard: null,
  rules: { title: "How stages work", highlight: null },
  accountTitle: "Your lineup against the meta",
  stage: {
    brackets: {
      title: "Bracket calculator",
      lede: [
        "Type your team power from the formation screen.",
        "See how far you keep each damage share.",
        "Every chapter's boss stage shows your bracket there.",
      ],
      topic: "power-gate",
    },
    zones: {
      title: "Zones and boss slots",
      lede: [
        "Chapters cycle through these zone layouts.",
        "From chapter 169 each layout's boss slots are fixed.",
        "Each slot: what to bring, lowest bracket cleared.",
      ],
      topic: "zones",
      fixedFrom: 169,
    },
    clears: {
      title: "Clears",
      lede: [
        "Accepted clears: furthest stage first, then lowest power.",
        "Failures and unverified or rejected claims follow.",
        "Pre-easing rows faced higher recommended power.",
      ],
      topic: "brackets-practice",
    },
    rift: {
      title: "Dimensional Rift",
      lede: [
        "Seasonal, boss-only mode past 328-30.",
        "Type your power as the Rift shows it.",
        "Levels, bosses per level and the decks players bring.",
      ],
      topic: "rift",
      decks: ["rift-shred"],
      mentions: ["Rift", "차원", "이면"],
    },
    riftClears: {
      title: "Rift at 15%",
      lede: [
        "Highest level first, then lowest power; never a ratio.",
        "The bracket is read off Rift power, 차원의 힘 included.",
        "Attempts without it, at other brackets or failed bound the reach.",
      ],
      bracket: 15,
      lines: [15, 35],
    },
    reach: [100, 75, 55, 35, 15],
  },
  dungeon: null,
  teamPower: null,
} as const satisfies ModeSection;
