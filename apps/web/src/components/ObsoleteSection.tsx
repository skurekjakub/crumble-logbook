import type { ReactNode } from "react";

/** Props for {@link ObsoleteSection}. */
export interface ObsoleteSectionProps {
  /** The section's element id, which a contents list links to. */
  id: string;
  /** The most recent `obsoleteSince` among its items; null renders nothing. */
  latest: string | null;
  /** Renders the section open, e.g. when the address names an item inside it. */
  open?: boolean;
  /** The obsolete items, the most recently obsoleted first. */
  children: ReactNode;
}

/**
 * The collapsed section that ends a list page with its obsolete items,
 * dated by the latest of them.
 *
 * @param props - the id, the latest date, whether it starts open, and the items
 * @returns the section, or null when there is nothing obsolete
 */
export function ObsoleteSection({ id, latest, open = false, children }: ObsoleteSectionProps) {
  if (latest === null) return null;
  return (
    <details className="obsolete" id={id} open={open}>
      <summary>
        <span className="label">Obsolete</span> <span className="muted">· latest {latest}</span>
      </summary>
      <div className="obsolete-body">{children}</div>
    </details>
  );
}
