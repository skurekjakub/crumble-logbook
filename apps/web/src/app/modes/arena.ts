/**
 * The Arena section: its tabs, view copy and rules card.
 *
 * @module
 */
import { modeLink } from "./links";
import { PVP_COPY, pvpTabs } from "./pvp-shared";
import type { ModeSection } from "./types";

/** Arena (아레나): regular, per-server PvP. */
export const ARENA = {
  id: "arena",
  kind: "mode",
  label: "Arena",
  labelKr: "아레나",
  title: "Arena Logbook",
  to: "/arena",
  link: modeLink("arena"),
  recordSlug: "002-pvp-meta",
  lede: null,
  stamp: ["updated", "sources", "decks"],
  tabs: pvpTabs("arena"),
  scope: { mode: "arena" },
  placeholder: null,
  copy: {
    ...PVP_COPY,
    overview: {
      title: "What wins in Arena",
      lede: [
        "How the mode works, then the findings that decide it.",
        "Each finding cites its posts.",
      ],
    },
    usage: {
      title: "Usage",
      lede: [
        "Share of community-shared crumblehub decks per cookie and pet.",
        "Shared decks, not ladder usage: no site publishes that.",
      ],
    },
  },
  boss: null,
  leaderboard: null,
  rules: { title: "How Arena works", highlight: "Season buffs" },
  accountTitle: "Your lineup against the meta",
  stage: null,
  dungeon: null,
  teamPower: null,
} as const satisfies ModeSection;
