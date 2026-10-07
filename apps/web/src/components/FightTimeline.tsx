import type { RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { eventLabel, markerRows, secondsLeft, trackPercent, whenLabel } from "../lib/fight-track";
import type { SourceIndex } from "../lib/sources";
import { Clamp } from "./Clamp";
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

/** The space one marker needs on a row, in pixels: its 22 px minimum width plus a gap. */
const MARKER_PX = 26;

/** The track width assumed until the lane has been measured. */
const DEFAULT_TRACK_PX = 640;

/**
 * Reports whether an event is a claim nobody has verified.
 *
 * @param e - the event
 * @returns `true` for a low-confidence event
 */
const isClaim = (e: FightTimelineEvent) => e.confidence === "low";

/**
 * The rendered width of the element `ref` points to, kept current as it resizes.
 *
 * @param ref - the element to measure
 * @returns the width in pixels, or null before the first measurement or where
 *   the browser can't measure (no `ResizeObserver`, or a zero width)
 */
function useWidth(ref: RefObject<HTMLElement | null>): number | null {
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    /** Stores the element's current width, or null for a zero width. */
    const measure = () => {
      setWidth(el.clientWidth || null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/**
 * One lane of the track: numbered markers placed by elapsed time, staggered where they overlap on screen.
 *
 * @param props - the lane's label, its numbered timed events, and the fight's length in seconds
 * @returns the lane
 */
function Lane({
  label,
  items,
  length,
}: {
  label: string;
  items: { n: number; e: FightTimelineEvent & { tElapsed: number } }[];
  length: number;
}) {
  const scale = useRef<HTMLDivElement>(null);
  const width = useWidth(scale) ?? DEFAULT_TRACK_PX;
  const rows = markerRows(
    items.map((i) => i.e.tElapsed),
    length,
    width,
    MARKER_PX,
  );
  const depth = Math.max(1, ...rows.map((r) => r + 1));
  return (
    <div className="fe-lane">
      <div className="fe-lane-label">{label}</div>
      <div ref={scale} className="fe-scale" style={{ height: `${depth * 24}px` }}>
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
 * in-game countdown under each tick, and the numbered events listed beneath,
 * each with its confidence first, its detail cut to one line and its
 * sources at the end. Low-confidence events sit in their own
 * hatched lane and are labelled "unverified claim"; events with no time are
 * listed but not placed.
 *
 * @param props - the events, the source index, the fight's length and the tick spacing
 * @returns the track and the event list
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
              <ConfidencePill confidence={e.confidence} />
              <b>{eventLabel(e.event)}</b>
              <span className="fe-when">{whenLabel(e.tElapsed, length)}</span>
            </div>
            <div className="fe-row">
              <span className="fe-detail">
                <Clamp lines={1}>{e.detail}</Clamp>
              </span>
              <SourceChips ids={e.sources} sources={sources} max={2} />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
