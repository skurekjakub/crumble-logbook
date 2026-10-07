import type { BossConfig } from "../../app/modes";
import { survivalTitle } from "../../lib/fight-track";
import { byTopic } from "../../lib/mechanics";
import type { SourceIndex } from "../../lib/sources";
import { EmptyState } from "../EmptyState";
import { Pill } from "../Pill";
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
 * One card per lethal pattern, titled by the countdown at its anchor event
 * and marked "lethal": first what it takes to live through it (the
 * mechanics filed under its topic, set apart), then its fight events.
 * Patterns with neither are left out.
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
        <div key={c.key} className="card survival-card">
          <div className="card-head">
            <h4>{c.title}</h4>
            <Pill kind="avoid">lethal</Pill>
          </div>
          {c.mechs.length ? (
            <div className="survive-need">
              {c.mechs.map((m) => (
                <MechanicNote key={m.id} m={m} sources={sources} />
              ))}
            </div>
          ) : null}
          {c.evs.map((e) => (
            <EventNote key={e.id} e={e} length={length} sources={sources} />
          ))}
        </div>
      ))}
    </div>
  );
}
