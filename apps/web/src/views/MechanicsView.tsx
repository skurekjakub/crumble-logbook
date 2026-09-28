import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { mechanicsQuery } from "../api/queries";
import type { ModeSection } from "../app/modes";
import { topicsShownElsewhere } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { ModeViewHeader } from "./ModeViewHeader";

/**
 * A mode's measured or datamined mechanics as cards, each with its
 * confidence pill and sources. Topics the mode shows elsewhere (its rules,
 * its boss's facts; see {@link topicsShownElsewhere}) are left out.
 *
 * @param mode - the mode whose mechanics and copy the view shows
 * @returns the mechanics view
 */
export function MechanicsView({ mode }: { mode: ModeSection }) {
  const hidden = topicsShownElsewhere(mode);
  const mechanics = useQuery({
    ...mechanicsQuery(mode.scope),
    select: (rows) => rows.filter((m) => m.topic == null || !hidden.has(m.topic)),
  });
  const sources = useSourceIndex();
  return (
    <>
      <ModeViewHeader mode={mode} view="mechanics" fallbackTitle="Mechanics" />
      <QueryResult query={mechanics} resource="mechanics">
        {(items) =>
          items.length ? (
            <div className="grid g2">
              {items.map((x) => (
                <div key={x.id} className="card">
                  <div className="card-head">
                    <h3>{x.title}</h3>
                    <Pill kind={x.confidence} />
                  </div>
                  <div>{x.body}</div>
                  <SourceChips ids={x.sources} sources={sources} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No mechanics recorded yet.</EmptyState>
          )
        }
      </QueryResult>
    </>
  );
}
