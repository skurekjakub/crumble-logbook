import { shortDeckName } from "../lib/deck-names";
import type { FaceRef } from "../lib/deck-names";
import { Clamp } from "./Clamp";
import { FaceStack } from "./Faces";
import type { PillKind } from "./Pill";
import { Pill } from "./Pill";

/** A directed counter edge as the matrix needs it; `/api/counters` rows fit as they are. */
export interface CounterEdge {
  slug: string;
  /** The team that is beaten. */
  teamDeckId: string;
  /** The team that beats it. */
  beatenByDeckId: string;
  /** When the edge holds; null when the source states none. */
  conditions: string | null;
  /** The mechanism: why the counter wins; shown when the cell is expanded. */
  why?: string | null;
  confidence: "high" | "medium" | "low";
}

/** A deck the matrix names. */
export interface MatrixDeck {
  id: string;
  nameEn: string;
  /** The Korean name, shown beneath the English; null when unknown. */
  nameKr: string | null;
  /** The cookies whose portraits stand for the deck, most telling first. */
  faces?: readonly FaceRef[];
  /** The deck's tier, shown as a pill on its row; omitted for none. */
  status?: PillKind | null;
}

/** What a cell's verdict badge says per confidence: the pill kind and its word. */
const VERDICT: Readonly<Record<CounterEdge["confidence"], readonly [PillKind, string]>> = {
  high: ["high", "high"],
  medium: ["medium", "medium"],
  low: ["low", "claim"],
};

/**
 * The first of a deck's Korean names, which often lists several ("호밀 원툴덱 / 호황").
 *
 * @param nameKr - the Korean name as stored
 * @returns the first name
 */
const firstKr = (nameKr: string) => nameKr.split(" / ")[0]!.trim();

/**
 * A team in a matrix heading: its portraits, then its short English name,
 * with its first Korean name beneath when known; the full names are in the
 * tooltip.
 *
 * @param props - the team's deck id, and its deck when listed
 * @returns the heading content; the bare id when the deck isn't listed
 */
function TeamHead({ id, deck }: { id: string; deck: MatrixDeck | undefined }) {
  if (!deck) return <span className="team-head">{id}</span>;
  const title = deck.nameKr ? `${deck.nameEn} ${deck.nameKr}` : deck.nameEn;
  return (
    <span className="team-head" title={title}>
      <FaceStack faces={deck.faces ?? []} size={28} />
      <span className="name-stack">
        <span className="en">{shortDeckName(deck.nameEn)}</span>
        {deck.nameKr ? <span className="kr">{firstKr(deck.nameKr)}</span> : null}
      </span>
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
 * One edge in a cell: a verdict badge coloured by confidence that links to
 * the edge's entry, then its conditions cut to two short lines (a cell is
 * narrow); expanding them also shows the mechanism.
 *
 * @param props - the edge, its accessible name and its link
 * @returns the tile
 */
function EdgeTile({ edge, name, href }: { edge: CounterEdge; name: string; href: string }) {
  const [kind, word] = VERDICT[edge.confidence];
  const length = (edge.conditions?.length ?? 0) + (edge.why?.length ?? 0);
  return (
    <div className={`edge ${edge.confidence}`}>
      <a className={`verdict ${edge.confidence}`} href={href} aria-label={name}>
        <Pill kind={kind}>{word}</Pill>
      </a>
      {length ? (
        <span className="edge-text">
          <Clamp lines={2} perLine={22} length={length}>
            {edge.conditions ? <span className="cond">{edge.conditions}</span> : null}
            {edge.conditions && edge.why ? " " : null}
            {edge.why ? <span className="why">{edge.why}</span> : null}
          </Clamp>
        </span>
      ) : null}
    </div>
  );
}

/**
 * The counter matrix, read as win/lose: one row per team that something
 * beats, one column per team that beats something, each headed by its
 * portraits and short name. A filled cell means the column's team wins:
 * each edge "row is beaten by column" is a tile coloured by its own
 * confidence, its conditions cut short with the mechanism on demand,
 * and its badge linking to `href(edge)`. The reverse matchup is a different
 * cell, filled only by its own edges. A cell where a team meets itself is
 * marked, and every other cell is empty.
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
   * Names a deck in English, shortened.
   *
   * @param id - the deck's id
   * @returns its short English name, or the id when it isn't listed
   */
  const name = (id: string) => {
    const deck = find(id);
    return deck ? shortDeckName(deck.nameEn) : id;
  };
  const rows = axis(edges, decks, (e) => e.teamDeckId);
  const cols = axis(edges, decks, (e) => e.beatenByDeckId);
  return (
    <div className="tablewrap matrix-wrap">
      <table className="matrix">
        <caption className="label">Each row's team is beaten by the column's team</caption>
        <thead>
          <tr>
            <th scope="col" className="corner">
              <span>Team ↓</span>
              <span>beaten by →</span>
            </th>
            {cols.map((id) => (
              <th key={id} scope="col">
                <TeamHead id={id} deck={find(id)} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((team) => {
            const deck = find(team);
            return (
              <tr key={team}>
                <th scope="row">
                  <TeamHead id={team} deck={deck} />
                  {deck?.status ? <Pill kind={deck.status} /> : null}
                </th>
                {cols.map((by) => {
                  if (team === by) {
                    return (
                      <td key={by} className="ctr self" aria-label="same team">
                        –
                      </td>
                    );
                  }
                  const cell = edges.filter(
                    (e) => e.teamDeckId === team && e.beatenByDeckId === by,
                  );
                  return (
                    <td key={by} className={cell.length ? "ctr hit" : "ctr"}>
                      {cell.map((e) => (
                        <EdgeTile
                          key={e.slug}
                          edge={e}
                          href={href(e)}
                          name={`${name(team)} is beaten by ${name(by)}: ${e.confidence} confidence${e.conditions ? `. ${e.conditions}` : ""}`}
                        />
                      ))}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The key to the matrix's tiles, one per confidence level.
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
        claim: unverified
      </span>
    </div>
  );
}
