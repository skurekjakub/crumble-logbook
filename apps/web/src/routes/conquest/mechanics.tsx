import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useSourceIndex } from "../../api/hooks";
import { mechanicsQuery } from "../../api/queries";
import { EmptyState } from "../../components/EmptyState";
import { Pill } from "../../components/Pill";
import { QueryResult } from "../../components/QueryResult";
import { SourceChips } from "../../components/SourceChips";

export const Route = createFileRoute("/conquest/mechanics")({
  component: MechanicsView,
});

/** Measured or datamined mechanics as cards, each with its confidence pill and sources. */
function MechanicsView() {
  const mechanics = useQuery(mechanicsQuery());
  const sources = useSourceIndex();
  return (
    <>
      <div>
        <h2>Mechanics</h2>
        <p className="lede">
          What the community measured or datamined (클뜯). Confidence reflects how well each point
          is sourced, not how plausible it sounds.
        </p>
      </div>
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
