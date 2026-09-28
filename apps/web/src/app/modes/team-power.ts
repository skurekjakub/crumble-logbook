/**
 * The team-power section: its tabs, view copy, rules card and the
 * team-power screens (routes, cost and efficiency, spending order,
 * planner, packages, curves, data points).
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
      lede: "Where team power counts, then the load-bearing findings, each with the posts it stands on.",
    },
    mechanics: {
      title: "Mechanics",
      lede: "How the game computes and grows displayed power, as players measured or read it. Confidence reflects how well each point is sourced. Where team power counts is on the overview.",
    },
    timeline: {
      title: "How the growth systems moved",
      lede: "Patches that changed a power source's cost, cap or curve, oldest first.",
    },
  },
  boss: null,
  leaderboard: null,
  rules: { title: "What team power decides", highlight: null },
  stage: null,
  dungeon: null,
  teamPower: {
    routes: {
      title: "Routes",
      lede: "The free route and the paid route near 2.2G, as the record ranks them. Each step carries its basis: only a posted step rests on a player's own before-and-after figure. The gain is the one the record ties to that step; a step without one says so.",
    },
    powerSources: {
      title: "Cost and efficiency",
      lede: "Every power source by what it costs and how much power it gives for that cost, at the account stage you pick. The grades are the record's: high is several percent of team power for a cost met within days, medium about 1% per a few days' income or about ₩10,000, low well under that or gated by luck or large sums, none no displayed power. A note that doesn't lead with a grade isn't graded.",
    },
    spending: {
      title: "Spending order",
      lede: "The order to spend in at each account stage, free and paid, with what each step's place rests on and why it sits there.",
    },
    defaultOrder: "endgame",
    planner: {
      title: "Planner",
      lede: "Type your team power as the formation screen shows it. The planner places you on the main stages with the power gate's brackets and each chapter's recommended power, then shows what each step the record weighs would buy. It multiplies only by posted gains; a claimed or unmeasured step shows why no reach is derived.",
    },
    reach: [55, 35, 15],
    packages: {
      title: "Packages",
      lede: "The shop packages the sources discuss, with their KRW price and their USD price as the US App Store lists it, or the price tier it pairs with (≈, inferred). Crystal value compares a package's contents with the plain Crystal pack; it is not team power. The shop rotates: prices are as of 2026-09-28.",
    },
    curves: {
      title: "Curves",
      lede: "How each power source's cost climbs and its return falls: odds, costs and stats by level, condensed from game data and posted tables.",
    },
    dataPoints: {
      title: "Data points",
      lede: "Every team-power figure the record found: measured changes, gains per step and account snapshots, in the record's order. Posted figures are players' own; claimed ones are stated without a measurement; inferred ones are the record's arithmetic.",
    },
  },
} as const satisfies ModeSection;
