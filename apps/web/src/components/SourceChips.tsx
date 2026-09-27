import type { SourceIndex } from "../lib/sources";
import { sourceLabel } from "../lib/sources";

/** Props for {@link SourceChips}. */
export interface SourceChipsProps {
  /** Source ids to show, e.g. `["dc:76135", "nv:43653"]`. Null or empty renders nothing. */
  ids: readonly string[] | null | undefined;
  /** Id → URL/title, from one `/api/sources` query (see `useSourceIndex`). */
  sources: SourceIndex;
}

/**
 * Source ids as chips. Ids found in `sources` link to their URL in a new
 * tab with the title as a tooltip; the rest render as plain chips.
 */
export function SourceChips({ ids, sources }: SourceChipsProps) {
  if (!ids?.length) return null;
  return (
    <span className="chips">
      {ids.map((id) => {
        const s = sources.get(id);
        return s?.url ? (
          <a
            key={id}
            className="chip"
            href={s.url}
            target="_blank"
            rel="noopener"
            title={s.title ?? ""}
          >
            {sourceLabel(id)}
          </a>
        ) : (
          <span key={id} className="chip">
            {sourceLabel(id)}
          </span>
        );
      })}
    </span>
  );
}
