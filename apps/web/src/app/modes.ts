/**
 * The app's navigation config: game modes (each with its research record
 * and sub-tabs) and the shared sections that sit outside any mode. The root
 * route renders the header, mode tabs and sub-tabs from this file alone, so
 * a new view is a route file plus, for a sub-tab, one entry here.
 */
import type { FileRoutesByTo } from "../routeTree.gen";

/** A navigable app path, checked against the generated route tree. */
export type AppPath = keyof FileRoutesByTo;

/** A figure the header's stamp can show. */
export type StampStat = "updated" | "season" | "sources" | "decks";

/** A sub-tab within a section. */
export interface SectionTab {
  /** Unique within the section; the tab's DOM id is `tab-<section id>-<tab id>`. */
  id: string;
  label: string;
  to: AppPath;
}

/** A top-level section: a game mode or a shared page. */
export interface Section {
  /** The first path segment, and the tab's DOM id suffix (`tab-<id>`). */
  id: string;
  /** "mode" sections carry a game mode's research; "shared" ones serve every mode. */
  kind: "mode" | "shared";
  /** Tab label. */
  label: string;
  /** Korean name shown in the header label instead of `label`, when known. */
  labelKr: string | null;
  /** The header's `<h1>`. */
  title: string;
  to: AppPath;
  /** The research record whose lede, season and update date fill the header; null for none. */
  recordSlug: string | null;
  /** Header lede when there's no record, or the record has none. */
  lede: string | null;
  /** Figures shown in the header stamp, in order. */
  stamp: readonly StampStat[];
  /** Sub-tabs, in order; the first is the section's landing page. Empty for none. */
  tabs: readonly SectionTab[];
}

/** Game modes, in tab order. */
export const MODES: readonly Section[] = [
  {
    id: "conquest",
    kind: "mode",
    label: "Guild Conquest",
    labelKr: "길드 토벌전",
    title: "Piñata Raid Logbook",
    to: "/conquest",
    recordSlug: "001-guild-conquest-meta",
    lede: null,
    stamp: ["updated", "season", "sources", "decks"],
    tabs: [
      { id: "overview", label: "Overview", to: "/conquest" },
      { id: "decks", label: "Decks", to: "/conquest/decks" },
      { id: "runes", label: "Sugar runes", to: "/conquest/runes" },
      { id: "gear", label: "Gear", to: "/conquest/gear" },
      { id: "scores", label: "Scores & RNG", to: "/conquest/scores" },
      { id: "mechanics", label: "Mechanics", to: "/conquest/mechanics" },
      { id: "timeline", label: "Timeline", to: "/conquest/timeline" },
      { id: "boss", label: "Piñata", to: "/conquest/boss" },
    ],
  },
  {
    id: "arena",
    kind: "mode",
    label: "Arena",
    labelKr: null,
    title: "Arena Logbook",
    to: "/arena",
    recordSlug: null,
    lede: "Arena research is in progress; its screens come once the record has findings.",
    stamp: [],
    tabs: [],
  },
  {
    id: "rumble",
    kind: "mode",
    label: "Rumble Arena",
    labelKr: null,
    title: "Rumble Arena Logbook",
    to: "/rumble",
    recordSlug: null,
    lede: "Rumble Arena research is in progress; its screens come once the record has findings.",
    stamp: [],
    tabs: [],
  },
];

/** Sections shared by every mode, in tab order after the modes. */
export const SHARED_SECTIONS: readonly Section[] = [
  {
    id: "sources",
    kind: "shared",
    label: "Sources",
    labelKr: null,
    title: "Crumble Logbook",
    to: "/sources",
    recordSlug: null,
    lede: null,
    stamp: ["sources"],
    tabs: [],
  },
  {
    id: "glossary",
    kind: "shared",
    label: "Glossary",
    labelKr: null,
    title: "Crumble Logbook",
    to: "/glossary",
    recordSlug: null,
    lede: null,
    stamp: [],
    tabs: [],
  },
];

/** Every top-level section, modes first. */
export const SECTIONS: readonly Section[] = [...MODES, ...SHARED_SECTIONS];

/** Whether `pathname` is `to` or lies under it. */
function isUnder(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`);
}

/**
 * The section a path belongs to, by its first segment.
 *
 * @param pathname - a location pathname, e.g. `/conquest/decks`
 * @returns the section, or undefined for `/` and unknown paths
 */
export function sectionForPath(pathname: string): Section | undefined {
  return SECTIONS.find((s) => isUnder(pathname, s.to));
}

/**
 * The sub-tab a path selects: the tab whose path is the longest prefix of it.
 *
 * @param tabs - a section's tabs
 * @param pathname - a location pathname; a trailing slash is ignored
 * @returns the selected tab, or undefined when none matches
 */
export function activeTab(tabs: readonly SectionTab[], pathname: string): SectionTab | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return tabs
    .filter((t) => isUnder(path, t.to))
    .reduce<SectionTab | undefined>(
      (best, t) => (!best || t.to.length > best.to.length ? t : best),
      undefined,
    );
}
