import type { ReactNode } from "react";
import type { SourceIndex } from "../lib/sources";
import { SourceChips } from "./SourceChips";

/** Props for {@link ObsoleteNotice}. */
export interface ObsoleteNoticeProps {
  /** Since when the item is obsolete, `YYYY-MM-DD`. */
  since: string;
  /** Why; null renders no reason. */
  reason: string | null;
  /** The ids of the sources that say why. */
  sources: readonly string[];
  /** Id → URL/title for the source chips. */
  sourceIndex: SourceIndex;
  /** What superseded the item, e.g. a link to the deck that did. */
  superseded?: ReactNode;
}

/**
 * The line that heads an obsolete item: since when, why, what superseded
 * it, and the sources that say so.
 *
 * @param props - the date, the reason, its sources, the source index and the successor
 * @returns the notice
 */
export function ObsoleteNotice({
  since,
  reason,
  sources,
  sourceIndex,
  superseded,
}: ObsoleteNoticeProps) {
  return (
    <div className="obsolete-notice" role="note">
      <b>Obsolete since {since}</b>
      {reason ? <>: {reason}</> : null}
      {superseded ? <> Superseded by {superseded}.</> : null}
      {sources.length ? " " : null}
      <SourceChips ids={sources} sources={sourceIndex} />
    </div>
  );
}
