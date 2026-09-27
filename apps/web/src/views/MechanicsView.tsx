import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { mechanicsQuery } from "../api/queries";
import type { ModeSection } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";

/**
 * A mode's measured or datamined mechanics as cards, each with its
 * confidence pill and sources.
 *
 * @param mode - the mode whose mechanics and copy the view shows
 */
export function MechanicsView({ mode }: { mode: ModeSection }) {
  const mechanics = useQuery(mechanicsQuery(mode.scope));
  const sources = useSourceIndex();
  return (
    <>
      <ViewHeader
        title={mode.copy.mechanics?.title ?? "Mechanics"}
        lede={mode.copy.mechanics?.lede}
      />
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
