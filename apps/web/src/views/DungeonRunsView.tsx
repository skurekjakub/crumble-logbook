import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { decksQuery, dungeonRunsQuery, glossaryQuery, rngFactorsQuery } from "../api/queries";
import type { DungeonRun, RngFactor } from "../api/types";
import type { DungeonConfig, ModeSection } from "../app/modes";
import { AtkOrder } from "../components/AtkOrder";
import { Clamp } from "../components/Clamp";
import type { Column, TableFilter, TableSelect } from "../components/DataTable";
import { applyFilters, DataTable, TableTools } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { ObsoleteSection } from "../components/ObsoleteSection";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { formatDungeonG, ordinal, scorePerPower } from "../lib/dungeon";
import { groupByObsoleteDeck, splitByDeck } from "../lib/obsolete";
import { optionalKey, optionalText } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import { sourceLabel } from "../lib/sources";
import { DeckLink } from "./DeckLink";
import { CopyHeader } from "./ModeViewHeader";
import { ObsoleteDeckRows } from "./ObsoleteDeckRows";

/** Select labels per board a score was shown on. */
const BOARDS: Readonly<Record<DungeonRun["board"], string>> = {
  run: "Run result",
  "weekly-best": "Weekly best",
  claim: "Claim",
};

/** Select labels per kind of evidence. */
const EVIDENCE: Readonly<Record<DungeonRun["evidence"], string>> = {
  screenshot: "Screenshot",
  video: "Video",
  text: "Text only",
};

/** One heading the runs are shown under. */
interface RunGroup {
  /** The section's DOM id. */
  id: string;
  /** Its heading. */
  title: string;
  /** What its rows are. */
  lede: string;
  /** The standing its rows have. */
  standing: DungeonRun["standing"];
}

/** The groups the runs are shown in, in order; only the first is a ranking. */
const GROUPS: readonly RunGroup[] = [
  {
    id: "runs-ranked",
    title: "Ranked runs",
    lede: "Screenshot or video runs, highest score first.",
    standing: "verified",
  },
  {
    id: "runs-claimed",
    title: "Claims",
    lede: "Text-only scores, by score; not ranked.",
    standing: "claim",
  },
];

/** The runs board's search params: a board, a kind of evidence and a text filter. */
export interface RunsSearch {
  board?: DungeonRun["board"];
  evidence?: DungeonRun["evidence"];
  q?: string;
}

/**
 * Reads the runs board's search params.
 *
 * @param search - the decoded query values
 * @returns the board, evidence and text filter, each dropped when unusable
 */
export function validateRunsSearch(search: Record<string, unknown>): RunsSearch {
  return {
    board: optionalKey(search.board, BOARDS),
    evidence: optionalKey(search.evidence, EVIDENCE),
    q: optionalText(search.q),
  };
}

/** Props for {@link DungeonRunsView}. */
export interface DungeonRunsViewProps {
  /** The Crumble Dungeon mode. */
  mode: ModeSection;
  /** Its dungeon screens' config. */
  dungeon: DungeonConfig;
  /** The current search params. */
  search: RunsSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: RunsSearch) => void;
}

/**
 * The mode's RNG factors: what moves a run's score between retries, each
 * with its mitigation and sources; nothing when there are none.
 *
 * @param props - the factors and the source index
 * @returns the card, or null
 */
function RunSpread({ rows, sources }: { rows: readonly RngFactor[]; sources: SourceIndex }) {
  if (!rows.length) return null;
  return (
    <section className="run-spread" aria-labelledby="runs-spread-title">
      <h3 id="runs-spread-title">What moves a run</h3>
      {rows.map((f) => (
        <div key={f.id} className="callout">
          <span className="callout-body">
            <Clamp lines={1} length={f.factor.length + f.effect.length + 2}>
              <b>{f.factor}.</b> {f.effect}
            </Clamp>
            {f.mitigation ? (
              <span className="helps">
                <Clamp lines={1}>{`What helps: ${f.mitigation}`}</Clamp>
              </span>
            ) : null}
          </span>
          <SourceChips ids={f.sources} sources={sources} max={2} />
        </div>
      ))}
    </section>
  );
}

/** The texts a runs-board row shows, cell by cell; `""` where the row shows nothing. */
type ShownRun = Readonly<
  Record<
    | "rank"
    | "score"
    | "totalPower"
    | "perPower"
    | "timeLeft"
    | "cookiesLeft"
    | "board"
    | "place"
    | "server"
    | "evidence"
    | "player"
    | "deck"
    | "perks"
    | "preset",
    string
  >
>;

