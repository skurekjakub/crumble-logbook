import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSourceIndex } from "../../api/hooks";
import type { RankingBoardFilter } from "../../api/queries";
import {
  decksQuery,
  rankingSeasonsQuery,
  rankingsQuery,
  rngFactorsQuery,
  scoresQuery,
} from "../../api/queries";
import type { Ranking, Score } from "../../api/types";
import type { Column } from "../../components/DataTable";
import { DataTable } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBox } from "../../components/ErrorBox";
import { Pill } from "../../components/Pill";
import { QueryResult } from "../../components/QueryResult";
import { Scatter } from "../../components/Scatter";
import { SourceChips } from "../../components/SourceChips";
import type { DeckSeries } from "../../lib/deck-series";
import { deckSeries } from "../../lib/deck-series";
import { formatG, formatRatio, ratio } from "../../lib/format";
import { boardSeasons, latestCapture } from "../../lib/rankings";
import { optionalInt, optionalKey, optionalText } from "../../lib/search";
import type { SourceIndex } from "../../lib/sources";

/** Select label per leaderboard; the keys are every board `?board=` accepts. */
const BOARD_LABELS: Record<RankingBoardFilter, string> = {
  players: "Players",
  guilds: "Guilds",
  power: "Power",
};

/** The scores page's search params: a deck for the scores, a season and board for the leaderboard. */
interface ScoresSearch {
  deck?: string;
  season?: number;
  board?: RankingBoardFilter;
}

export const Route = createFileRoute("/conquest/scores")({
  validateSearch: (search: Record<string, unknown>): ScoresSearch => ({
    deck: optionalText(search.deck),
    season: optionalInt(search.season),
    board: optionalKey(search.board, BOARD_LABELS),
  }),
  component: ScoresView,
});

/** Scores sorted by damage, highest first, without mutating the input. */
function byDamage(scores: readonly Score[]): Score[] {
  return [...scores].sort((a, b) => b.damageG - a.damageG);
}

/** The scores table's columns; deck names come from `series`. */
function scoreColumns(series: DeckSeries, sources: SourceIndex): Column<Score>[] {
  return [
    { header: "Damage", cell: (s) => formatG(s.damageG), className: "n" },
    { header: "Power", cell: (s) => formatG(s.powerG), className: "n" },
    { header: "배", cell: (s) => formatRatio(ratio(s)), className: "n" },
    { header: "Deck", cell: (s) => series.name(s.deckId) },
    {
      header: "Evidence",
      cell: (s) => (s.verified ? <Pill kind="verified">screenshot</Pill> : <Pill kind="claimed" />),
    },
    { header: "Notes", cell: (s) => s.note ?? "" },
    { header: "Date", cell: (s) => s.date ?? "", className: "n" },
    { header: "Source", cell: (s) => <SourceChips ids={s.sources} sources={sources} /> },
  ];
}

/**
 * Posted scores (scatter, RNG factor cards and a damage-ordered table,
 * narrowed by `?deck=`) and the crumb.gg leaderboard (`?season=`, `?board=`).
 */
function ScoresView() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const setSearch = (patch: ScoresSearch) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const decks = useQuery(decksQuery());
  const scores = useQuery(scoresQuery(search.deck));
  const rng = useQuery(rngFactorsQuery());
  const sources = useSourceIndex();
  const series = useMemo(() => deckSeries(decks.data ?? []), [decks.data]);

  return (
    <>
      <div>
        <h2>Scores and RNG</h2>
        <p className="lede">
          Each dot is one posted score: team power across, damage up, both on log scales. Dashed
          lines mark 배 multiples (damage ÷ power), the unit the Korean community compares runs by.
          Solid dots have a screenshot behind them; faded dots are claims in text.
        </p>
      </div>
      <div className="tools">
        <select
          aria-label="All decks"
          value={search.deck ?? ""}
          onChange={(e) => setSearch({ deck: e.target.value || undefined })}
        >
          <option value="">All decks</option>
          {decks.data?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nameEn}
            </option>
          ))}
        </select>
      </div>
      <QueryResult query={scores} resource="scores">
        {(rows) => <ScoreChart scores={rows} series={series} />}
      </QueryResult>
      <QueryResult query={rng} resource="RNG factors">
        {(factors) =>
          factors.length > 0 && (
            <div className="grid g3">
              {factors.map((r) => (
                <div key={r.id} className="card">
                  <h3>{r.factor}</h3>
                  <div>{r.effect}</div>
                  {r.mitigation && <div className="flag">{r.mitigation}</div>}
                  <SourceChips ids={r.sources} sources={sources} />
                </div>
              ))}
            </div>
          )
        }
      </QueryResult>
      {scores.data && (
        <div className="grid" role="region" aria-label="Posted scores">
          <DataTable
            columns={scoreColumns(series, sources)}
            rows={byDamage(scores.data)}
            rowKey={(s) => s.id}
          />
        </div>
      )}
      <Leaderboard
        search={search}
        onBoard={(board) => setSearch({ board, season: undefined })}
        onSeason={(season) => setSearch({ season })}
        sources={sources}
      />
    </>
  );
}

