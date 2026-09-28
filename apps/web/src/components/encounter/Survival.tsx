import type { BossConfig } from "../../app/modes";
import { survivalTitle } from "../../lib/fight-track";
import { byTopic } from "../../lib/mechanics";
import type { SourceIndex } from "../../lib/sources";
import { EmptyState } from "../EmptyState";
import type { FightTimelineEvent } from "../FightTimeline";
import type { MechanicLike } from "./notes";
import { EventNote, MechanicNote } from "./notes";

/** Props for {@link Survival}. */
export interface SurvivalProps {
  /** The boss screen's config; its `survival` cards are shown. */
  boss: BossConfig;
  /** The boss's fight events. */
  events: readonly FightTimelineEvent[];
  /** The mode's mechanics; each card shows those filed under its topic. */
  mechanics: readonly MechanicLike[];
  /** The fight's length in seconds. */
  length: number;
  /** Id → URL/title for the source chips. */
  sources: SourceIndex;
}

/**
 * One card per lethal pattern, built from its fight events and the
 * mechanics filed under its topic, titled by the countdown at its anchor
 * event. Patterns with neither are left out.
 *
 * @param props - the boss config, its fight events and mechanics, the fight's length, and the source index
 * @returns the cards, or an empty state when no pattern has data
 */
export function Survival({ boss, events, mechanics, length, sources }: SurvivalProps) {
  const cards = boss.survival
    .map((s) => ({
      key: s.anchor,
      title: survivalTitle(
        s.name,
        events.find((e) => e.event === s.anchor)?.tElapsed ?? null,
        length,
      ),
      evs: events.filter((e) => s.events.includes(e.event)),
      mechs: byTopic(mechanics, s.topic),
    }))
    .filter((c) => c.evs.length || c.mechs.length);
  if (!cards.length) return <EmptyState>No survival data recorded yet.</EmptyState>;
  return (
    <div className="grid g2">
      {cards.map((c) => (
        <div key={c.key} className="card">
          <div className="card-head">
            <h4>{c.title}</h4>
          </div>
          {c.evs.map((e) => (
            <EventNote key={e.id} e={e} length={length} sources={sources} />
          ))}
          {c.mechs.map((m) => (
            <MechanicNote key={m.id} m={m} sources={sources} />
          ))}
        </div>
      ))}
    </div>
  );
}
