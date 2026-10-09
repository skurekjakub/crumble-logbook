import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSourceIndex } from "../api/hooks";
import {
  buffValuesQuery,
  decksQuery,
  fightEventsQuery,
  gearRecsQuery,
  mechanicsQuery,
  runeBuildsQuery,
} from "../api/queries";
import type { BossConfig, ModeSection } from "../app/modes";
import { ConfidencePill } from "../components/ConfidencePill";
import { EmptyState } from "../components/EmptyState";
import { AtkCheck } from "../components/encounter/AtkCheck";
import { BuffTable } from "../components/encounter/BuffTable";
import { FactNote } from "../components/encounter/notes";
import { Survival } from "../components/encounter/Survival";
import { WhatToRun } from "../components/encounter/WhatToRun";
import { FightTimeline } from "../components/FightTimeline";
import { GearBoard, GearRow, generalGear } from "../components/GearBoard";
import { Kv } from "../components/Kv";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { ViewHeader } from "../components/ViewHeader";
import { fightLength } from "../lib/fight-track";
import { byTopic } from "../lib/mechanics";

/** The screen's sections, in page order: each heading's id and text. */
const PARTS = {
  timeline: { id: "boss-timeline", title: "Fight timeline" },
  survival: { id: "boss-survival", title: "Survival" },
  buffs: { id: "boss-buffs", title: "Buffs by star" },
  run: { id: "boss-run", title: "What to run" },
  atk: { id: "boss-atk", title: "ATK-order check" },
} as const;

/** The "On this page" list: one link per section. */
const TOC = Object.values(PARTS).map((p) => ({ id: p.id, label: p.title }));

/**
 * A titled page section, exposed as a region named by its heading.
 *
 * @param props - the section's heading id and text, and its content
 * @returns the section
 */
function Section({
  part: { id, title },
  children,
}: {
  part: { id: string; title: string };
  children: ReactNode;
}) {
  return (
    <section className="boss-sec" aria-labelledby={id}>
      <h3 id={id}>{title}</h3>
      {children}
    </section>
  );
}

/** Props for {@link BossView}. */
export interface BossViewProps {
  /** The mode the boss belongs to; its scope narrows the decks, runes, gear and mechanics. */
  mode: ModeSection;
  /** The boss screen's config. */
  boss: BossConfig;
}

/**
 * A boss screen: the boss's cited facts, its fight on a 0–length track,
 * what it takes to survive its lethal patterns, the buffers' values by star,
 * what to run (current decks, rune builds and gear only), and the ATK-order
 * checklist, with an "On this page" list of
 * those sections. Every research claim comes from
 * the API data, selected by mechanics topic or fight-event key, with its
 * confidence and sources. Each block renders its own query, so one failed
 * resource leaves the others in place.
 *
 * @param props - the mode and the boss screen's config
 * @returns the boss screen
 */
export function BossView({ mode, boss }: BossViewProps) {
  const sources = useSourceIndex();
  const fights = useQuery(fightEventsQuery(boss.id));
  const buffs = useQuery(buffValuesQuery());
  const debufferBuffs = useQuery(buffValuesQuery(boss.debufferKr));
  const mechanics = useQuery(mechanicsQuery(mode.scope));
  const runes = useQuery(runeBuildsQuery(mode.scope, undefined, { current: true }));
  const decks = useQuery(decksQuery(mode.scope, { current: true }));
  const gear = useQuery(gearRecsQuery(mode.scope, { current: true }));

  const events = fights.data ?? [];
  const mechs = mechanics.data ?? [];
  const lengthEvent = events.find((e) => e.event === boss.lengthEvent);
  const length = fightLength(events, boss.lengthEvent);

  return (
    <>
      <ViewHeader
        title={
          <>
            {boss.name} <span className="kr">{boss.kr}</span>
          </>
        }
        lede={boss.lede}
      />
      <Kv
        rows={[
          ...boss.facts.map(
            (f) =>
              [
                f.label,
                byTopic(mechs, f.topic).map((m) => <FactNote key={m.id} m={m} sources={sources} />),
              ] as const,
          ),
          [
            "Fight length",
            lengthEvent?.tElapsed != null ? (
              <div className={`boss-fact${lengthEvent.confidence === "low" ? " low" : ""}`}>
                <ConfidencePill confidence={lengthEvent.confidence} />
                <span className="boss-fact-body">{lengthEvent.tElapsed} s</span>
                <SourceChips ids={lengthEvent.sources} sources={sources} max={2} />
              </div>
            ) : null,
          ],
        ]}
      />

      <TocLayout items={TOC}>
        <Section part={PARTS.timeline}>
          <div className="legend-row">
            <span>Seconds elapsed, the in-game countdown under them</span>
            <span>
              <i className="sw fe-key low" />
              unverified claim
            </span>
          </div>
          <QueryResult query={fights} resource="fight events">
            {(rows) => {
              const shown = rows.filter((e) => e.event !== boss.lengthEvent);
              return shown.length ? (
                <FightTimeline events={shown} sources={sources} length={length} />
              ) : (
                <EmptyState>No fight events recorded yet.</EmptyState>
              );
            }}
          </QueryResult>
        </Section>

        <Section part={PARTS.survival}>
          <QueryResult query={mechanics} resource="mechanics">
            {(list) => (
              <Survival
                boss={boss}
                events={events}
                mechanics={list}
                length={length}
                sources={sources}
              />
            )}
          </QueryResult>
        </Section>

        <Section part={PARTS.buffs}>
          <QueryResult query={buffs} resource="buff values">
            {(rows) => (
              <BuffTable
                rows={rows}
                buffFormula={byTopic(mechs, boss.topics.buffFormula)}
                debuffFormula={byTopic(mechs, boss.topics.debuffFormula)}
                sources={sources}
              />
            )}
          </QueryResult>
        </Section>

        <Section part={PARTS.run}>
          <QueryResult query={runes} resource="rune builds">
            {(builds) => (
              <WhatToRun
                boss={boss}
                builds={builds.filter((b) => b.decks.includes(boss.deck))}
                haste={byTopic(mechs, boss.topics.haste)}
                debufferBuffs={debufferBuffs.data ?? []}
                buffTableId={PARTS.buffs.id}
                sources={sources}
              />
            )}
          </QueryResult>
          <QueryResult query={gear} resource="gear recommendations">
            {(recs) => {
              const shown = recs.filter((g) => g.context === boss.gearContext);
              if (!shown.length) return null;
              const general = generalGear(shown);
              return (
                <>
                  <h4>Gear</h4>
                  <GearBoard gear={shown} sources={sources} />
                  {general.length ? (
                    <div className="card gear-notes">
                      {general.map((g) => (
                        <GearRow key={g.id} g={g} sources={sources} />
                      ))}
                    </div>
                  ) : null}
                </>
              );
            }}
          </QueryResult>
        </Section>

        <Section part={PARTS.atk}>
          <QueryResult query={decks} resource="decks">
            {(list) => {
              const deck = list.find((d) => d.id === boss.deck);
              return deck ? (
                <AtkCheck
                  boss={boss}
                  deck={deck}
                  petNotes={byTopic(mechs, boss.topics.atkPet)}
                  sources={sources}
                />
              ) : (
                <EmptyState>The recommended deck isn't recorded yet.</EmptyState>
              );
            }}
          </QueryResult>
        </Section>
      </TocLayout>
    </>
  );
}
