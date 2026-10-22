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
  navGroup: "play",
  title: "Crumble Dungeon Logbook",
  to: "/dungeon",
  link: modeLink("dungeon"),
  recordSlug: "004-golden-drop-meta",
  lede: null,
  stamp: ["updated", "sources", "decks"],
  tabs: [
    modeTab("dungeon", "setup", "Best setup", "/$mode", "setup"),
    modeTab("dungeon", "teams", "Teams", "/$mode/teams", "setup"),
    modeTab("dungeon", "runes", "Sugar runes", "/$mode/runes", "setup"),
    modeTab("dungeon", "gear", "Gear", "/$mode/gear", "setup"),
    modeTab("dungeon", "lineups", "Lineups", "/$mode/lineups", "setup"),
    modeTab("dungeon", "findings", "Findings", "/$mode/findings", "details"),
    modeTab("dungeon", "runs", "Runs", "/$mode/runs", "details"),
    modeTab("dungeon", "exclusions", "Exclusions", "/$mode/exclusions", "details"),
    modeTab("dungeon", "usage", "Usage", "/$mode/usage", "details"),
    modeTab("dungeon", "mechanics", "Mechanics", "/$mode/mechanics", "details"),
    modeTab("dungeon", "timeline", "Timeline", "/$mode/timeline", "details"),
  ],
  scope: { mode: "crumble_dungeon" },
  placeholder: null,
  copy: {
    setup: {
      title: "Best setup for Crumble Dungeon",
      lede: [
        "The lead lineup by score, runes for its first cookies.",
        "Levels and each cookie's why are on the lineup's card.",
      ],
    },
    findings: {
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
    setupRunes: 12,
  },
  teamPower: null,
  daily: null,
  attempts: null,
} as const satisfies ModeSection;
