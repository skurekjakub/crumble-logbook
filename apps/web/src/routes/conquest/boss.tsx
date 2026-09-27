import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useSourceIndex } from "../../api/hooks";
import {
  buffValuesQuery,
  decksQuery,
  fightEventsQuery,
  gearRecsQuery,
  mechanicsQuery,
  runeBuildsQuery,
} from "../../api/queries";
import type { BuffValue, Deck, FightEvent, Mechanic, RuneBuild } from "../../api/types";
import { AtkOrder } from "../../components/AtkOrder";
import { CookieName } from "../../components/CookieName";
import type { Column } from "../../components/DataTable";
import { DataTable } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { FightTimeline } from "../../components/FightTimeline";
import { GearBoard, generalGear } from "../../components/GearBoard";
import { Kv } from "../../components/Kv";
import { Pill } from "../../components/Pill";
import { QueryResult } from "../../components/QueryResult";
import { SourceChips } from "../../components/SourceChips";
import type { BuffStarRow } from "../../lib/boss";
import {
  FIGHT_SECONDS,
  buffStars,
  effectLabel,
  formatPct,
  pivotBuffs,
  secondsLeft,
  starLabel,
} from "../../lib/boss";
import type { SourceIndex } from "../../lib/sources";

export const Route = createFileRoute("/conquest/boss")({
  component: BossView,
});

/**
 * The page's subject: which boss, which deck its checks read, and the
 * cookies and pet the ATK-order checklist names. Research findings live in
 * the API data, not here.
 */
const PAGE = {
  boss: "pinata",
  kr: "지나치게 무거워진 피냐타",
  en: "Extra Stuffed Piñata",
  element: "Dark",
  weakness: "Light",
  deck: "cherry",
  /** The cookie levelled to catch a stray beam just below the ranked buffers. */
  catcherKr: "전갈",
  /** The pet whose ATK bonus applies only in battle. */
  atkPetKr: "와사비문어",
  /** The carry whose haste breakpoint gets a callout (rune-build shorthand). */
  hasteKr: "브시커",
  /** The debuffer whose application chance gets a callout (rune-build shorthand). */
  debufferKr: "닼초",
  /** Fight-event keys for the fight's length and its end. */
  lengthEvent: "fight_length",
  endEvent: "fight_ends",
} as const;

/** The survival cards: the lethal patterns, the events that describe them, and the mechanics title that matches. */
const SURVIVAL = [
  { title: "The 30 s slam", events: ["slam_pattern", "mob_wave_hit"], mechanic: /slam/i },
  {
    title: "The 17 s super-jump wipe",
    events: ["chip_deaths_begin", "super_jump_wipe"],
    mechanic: /wipe/i,
  },
] as const;

/** A titled page section, exposed as a region named by its heading. */
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="boss-sec" aria-labelledby={id}>
      <h3 id={id}>{title}</h3>
      {children}
    </section>
  );
}

/** A cookie's English name without the trailing " Cookie", else its Korean name. */
function shortName(ref: { kr: string; en: string | null }): string {
  return ref.en?.replace(/ Cookie$/, "") ?? ref.kr;
}

/**
 * The Piñata screen: the boss's facts, its fight on a 0–60 s track, what it
 * takes to survive its lethal patterns, the buffers' values by star, what to
 * run, and the ATK-order checklist. Each block renders its own query, so one
 * failed resource leaves the others in place.
 */