/** Props for {@link ScoreChart}. */
interface ScoreChartProps {
  scores: readonly Score[];
  series: DeckSeries;
}

/** The damage–power scatter in a card, with a legend of the decks it plots. */
function ScoreChart({ scores, series }: ScoreChartProps) {
  const plotted = scores.filter((s) => s.damageG > 0 && s.powerG != null && s.powerG > 0);
  const used = [...new Set(plotted.map((s) => s.deckId))];
  return (
    <div className="card">
      <Scatter
        points={scores}
        color={(s) => series.color(s.deckId)}
        label={(s) =>
          `${series.name(s.deckId)}${s.verified ? " · screenshot" : " · claimed"}${s.note ? ` · ${s.note}` : ""}`
        }
      />
      {used.length > 0 && (
        <div className="legend-row">
          {used.map((d) => (
            <span key={d ?? ""}>
              <i className="sw" style={{ background: series.color(d), borderRadius: "50%" }} />
              {series.name(d)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Props for {@link Leaderboard}. */
interface LeaderboardProps {
  search: ScoresSearch;
  onBoard: (board: RankingBoardFilter) => void;
  onSeason: (season: number) => void;
  sources: SourceIndex;
}

/** The leaderboard table's columns for `board`: guilds have no guild column, only players carry team power. */
function rankingColumns(board: RankingBoardFilter, sources: SourceIndex): Column<Ranking>[] {
  return [
    { header: "Rank", cell: (r) => r.rank, className: "n" },
    { header: board === "guilds" ? "Guild" : "Player", cell: (r) => r.name },
    ...(board === "guilds" ? [] : [{ header: "Guild", cell: (r: Ranking) => r.guild ?? "" }]),
    {
      header: board === "power" ? "Power" : "Damage",
      cell: (r) => formatG(r.valueG),
      className: "n",
    },
    ...(board === "players"
      ? [{ header: "Power", cell: (r: Ranking) => formatG(r.powerG), className: "n" }]
      : []),
    { header: "Source", cell: (r) => <SourceChips ids={[r.sourceId]} sources={sources} /> },
  ];
}

/**
 * The crumb.gg leaderboard for one board and season, in rank order. With no
 * `?season=` it shows the board's latest captured season; a board without
 * seasons (power) shows its seasonless capture.
 */
function Leaderboard({ search, onBoard, onSeason, sources }: LeaderboardProps) {
  const board = search.board ?? "players";
  const seasons = useQuery(rankingSeasonsQuery());
  const captured = seasons.data?.filter((s) => s.board === board) ?? [];
  const available = boardSeasons(captured, board);
  const season = search.season ?? available[0];
  const noCapture = search.season == null && seasons.isSuccess && captured.length === 0;
  const rankings = useQuery({
    ...rankingsQuery({ season, board }),
    enabled: (search.season != null || seasons.isSuccess) && !noCapture,
  });
  const seasonOptions = [...new Set([...available, ...(season == null ? [] : [season])])].sort(
    (a, b) => b - a,
  );
  const empty = <EmptyState>No crumb.gg capture for this board and season.</EmptyState>;

  let body;
  if (noCapture) body = empty;
  else if (search.season == null && seasons.isError)
    body = <ErrorBox resource="crumb.gg seasons" error={seasons.error} />;
  else
    body = (
      <QueryResult query={rankings} resource="crumb.gg rankings">
        {(rows) =>
          rows.length ? (
            <DataTable
              columns={rankingColumns(board, sources)}
              rows={latestCapture(rows)}
              rowKey={(r) => r.id}
            />
          ) : (
            empty
          )
        }
      </QueryResult>
    );

  return (
    <div className="grid" role="region" aria-label="crumb.gg leaderboard">
      <div>
        <h2>crumb.gg leaderboard</h2>
        <p className="lede">
          The crumb.gg board for one season, in rank order. The players and guilds boards rank by
          damage; the power board ranks by team power.
        </p>
      </div>
      <div className="tools">
        <select
          aria-label="Board"
          value={board}
          onChange={(e) => onBoard(optionalKey(e.target.value, BOARD_LABELS) ?? "players")}
        >
          {Object.entries(BOARD_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        {seasonOptions.length > 0 && (
          <select
            aria-label="Season"
            value={season ?? ""}
            onChange={(e) => onSeason(Number(e.target.value))}
          >
            {seasonOptions.map((s) => (
              <option key={s} value={s}>
                Season {s}
              </option>
            ))}
          </select>
        )}
      </div>
      {body}
    </div>
  );
}
