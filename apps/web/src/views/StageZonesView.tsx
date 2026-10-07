import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { decksQuery, stageZoneSlotsQuery } from "../api/queries";
import type { Deck, StageZoneSlot } from "../api/types";
import type { ModeSection, StageConfig } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { CookieIcon } from "../components/CookieIcon";
import { CookieName } from "../components/CookieName";
import { EmptyState } from "../components/EmptyState";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { shortName } from "../lib/cookie-icons";
import type { SourceIndex } from "../lib/sources";
import { bracketNoteParts } from "../lib/stage";
import { CopyHeader } from "./ModeViewHeader";
import { BracketTag, ShortDeckLink } from "./StageParts";

/** One zone layout and its boss slots, in slot order. */
interface Zone {
  zoneIndex: number;
  zoneKr: string;
  zoneEn: string;
  slots: StageZoneSlot[];
}

/**
 * Groups boss slots by zone, in the order the API lists them.
 *
 * @param slots - the slots, zone by zone
 * @returns the zones
 */
function zonesOf(slots: readonly StageZoneSlot[]): Zone[] {
  const zones = new Map<number, Zone>();
  for (const slot of slots) {
    const zone = zones.get(slot.zoneIndex) ?? {
      zoneIndex: slot.zoneIndex,
      zoneKr: slot.zoneKr,
      zoneEn: slot.zoneEn,
      slots: [],
    };
    zone.slots.push(slot);
    zones.set(slot.zoneIndex, zone);
  }
  return [...zones.values()];
}

/**
 * The chapters whose boss slots a zone layout fixes: the zone's chapters
 * from `fixedFrom` on (chapter c is in zone ((c − 1) mod 8) + 1), as the
 * first few and then every 8th.
 *
 * @param zoneIndex - the zone, 1-8
 * @param fixedFrom - the first chapter whose slots the layouts fix
 * @returns the chapters, as text
 */
function chaptersOf(zoneIndex: number, fixedFrom: number): string {
  const first = fixedFrom + ((zoneIndex - 1 - ((fixedFrom - 1) % 8) + 8) % 8);
  return `${[0, 1, 2].map((n) => first + 8 * n).join(", ")} … every 8th from ${fixedFrom}`;
}

/**
 * Builds a zone card's DOM id, which the "On this page" list links to.
 *
 * @param zone - the zone
 * @returns `zone-<index>`
 */
const zoneId = (zone: Pick<Zone, "zoneIndex">) => `zone-${zone.zoneIndex}`;

/**
 * How low a bracket a slot has been cleared at: the bracket it leads with
 * as a tinted tag, then what the note adds.
 *
 * @param props - the slot's note, or null when none is recorded
 * @returns the line
 */
function ClearedAt({ note }: { note: string | null }) {
  if (!note) return <span className="zslot-cleared">untested</span>;
  const { pct, rest } = bracketNoteParts(note);
  return (
    <span className="zslot-cleared" title={note}>
      {pct === null ? null : <BracketTag pct={pct} />}
      {rest ? <span>{rest}</span> : null}
    </span>
  );
}

/**
 * What a slot says to bring: the deck by its short name (linking to its
 * card, marked when obsolete) and its cookies' portraits, each named in
 * its tooltip.
 *
 * @param props - the slot's deck id, the deck once loaded, and the stage mode
 * @returns the block, or null when the slot names no deck
 */
function Bring({
  id,
  deck,
  mode,
}: {
  id: string | null;
  deck: Deck | undefined;
  mode: ModeSection;
}) {
  if (!id) return null;
  return (
    <div className="bring">
      <ShortDeckLink mode={mode} id={id} deck={deck} />
      {deck?.cookies.length ? (
        <span className="bring-icons" aria-label="Cookies">
          {deck.cookies.map((c) => (
            <span key={c.id} title={c.en ? shortName(c.en) : c.cookieKr}>
              <CookieIcon kr={c.cookieKr} en={c.en} size={28} />
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}

/**
 * One zone layout as a card: its chapters, then a tile per boss slot with
 * the stage, how low a bracket it has been cleared at, the boss's portrait,
 * what to bring (the deck and its cookies' portraits), the plan cut to two
 * lines, and the sources last.
 *
 * @param props - the zone, the first chapter the layouts fix, the stage mode, the decks by id and the source index
 * @returns the card
 */
function ZoneCard({
  zone,
  fixedFrom,
  mode,
  decks,
  sources,
}: {
  zone: Zone;
  fixedFrom: number;
  mode: ModeSection;
  decks: ReadonlyMap<string, Deck>;
  sources: SourceIndex;
}) {
  return (
    <section className="card zone-card" id={zoneId(zone)} aria-labelledby={`${zoneId(zone)}-title`}>
      <h3 id={`${zoneId(zone)}-title`}>
        {zone.zoneIndex}. {zone.zoneEn} <span className="kr">{zone.zoneKr}</span>
      </h3>
      <p className="zone-chapters">Chapters {chaptersOf(zone.zoneIndex, fixedFrom)}</p>
      <ul className="zslots">
        {zone.slots.map((s) => (
          <li key={s.id} className="zslot">
            <div className="zslot-head">
              <span className="zslot-stage">{s.stage}</span>
              <ClearedAt note={s.bracketNote} />
            </div>
            <CookieName kr={s.bossKr} en={s.bossEn} size={40} />
            <Bring id={s.deckId} deck={s.deckId ? decks.get(s.deckId) : undefined} mode={mode} />
            <span className="zslot-plan">
              <Clamp lines={2} perLine={40}>
                {s.plan}
              </Clamp>
            </span>
            <SourceChips ids={s.sources} sources={sources} max={2} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The zone board: every zone layout the chapters cycle through, each with
 * its boss slots and what to bring to each, under the mode's zone copy and
 * its cited mechanics; "No zone plans recorded yet." when there are none.
 *
 * @param props - the stage mode and its stage config
 * @returns the board
 */
export function StageZonesView({ mode, stage }: { mode: ModeSection; stage: StageConfig }) {
  const sources = useSourceIndex();
  const slots = useQuery(stageZoneSlotsQuery());
  const decks =
    useQuery({
      ...decksQuery(mode.scope),
      select: (list) => new Map(list.map((d) => [d.id, d] as const)),
    }).data ?? new Map<string, Deck>();
  return (
    <>
      <CopyHeader scope={mode.scope} copy={stage.zones} fallbackTitle="Zones" />
      <QueryResult query={slots} resource="zone plans">
        {(rows) => {
          if (!rows.length) return <EmptyState>No zone plans recorded yet.</EmptyState>;
          const zones = zonesOf(rows);
          return (
            <TocLayout items={zones.map((z) => ({ id: zoneId(z), label: z.zoneEn }))}>
              {zones.map((zone) => (
                <ZoneCard
                  key={zone.zoneIndex}
                  zone={zone}
                  fixedFrom={stage.zones.fixedFrom}
                  mode={mode}
                  decks={decks}
                  sources={sources}
                />
              ))}
            </TocLayout>
          );
        }}
      </QueryResult>
    </>
  );
}
