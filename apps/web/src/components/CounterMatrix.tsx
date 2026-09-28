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

/**
 * A team's name in a matrix heading: English, with the Korean beneath when known.
 *
 * @param props - the team's deck id, and its deck when listed
 * @returns the name; the bare id when the deck isn't listed
 */
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
 * Lists the ids `pick` returns across `edges`, in deck display order, then
 * any ids the deck list lacks in first-seen order.
 *
 * @param edges - the counter edges
 * @param decks - the decks, in display order
 * @param pick - reads one side of an edge
 * @returns the axis's deck ids, each once
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
 *
 * @param props - the edges, the decks naming the axes, and each cell's link
 * @returns the matrix table
 */
export function CounterMatrix({ edges, decks, href }: CounterMatrixProps) {
  /**
   * Finds a listed deck by id.
   *
   * @param id - the deck's id
   * @returns the deck, or `undefined` if it isn't listed
   */
  const find = (id: string) => decks.find((d) => d.id === id);
  /**
   * Names a deck in English.
   *
   * @param id - the deck's id
   * @returns its English name, or the id when it isn't listed
   */
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

/**
 * The key to the matrix's cell styles, one per confidence level.
 *
 * @returns the legend row
 */
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
