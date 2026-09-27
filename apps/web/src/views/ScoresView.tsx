import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSourceIndex } from "../api/hooks";
import type { RankingBoardFilter } from "../api/queries";
import {
  decksQuery,
  rankingSeasonsQuery,
  rankingsQuery,
  rngFactorsQuery,
  scoresQuery,
} from "../api/queries";
import type { Ranking, Score } from "../api/types";
import type { LeaderboardConfig, ModeSection } from "../app/modes";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { ErrorBox } from "../components/ErrorBox";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { Scatter } from "../components/Scatter";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { ViewHeader } from "../components/ViewHeader";
import type { DeckSeries } from "../lib/deck-series";
import { deckSeries } from "../lib/deck-series";
import { formatG, formatRatio, ratio } from "../lib/format";
import { boardSeasons, latestCapture } from "../lib/rankings";
import { optionalInt, optionalKey, optionalText } from "../lib/search";
import type { SourceIndex } from "../lib/sources";

/** The scores view's search params: a deck for the scores, a season and board for the leaderboard. */
export interface ScoresSearch {
  deck?: string;
  season?: number;
  board?: RankingBoardFilter;
}

/**
 * Builds the search-param reader of a mode's scores view.
 * @param mode - the mode; its leaderboard's boards are the `?board=` values it keeps
 * @returns the reader: the deck, season and board, each dropped when unusable
 */
export function scoresSearchFor(mode: ModeSection) {
  return (search: Record<string, unknown>): ScoresSearch => ({
    deck: optionalText(search.deck),
    season: optionalInt(search.season),
    board: mode.leaderboard ? optionalKey(search.board, mode.leaderboard.boards) : undefined,
  });
}

/** Props for {@link ScoresView}. */
export interface ScoresViewProps {
  /** The mode whose scores, RNG factors, leaderboard and copy the view shows. */
  mode: ModeSection;
  /** The current search params. */
  search: ScoresSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: ScoresSearch) => void;
}

/** The ids of the view's sections, which its "On this page" list links to. */
const PARTS = {
  chart: "scores-chart",
  rng: "scores-rng",
  table: "scores-table",
  leaderboard: "scores-leaderboard",
} as const;

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
    { header: "Notes", cell: (s) => s.note ?? "", className: "wide" },
    { header: "Date", cell: (s) => s.date ?? "", className: "n" },
    { header: "Source", cell: (s) => <SourceChips ids={s.sources} sources={sources} /> },
  ];
}

/**
 * A mode's posted scores (scatter, RNG factor cards and a damage-ordered
 * table, narrowed by `?deck=`) and, when the mode has one, its leaderboard
 * (`?season=`, `?board=`), with an "On this page" list of those parts. A
 * failed deck list is reported; the scores then show without deck names or
 * colours.
 */
export function ScoresView({ mode, search, onSearch }: ScoresViewProps) {
  const decks = useQuery(decksQuery(mode.scope));
  const scores = useQuery(scoresQuery(mode.scope, search.deck));
  const rng = useQuery(rngFactorsQuery(mode.scope));
  const sources = useSourceIndex();
  const series = useMemo(() => deckSeries(decks.data ?? []), [decks.data]);
  const toc = [
    { id: PARTS.chart, label: "Score chart" },
    ...(rng.data?.length ? [{ id: PARTS.rng, label: "RNG factors" }] : []),
    ...(scores.data ? [{ id: PARTS.table, label: "Posted scores" }] : []),
    ...(mode.leaderboard ? [{ id: PARTS.leaderboard, label: mode.leaderboard.title }] : []),
  ];

  return (
    <>
      <ViewHeader title={mode.copy.scores?.title ?? "Scores"} lede={mode.copy.scores?.lede} />
      {decks.isError ? <ErrorBox resource="decks" error={decks.error} /> : null}
      <TocLayout items={toc}>
        <div className="tools" id={PARTS.chart}>
          <select
            aria-label="Deck"
            value={search.deck ?? ""}
            onChange={(e) => onSearch({ deck: e.target.value || undefined })}
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
              <div className="grid g3" id={PARTS.rng}>
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
          <div className="grid" role="region" aria-label="Posted scores" id={PARTS.table}>
            <DataTable
              columns={scoreColumns(series, sources)}
              rows={byDamage(scores.data)}
              rowKey={(s) => s.id}
              layout="stack"
            />
          </div>
        )}
        {mode.leaderboard ? (
          <Leaderboard
            config={mode.leaderboard}
            search={search}
            onBoard={(board) => onSearch({ board, season: undefined })}
            onSeason={(season) => onSearch({ season })}
            sources={sources}
          />
        ) : null}
      </TocLayout>
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
  config: LeaderboardConfig;
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
 * The leaderboard for one board and season, in rank order. With no
 * `?season=` it shows the board's latest captured season; a board without
 * seasons (power) shows its seasonless capture. The first of the config's
 * boards is the default.
 */
function Leaderboard({ config, search, onBoard, onSeason, sources }: LeaderboardProps) {
  const defaultBoard = Object.keys(config.boards)[0] as RankingBoardFilter;
  const board = search.board ?? defaultBoard;
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
    <div className="grid" role="region" aria-label={config.title} id={PARTS.leaderboard}>
      <ViewHeader title={config.title} lede={config.lede} />
      <div className="tools">
        <select
          aria-label="Board"
          value={board}
          onChange={(e) => onBoard(optionalKey(e.target.value, config.boards) ?? defaultBoard)}
        >
          {Object.entries(config.boards).map(([v, l]) => (
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
