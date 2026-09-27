import type { ReactNode } from "react";

/** Props for {@link PageHeader}. */
export interface PageHeaderProps {
  /** The small label's suffix after "Cookie Run: Crumble ·"; omitted when null. */
  context: ReactNode;
  /** The `<h1>`. */
  title: string;
  /** The lede under the title: text, or an error box in its place. */
  lede: ReactNode;
  /** Label → value figures for the stamp; rows with a null or empty value are dropped. */
  stats: ReadonlyArray<readonly [label: string, value: string | number | null | undefined]>;
}

/** The page header: game label, title, lede, and the stat stamp on the right. */
export function PageHeader({ context, title, lede, stats }: PageHeaderProps) {
  const shown = stats.filter(([, v]) => v != null && v !== "");
  return (
    <header className="top">
      <div>
        <div className="label">
          Cookie Run: Crumble
          {context != null && <> · {context}</>}
        </div>
        <h1>{title}</h1>
        {typeof lede === "string" ? <p className="lede">{lede}</p> : lede}
      </div>
      <div className="stamp">
        {shown.map(([k, v]) => (
          <div key={k}>
            <span className="label">{k}</span>
            <b>{v}</b>
          </div>
        ))}
      </div>
    </header>
  );
}
