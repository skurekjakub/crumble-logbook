import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useSourceIndex } from "../../api/hooks";
import { timelineQuery } from "../../api/queries";
import type { TimelineEvent } from "../../api/types";
import { EmptyState } from "../../components/EmptyState";
import { QueryResult } from "../../components/QueryResult";
import { SourceChips } from "../../components/SourceChips";

export const Route = createFileRoute("/conquest/timeline")({
  component: TimelineView,
});

/** Orders events by date, oldest first; same-date events keep their id order. */
function byDate(a: TimelineEvent, b: TimelineEvent): number {
  return String(a.date).localeCompare(String(b.date)) || a.id - b.id;
}

/** Patches, new cookies and the decks that followed, as a dated list with sources. */
function TimelineView() {
  const timeline = useQuery(timelineQuery());
  const sources = useSourceIndex();
  return (
    <>
      <div>
        <h2>How the meta moved</h2>
        <p className="lede">Patches, new cookies and the decks that followed, oldest first.</p>
      </div>
      <QueryResult query={timeline} resource="timeline">
        {(events) =>
          events.length ? (
            <ol className="tl">
              {[...events].sort(byDate).map((t) => (
                <li key={t.id}>
                  <span className="d">{t.date}</span>
                  <span>{t.event}</span>
                  <SourceChips ids={t.sources} sources={sources} />
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState>No timeline events recorded yet.</EmptyState>
          )
        }
      </QueryResult>
    </>
  );
}
