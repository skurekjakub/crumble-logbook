import type { ReactNode } from "react";

/** Props for {@link ViewHeader}. */
export interface ViewHeaderProps {
  /** The view's `<h2>`. */
  title: ReactNode;
  /** The paragraph under it, when the view has one. */
  lede?: ReactNode;
}

/**
 * A view's heading and lede, at the top of its panel.
 *
 * @param props - the heading and the optional lede
 * @returns the header
 */
export function ViewHeader({ title, lede }: ViewHeaderProps) {
  return (
    <div>
      <h2>{title}</h2>
      {lede ? <p className="lede">{lede}</p> : null}
    </div>
  );
}
