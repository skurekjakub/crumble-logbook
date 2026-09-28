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
      lede: "How the dungeon works, then the load-bearing findings, each with the posts it stands on.",
    },
    decks: {
      title: "Teams",
      lede: "The lineups behind the top scores, as their owners describe them. There is no formation: the cookies with the highest power deploy first, so every cookie carries the level or level rule that puts it in (or keeps it out of) the first wave, and why it's there. Each team's ATK order runs from the top.",
    },
    usage: {
      title: "Usage",
      lede: "How often each cookie appears in the full first-40 lists published in September. These are guides' lists, not a ranking of what scores.",
    },
    runes: {
      title: "Sugar runes",
      lede: 'Dungeon rune lines per cookie. "All" means every line rolls the same stat. Disputed rows are where posters disagreed; both sides are kept.',
    },
    gear: {
      title: "Gear substats",
      lede: "The dungeon has no preset of its own: players pick an existing one. Each note says which and why.",
    },
    mechanics: {
      title: "Mechanics",
      lede: "What players measured or inferred about how the dungeon plays. Confidence reflects how well each point is sourced. The mode's rules are on its overview.",
    },
    timeline: {
      title: "How the scores moved",
      lede: "Launch, patches, guides and record runs, oldest first.",
    },
  },
  boss: null,
  leaderboard: null,
  rules: { title: "How Crumble Dungeon works", highlight: null },
  stage: null,
  dungeon: {
    runs: {
      title: "Runs",
      lede: "Documented scores, ranked by score. The runs a screenshot or video shows are ranked; scores stated only in text or posted as claims follow as claims. Total power is the whole collection's power the result screen shows, not a team's power. Score ÷ total power is only a normaliser for comparing accounts; it ranks nothing.",
    },
    lineups: {
      title: "Published lineups",
      lede: "The first-wave lists guides published, in the author's order, with the ATK order from the top, the rule the levels follow, and the cookies each keeps out. Cookies the exclusions list names are flagged where a lineup keeps them.",
      topic: "deployment",
    },
    exclusions: {
      title: "Exclusions",
      lede: "Cookies players level out of the first wave, each with the kind of reason, why, where it stands now, and the published lineups that leave it out or keep it.",
      topic: "formation",
    },
    firstWave: 40,
  },
} as const satisfies ModeSection;
