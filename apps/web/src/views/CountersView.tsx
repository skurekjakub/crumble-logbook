import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSourceIndex } from "../api/hooks";
import { countersQuery, decksQuery } from "../api/queries";
import type { Counter, Deck } from "../api/types";
import type { ModeSection } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { ConfidencePill } from "../components/ConfidencePill";
import type { MatrixDeck } from "../components/CounterMatrix";
import { CounterLegend, CounterMatrix } from "../components/CounterMatrix";
import { EmptyState } from "../components/EmptyState";
import { FaceStack } from "../components/Faces";
import { Kv } from "../components/Kv";
import { ObsoleteNotice } from "../components/ObsoleteNotice";
import { ObsoleteSection } from "../components/ObsoleteSection";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { deckFaces, shortDeckName } from "../lib/deck-names";
import { isCurrent } from "../lib/obsolete";
import type { SourceIndex } from "../lib/sources";
import { DeckLink } from "./DeckLink";
import { ModeViewHeader } from "./ModeViewHeader";

/** The deck fields a counter heading shows. */
type DeckName = Pick<Deck, "id" | "nameEn" | "nameKr" | "cookies" | "atkOrder">;

/** The view's sections, in page order, which its "On this page" list links to. */
const TOC = [
  { id: "counters-matrix", label: "Matrix" },
  { id: "counters-edges", label: "Every edge" },
] as const;

/**
 * Builds a counter edge's DOM id, which its matrix cell links to.
 *
 * @param edge - the edge
 * @returns `counter-<slug>`
 */
const edgeId = (edge: Pick<Counter, "slug">) => `counter-${edge.slug}`;

/**
 * A deck as the matrix names it: its portraits, English and Korean names and tier.
 *
 * @param deck - a deck of the mode
 * @returns the matrix's deck
 */
function matrixDeck(deck: Deck): MatrixDeck {
  return {
    id: deck.id,
    nameEn: deck.nameEn,
    nameKr: deck.nameKr,
    faces: deckFaces(deck),
    status: deck.status,
  };
}

/**
 * A team in an edge's heading: its portraits and short English name, the
 * full names in the tooltip; its id when the deck isn't listed.
 *
 * @param props - the deck, when listed, and its id
 * @returns the label
 */
function DeckLabel({ deck, id }: { deck: DeckName | undefined; id: string }) {
  if (!deck) return <span className="edge-team">{id}</span>;
  return (
    <span className="edge-team" title={deck.nameKr ? `${deck.nameEn} ${deck.nameKr}` : deck.nameEn}>
      <FaceStack faces={deckFaces(deck)} size={20} />
      <span>{shortDeckName(deck.nameEn)}</span>
    </span>
  );
}

/**
 * One edge as a compact card, verdict first: its confidence, then "team
 * loses to team", then its conditions and mechanism each cut to a line,
 * sources at the foot; headed by `notice` when given.
 *
 * @param props - the edge, the deck lookup, the source index and an optional notice
 * @returns the card
 */
function CounterCard({
  edge,
  deck,
  sources,
  notice,
}: {
  edge: Counter;
  /** Finds a listed deck by id. */
  deck: (id: string) => DeckName | undefined;
  sources: SourceIndex;
  /** What heads the card, e.g. an obsolete notice. */
  notice?: ReactNode;
}) {
  return (
    <article className={`card edge-card ${edge.confidence}`} id={edgeId(edge)}>
      {notice}
      <div className="edge-head">
        <ConfidencePill confidence={edge.confidence} />
        <h3>
          <DeckLabel deck={deck(edge.teamDeckId)} id={edge.teamDeckId} />{" "}
          <span className="loses">loses to</span>{" "}
          <DeckLabel deck={deck(edge.beatenByDeckId)} id={edge.beatenByDeckId} />
        </h3>
      </div>
      <Kv
        rows={[
          ["When", edge.conditions ? <Clamp lines={1}>{edge.conditions}</Clamp> : null],
          ["Why", edge.why ? <Clamp lines={1}>{edge.why}</Clamp> : null],
        ]}
      />
      <div className="card-foot">
        <SourceChips ids={edge.sources} sources={sources} />
      </div>
    </article>
  );
}

/**
 * Orders edges as the matrix reads: by the beaten team's deck order, then
 * by the counter's; decks not listed come last.
 *
 * @param order - each listed deck's display position, by id
 * @returns a comparator for counter edges, ties broken by id
 */
function byMatrixOrder(order: ReadonlyMap<string, number>) {
  /**
   * Returns a deck's display position.
   *
   * @param id - the deck's id
   * @returns its position; past every listed deck when it isn't listed
   */
  const rank = (id: string) => order.get(id) ?? Number.MAX_SAFE_INTEGER;
  return (a: Counter, b: Counter) =>
    rank(a.teamDeckId) - rank(b.teamDeckId) ||
    rank(a.beatenByDeckId) - rank(b.beatenByDeckId) ||
    a.id - b.id;
}

