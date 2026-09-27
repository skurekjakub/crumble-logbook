/** One tab of a {@link TabNav}. */
export interface TabItem {
  /** The tab button's DOM id; a tab panel names it in `aria-labelledby`. */
  domId: string;
  label: string;
  selected: boolean;
  /** Draw a divider before this tab, to start a new group. */
  startsGroup?: boolean;
  onSelect: () => void;
}

/** Props for {@link TabNav}. */
export interface TabNavProps {
  /** The tab list's accessible name. */
  label: string;
  items: readonly TabItem[];
  /** Extra class on the `<nav>` beside `tabs`, e.g. `modes` or `sub`. */
  className?: string;
}

/** A pill tab strip (`nav.tabs`) of `role="tab"` buttons; the selected one is filled. */
export function TabNav({ label, items, className }: TabNavProps) {
  return (
    <nav className={className ? `tabs ${className}` : "tabs"} role="tablist" aria-label={label}>
      {items.map((t) => [
        t.startsGroup ? <span key={`${t.domId}-sep`} className="sep" aria-hidden="true" /> : null,
        <button
          key={t.domId}
          type="button"
          role="tab"
          id={t.domId}
          aria-selected={t.selected}
          onClick={t.onSelect}
        >
          {t.label}
        </button>,
      ])}
    </nav>
  );
}
