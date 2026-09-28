import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { countersQuery, decksQuery } from "../api/queries";
import type { Counter, Deck } from "../api/types";
import type { ModeSection } from "../app/modes";
import { ConfidencePill } from "../components/ConfidencePill";
import { CounterLegend, CounterMatrix } from "../components/CounterMatrix";
import { EmptyState } from "../components/EmptyState";
import { Kv } from "../components/Kv";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import type { SourceIndex } from "../lib/sources";
import { ModeViewHeader } from "./ModeViewHeader";

/** The name parts a counter heading shows for a deck. */
type DeckName = Pick<Deck, "id" | "nameEn" | "nameKr">;

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
 * A deck's English name with its Korean name beside it, or its id when the deck isn't listed.
 *
 * @param props - the deck, when listed, and its id
 * @returns the label
 */
function DeckLabel({ deck, id }: { deck: DeckName | undefined; id: string }) {
  if (!deck) return <>{id}</>;
  return (
    <>
      {deck.nameEn} {deck.nameKr ? <span className="kr">{deck.nameKr}</span> : null}
    </>
  );
}

/**
 * One edge as a card: "team is beaten by team", its conditions, mechanism, confidence and sources.
 *
 * @param props - the edge, the deck lookup and the source index
 * @returns the card
 */
function CounterCard({
  edge,
  deck,
  sources,
}: {
  edge: Counter;
  /** Finds a listed deck by id. */
  deck: (id: string) => DeckName | undefined;
  sources: SourceIndex;
}) {
  return (
    <article className="card" id={edgeId(edge)}>
      <div className="card-head">
        <h3>
          <DeckLabel deck={deck(edge.teamDeckId)} id={edge.teamDeckId} />{" "}
          <span className="muted">is beaten by</span>{" "}
          <DeckLabel deck={deck(edge.beatenByDeckId)} id={edge.beatenByDeckId} />
        </h3>
        <ConfidencePill confidence={edge.confidence} />
      </div>
      <Kv
        rows={[
          ["Conditions", edge.conditions],
          ["Why", edge.why],
        ]}
      />
      <SourceChips ids={edge.sources} sources={sources} />
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

/**
 * A mode's counters: the directed matrix (row = the team, column = the team
 * that beats it) with its confidence legend, then every edge as a card the
 * matrix cells link to, with an "On this page" list linking to each part.
 * "No counters recorded yet." when there are none.
 *
 * @param mode - the mode whose counters, decks and copy the view shows
 * @returns the counters view
 */
export function CountersView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const counters = useQuery(countersQuery(mode.scope));
  const decks = useQuery(decksQuery(mode.scope)).data ?? [];
  /**
   * Finds a listed deck by id.
   *
   * @param id - the deck's id
   * @returns the deck, or `undefined` if it isn't listed
   */
  const deck = (id: string) => decks.find((d) => d.id === id);
  const order = new Map(decks.map((d, i) => [d.id, i] as const));

  return (
    <>
      <ModeViewHeader mode={mode} view="counters" fallbackTitle="Counters" />
      <QueryResult query={counters} resource="counters">
        {(edges) =>
          edges.length ? (
            <TocLayout items={TOC}>
              <div className="grid" id={TOC[0].id}>
                <CounterMatrix edges={edges} decks={decks} href={(e) => `#${edgeId(e)}`} />
                <CounterLegend />
              </div>
              <h3 id={TOC[1].id}>Every edge</h3>
              <div className="counter-list">
                {[...edges].sort(byMatrixOrder(order)).map((e) => (
                  <CounterCard key={e.id} edge={e} deck={deck} sources={sources} />
                ))}
              </div>
            </TocLayout>
          ) : (
            <EmptyState>No counters recorded yet.</EmptyState>
          )
        }
      </QueryResult>
    </>
  );
}
