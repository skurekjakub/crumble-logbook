/**
 * Builds a mode's paths and links from its id and the shared routes under
 * `routes/$mode/`, so a mode's tabs name routes the route tree checks.
 *
 * @module
 */
import type { AppPath, LinkTarget, ModeRoutePath, SectionTab } from "./types";

/**
 * A route under a mode, made concrete for one mode.
 *
 * @param mode - the mode's id, its first path segment
 * @param route - the route, e.g. `/$mode/teams`
 * @returns the concrete path, e.g. `/arena/teams`
 */
export function modePath(mode: string, route: ModeRoutePath): AppPath {
  return `/${mode}${route.slice("/$mode".length)}`;
}

/**
 * A link to a route under a mode.
 *
 * @param mode - the mode's id
 * @param route - the route; the mode's landing page when omitted
 * @returns the link target
 */
export function modeLink(mode: string, route: ModeRoutePath = "/$mode"): LinkTarget {
  return { to: route, params: { mode } };
}

/**
 * One tab of a mode.
 *
 * @param mode - the mode's id
 * @param id - the tab's id, unique within the mode
 * @param label - the tab's label
 * @param route - the route the tab shows
 * @returns the tab, with its concrete path and its link
 */
export function modeTab(mode: string, id: string, label: string, route: ModeRoutePath): SectionTab {
  return { id, label, to: modePath(mode, route), link: modeLink(mode, route) };
}
