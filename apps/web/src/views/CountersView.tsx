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
import { ViewHeader } from "../components/ViewHeader";
import type { SourceIndex } from "../lib/sources";

/** The name parts a counter heading shows for a deck. */
type DeckName = Pick<Deck, "id" | "nameEn" | "nameKr">;

/** A counter edge's DOM id, which its matrix cell links to. */
const edgeId = (edge: Pick<Counter, "slug">) => `counter-${edge.slug}`;

/** A deck's English name with its Korean name beside it, or its id when the deck isn't listed. */
function DeckLabel({ deck, id }: { deck: DeckName | undefined; id: string }) {
  if (!deck) return <>{id}</>;
  return (
    <>
      {deck.nameEn} {deck.nameKr ? <span className="kr">{deck.nameKr}</span> : null}
    </>
  );
}

/** One edge as a card: "team is beaten by team", its conditions, mechanism, confidence and sources. */
function CounterCard({
  edge,
  deck,
  sources,
}: {
  edge: Counter;
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
 */
function byMatrixOrder(order: ReadonlyMap<string, number>) {
  const rank = (id: string) => order.get(id) ?? Number.MAX_SAFE_INTEGER;
  return (a: Counter, b: Counter) =>
    rank(a.teamDeckId) - rank(b.teamDeckId) ||
    rank(a.beatenByDeckId) - rank(b.beatenByDeckId) ||
    a.id - b.id;
}

/**
 * A mode's counters: the directed matrix (row = the team, column = the team
 * that beats it) with its confidence legend, then every edge as a card the
 * matrix cells link to. "No counters recorded yet." when there are none.
 *
 * @param mode - the mode whose counters, decks and copy the view shows
 */
export function CountersView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const counters = useQuery(countersQuery(mode.scope));
  const decks = useQuery(decksQuery(mode.scope)).data ?? [];
  const deck = (id: string) => decks.find((d) => d.id === id);
  const order = new Map(decks.map((d, i) => [d.id, i] as const));

  return (
    <>
      <ViewHeader title={mode.copy.counters?.title ?? "Counters"} lede={mode.copy.counters?.lede} />
      <QueryResult query={counters} resource="counters">
        {(edges) =>
          edges.length ? (
            <>
              <CounterMatrix edges={edges} decks={decks} href={(e) => `#${edgeId(e)}`} />
              <CounterLegend />
              <h3>Every edge</h3>
              <div className="counter-list">
                {[...edges].sort(byMatrixOrder(order)).map((e) => (
                  <CounterCard key={e.id} edge={e} deck={deck} sources={sources} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState>No counters recorded yet.</EmptyState>
          )
        }
      </QueryResult>
    </>
  );
}
