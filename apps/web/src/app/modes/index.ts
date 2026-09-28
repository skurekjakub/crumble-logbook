/**
 * The app's navigation and mode config: game modes (each with its research
 * record, sub-tabs, API scope, view copy and mode-specific screens) and the
 * shared sections that sit outside any mode. The root route renders the
 * header, mode tabs and sub-tabs from this module alone.
 *
 * A view that serves several modes takes a {@link ModeSection} and reads
 * its scope and copy from it; the shared route files under `routes/$mode/`
 * mount it for every mode whose tabs list the page. A mode-specific screen
 * (the conquest boss screen) takes its own config block from its mode.
 * Each mode's section lives in its own file here; a new mode is a new
 * file, added to {@link MODES}.
 *
 * @module
 */
import { RULES_TOPIC } from "../../api/queries";
import { ARENA } from "./arena";
import { CONQUEST } from "./conquest";
import { RUMBLE } from "./rumble";
import { SHARED_SECTIONS } from "./shared";
import type { ModeSection, Section, SectionTab } from "./types";

export type * from "./types";
export { modeLink, modePath, modeTab } from "./links";
export { ARENA, CONQUEST, RUMBLE, SHARED_SECTIONS };

/** Game modes, in tab order. */
export const MODES: readonly ModeSection[] = [CONQUEST, ARENA, RUMBLE];

/** Every top-level section, modes first. */
export const SECTIONS: readonly Section[] = [...MODES, ...SHARED_SECTIONS];

/**
 * The game mode whose first path segment is `id`.
 *
 * @param id - a path segment, e.g. `arena`
 * @returns the mode's section, or undefined when no mode has that id
 */
export function modeById(id: string): ModeSection | undefined {
  return MODES.find((m) => m.id === id);
}

/**
 * The tab of a section at exactly `pathname`.
 *
 * @param section - the section
 * @param pathname - a location pathname; a trailing slash is ignored
 * @returns the tab, or undefined when none is at that path
 */
export function tabAt(section: Section, pathname: string): SectionTab | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return section.tabs.find((t) => t.to === path);
}

/**
 * The mechanics topics a mode shows somewhere other than its mechanics
 * view: its rules (on the overview) and its boss's facts (in the boss
 * screen's header list). The mechanics view leaves them out.
 *
 * @param mode - the mode
 * @returns the topics
 */
export function topicsShownElsewhere(mode: ModeSection): ReadonlySet<string> {
  return new Set([RULES_TOPIC, ...(mode.boss?.facts.map((f) => f.topic) ?? [])]);
}

/**
 * Reports whether `pathname` is `to` or lies under it.
 *
 * @param pathname - the current path
 * @param to - a route path
 * @returns `true` if `pathname` is `to` or inside it
 */
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
