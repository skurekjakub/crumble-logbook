/**
 * The Crumble Dungeon section: its tabs, view copy, rules card and the
 * dungeon screens (runs board, published lineups, exclusions).
 *
 * @module
 */
import { modeLink, modeTab } from "./links";
import type { ModeSection } from "./types";

/** Crumble Dungeon (크럼블 던전): the whole collection against the Holy Golden Drop, scored on damage. */
export const DUNGEON = {
  id: "dungeon",
  kind: "mode",
  label: "Crumble Dungeon",
  labelKr: "크럼블 던전",
  title: "Crumble Dungeon Logbook",
  to: "/dungeon",
  link: modeLink("dungeon"),
  recordSlug: "004-golden-drop-meta",
  lede: null,
  stamp: ["updated", "sources", "decks"],
  tabs: [
    modeTab("dungeon", "overview", "Overview", "/$mode"),
    modeTab("dungeon", "runs", "Runs", "/$mode/runs"),
    modeTab("dungeon", "teams", "Teams", "/$mode/teams"),
    modeTab("dungeon", "lineups", "Lineups", "/$mode/lineups"),
    modeTab("dungeon", "exclusions", "Exclusions", "/$mode/exclusions"),
    modeTab("dungeon", "usage", "Usage", "/$mode/usage"),
    modeTab("dungeon", "runes", "Sugar runes", "/$mode/runes"),
    modeTab("dungeon", "gear", "Gear", "/$mode/gear"),
    modeTab("dungeon", "mechanics", "Mechanics", "/$mode/mechanics"),
    modeTab("dungeon", "timeline", "Timeline", "/$mode/timeline"),
  ],
  scope: { mode: "crumble_dungeon" },
  placeholder: null,
  copy: {
    overview: {
      title: "How the top scores are built",
      lede: ["How the dungeon works, then what the top scores share."],
    },
    decks: {
      title: "Teams",
      lede: [
        "The lineups behind the top scores, as their owners run them.",
        "No formation: the highest-power cookies deploy first.",
        "Each cookie's level puts it in or keeps it out.",
      ],
    },
    usage: {
      title: "Usage",
      lede: [
        "How often each cookie appears in published first-40 lists.",
        "Guides' lists, not a ranking of what scores.",
      ],
    },
    runes: {
      title: "Sugar runes",
      lede: [
        'Dungeon rune lines per cookie; "All" means every line.',
        "Disputed rows keep both sides.",
      ],
    },
    gear: {
      title: "Gear substats",
      lede: ["No dungeon preset: players reuse an existing one."],
    },
    mechanics: {
      title: "Mechanics",
      lede: [
        "What players measured or inferred about the dungeon.",
        "The pill says how well each point is sourced.",
      ],
    },
    timeline: {
      title: "How the scores moved",
      lede: ["Launch, patches, guides and record runs, oldest first."],
    },
  },
  boss: null,
  leaderboard: null,
  rules: { title: "How Crumble Dungeon works", highlight: null },
  accountTitle: "Your lineup against the meta",
  stage: null,
  dungeon: {
    runs: {
      title: "Runs",
      lede: [
        "Ranked by score; only screenshot or video runs rank.",
        "Text-only scores follow as claims.",
        "Score ÷ collection power only normalises accounts.",
      ],
    },
    lineups: {
      title: "Published lineups",
      lede: [
        "Guides' first-wave lists, in the author's order.",
        "Red ring: a cookie the exclusions list levels out.",
      ],
      topic: "deployment",
    },
    exclusions: {
      title: "Exclusions",
      lede: [
        "Cookies players level out of the first wave.",
        "The status pill says whether the advice still holds.",
      ],
      topic: "formation",
    },
    firstWave: 40,
  },
  teamPower: null,
  daily: null,
} as const satisfies ModeSection;
