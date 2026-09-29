import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import {
  decksQuery,
  dungeonExclusionsQuery,
  dungeonLineupsQuery,
  glossaryQuery,
} from "../api/queries";
import type { DungeonExclusion, DungeonLineup } from "../api/types";
import type { DungeonConfig, ModeSection } from "../app/modes";
import { AtkOrder } from "../components/AtkOrder";
import { CookieName } from "../components/CookieName";
import { EmptyState } from "../components/EmptyState";
import { Kv } from "../components/Kv";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { EXCLUSION_KINDS, EXCLUSION_STATUSES, keptExclusions } from "../lib/dungeon";
import type { LifecycleDeck } from "../lib/obsolete";
import type { SourceIndex } from "../lib/sources";
import { DeckLink } from "./DeckLink";
import { CopyHeader } from "./ModeViewHeader";

/**
 * Builds a lineup card's DOM id, which an "On this page" list links to.
 *
 * @param l - the lineup
 * @returns `lineup-<slug>`
 */
export const lineupId = (l: Pick<DungeonLineup, "slug">) => `lineup-${l.slug}`;

/** What a lineup card reads besides the lineup. */
interface LineupContext {
  /** The Crumble Dungeon mode, for the deck link. */
  mode: ModeSection;
  /** How many cookies deploy first. */
  firstWave: number;
  /** Names a Korean cookie name in English, or null when the glossary doesn't know it. */
  en: (kr: string) => string | null;
  /** Each deck, by id, once the decks load. */
  decks: ReadonlyMap<string, LifecycleDeck> | undefined;
  /** The exclusions list, by Korean name. */
  exclusions: ReadonlyMap<string, DungeonExclusion>;
  sources: SourceIndex;
}

/**
 * One lineup as a card: author and date, the deck it documents (marked
 * when the deck is obsolete), the ATK
 * order, the level rule, the first wave in the author's order (flagging the
 * cookies the exclusions list names), the cookies it leaves out with the
 * exclusions list's reason, and sources.
 *
 * @param props - the lineup and what the card reads besides it
 * @returns the card
 */
function LineupCard({ lineup: l, context }: { lineup: DungeonLineup; context: LineupContext }) {
  const { mode, firstWave, en, decks, exclusions, sources } = context;
  const kept = keptExclusions(l.first40, [...exclusions.values()]);
  const flagged = new Set(kept.map((e) => e.cookieKr));
  const deck = l.deckId ? <DeckLink mode={mode} id={l.deckId} deck={decks?.get(l.deckId)} /> : null;
  const atkOrder = l.atkOrder.length ? (
    <AtkOrder order={l.atkOrder.map((kr) => ({ kr, en: en(kr) }))} />
  ) : null;
  const wave = (
    <>
      {l.first40.length !== firstWave ? (
        <div className="muted">
          The list names {l.first40.length} cookies; the first {firstWave} by power deploy first.
        </div>
      ) : null}
      <ol className="wave">
        {l.first40.map((kr, i) => (
          <li key={`${i}-${kr}`} className={flagged.has(kr) ? "flagged" : undefined}>
            <CookieName kr={kr} en={en(kr)} inline />
          </li>
        ))}
      </ol>
    </>
  );
  const leftOut = l.excluded.length ? (
    <ul className="clean">
      {l.excluded.map((kr) => {
        const e = exclusions.get(kr);
        return (
          <li key={kr}>
            <CookieName kr={kr} en={e?.en ?? en(kr)} inline />
            {e ? <span className="muted"> · {EXCLUSION_KINDS[e.kind]}</span> : null}
          </li>
        );
      })}
    </ul>
  ) : null;
  const keeps = kept.length ? (
    <ul className="clean">
      {kept.map((e) => (
        <li key={e.id} className="flag">
          <CookieName kr={e.cookieKr} en={e.en} inline /> is on the exclusions list (
          {EXCLUSION_KINDS[e.kind]}, {EXCLUSION_STATUSES[e.status].toLowerCase()}) but this lineup
          keeps it.
        </li>
      ))}
    </ul>
  ) : null;
  return (
    <article className="card" id={lineupId(l)}>
      <div className="card-head">
        <div>
          <h3>
            {l.author} <span className="muted">{l.date}</span>
          </h3>
        </div>
        <div className="chips">
          <span className="chip">{l.complete ? "every cookie named" : "partly named"}</span>
        </div>
      </div>
      <Kv
        rows={[
          ["Deck", deck],
          ["ATK order", atkOrder],
          ["Level rule", l.levelRule],
          ["Keeps from the exclusions list", keeps],
          ["First wave", wave],
          ["Leaves out", leftOut],
        ]}
      />
      <SourceChips ids={l.sources} sources={sources} />
    </article>
  );
}

/** Props for {@link DungeonLineupsView}. */
export interface DungeonLineupsViewProps {
  /** The Crumble Dungeon mode. */
  mode: ModeSection;
  /** Its dungeon screens' config. */
  dungeon: DungeonConfig;
}

/**
 * The published Crumble Dungeon lineups, newest first, each as a card
 * (see {@link LineupCard}), with an "On this page" list linking to each.
 * Names show in English where the glossary knows them.
 *
 * @param props - the mode and its dungeon config
 * @returns the lineups view
 */
export function DungeonLineupsView({ mode, dungeon }: DungeonLineupsViewProps) {
  const sources = useSourceIndex();
  const lineups = useQuery(dungeonLineupsQuery());
  const exclusions = useQuery({
    ...dungeonExclusionsQuery(),
    select: (list) => new Map(list.map((e) => [e.cookieKr, e] as const)),
  }).data;
  const glossary = useQuery({
    ...glossaryQuery(),
    select: (entries) => new Map(entries.map((e) => [e.kr, e.en] as const)),
  }).data;
  const decks = useQuery({
    ...decksQuery(mode.scope),
    select: (list) => new Map(list.map((d) => [d.id, d] as const)),
  }).data;
  const context: LineupContext = {
    mode,
    firstWave: dungeon.firstWave,
    /**
     * Names a Korean cookie name in English.
     *
     * @param kr - the Korean name
     * @returns the English name, or null when unknown or the glossary hasn't loaded
     */
    en: (kr) => glossary?.get(kr) ?? null,
    decks,
    exclusions: exclusions ?? new Map(),
    sources,
  };
  return (
    <>
      <CopyHeader scope={mode.scope} copy={dungeon.lineups} fallbackTitle="Lineups" />
      <QueryResult query={lineups} resource="dungeon lineups">
        {(rows) =>
          rows.length ? (
            <TocLayout
              items={rows.map((l) => ({ id: lineupId(l), label: `${l.author}, ${l.date}` }))}
            >
              {rows.map((l) => (
                <LineupCard key={l.id} lineup={l} context={context} />
              ))}
            </TocLayout>
          ) : (
            <EmptyState>No lineups recorded yet.</EmptyState>
          )
        }
      </QueryResult>
    </>
  );
}
