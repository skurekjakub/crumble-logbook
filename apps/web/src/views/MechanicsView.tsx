import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { mechanicsQuery } from "../api/queries";
import type { ModeSection } from "../app/modes";
import { topicsShownElsewhere } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { ConfidencePill } from "../components/ConfidencePill";
import { EmptyState } from "../components/EmptyState";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { ModeViewHeader } from "./ModeViewHeader";

/**
 * A mode's measured or datamined mechanics as cards, each leading with its
 * confidence pill, its body cut to two lines and its sources at the foot.
 * Topics the mode shows elsewhere (its rules,
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
                <article key={x.id} className="card mech-card">
                  <div className="mech-head">
                    <ConfidencePill confidence={x.confidence} />
                    <h3>{x.title}</h3>
                  </div>
                  <div className="mech-body">
                    <Clamp lines={2}>{x.body}</Clamp>
                  </div>
                  <div className="card-foot">
                    <SourceChips ids={x.sources} sources={sources} />
                  </div>
                </article>
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