/**
 * The texts a runs-board row shows, which its cells print and its text
 * filter matches.
 *
 * @param r - the run
 * @param rank - its place among the ranked runs, or undefined for a claim
 * @param deck - the name its deck shows under, or null without a deck
 * @returns the texts, by cell
 */
function showRun(r: DungeonRun, rank: number | undefined, deck: string | null): ShownRun {
  const perPower = scorePerPower(r.scoreG, r.totalPowerG);
  return {
    rank: rank === undefined ? "–" : String(rank),
    score: formatDungeonG(r.scoreG),
    totalPower: formatDungeonG(r.totalPowerG),
    perPower: perPower == null ? "–" : `${perPower}×`,
    timeLeft: r.timeLeftS == null ? "" : `${r.timeLeftS} s left`,
    cookiesLeft:
      r.cookiesLeft == null ? "" : `${r.cookiesLeft} cookie${r.cookiesLeft === 1 ? "" : "s"} left`,
    board: BOARDS[r.board],
    place: r.serverRank == null ? "" : `${ordinal(r.serverRank)} on the server`,
    server: r.server ? `Server: ${r.server}` : "",
    evidence: EVIDENCE[r.evidence],
    player: r.player ?? "anonymous",
    deck: deck ?? "",
    perks: r.perks ? `Perks: ${r.perks}` : "",
    preset: r.preset ? `Preset: ${r.preset}` : "",
  };
}

/**
 * The runs board: the documented Crumble Dungeon scores a screenshot or
 * video shows, ranked by score, then the claims under their own heading,
 * with the columns `columns` declares and the mode's RNG factors after
 * them. The board, evidence and text filters live in the URL and apply to
 * both groups; the text filter matches what a row shows. A run on an
 * obsolete team is left out of the ranking; those runs end the board in
 * the collapsed Obsolete section, under the team's notice with a link to
 * the team that superseded it, and the filters apply to them too.
 *
 * @param props - the mode, its dungeon config, the search params and their setter
 * @returns the runs board
 */
