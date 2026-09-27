import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { timelineQuery } from "../api/queries";
import type { TimelineEvent } from "../api/types";
import type { ModeSection } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { ModeViewHeader } from "./ModeViewHeader";

/** Orders events by date, oldest first; same-date events keep their id order. */
function byDate(a: TimelineEvent, b: TimelineEvent): number {
  return a.date.localeCompare(b.date) || a.id - b.id;
}

/**
 * A mode's dated events (patches, new cookies and the decks that
 * followed), oldest first, with sources.
 *
 * @param mode - the mode whose timeline and copy the view shows
 */
export function TimelineView({ mode }: { mode: ModeSection }) {
  const timeline = useQuery(timelineQuery(mode.scope));
  const sources = useSourceIndex();
  return (
    <>
      <ModeViewHeader mode={mode} view="timeline" fallbackTitle="Timeline" />
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
