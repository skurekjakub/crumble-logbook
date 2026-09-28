/**
 * The Rumble Arena section: its tabs, view copy and rules card.
 *
 * @module
 */
import { modeLink } from "./links";
import { PVP_COPY, pvpTabs } from "./pvp-shared";
import type { ModeSection } from "./types";

/** Rumble Arena (와글와글 아레나): cross-server PvP with a passive per season. */
export const RUMBLE = {
  id: "rumble",
  kind: "mode",
  label: "Rumble Arena",
  labelKr: "와글와글 아레나",
  title: "Rumble Arena Logbook",
  to: "/rumble",
  link: modeLink("rumble"),
  recordSlug: "002-pvp-meta",
  lede: null,
  stamp: ["updated", "sources", "decks"],
  tabs: pvpTabs("rumble"),
  scope: { mode: "rumble_arena" },
  placeholder: null,
  copy: {
    ...PVP_COPY,
    overview: {
      title: "What wins in Rumble Arena",
      lede: "The season's buffs shape this mode's meta, so they come first. Then how the mode works and the load-bearing findings, each with the posts it stands on.",
    },
    usage: {
      title: "Usage",
      lede: "How often each cookie, core, pet and team appears among the top defenses on crumb.gg. The game hides some defenders, so cookie figures are lower bounds, and core and team figures are upper bounds: the solid part of their bars has every member revealed.",
    },
  },
  boss: null,
  leaderboard: null,
  rules: { title: "How Rumble Arena works", highlight: "Season buffs" },
  accountTitle: "Your lineup against the meta",
  stage: null,
  dungeon: null,
  teamPower: null,
} as const satisfies ModeSection;
