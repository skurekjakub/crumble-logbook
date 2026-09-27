import { Link } from "@tanstack/react-router";
import type { AppPath } from "../app/modes";

/** One link of a {@link TabNav}. */
export interface TabItem {
  /** Unique within the strip; the React key. */
  id: string;
  label: string;
  to: AppPath;
  /**
   * `page` for the link to the page shown, `section` for the link to the
   * section the page belongs to, null for any other.
   */
  current: "page" | "section" | null;
  /** Draw a divider before this link, to start a new group. */
  startsGroup?: boolean;
}

/** Props for {@link TabNav}. */
export interface TabNavProps {
  /** The navigation landmark's accessible name. */
  label: string;
  items: readonly TabItem[];
  /** Extra class on the `<nav>` beside `tabs`, e.g. `modes` or `sub`. */
  className?: string;
}

/**
 * A pill strip of navigation links (`nav.tabs`). The current page's link
 * carries `aria-current="page"` and the current section's `aria-current="true"`;
 * both are filled.
 */
export function TabNav({ label, items, className }: TabNavProps) {
  return (
    <nav className={className ? `tabs ${className}` : "tabs"} aria-label={label}>
      {items.map((t) => [
        t.startsGroup ? <span key={`${t.id}-sep`} className="sep" aria-hidden="true" /> : null,
        <Link
          key={t.id}
          to={t.to}
          // Link forces aria-current="page" on an active match; exact matching keeps that to the page itself.
          activeOptions={{ exact: true, includeSearch: false, includeHash: false }}
          aria-current={
            t.current === "page" ? "page" : t.current === "section" ? "true" : undefined
          }
        >
          {t.label}
        </Link>,
      ])}
    </nav>
  );
}
