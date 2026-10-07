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
      lede: [
        "Season buffs first: they shape this meta.",
        "Then the rules and the findings, each citing its posts.",
      ],
    },
    usage: {
      title: "Usage",
      lede: [
        "Share of the top crumb.gg defenses, ranked.",
        "Hidden defenders make cookie shares lower bounds.",
        "Core and team bars are upper bounds; the solid strip is confirmed.",
      ],
    },
  },
  boss: null,
  leaderboard: null,
  rules: { title: "How Rumble Arena works", highlight: "Season buffs" },
  accountTitle: "Your lineup against the meta",
  stage: null,
  dungeon: null,
  teamPower: null,
  daily: null,
} as const satisfies ModeSection;
