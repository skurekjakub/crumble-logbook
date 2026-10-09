/**
 * The daily dungeon section: its tabs, view copy, rules card and the
 * dungeon board, its landing page.
 *
 * @module
 */
import { modeLink, modeTab } from "./links";
import type { ModeSection } from "./types";

/** The daily dungeons (일일던전): material dungeons pushed stage by stage, each with its own boss and key. */
export const DAILY = {
  id: "daily-dungeons",
  kind: "mode",
  label: "Daily Dungeons",
  labelKr: "일일던전",
  title: "Daily Dungeons Logbook",
  to: "/daily-dungeons",
  link: modeLink("daily-dungeons"),
  recordSlug: "006-daily-dungeons",
  lede: null,
  stamp: ["updated", "sources", "decks"],
  tabs: [
    modeTab("daily-dungeons", "dungeons", "Dungeons", "/$mode"),
    modeTab("daily-dungeons", "overview", "Overview", "/$mode/overview"),
    modeTab("daily-dungeons", "teams", "Teams", "/$mode/teams"),
    modeTab("daily-dungeons", "mechanics", "Mechanics", "/$mode/mechanics"),
    modeTab("daily-dungeons", "timeline", "Timeline", "/$mode/timeline"),
  ],
  scope: { mode: "daily_dungeon" },
  placeholder: null,
  copy: {
    overview: {
      title: "What clears the daily dungeons",
      lede: ["How the dungeons work, then what the furthest clears share."],
    },
    decks: {
      title: "Teams",
      lede: ["Every daily dungeon deck, with levels and why."],
    },
    mechanics: {
      title: "Mechanics",
      lede: [
        "What players measured or inferred about the dungeons.",
        "The pill says how well each point is sourced.",
      ],
    },
    timeline: {
      title: "How the dungeons moved",
      lede: ["Patches, guides and record clears, oldest first."],
    },
  },
  boss: null,
  leaderboard: null,
  rules: { title: "How the daily dungeons work", highlight: null },
  accountTitle: "For your account",
  stage: null,
  dungeon: null,
  teamPower: null,
  daily: {
    board: {
      title: "Daily dungeons",
      lede: [
        "Pick a dungeon: its best full-auto deck leads.",
        "Other decks rank by stage reached.",
      ],
    },
    heroTitle: "Best full auto",
    decksTitle: "Decks by stage",
    clearsTitle: "Clears",
  },
} as const satisfies ModeSection;
