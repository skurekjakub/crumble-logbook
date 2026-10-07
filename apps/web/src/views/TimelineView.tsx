import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { timelineQuery } from "../api/queries";
import type { TimelineEvent } from "../api/types";
import type { ModeSection } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { EmptyState } from "../components/EmptyState";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { ModeViewHeader } from "./ModeViewHeader";

/**
 * Orders events by date, oldest first; same-date events keep their id order.
 *
 * @param a - an event
 * @param b - another event
 * @returns negative, zero or positive, as for `Array.prototype.sort`
 */
function byDate(a: TimelineEvent, b: TimelineEvent): number {
  return a.date.localeCompare(b.date) || a.id - b.id;
}

/**
 * A mode's dated events (patches, new cookies and the decks that
 * followed), oldest first, one row each: the date, the event cut to one
 * line, and its sources at the end.
 *
 * @param mode - the mode whose timeline and copy the view shows
 * @returns the timeline view
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
                  <span className="tl-event">
                    <Clamp lines={1}>{t.event}</Clamp>
                  </span>
                  <SourceChips ids={t.sources} sources={sources} max={2} />
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
