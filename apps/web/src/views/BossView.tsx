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
import type { BuffValue, Deck, FightEvent, Mechanic, RuneBuild } from "../api/types";
import type { BossConfig, ModeSection } from "../app/modes";
import { AtkOrder } from "../components/AtkOrder";
import { ConfidencePill } from "../components/ConfidencePill";
import { CookieName } from "../components/CookieName";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { FightTimeline } from "../components/FightTimeline";
import { GearBoard, generalGear } from "../components/GearBoard";
import { Kv } from "../components/Kv";
import { QueryResult } from "../components/QueryResult";
import { RuneCard } from "../components/RuneBuilds";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { ViewHeader } from "../components/ViewHeader";
import type { BuffStarRow } from "../lib/boss";
import {
  buffStars,
  effectLabel,
  effectName,
  fightLength,
  formatPct,
  pivotBuffs,
  starCells,
  starLabel,
  survivalTitle,
  whenLabel,
} from "../lib/boss";
import type { SourceIndex } from "../lib/sources";

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

/** A titled page section, exposed as a region named by its heading. */
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

/** The mechanics filed under `topic`, in their stored order. */
function byTopic(mechanics: readonly Mechanic[], topic: string): Mechanic[] {
  return mechanics.filter((m) => m.topic === topic);
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
 * what to run, and the ATK-order checklist, with an "On this page" list of
 * those sections. Every research claim comes from
 * the API data, selected by mechanics topic or fight-event key, with its
 * confidence and sources. Each block renders its own query, so one failed
 * resource leaves the others in place.
 */
export function BossView({ mode, boss }: BossViewProps) {
  const sources = useSourceIndex();
  const fights = useQuery(fightEventsQuery(boss.id));
  const buffs = useQuery(buffValuesQuery());
  const debufferBuffs = useQuery(buffValuesQuery(boss.debufferKr));
  const mechanics = useQuery(mechanicsQuery(mode.scope));
  const runes = useQuery(runeBuildsQuery(mode.scope));
  const decks = useQuery(decksQuery(mode.scope));
  const gear = useQuery(gearRecsQuery(mode.scope));

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
                <span>{lengthEvent.tElapsed} s</span>
                <ConfidencePill confidence={lengthEvent.confidence} />
                <SourceChips ids={lengthEvent.sources} sources={sources} />
              </div>
            ) : null,
          ],
        ]}
      />

      <TocLayout items={TOC}>
        <Section part={PARTS.timeline}>
          <p className="muted">
            Elapsed seconds along the track, the in-game countdown under them. Hatched marks are
            unverified claims.
          </p>
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
                    <ul className="clean">
                      {general.map((g) => (
                        <li key={g.id}>
                          <b>{g.substats}</b>{" "}
                          {g.why ? <span className="muted">{g.why}</span> : null}{" "}
                          <SourceChips ids={g.sources} sources={sources} />
                        </li>
                      ))}
                    </ul>
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
                <EmptyState>The Cherry deck isn't recorded yet.</EmptyState>
              );
            }}
          </QueryResult>
        </Section>
      </TocLayout>
    </>
  );
}

/** A mechanic's body as a one-line fact, with its confidence and sources; hatched when unverified. */
function FactNote({ m, sources }: { m: Mechanic; sources: SourceIndex }) {
  return (
    <div className={`boss-fact${m.confidence === "low" ? " low" : ""}`}>
      <span>{m.body}</span>
      <ConfidencePill confidence={m.confidence} />
      <SourceChips ids={m.sources} sources={sources} />
    </div>
  );
}

