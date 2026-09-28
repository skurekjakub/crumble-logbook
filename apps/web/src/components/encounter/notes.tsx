/**
 * The cited notes an encounter screen's sections are built from: a one-line
 * fact, a fight event in a card, and a mechanic in a card. Each is hatched
 * when unverified.
 *
 * @module
 */
import { whenLabel } from "../../lib/fight-track";
import type { SourceIndex } from "../../lib/sources";
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
 * A mechanic's body as a one-line fact, with its confidence and sources; hatched when unverified.
 *
 * @param props - the mechanic and the source index
 * @returns the fact
 */
export function FactNote({ m, sources }: { m: MechanicLike; sources: SourceIndex }) {
  return (
    <div className={`boss-fact${m.confidence === "low" ? " low" : ""}`}>
      <span>{m.body}</span>
      <ConfidencePill confidence={m.confidence} />
      <SourceChips ids={m.sources} sources={sources} />
    </div>
  );
}

/**
 * A fight event inside a card: when it happens, its confidence, detail and sources.
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
        {e.tElapsed != null ? (
          <span className="fe-when">{whenLabel(e.tElapsed, length)}</span>
        ) : null}
        <ConfidencePill confidence={e.confidence} />
      </div>
      <div>{e.detail}</div>
      <SourceChips ids={e.sources} sources={sources} />
    </div>
  );
}

/**
 * A mechanic inside a card: title, confidence, body and sources; hatched when unverified.
 *
 * @param props - the mechanic and the source index
 * @returns the note
 */
export function MechanicNote({ m, sources }: { m: MechanicLike; sources: SourceIndex }) {
  return (
    <div className={`boss-note${m.confidence === "low" ? " low" : ""}`}>
      <div className="fe-head">
        <b>{m.title}</b>
        <ConfidencePill confidence={m.confidence} />
      </div>
      <div>{m.body}</div>
      <SourceChips ids={m.sources} sources={sources} />
    </div>
  );
}