export function DungeonRunsView({ mode, dungeon, search, onSearch }: DungeonRunsViewProps) {
  const sources = useSourceIndex();
  const runs = useQuery(dungeonRunsQuery());
  const rng = useQuery(rngFactorsQuery(mode.scope));
  const deckRows = useQuery(decksQuery(mode.scope)).data;
  const decks = deckRows ? new Map(deckRows.map((d) => [d.id, d.nameEn] as const)) : undefined;
  const glossary = useQuery({
    ...glossaryQuery(),
    select: (entries) => new Map(entries.map((e) => [e.kr, e.en] as const)),
  }).data;
  /**
   * The deck name a row shows.
   *
   * @param r - the run
   * @returns the deck's English name (its id before the decks load), or null without a deck
   */
  const deckOf = (r: DungeonRun) => (r.deckId ? (decks?.get(r.deckId) ?? r.deckId) : null);
  /**
   * A run's ATK order as the chain shows it: each Korean name with its glossary English.
   *
   * @param r - the run
   * @returns the names, top first; empty when the post gives no order
   */
  const orderOf = (r: DungeonRun) =>
    (r.atkOrder ?? []).map((kr) => ({ kr, en: glossary?.get(kr) ?? null }));

  return (
    <>
      <CopyHeader scope={mode.scope} copy={dungeon.runs} fallbackTitle="Runs" />
      <QueryResult query={runs} resource="dungeon runs">
        {(rows) => {
          if (!rows.length) return <EmptyState>No runs recorded yet.</EmptyState>;
          const { current: live, obsolete: retiredRuns } = splitByDeck(rows, deckRows ?? []);
          const rank = new Map(
            live.filter((r) => r.standing === "verified").map((r, i) => [r.id, i + 1] as const),
          );
          /**
           * The texts a row shows.
           *
           * @param r - the run
           * @returns them, by cell
           */
          const shown = (r: DungeonRun) => showRun(r, rank.get(r.id), deckOf(r));
          const columns: Column<DungeonRun>[] = [
            {
              header: "Rank",
              cell: (r) => {
                const place = rank.get(r.id);
                return (
                  <span className={place === 1 ? "dg-rank top" : "dg-rank"}>{shown(r).rank}</span>
                );
              },
              className: "n rank-cell",
            },
            {
              header: "Score",
              cell: (r) => <span className="score">{shown(r).score}</span>,
              className: "n",
            },
            {
              header: "Evidence",
              cell: (r) => (
                <Pill kind={r.standing === "verified" ? "verified" : "claimed"}>
                  {shown(r).evidence}
                </Pill>
              ),
            },
            {
              header: "Collection power",
              cell: (r) => {
                const s = shown(r);
                return (
                  <>
                    {s.totalPower}
                    {s.perPower === "–" ? null : (
                      <div
                        className="muted"
                        title="Score ÷ collection power: a normaliser, not a rank"
                      >
                        {s.perPower} per power
                      </div>
                    )}
                  </>
                );
              },
              className: "n",
            },
            {
              header: "Run",
              cell: (r) => {
                const s = shown(r);
                const facts = [s.place, s.timeLeft, s.cookiesLeft].filter(Boolean);
                return (
                  <>
                    {s.board}
                    {facts.length ? <div className="muted">{facts.join(" · ")}</div> : null}
                    {s.server ? <div className="muted">{s.server}</div> : null}
                  </>
                );
              },
              className: "run-facts",
            },
            {
              header: "Player",
              cell: (r) => (
                <>
                  {shown(r).player}
                  <div className="muted">{r.date}</div>
                </>
              ),
              className: "run-player",
            },
            {
              header: "Build",
              cell: (r) => {
                const s = shown(r);
                const order = orderOf(r);
                const extras = [r.atkOrderNote ?? "", s.perks, s.preset].filter(Boolean);
                return (
                  <>
                    {r.deckId ? (
                      <DeckLink
                        mode={mode}
                        id={r.deckId}
                        deck={deckRows?.find((d) => d.id === r.deckId)}
                      />
                    ) : null}
                    {order.length ? <AtkOrder order={order} /> : null}
                    {extras.length ? (
                      <div className="muted">
                        <Clamp lines={1}>{extras.join(" · ")}</Clamp>
                      </div>
                    ) : null}
                    {r.note ? (
                      <div className="run-note">
                        <Clamp lines={1}>{r.note}</Clamp>
                      </div>
                    ) : null}
                  </>
                );
              },
              className: "wide run-build",
            },
            {
              header: "Sources",
              cell: (r) => <SourceChips ids={r.sources} sources={sources} max={2} />,
            },
          ];
          const filter: TableFilter<DungeonRun> = {
            value: search.q ?? "",
            onChange: (q) => onSearch({ q }),
            text: (r) =>
              [
                ...Object.values(shown(r)),
                r.date,
                ...orderOf(r).flatMap((c) => [c.kr, c.en ?? ""]),
                r.atkOrderNote ?? "",
                r.note ?? "",
                ...r.sources.map(sourceLabel),
              ].join(" "),
            placeholder: "Filter by anything a run shows",
          };
          const select: TableSelect<DungeonRun> = {
            name: "Board",
            label: "Any board",
            options: Object.entries(BOARDS),
            value: search.board ?? "",
            onChange: (value) => onSearch({ board: optionalKey(value, BOARDS) }),
            test: (r, value) => r.board === value,
          };
          const selects: TableSelect<DungeonRun>[] = [
            {
              name: "Evidence",
              label: "Any evidence",
              options: Object.entries(EVIDENCE),
              value: search.evidence ?? "",
              onChange: (value) => onSearch({ evidence: optionalKey(value, EVIDENCE) }),
              test: (r, value) => r.evidence === value,
            },
          ];
          const kept = applyFilters(live, filter, select, selects);
          const groups = GROUPS.map((g) => ({
            ...g,
            rows: kept.filter((r) => r.standing === g.standing),
          })).filter((g) => g.rows.length > 0);
          const retired = groupByObsoleteDeck(
            applyFilters(retiredRuns, filter, select, selects),
            deckRows ?? [],
          );
          return (
            <>
              <TableTools filter={filter} select={select} selects={selects} />
              {groups.length ? (
                groups.map((g) => (
                  <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`}>
                    <h3 id={`${g.id}-title`}>{g.title}</h3>
                    <p className="muted dg-group-lede">{g.lede}</p>
                    <DataTable
                      columns={columns}
                      rows={g.rows}
                      rowKey={(r) => r.id}
                      layout="stack"
                    />
                  </section>
                ))
              ) : (
                <EmptyState>{live.length ? "Nothing matches." : "No current runs."}</EmptyState>
              )}
              <ObsoleteSection id="runs-obsolete" latest={retired[0]?.deck.obsoleteSince ?? null}>
                <ObsoleteDeckRows
                  groups={retired}
                  columns={columns}
                  rowKey={(r) => r.id}
                  sources={sources}
                  mode={mode}
                  deck={(id) => deckRows?.find((d) => d.id === id)}
                />
              </ObsoleteSection>
            </>
          );
        }}
      </QueryResult>
      <QueryResult query={rng} resource="RNG factors">
        {(rows) => <RunSpread rows={rows} sources={sources} />}
      </QueryResult>
    </>
  );
}
