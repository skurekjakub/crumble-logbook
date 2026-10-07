/**
 * The cited notes an encounter screen's sections are built from: a one-line
 * fact, a fight event in a card, and a mechanic in a card. Each leads with
 * its confidence, cuts its text to one line (expanding on demand), ends with
 * its sources, and is hatched when unverified.
 *
 * @module
 */
import { whenLabel } from "../../lib/fight-track";
import type { SourceIndex } from "../../lib/sources";
import { Clamp } from "../Clamp";
import { ConfidencePill } from "../ConfidencePill";
import type { FightTimelineEvent } from "../FightTimeline";
import { SourceChips } from "../SourceChips";

/** One mechanic; `/api/mechanics` rows fit as they are. */
export interface MechanicLike {
  id: number;
  title: string;
  body: string;
  topic: string | null;
  confidence: "high" | "medium" | "low";
  sources: readonly string[];
}

/**
 * A mechanic's body as a one-line fact: its confidence first, the body cut
 * to one line, its sources last; hatched when unverified.
 *
 * @param props - the mechanic and the source index
 * @returns the fact
 */
export function FactNote({ m, sources }: { m: MechanicLike; sources: SourceIndex }) {
  return (
    <div className={`boss-fact${m.confidence === "low" ? " low" : ""}`}>
      <ConfidencePill confidence={m.confidence} />
      <span className="boss-fact-body">
        <Clamp lines={1}>{m.body}</Clamp>
      </span>
      <SourceChips ids={m.sources} sources={sources} max={2} />
    </div>
  );
}

/**
 * A fight event inside a card: when it happens and its confidence, then
 * its detail cut to one line, then its sources.
 *
 * @param props - the event, the fight's length in seconds, and the source index
 * @returns the note
 */
export function EventNote({
  e,
  length,
  sources,
}: {
  e: FightTimelineEvent;
  length: number;
  sources: SourceIndex;
}) {
  return (
    <div className={`boss-note${e.confidence === "low" ? " low" : ""}`}>
      <div className="fe-head">
        <ConfidencePill confidence={e.confidence} />
        {e.tElapsed != null ? (
          <span className="fe-when">{whenLabel(e.tElapsed, length)}</span>
        ) : null}
      </div>
      <div className="boss-note-body">
        <Clamp lines={1}>{e.detail}</Clamp>
      </div>
      <SourceChips ids={e.sources} sources={sources} max={2} />
    </div>
  );
}

/**
 * A mechanic inside a card: its confidence and title, its body cut to one
 * line, and its sources; hatched when unverified.
 *
 * @param props - the mechanic and the source index
 * @returns the note
 */
export function MechanicNote({ m, sources }: { m: MechanicLike; sources: SourceIndex }) {
  return (
    <div className={`boss-note${m.confidence === "low" ? " low" : ""}`}>
      <div className="fe-head">
        <ConfidencePill confidence={m.confidence} />
        <b>{m.title}</b>
      </div>
      <div className="boss-note-body">
        <Clamp lines={1}>{m.body}</Clamp>
      </div>
      <SourceChips ids={m.sources} sources={sources} max={2} />
    </div>
  );
}
