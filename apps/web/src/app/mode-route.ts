/**
 * What the routes under `routes/$mode/` share: resolving the `$mode` path
 * segment to its section, and refusing a page the mode doesn't have. A
 * mode is data here: a new mode is a section in `modes/`, and its pages
 * are the shared route files its tabs name.
 *
 * @module
 */
import { notFound } from "@tanstack/react-router";
import type { ModeSection } from "./modes";
import { modeById, tabAt } from "./modes";

/**
 * Resolves the `$mode` path segment to its game mode's section.
 *
 * @param id - the segment, e.g. `arena`
 * @returns the mode's section, for the route context
 * @throws the router's not-found error when no mode has that id
 */
export function resolveMode(id: string): { mode: ModeSection } {
  const mode = modeById(id);
  if (!mode) throw notFound();
  return { mode };
}

/**
 * Refuses a page the mode doesn't list among its tabs, so a shared route
 * file serves only the modes that have its page (`/arena/scores` is not a
 * page, `/conquest/scores` is).
 *
 * @param mode - the mode, from the route context
 * @param pathname - the requested path; a trailing slash is ignored
 * @throws the router's not-found error when no tab of the mode is at `pathname`
 */
export function requireTab(mode: ModeSection, pathname: string): void {
  if (!tabAt(mode, pathname)) throw notFound();
}
