import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { decksQuery, stageZoneSlotsQuery } from "../api/queries";
import type { StageZoneSlot } from "../api/types";
import type { ModeSection, StageConfig } from "../app/modes";
import { CookieName } from "../components/CookieName";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import type { LifecycleDeck } from "../lib/obsolete";
import type { SourceIndex } from "../lib/sources";
import { DeckLink } from "./DeckLink";
import { CopyHeader } from "./ModeViewHeader";

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
  return `${[0, 1, 2].map((n) => first + 8 * n).join(", ")}, … every 8th chapter (fixed from ${fixedFrom})`;
}

/**
 * Builds a zone card's DOM id, which the "On this page" list links to.
 *
 * @param zone - the zone
 * @returns `zone-<index>`
 */
const zoneId = (zone: Pick<Zone, "zoneIndex">) => `zone-${zone.zoneIndex}`;

/**
 * One zone layout as a card: its chapters, then a row per boss slot with the
 * boss, the plan, the deck it starts from (linking to the deck's card,
 * marked when the deck is obsolete), how low a bracket the slot has been
 * cleared at, and sources.
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
  decks: ReadonlyMap<string, LifecycleDeck>;
  sources: SourceIndex;
}) {
  const columns: Column<StageZoneSlot>[] = [
    { header: "Stage", cell: (s) => s.stage, className: "n" },
    { header: "Boss", cell: (s) => <CookieName kr={s.bossKr} en={s.bossEn} /> },
    { header: "Plan", cell: (s) => s.plan, className: "wide" },
    {
      header: "Deck",
      cell: (s) =>
        s.deckId ? <DeckLink mode={mode} id={s.deckId} deck={decks.get(s.deckId)} /> : "–",
    },
    { header: "Cleared at", cell: (s) => s.bracketNote ?? "–" },
    { header: "Sources", cell: (s) => <SourceChips ids={s.sources} sources={sources} /> },
  ];
  return (
    <section className="card" id={zoneId(zone)}>
      <h3>
        {zone.zoneIndex}. {zone.zoneEn} <span className="kr">{zone.zoneKr}</span>
      </h3>
      <p className="muted">Chapters {chaptersOf(zone.zoneIndex, fixedFrom)}.</p>
      <DataTable columns={columns} rows={zone.slots} rowKey={(s) => s.id} layout="stack" />
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
    }).data ?? new Map<string, LifecycleDeck>();
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
