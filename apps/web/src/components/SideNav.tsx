import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import type { LinkTarget } from "../app/modes";
import { ThemeToggle } from "./ThemeToggle";

/** One page link under the current section of a {@link SideNav}. */
export interface NavPage {
  /** Unique within the section; the React key. */
  id: string;
  label: string;
  link: LinkTarget;
  /** Whether this is the page shown. */
  current: boolean;
}

/** One top-level entry of a {@link SideNav}: a game mode or a shared section. */
export interface NavSection {
  /** Unique within the nav; the React key. */
  id: string;
  label: string;
  link: LinkTarget;
  /**
   * `page` when the section's own landing page is shown, `section` when one
   * of its other pages is, null otherwise.
   */
  current: "page" | "section" | null;
  /**
   * The section has pages that following its link lists beneath it; the
   * phone drawer then stays open so one of them can be picked.
   */
  hasPages?: boolean;
  /** The section's pages, listed under it; empty to list none. */
  pages: readonly NavPage[];
}

/** A labelled group of a {@link SideNav}'s sections. */
export interface NavSectionGroup {
  /** Unique within the nav; the React key and part of the label's id. */
  id: string;
  /** The label shown above the group's list, which names the list. */
  label: string;
  /** The group's sections, in order; a group with none isn't drawn. */
  sections: readonly NavSection[];
}

/** Props for {@link SideNav}. */
export interface SideNavProps {
  /** The element id; a phone's menu button opens the nav as a popover by it. */
  id: string;
  /** The navigation landmark's accessible name. */
  label: string;
  /** The groups, in order. */
  groups: readonly NavSectionGroup[];
}

/**
 * Hides the nav's popover after a link inside it is followed, unless the
 * link is marked `data-keep-open`. Does nothing where the popover isn't
 * open (the desktop sidebar) or the browser has no popover API.
 *
 * @param e - the click on the nav
 */
function closeAfterFollow(e: MouseEvent<HTMLElement>) {
  const nav = e.currentTarget;
  const link = e.target instanceof Element ? e.target.closest("a") : null;
  if (!link || link.hasAttribute("data-keep-open")) return;
  if (typeof nav.hidePopover !== "function" || !nav.matches(":popover-open")) return;
  nav.hidePopover();
}

/**
 * One section's entry: its link, and its pages nested beneath it when it
 * lists them.
 *
 * @param props - the section
 * @returns the list item
 */
function SectionItem({ section: s }: { section: NavSection }) {
  return (
    <li className="nav-section">
      <Link
        {...s.link}
        className="nav-section-link"
        data-keep-open={s.hasPages ? "" : undefined}
        // Link forces aria-current="page" on an active match; exact matching keeps that to the page itself.
        activeOptions={{ exact: true, includeSearch: false, includeHash: false }}
        aria-current={s.current === "page" ? "page" : s.current === "section" ? "true" : undefined}
      >
        <span className="nav-en">{s.label}</span>
      </Link>
      {s.pages.length ? (
        <ul className="nav-pages" aria-label={`${s.label} sections`}>
          {s.pages.map((p) => (
            <li key={p.id}>
              <Link
                {...p.link}
                activeOptions={{ exact: true, includeSearch: false, includeHash: false }}
                aria-current={p.current ? "page" : undefined}
              >
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * The logbook's index: the sections in labelled groups, and the current
 * section's pages nested beneath it. The current page's link carries
 * `aria-current="page"` and the current section's `aria-current="true"`.
 *
 * On a wide screen the stylesheet shows it as a sticky sidebar; on a phone
 * it's a popover drawer opened by a button with `popoverTarget={id}`.
 *
 * @param props - the element id, the landmark's name and the groups
 * @returns the navigation landmark
 */
export function SideNav({ id, label, groups }: SideNavProps) {
  return (
    <nav id={id} className="sidenav" aria-label={label} popover="auto" onClick={closeAfterFollow}>
      <div className="brand">
        <span className="brand-name">Crumble Logbook</span>
        <span className="brand-game">Cookie Run: Crumble</span>
        <ThemeToggle />
      </div>
      {groups
        .filter((g) => g.sections.length)
        .map((g) => (
          <div key={g.id} className="nav-group">
            <span className="nav-group-label" id={`${id}-${g.id}`}>
              {g.label}
            </span>
            <ul className="nav-sections" aria-labelledby={`${id}-${g.id}`}>
              {g.sections.map((s) => (
                <SectionItem key={s.id} section={s} />
              ))}
            </ul>
          </div>
        ))}
    </nav>
  );
}
