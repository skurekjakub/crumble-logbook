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
      lede: "How the mode works, then the load-bearing findings, each with the posts it stands on.",
    },
    usage: {
      title: "Usage",
      lede: "How often each cookie and pet appears in community-shared Arena decks on crumblehub. These are shared decks, not ladder usage: no site publishes regular-Arena usage.",
    },
  },
  boss: null,
  leaderboard: null,
  rules: { title: "How Arena works", highlight: "Season buffs" },
  stage: null,
  dungeon: null,
} as const satisfies ModeSection;