function BossView() {
  const sources = useSourceIndex();
  const fights = useQuery(fightEventsQuery(PAGE.boss));
  const buffs = useQuery(buffValuesQuery());
  const mechanics = useQuery(mechanicsQuery());
  const runes = useQuery(runeBuildsQuery());
  const decks = useQuery(decksQuery());
  const gear = useQuery(gearRecsQuery());

  const events = fights.data ?? [];
  const lengthEvent = events.find((e) => e.event === PAGE.lengthEvent);
  const length = lengthEvent?.tElapsed ?? FIGHT_SECONDS;
  const endEvent = events.find((e) => e.event === PAGE.endEvent);
  const bossMechanic = mechanics.data?.find((m) => m.body.includes(PAGE.kr));

  return (
    <>
      <div>
        <h2>
          {PAGE.en} <span className="kr">{PAGE.kr}</span>
        </h2>
        <p className="lede">
          The Guild Conquest boss on one page: when it hits, what it takes to live through it, what
          each buffer gives by star, and what to run.
        </p>
      </div>
      <Kv
        rows={[
          [
            "Element",
            <>
              {PAGE.element} <SourceChips ids={bossMechanic?.sources} sources={sources} />
            </>,
          ],
          ["Weak to", PAGE.weakness],
          [
            "Fight length",
            lengthEvent?.tElapsed != null ? (
              <>
                <span>{lengthEvent.tElapsed} s</span>{" "}
                <SourceChips ids={lengthEvent.sources} sources={sources} />
              </>
            ) : null,
          ],
          [
            "Score",
            <>
              Cumulative damage dealt before the timer runs out, kept even after a wipe.{" "}
              <SourceChips ids={endEvent?.sources} sources={sources} />
            </>,
          ],
        ]}
      />

      <Section id="boss-timeline" title="Fight timeline">
        <p className="muted">
          Elapsed seconds along the track, the in-game countdown under them. Hatched marks are
          unverified claims.
        </p>
        <QueryResult query={fights} resource="fight events">
          {(rows) => {
            const shown = rows.filter((e) => e.event !== PAGE.lengthEvent);
            return shown.length ? (
              <FightTimeline events={shown} sources={sources} length={length} />
            ) : (
              <EmptyState>No fight events recorded yet.</EmptyState>
            );
          }}
        </QueryResult>
      </Section>

      <Section id="boss-survival" title="Survival">
        <QueryResult query={mechanics} resource="mechanics">
          {(mechs) => (
            <Survival events={events} mechanics={mechs} length={length} sources={sources} />
          )}
        </QueryResult>
      </Section>

      <Section id="boss-buffs" title="Buffs by star">
        <QueryResult query={buffs} resource="buff values">
          {(rows) => <BuffTable rows={rows} sources={sources} />}
        </QueryResult>
      </Section>

      <Section id="boss-run" title="What to run">
        <QueryResult query={runes} resource="rune builds">
          {(builds) => (
            <WhatToRun
              builds={builds.filter((b) => b.decks.includes(PAGE.deck))}
              mechanics={mechanics.data ?? []}
              buffs={buffs.data ?? []}
              sources={sources}
            />
          )}
        </QueryResult>
        <QueryResult query={gear} resource="gear recommendations">
          {(recs) => {
            const raid = recs.filter((g) => g.context === "raid");
            if (!raid.length) return null;
            const general = generalGear(raid);
            return (
              <>
                <h4>Gear</h4>
                <GearBoard gear={raid} sources={sources} />
                {general.length ? (
                  <ul className="clean">
                    {general.map((g) => (
                      <li key={g.id}>
                        <b>{g.substats}</b> {g.why ? <span className="muted">{g.why}</span> : null}{" "}
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

      <Section id="boss-atk" title="ATK-order check">
        <QueryResult query={decks} resource="decks">
          {(list) => {
            const deck = list.find((d) => d.id === PAGE.deck);
            return deck ? (
              <AtkCheck deck={deck} mechanics={mechanics.data ?? []} sources={sources} />
            ) : (
              <EmptyState>The Cherry deck isn't recorded yet.</EmptyState>
            );
          }}
        </QueryResult>
      </Section>
    </>
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
          <span className="fe-when">
            {e.tElapsed} s · {secondsLeft(e.tElapsed, length)} s left
          </span>
        ) : null}
        {e.confidence === "low" ? (
          <Pill kind="low">unverified claim</Pill>
        ) : (
          <Pill kind={e.confidence} />
        )}
      </div>
      <div>{e.detail}</div>
      <SourceChips ids={e.sources} sources={sources} />
    </div>
  );
}

/** A mechanic inside a card: title, confidence, body and sources. */
function MechanicNote({ m, sources }: { m: Mechanic; sources: SourceIndex }) {
  return (
    <div className="boss-note">
      <div className="fe-head">
        <b>{m.title}</b>
        <Pill kind={m.confidence} />
      </div>
      <div>{m.body}</div>
      <SourceChips ids={m.sources} sources={sources} />
    </div>
  );
}

/**
 * One card per lethal pattern, built from its fight events and the survival
 * mechanics that name it. Patterns with neither are left out.
 */
function Survival({
  events,
  mechanics,
  length,
  sources,
}: {
  events: readonly FightEvent[];
  mechanics: readonly Mechanic[];
  length: number;
  sources: SourceIndex;
}) {
  const cards = SURVIVAL.map((s) => ({
    ...s,
    evs: events.filter((e) => (s.events as readonly string[]).includes(e.event)),
    mechs: mechanics.filter((m) => /surviv/i.test(m.title) && s.mechanic.test(m.title)),
  })).filter((c) => c.evs.length || c.mechs.length);
  if (!cards.length) return <EmptyState>No survival data recorded yet.</EmptyState>;
  return (
    <div className="grid g2">
      {cards.map((c) => (
        <div key={c.title} className="card">
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
 * The buffers' values as a cookie × star table, with notes on how the
 * values scale. Self-only buffs are marked and listed last; application
 * chances are marked as such.
 */
function BuffTable({ rows, sources }: { rows: readonly BuffValue[]; sources: SourceIndex }) {
  if (!rows.length) return <EmptyState>No buff values recorded yet.</EmptyState>;
  const pivot = pivotBuffs(rows);
  const stars = buffStars(rows);
  const name = (r: BuffStarRow) => r.en ?? r.cookieKr;
  const unique = (xs: string[]) => [...new Set(xs)];
  const ampScaled = pivot.some((r) => r.scalesWithCasterAmp);
  const atkBased = unique(pivot.filter((r) => r.base === "CastersAttackPoint").map(name));
  const chances = unique(pivot.filter((r) => r.chance).map(name));

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
    ...stars.map((s): Column<BuffStarRow> => ({
      header: starLabel(s, stars),
      cell: (r) => formatPct(r.byStar[s]),
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
      {ampScaled ? (
        <p className="muted">
          Each buff is worth value × (1 + the caster's skill amp): the caster's own skill amp, not
          the receiver's, which is why buffers run skill amp.
          {atkBased.length
            ? ` Where the value is a share of the caster's ATK, the caster's ATK counts too, which is why ${joinNames(atkBased)} runs ATK%.`
            : null}
        </p>
      ) : null}
      {chances.length ? (
        <p className="muted">
          {joinNames(chances.map((c) => `${c}'s`))} row is an application chance, not a buff size:
          the chance scales with the caster's focus against the target's resist, not with skill amp.
        </p>
      ) : null}
      <p className="muted">
        Each column holds the value from that star count up to the next column. Rows marked "self
        only" buff the caster alone.
      </p>
      <DataTable columns={columns} rows={pivot} rowKey={(r) => r.key} />
    </>
  );
}

/**
 * Rune guidance for the deck: callouts for Brightseeker's haste breakpoint
 * and Dark Choco's focus question where the data has them, then every
 * cookie's rune lines with the reason and any dispute.
 */
function WhatToRun({
  builds,
  mechanics,
  buffs,
  sources,
}: {
  builds: readonly RuneBuild[];
  mechanics: readonly Mechanic[];
  buffs: readonly BuffValue[];
  sources: SourceIndex;
}) {
  if (!builds.length) return <EmptyState>No rune builds recorded for this deck yet.</EmptyState>;
  const seeker = builds.find((b) => b.cookieKr === PAGE.hasteKr);
  const seekerMechs = seeker
    ? mechanics.filter(
        (m) =>
          m.title.includes(shortName({ kr: seeker.cookieKr, en: seeker.en })) &&
          /haste/i.test(m.title),
      )
    : [];
  const choco = builds.find((b) => b.cookieKr === PAGE.debufferKr);
  const chocoChance = choco
    ? pivotBuffs(buffs).find((r) => r.chance && r.en === choco.en)
    : undefined;

  const columns: Column<RuneBuild>[] = [
    {
      header: "Cookie",
      cell: (r) => (
        <>
          <CookieName kr={r.cookieKr} en={r.en} />
          {r.disputed ? <Pill kind="disputed" /> : null}
        </>
      ),
    },
    { header: "Rune lines", cell: (r) => <b>{r.lines}</b> },
    {
      header: "Why",
      cell: (r) => (
        <>
          <div>{r.why}</div>
          {r.disputed ? (
            <div className="muted">
              <b>Disputed:</b> {r.disputed}
            </div>
          ) : null}
        </>
      ),
    },
    { header: "Sources", cell: (r) => <SourceChips ids={r.sources} sources={sources} /> },
  ];

  return (
    <>
      {seeker && seekerMechs.length ? (
        <div className="grid g2">
          <div className="card">
            <div className="card-head">
              <h4>Brightseeker's haste</h4>
            </div>
            {seekerMechs.map((m) => (
              <MechanicNote key={m.id} m={m} sources={sources} />
            ))}
            <RuneNote b={seeker} sources={sources} />
          </div>
          {choco ? <ChocoCard b={choco} chance={chocoChance} sources={sources} /> : null}
        </div>
      ) : choco ? (
        <div className="grid g2">
          <ChocoCard b={choco} chance={chocoChance} sources={sources} />
        </div>
      ) : null}
      <DataTable columns={columns} rows={builds} rowKey={(r) => r.id} />
    </>
  );
}

/** A rune build inside a card: its lines, reason, dispute and sources. */
function RuneNote({ b, sources }: { b: RuneBuild; sources: SourceIndex }) {
  return (
    <div className="boss-note">
      <div>
        <b>{b.lines}</b>
      </div>
      <div>{b.why}</div>
      {b.disputed ? (
        <div className="muted">
          <b>Disputed:</b> {b.disputed}
        </div>
      ) : null}
      <SourceChips ids={b.sources} sources={sources} />
    </div>
  );
}

/** Dark Choco's card: her debuff's base application chance by star, and her rune build. */
function ChocoCard({
  b,
  chance,
  sources,
}: {
  b: RuneBuild;
  chance: BuffStarRow | undefined;
  sources: SourceIndex;
}) {
  const values = chance ? [...new Set(Object.values(chance.byStar))] : [];
  return (
    <div className="card">
      <div className="card-head">
        <h4>Dark Choco: haste or focus</h4>
      </div>
      {chance ? (
        <div className="boss-note">
          <div>
            DEF shred base application chance:{" "}
            <b>{values.length === 1 ? formatPct(values[0]) : values.map(formatPct).join(" → ")}</b>{" "}
            by star, scaled by her focus against the boss's resist.
          </div>
          <SourceChips ids={chance.sources} sources={sources} />
        </div>
      ) : null}
      <RuneNote b={b} sources={sources} />
    </div>
  );
}

/**
 * The deck's ATK-order chain and the in-battle checklist: the catcher sits
 * just under the last ranked cookie once the pet's bonus is added, every
 * ranked cookie sits above the catcher, and the check happens in battle.
 */
function AtkCheck({
  deck,
  mechanics,
  sources,
}: {
  deck: Deck;
  mechanics: readonly Mechanic[];
  sources: SourceIndex;
}) {
  const order = deck.atkOrder ?? [];
  const catcher = deck.cookies.find((c) => c.cookieKr === PAGE.catcherKr);
  const catcherName = catcher ? (catcher.en ?? catcher.cookieKr) : null;
  const last = order.at(-1);
  const pet = deck.pets.find((p) => p.kr === PAGE.atkPetKr);
  const petName = pet ? (pet.en ?? pet.kr) : "the pet";
  const petMechs = pet?.en ? mechanics.filter((m) => m.title.includes(pet.en!)) : [];

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
          {petMechs.map((m) => (
            <div key={m.id} className="muted">
              {m.body} <SourceChips ids={m.sources} sources={sources} />
            </div>
          ))}
        </li>
      </ul>
      <SourceChips ids={deck.sources} sources={sources} />
    </>
  );
}
