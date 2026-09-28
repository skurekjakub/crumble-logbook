import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useSourceIndex } from "../api/hooks";
import { decksQuery, dungeonRunsQuery, rngFactorsQuery } from "../api/queries";
import type { DungeonRun, RngFactor } from "../api/types";
import type { DungeonConfig, ModeSection } from "../app/modes";
import { modeLink } from "../app/modes";
import type { Column, TableFilter, TableSelect } from "../components/DataTable";
import { applyFilters, DataTable, TableTools } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { formatDungeonG, ordinal, scorePerPower } from "../lib/dungeon";
import { optionalKey, optionalText } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import { deckId } from "./DeckCard";
import { CopyHeader } from "./ModeViewHeader";

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
    title: "Text-only claims",
    lede: "Scores stated without a screen; listed by score, not ranked.",
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

/**
 * The documented Crumble Dungeon scores: the runs a screenshot or video
 * shows, ranked by score, then, under their own heading, the scores text
 * alone claims. Every row shows its rank (ranked runs only, among all of
 * them), the score, the collection's total power, score ÷ total power as
 * a normaliser, time and cookies left, the board it was shown on with the
 * server and its place there, the evidence, the player and date, the
 * build (the deck, linking to its Teams card, the ATK order, perks and
 * preset), a note and sources. The board, evidence and a text filter
 * live in the URL and apply to both groups; the text filter matches the
 * player, server, deck, build and note. The mode's RNG factors follow.
 *
 * @param props - the mode, its dungeon config, the search params and their setter
 * @returns the runs board
 */
export function DungeonRunsView({ mode, dungeon, search, onSearch }: DungeonRunsViewProps) {
  const sources = useSourceIndex();
  const runs = useQuery(dungeonRunsQuery());
  const rng = useQuery(rngFactorsQuery(mode.scope));
  const decks = useQuery({
    ...decksQuery(mode.scope),
    select: (list) => new Map(list.map((d) => [d.id, d.nameEn] as const)),
  }).data;
  /**
   * The deck name a row shows.
   *
   * @param r - the run
   * @returns the deck's English name (its id before the decks load), or null without a deck
   */
  const deckOf = (r: DungeonRun) => (r.deckId ? (decks?.get(r.deckId) ?? r.deckId) : null);

  return (
    <>
      <CopyHeader scope={mode.scope} copy={dungeon.runs} fallbackTitle="Runs" />
      <QueryResult query={runs} resource="dungeon runs">
        {(rows) => {
          if (!rows.length) return <EmptyState>No runs recorded yet.</EmptyState>;
          const rank = new Map(
            rows.filter((r) => r.standing === "verified").map((r, i) => [r.id, i + 1] as const),
          );
          const columns: Column<DungeonRun>[] = [
            { header: "Rank", cell: (r) => rank.get(r.id) ?? "–", className: "n" },
            { header: "Score", cell: (r) => formatDungeonG(r.scoreG), className: "n" },
            {
              header: "Total power (collection)",
              cell: (r) => formatDungeonG(r.totalPowerG),
              className: "n",
            },
            {
              header: "Score ÷ power (normaliser)",
              cell: (r) => {
                const x = scorePerPower(r.scoreG, r.totalPowerG);
                return x == null ? "–" : `${x}×`;
              },
              className: "n",
            },
            {
              header: "Time left",
              cell: (r) => (r.timeLeftS == null ? "–" : `${r.timeLeftS} s`),
              className: "n",
            },
            {
              header: "Cookies left",
              cell: (r) => (r.cookiesLeft == null ? "–" : r.cookiesLeft),
              className: "n",
            },
            {
              header: "Board",
              cell: (r) => (
                <>
                  {BOARDS[r.board]}
                  {r.serverRank != null ? <div>{ordinal(r.serverRank)} on the server</div> : null}
                  {r.server ? <div className="muted">Server: {r.server}</div> : null}
                </>
              ),
            },
            {
              header: "Evidence",
              cell: (r) => (
                <Pill kind={r.standing === "verified" ? "verified" : "claimed"}>
                  {EVIDENCE[r.evidence]}
                </Pill>
              ),
            },
            {
              header: "Player",
              cell: (r) => (
                <>
                  {r.player ?? "anonymous"}
                  <div className="muted">{r.date}</div>
                </>
              ),
            },
            {
              header: "Build",
              cell: (r) => (
                <>
                  {r.deckId ? (
                    <Link {...modeLink(mode.id, "/$mode/teams")} hash={deckId({ id: r.deckId })}>
                      {deckOf(r)}
                    </Link>
                  ) : null}
                  {r.atkOrder ? <div>ATK order: {r.atkOrder}</div> : null}
                  {r.perks ? <div className="muted">Perks: {r.perks}</div> : null}
                  {r.preset ? <div className="muted">Preset: {r.preset}</div> : null}
                </>
              ),
              className: "wide",
            },
            { header: "Note", cell: (r) => r.note ?? "", className: "wide" },
            { header: "Sources", cell: (r) => <SourceChips ids={r.sources} sources={sources} /> },
          ];
          const filter: TableFilter<DungeonRun> = {
            value: search.q ?? "",
            onChange: (q) => onSearch({ q }),
            text: (r) =>
              [
                r.player ?? "",
                r.server ?? "",
                deckOf(r) ?? "",
                r.atkOrder ?? "",
                r.perks ?? "",
                r.preset ?? "",
                r.note ?? "",
              ].join(" "),
            placeholder: "Filter by player, server, deck, build or note",
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
          const kept = applyFilters(rows, filter, select, selects);
          const groups = GROUPS.map((g) => ({
            ...g,
            rows: kept.filter((r) => r.standing === g.standing),
          })).filter((g) => g.rows.length > 0);
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
                <EmptyState>Nothing matches.</EmptyState>
              )}
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