/** A fight event inside a card: when it happens, its confidence, detail and sources. */
function EventNote({
  e,
  length,
  sources,
}: {
  e: FightEvent;
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

/** A mechanic inside a card: title, confidence, body and sources; hatched when unverified. */
function MechanicNote({ m, sources }: { m: Mechanic; sources: SourceIndex }) {
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

/**
 * One card per lethal pattern, built from its fight events and the
 * mechanics filed under its topic, titled by the countdown at its anchor
 * event. Patterns with neither are left out.
 */
function Survival({
  boss,
  events,
  mechanics,
  length,
  sources,
}: {
  boss: BossConfig;
  events: readonly FightEvent[];
  mechanics: readonly Mechanic[];
  length: number;
  sources: SourceIndex;
}) {
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

/** Names joined for prose: "A", "A and B", "A, B and C". */
function joinNames(names: readonly string[]): string {
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/**
 * The buffers' values as a cookie × star table, with the cited formulas
 * for how buffs and application chances scale. Self-only buffs are marked
 * and listed last; application chances are marked as such; a value carried
 * over from the column to its left is greyed.
 */
function BuffTable({
  rows,
  buffFormula,
  debuffFormula,
  sources,
}: {
  rows: readonly BuffValue[];
  buffFormula: readonly Mechanic[];
  debuffFormula: readonly Mechanic[];
  sources: SourceIndex;
}) {
  if (!rows.length) return <EmptyState>No buff values recorded yet.</EmptyState>;
  const pivot = pivotBuffs(rows);
  const stars = buffStars(rows);
  const cells = new Map(pivot.map((r) => [r.key, starCells(r, stars)]));
  const name = (r: BuffStarRow) => r.en ?? r.cookieKr;
  const ampScaled = pivot.some((r) => r.scalesWithCasterAmp);
  const chances = [...new Set(pivot.filter((r) => r.chance).map(name))];

  const columns: Column<BuffStarRow>[] = [
    { header: "Cookie", cell: (r) => <CookieName kr={r.cookieKr} en={r.en} /> },
    {
      header: "Effect",
      cell: (r) => (
        <>
          {effectLabel(r.effectType, r.base)}
          {r.selfOnly ? <span className="boss-mark">self only</span> : null}
          {r.chance ? <span className="boss-mark">chance</span> : null}
        </>
      ),
    },
    ...stars.map((s, i): Column<BuffStarRow> => ({
      header: starLabel(s, stars),
      cell: (r) => {
        const c = cells.get(r.key)![i]!;
        return c.carried ? (
          <span className="carried" title="Unchanged from the column to its left">
            {formatPct(c.value)}
          </span>
        ) : (
          formatPct(c.value)
        );
      },
      className: "n",
    })),
    {
      header: "Stacks",
      cell: (r) => (r.maxStack != null && r.maxStack > 1 ? `×${r.maxStack}` : ""),
      className: "n",
    },
    { header: "Sources", cell: (r) => <SourceChips ids={r.sources} sources={sources} /> },
  ];

  return (
    <>
      {ampScaled
        ? buffFormula.map((m) => <MechanicNote key={m.id} m={m} sources={sources} />)
        : null}
      {chances.length ? (
        <>
          <p className="muted">
            {chances.length === 1
              ? `${chances[0]}'s row is an application chance, not a buff size.`
              : `${joinNames(chances.map((c) => `${c}'s`))} rows are application chances, not buff sizes.`}
          </p>
          {debuffFormula.map((m) => (
            <MechanicNote key={m.id} m={m} sources={sources} />
          ))}
        </>
      ) : null}
      <p className="muted">
        Each column holds the value from that star count up to the next column. A greyed value is
        unchanged from the column to its left; a dash means the effect has no value yet at that
        star. Rows marked "self only" buff the caster alone.
      </p>
      <DataTable columns={columns} rows={pivot} rowKey={(r) => r.key} />
    </>
  );
}

/**
 * Rune guidance for the boss's deck: one card per cookie, reason first,
 * with the haste carry's breakpoint and the debuffer's base application
 * chance on their cards where the data has them.
 */
function WhatToRun({
  boss,
  builds,
  haste,
  debufferBuffs,
  sources,
}: {
  boss: BossConfig;
  builds: readonly RuneBuild[];
  haste: readonly Mechanic[];
  debufferBuffs: readonly BuffValue[];
  sources: SourceIndex;
}) {
  if (!builds.length) return <EmptyState>No rune builds recorded for this deck yet.</EmptyState>;
  const chance = pivotBuffs(debufferBuffs).find((r) => r.chance);
  return (
    <div className="grid g2">
      {builds.map((b) => (
        <RuneCard key={b.id} build={b} sources={sources} headingLevel={4}>
          {b.cookieKr === boss.hasteKr
            ? haste.map((m) => <MechanicNote key={m.id} m={m} sources={sources} />)
            : null}
          {b.cookieKr === boss.debufferKr && chance ? (
            <ChanceNote chance={chance} sources={sources} />
          ) : null}
        </RuneCard>
      ))}
    </div>
  );
}

/** A debuff's base application chance by star, pointing to the chance formula in the buff section. */
function ChanceNote({ chance, sources }: { chance: BuffStarRow; sources: SourceIndex }) {
  const values = [...new Set(Object.values(chance.byStar))];
  return (
    <div className="boss-note">
      <div>
        {effectName(chance.effectType)} base application chance:{" "}
        {values.length === 1 ? (
          <>
            <b>{formatPct(values[0])}</b> at every star.
          </>
        ) : (
          <>
            <b>{values.map(formatPct).join(" → ")}</b> by star.
          </>
        )}
      </div>
      <div className="muted">
        How focus and resist change it: see <a href="#boss-buffs">Buffs by star</a>.
      </div>
      <SourceChips ids={chance.sources} sources={sources} />
    </div>
  );
}

/**
 * The deck's ATK-order chain and the in-battle checklist: the catcher sits
 * just under the last ranked cookie once the pet's bonus is added, every
 * ranked cookie sits above the catcher, and the check happens in battle,
 * with the pet's cited notes.
 */
function AtkCheck({
  boss,
  deck,
  petNotes,
  sources,
}: {
  boss: BossConfig;
  deck: Deck;
  petNotes: readonly Mechanic[];
  sources: SourceIndex;
}) {
  const order = deck.atkOrder ?? [];
  const catcher = deck.cookies.find((c) => c.cookieKr === boss.catcherKr);
  const catcherName = catcher ? (catcher.en ?? catcher.cookieKr) : null;
  const last = order.at(-1);
  const pet = deck.pets.find((p) => p.kr === boss.atkPetKr);
  const petName = pet ? (pet.en ?? pet.kr) : "the pet";

  if (!order.length) return <EmptyState>No ATK order recorded for this deck yet.</EmptyState>;
  return (
    <>
      <AtkOrder order={order} />
      {deck.atkOrderNote ? <div className="muted">{deck.atkOrderNote}</div> : null}
      <ul className="clean boss-check">
        {catcher && last ? (
          <li>
            {catcherName} stays below {last.en ?? last.kr} once {petName}'s in-battle ATK bonus is
            added.
            {catcher.levelRule ? <div className="muted">{catcher.levelRule}</div> : null}
          </li>
        ) : null}
        {catcher ? (
          <li>
            All {order.length} cookies in the ATK order sit above {catcherName}.
          </li>
        ) : null}
        <li>
          Check the order in battle, not in the lobby.
          {pet ? petNotes.map((m) => <FactNote key={m.id} m={m} sources={sources} />) : null}
        </li>
      </ul>
      <SourceChips ids={deck.sources} sources={sources} />
    </>
  );
}
