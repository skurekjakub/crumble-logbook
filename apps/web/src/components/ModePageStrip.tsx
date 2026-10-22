import { Link } from "@tanstack/react-router";
import type { NavPage } from "./SideNav";

/** Props for {@link ModePageStrip}. */
export interface ModePageStripProps {
  /** The navigation landmark's accessible name, e.g. `Setup pages`. */
  label: string;
  /** The pages, in order; the strip draws nothing for none. */
  pages: readonly NavPage[];
}

/**
 * A row of links to a mode's Setup pages at the top of its pages, so a
 * phone reaches them without opening the menu. The page shown is filled
 * and carries `aria-current="page"`; the row scrolls sideways when it
 * doesn't fit. Plain links, not ARIA tabs: each one loads a page.
 *
 * @param props - the landmark's name and the pages
 * @returns the strip, or null with no pages
 */
export function ModePageStrip({ label, pages }: ModePageStripProps) {
  if (!pages.length) return null;
  return (
    <nav className="page-strip" aria-label={label}>
      <ul>
        {pages.map((p) => (
          <li key={p.id}>
            <Link
              {...p.link}
              // Link forces aria-current="page" on an active match; exact matching keeps that to the page itself.
              activeOptions={{ exact: true, includeSearch: false, includeHash: false }}
              aria-current={p.current ? "page" : undefined}
            >
              {p.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
