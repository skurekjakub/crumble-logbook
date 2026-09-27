/** A directed counter edge as the matrix needs it; `/api/counters` rows fit as they are. */
export interface CounterEdge {
  slug: string;
  /** The team that is beaten. */
  teamDeckId: string;
  /** The team that beats it. */
  beatenByDeckId: string;
  /** When the edge holds; null when the source states none. */
  conditions: string | null;
  confidence: "high" | "medium" | "low";
}

/** A deck the matrix names: its id, English name and Korean name. */
export interface MatrixDeck {
  id: string;
  nameEn: string;
  /** The Korean name, shown beneath the English; null when unknown. */
  nameKr: string | null;
}

/** A team's name in a matrix heading: English, with the Korean beneath when known. */
function TeamName({ id, deck }: { id: string; deck: MatrixDeck | undefined }) {
  if (!deck) return <>{id}</>;
  if (!deck.nameKr) return <>{deck.nameEn}</>;
  return (
    <span className="name-stack">
      {deck.nameEn}
      <span className="kr">{deck.nameKr}</span>
    </span>
  );
}

/** Props for {@link CounterMatrix}. */
export interface CounterMatrixProps {
  edges: readonly CounterEdge[];
  /** Decks in display order; the axes follow it, and ids not listed come last, named by id. */
  decks: readonly MatrixDeck[];
  /** Where an edge's cell links to, e.g. its entry in a list below. */
  href: (edge: CounterEdge) => string;
}

/**
 * The ids `pick` returns across `edges`, in deck display order, then any
 * ids the deck list lacks in first-seen order.
 */
function axis(
  edges: readonly CounterEdge[],
  decks: readonly MatrixDeck[],
  pick: (edge: CounterEdge) => string,
): string[] {
  const ids = new Set(edges.map(pick));
  const known = decks.map((d) => d.id).filter((id) => ids.has(id));
  return [...known, ...[...ids].filter((id) => !known.includes(id))];
}

/**
 * The counter matrix: one row per team that something beats, one column
 * per team that beats something, each named in English with the Korean
 * beneath. A cell holds the edges "row is beaten by column", each with its
 * conditions, styled by its own confidence and linking to `href(edge)`; the
 * reverse matchup is a different cell, filled only by its own edges. A cell
 * where a team meets itself is marked, and every other cell is empty.
 */
export function CounterMatrix({ edges, decks, href }: CounterMatrixProps) {
  const find = (id: string) => decks.find((d) => d.id === id);
  const name = (id: string) => find(id)?.nameEn ?? id;
  const rows = axis(edges, decks, (e) => e.teamDeckId);
  const cols = axis(edges, decks, (e) => e.beatenByDeckId);
  return (
    <div className="tablewrap">
      <table className="matrix">
        <caption className="label">Each row's team is beaten by the column's team</caption>
        <thead>
          <tr>
            <th scope="col">Team ↓ · beaten by →</th>
            {cols.map((id) => (
              <th key={id} scope="col">
                <TeamName id={id} deck={find(id)} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((team) => (
            <tr key={team}>
              <th scope="row">
                <TeamName id={team} deck={find(team)} />
              </th>
              {cols.map((by) => {
                const cell = edges.filter((e) => e.teamDeckId === team && e.beatenByDeckId === by);
                if (team === by) {
                  return (
                    <td key={by} className="ctr self" aria-label="same team">
                      –
                    </td>
                  );
                }
                return (
                  <td key={by} className="ctr">
                    {cell.map((e) => (
                      <a
                        key={e.slug}
                        className={e.confidence}
                        href={href(e)}
                        title={e.conditions ?? undefined}
                        aria-label={`${name(team)} is beaten by ${name(by)}: ${e.confidence} confidence${e.conditions ? `. ${e.conditions}` : ""}`}
                      >
                        <b>{e.confidence}</b>
                        {e.conditions ? <span className="cond">{e.conditions}</span> : null}
                      </a>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The key to the matrix's cell styles, one per confidence level. */
export function CounterLegend() {
  return (
    <div className="legend-row">
      <span>
        <i className="sw ctr-sw high" />
        high: shown in results
      </span>
      <span>
        <i className="sw ctr-sw medium" />
        medium: reported, partly shown
      </span>
      <span>
        <i className="sw ctr-sw low" />
        low: unverified claim
      </span>
    </div>
  );
}
