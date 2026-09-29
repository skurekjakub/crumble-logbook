import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useSourceIndex } from "../api/hooks";
import { decksQuery, dungeonRunsQuery, glossaryQuery, rngFactorsQuery } from "../api/queries";
import type { DungeonRun, RngFactor } from "../api/types";
import type { DungeonConfig, ModeSection } from "../app/modes";
import { modeLink } from "../app/modes";
import { AtkOrder } from "../components/AtkOrder";
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
import { deckId } from "./DeckCard";
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
    lede: "Scores a screenshot or video shows, highest first.",
    standing: "verified",
  },
  {
    id: "runs-claimed",
    title: "Claims",
    lede: "Scores stated only in text, or posted as claims; listed by score, not ranked.",
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
    <section className="card" aria-labelledby="runs-spread-title">
      <h3 id="runs-spread-title">What moves a run</h3>
      <ul className="clean">
        {rows.map((f) => (
          <li key={f.id}>
            <b>{f.factor}.</b> {f.effect}
            {f.mitigation ? <div className="muted">What helps: {f.mitigation}</div> : null}
            <SourceChips ids={f.sources} sources={sources} />
          </li>
        ))}
      </ul>
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
    timeLeft: r.timeLeftS == null ? "–" : `${r.timeLeftS} s`,
    cookiesLeft: r.cookiesLeft == null ? "–" : String(r.cookiesLeft),
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
 * obsolete team is left out of the ranking and the filters; those runs end
 * the board in the collapsed Obsolete section, under the team's notice.
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
            { header: "Rank", cell: (r) => shown(r).rank, className: "n" },
            { header: "Score", cell: (r) => shown(r).score, className: "n" },
            {
              header: "Total power (collection)",
              cell: (r) => shown(r).totalPower,
              className: "n",
            },
            {
              header: "Score ÷ power (normaliser)",
              cell: (r) => shown(r).perPower,
              className: "n",
            },
            { header: "Time left", cell: (r) => shown(r).timeLeft, className: "n" },
            { header: "Cookies left", cell: (r) => shown(r).cookiesLeft, className: "n" },
            {
              header: "Board",
              cell: (r) => {
                const s = shown(r);
                return (
                  <>
                    {s.board}
                    {s.place ? <div>{s.place}</div> : null}
                    {s.server ? <div className="muted">{s.server}</div> : null}
                  </>
                );
              },
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
              header: "Player",
              cell: (r) => (
                <>
                  {shown(r).player}
                  <div className="muted">{r.date}</div>
                </>
              ),
            },
            {
              header: "Build",
              cell: (r) => {
                const s = shown(r);
                const order = orderOf(r);
                return (
                  <>
                    {r.deckId ? (
                      <Link {...modeLink(mode.id, "/$mode/teams")} hash={deckId({ id: r.deckId })}>
                        {s.deck}
                      </Link>
                    ) : null}
                    {order.length ? <AtkOrder order={order} /> : null}
                    {r.atkOrderNote ? <div className="muted">{r.atkOrderNote}</div> : null}
                    {s.perks ? <div className="muted">{s.perks}</div> : null}
                    {s.preset ? <div className="muted">{s.preset}</div> : null}
                  </>
                );
              },
              className: "wide run-build",
            },
            { header: "Note", cell: (r) => r.note ?? "", className: "wide" },
            { header: "Sources", cell: (r) => <SourceChips ids={r.sources} sources={sources} /> },
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
          const retired = groupByObsoleteDeck(retiredRuns, deckRows ?? []);
          return (
            <>
              <TableTools filter={filter} select={select} selects={selects} />
              {groups.length ? (
                groups.map((g) => (
                  <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`}>
                    <h3 id={`${g.id}-title`}>{g.title}</h3>
                    <p className="muted">{g.lede}</p>
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
