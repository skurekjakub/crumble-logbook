import type { SourceIndex } from "../lib/sources";
import { eventLabel, secondsLeft, staggerRows, trackPercent, whenLabel } from "../lib/boss";
import { ConfidencePill } from "./ConfidencePill";
import { SourceChips } from "./SourceChips";

/** One fight event; `/api/fight-events` rows fit as they are. */
export interface FightTimelineEvent {
  id: number;
  /** Seconds since the fight began, or null for an event off the clock. */
  tElapsed: number | null;
  event: string;
  detail: string;
  confidence: "high" | "medium" | "low";
  sources?: readonly string[] | null;
}

/** Props for {@link FightTimeline}. */
export interface FightTimelineProps {
  /** Events in elapsed-time order, untimed ones last. */
  events: readonly FightTimelineEvent[];
  /** Id → URL/title for the source chips. */
  sources: SourceIndex;
  /** The fight's length in seconds; the track spans 0 to this. */
  length: number;
  /** Seconds between axis ticks. */
  tickEvery?: number;
}

/** Markers closer than this many seconds go on separate rows of a lane. */
const MIN_GAP_S = 4;

/** Whether an event is a claim nobody has verified. */
const isClaim = (e: FightTimelineEvent) => e.confidence === "low";

/** One lane of the track: numbered markers placed by elapsed time, staggered where they crowd. */
function Lane({
  label,
  items,
  length,
}: {
  label: string;
  items: { n: number; e: FightTimelineEvent & { tElapsed: number } }[];
  length: number;
}) {
  const rows = staggerRows(
    items.map((i) => i.e.tElapsed),
    MIN_GAP_S,
  );
  const depth = Math.max(1, ...rows.map((r) => r + 1));
  return (
    <div className="fe-lane">
      <div className="fe-lane-label">{label}</div>
      <div className="fe-scale" style={{ height: `${depth * 24}px` }}>
        {items.map(({ n, e }, i) => (
          <span
            key={e.id}
            data-testid="fight-mark"
            data-event={e.event}
            className={`fe-mark${isClaim(e) ? " low" : ""}`}
            style={{ left: `${trackPercent(e.tElapsed, length)}%`, top: `${rows[i]! * 24}px` }}
            title={`${n}. ${eventLabel(e.event)}, ${whenLabel(e.tElapsed, length)}${isClaim(e) ? " (unverified claim)" : ""}`}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * A boss fight on a horizontal track from 0 to `length` seconds, the
 * in-game countdown under each tick, and the numbered events listed beneath
 * with their details and sources. Low-confidence events sit in their own
 * hatched lane and are labelled "unverified claim"; events with no time are
 * listed but not placed.
 */
export function FightTimeline({ events, sources, length, tickEvery = 10 }: FightTimelineProps) {
  const numbered = events.map((e, i) => ({ n: i + 1, e }));
  const timed = numbered.filter(
    (x): x is { n: number; e: FightTimelineEvent & { tElapsed: number } } => x.e.tElapsed != null,
  );
  const ticks = Array.from({ length: Math.floor(length / tickEvery) + 1 }, (_, i) => i * tickEvery);

  return (
    <>
      <div className="fe-track" role="img" aria-label={`Fight events on a 0–${length} s track`}>
        <Lane label="Unverified claims" items={timed.filter((x) => isClaim(x.e))} length={length} />
        <Lane label="Observed" items={timed.filter((x) => !isClaim(x.e))} length={length} />
        <div className="fe-axis">
          <div className="fe-lane-label">
            Elapsed
            <br />
            Timer
          </div>
          <div className="fe-scale">
            {ticks.map((t) => (
              <span key={t} className="fe-tick" style={{ left: `${trackPercent(t, length)}%` }}>
                {t} s<span className="left">{secondsLeft(t, length)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <ol className="fe-list">
        {numbered.map(({ n, e }) => (
          <li key={e.id} className={isClaim(e) ? "low" : undefined}>
            <div className="fe-head">
              <span className="fe-num">{n}</span>
              <span className="fe-when">{whenLabel(e.tElapsed, length)}</span>
              <b>{eventLabel(e.event)}</b>
              <ConfidencePill confidence={e.confidence} />
            </div>
            <div>{e.detail}</div>
            <SourceChips ids={e.sources} sources={sources} />
          </li>
        ))}
      </ol>
    </>
  );
}
