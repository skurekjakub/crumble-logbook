/**
 * The team-power section: its tabs, view copy, rules card and the
 * team-power screens' config.
 *
 * @module
 */
import { modeLink, modeTab } from "./links";
import type { ModeSection } from "./types";

/** Team power (팀투): what raises the power the game shows for a lineup, free and paid, and at what cost. */
export const TEAM_POWER = {
  id: "team-power",
  kind: "mode",
  label: "Team power",
  labelKr: "팀투",
  title: "Team Power Logbook",
  to: "/team-power",
  link: modeLink("team-power"),
  recordSlug: "005-team-power-growth",
  lede: null,
  stamp: ["updated", "sources"],
  tabs: [
    modeTab("team-power", "overview", "Overview", "/$mode"),
    modeTab("team-power", "routes", "Routes", "/$mode/routes"),
    modeTab("team-power", "power-sources", "Cost & efficiency", "/$mode/power-sources"),
    modeTab("team-power", "spending", "Spending order", "/$mode/spending"),
    modeTab("team-power", "planner", "Planner", "/$mode/planner"),
    modeTab("team-power", "packages", "Packages", "/$mode/packages"),
    modeTab("team-power", "curves", "Curves", "/$mode/curves"),
    modeTab("team-power", "data-points", "Data points", "/$mode/data-points"),
    modeTab("team-power", "mechanics", "Mechanics", "/$mode/mechanics"),
    modeTab("team-power", "timeline", "Timeline", "/$mode/timeline"),
  ],
  scope: { mode: "team_power" },
  placeholder: null,
  copy: {
    overview: {
      title: "What raises team power",
      lede: ["Where team power counts, then what raises it."],
    },
    mechanics: {
      title: "Mechanics",
      lede: [
        "How the game computes and grows displayed power.",
        "The pill says how well each point is sourced.",
      ],
    },
    timeline: {
      title: "How the growth systems moved",
      lede: ["Patches that changed a cost, cap or curve, oldest first."],
    },
  },
  boss: null,
  leaderboard: null,
  rules: { title: "What team power decides", highlight: null },
  accountTitle: "For your account",
  stage: null,
  dungeon: null,
  teamPower: {
    routes: {
      title: "Routes",
      lede: [
        "The free and paid routes near 2.2G, in the record's order.",
        "Only a green Posted step rests on a measured gain.",
      ],
    },
    powerSources: {
      title: "Cost and efficiency",
      lede: [
        "Every power source's cost and grade at your account stage.",
        "High: several percent of team power within days.",
        "Most grades are judgement; a green Posted mark is measured.",
      ],
    },
    spending: {
      title: "Spending order",
      lede: [
        "What to spend on first at each account stage.",
        "The pill says what each step's place rests on.",
      ],
    },
    defaultOrder: "endgame",
    planner: {
      title: "Planner",
      lede: [
        "Type your team power as the formation screen shows it.",
        "See how far it pushes, and what each step buys.",
        "Only posted gains are multiplied in.",
      ],
    },
    reach: [55, 35, 15],
    packages: {
      title: "Packages",
      lede: [
        "Shop packages the sources discuss, with a buy or skip verdict.",
        "≈ marks a USD price inferred from its KRW tier.",
        "Prices as of 2026-09-28; the shop rotates.",
      ],
    },
    curves: {
      title: "Curves",
      lede: ["How each power source's cost climbs and its return falls."],
    },
    dataPoints: {
      title: "Data points",
      lede: [
        "Every team-power figure the record found, in its order.",
        "Posted: a player's own. Claimed: stated. Inferred: the record's maths.",
      ],
    },
  },
  daily: null,
} as const satisfies ModeSection;