/** The id of the page's Obsolete section. */
const OBSOLETE_ID = "counters-obsolete";

/** An edge the Obsolete section lists, with what its notice says. */
interface RetiredEdge {
  edge: Counter;
  since: string;
  reason: string | null;
  sources: readonly string[];
  /** The deck that superseded the obsolete deck the edge names, when one did. */
  successor: string | null;
}

/**
 * Splits edges into the matrix's, current edges between current decks, and
 * the Obsolete section's: obsolete edges, under their own reason, and
 * current edges that name an obsolete deck, under that deck's, with the
 * deck that superseded it; the most
 * recently obsoleted first.
 *
 * @param edges - every edge, in list order
 * @param decks - every deck of the mode
 * @returns `live` in list order, and `retired`
 */
function matchups(
  edges: readonly Counter[],
  decks: readonly Deck[],
): { live: Counter[]; retired: RetiredEdge[] } {
  const obsoleteDecks = new Map(decks.filter((d) => !isCurrent(d)).map((d) => [d.id, d] as const));
  const live: Counter[] = [];
  const retired: RetiredEdge[] = [];
  for (const edge of edges) {
    if (edge.obsoleteSince) {
      retired.push({
        edge,
        since: edge.obsoleteSince,
        reason: edge.obsoleteReason,
        sources: edge.obsoleteSources,
        successor: null,
      });
      continue;
    }
    const gone = obsoleteDecks.get(edge.teamDeckId) ?? obsoleteDecks.get(edge.beatenByDeckId);
    if (gone?.obsoleteSince) {
      retired.push({
        edge,
        since: gone.obsoleteSince,
        reason: `${gone.nameEn} is obsolete${gone.obsoleteReason ? `: ${gone.obsoleteReason}` : ""}`,
        sources: gone.obsoleteSources,
        successor: gone.supersededBy,
      });
    } else {
      live.push(edge);
    }
  }
  retired.sort((a, b) => b.since.localeCompare(a.since));
  return { live, retired };
}

/**
 * A mode's counters: the directed matrix (row = the team, column = the team
 * that beats it) with its confidence legend, then every edge as a card the
 * matrix cells link to, with an "On this page" list linking to each part.
 * The matrix and the edge list count current decks only: obsolete edges,
 * and current edges that name an obsolete deck, end the page in the
 * collapsed Obsolete section, each under its notice. "No counters recorded
 * yet." when there are none, and "No current counters." above the section
 * when every edge is in it.
 *
 * @param mode - the mode whose counters, decks and copy the view shows
 * @returns the counters view
 */
export function CountersView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const counters = useQuery(countersQuery(mode.scope));
  const decks = useQuery(decksQuery(mode.scope)).data ?? [];
  const current = decks.filter(isCurrent);
  /**
   * Finds a listed deck by id.
   *
   * @param id - the deck's id
   * @returns the deck, or `undefined` if it isn't listed
   */
  const deck = (id: string) => decks.find((d) => d.id === id);
  const order = new Map(current.map((d, i) => [d.id, i] as const));

  return (
    <>
      <ModeViewHeader mode={mode} view="counters" fallbackTitle="Counters" />
      <QueryResult query={counters} resource="counters">
        {(edges) => {
          if (!edges.length) return <EmptyState>No counters recorded yet.</EmptyState>;
          const { live, retired } = matchups(edges, decks);
          const toc = [
            ...(live.length ? TOC : []),
            ...(retired.length ? [{ id: OBSOLETE_ID, label: "Obsolete" }] : []),
          ];
          return (
            <TocLayout items={toc}>
              {live.length ? (
                <>
                  <div className="grid" id={TOC[0].id}>
                    <CounterMatrix
                      edges={live}
                      decks={current.map(matrixDeck)}
                      href={(e) => `#${edgeId(e)}`}
                    />
                    <CounterLegend />
                  </div>
                  <h3 id={TOC[1].id}>Every edge</h3>
                  <div className="counter-list">
                    {[...live].sort(byMatrixOrder(order)).map((e) => (
                      <CounterCard key={e.id} edge={e} deck={deck} sources={sources} />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState>No current counters.</EmptyState>
              )}
              <ObsoleteSection id={OBSOLETE_ID} latest={retired[0]?.since ?? null}>
                {retired.map((r) => (
                  <CounterCard
                    key={r.edge.id}
                    edge={r.edge}
                    deck={deck}
                    sources={sources}
                    notice={
                      <ObsoleteNotice
                        since={r.since}
                        reason={r.reason}
                        sources={r.sources}
                        sourceIndex={sources}
                        superseded={
                          r.successor ? (
                            <DeckLink mode={mode} id={r.successor} deck={deck(r.successor)} />
                          ) : null
                        }
                      />
                    }
                  />
                ))}
              </ObsoleteSection>
            </TocLayout>
          );
        }}
      </QueryResult>
    </>
  );
}
