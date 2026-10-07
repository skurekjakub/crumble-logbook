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
import { Clamp } from "../components/Clamp";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { ErrorBox } from "../components/ErrorBox";
import { ObsoleteNotice } from "../components/ObsoleteNotice";
import { ObsoleteSection } from "../components/ObsoleteSection";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { Scatter } from "../components/Scatter";
import { SourceChips } from "../components/SourceChips";
import { TocLayout } from "../components/TocLayout";
import { ViewHeader } from "../components/ViewHeader";
import type { DeckSeries } from "../lib/deck-series";
import { deckSeries } from "../lib/deck-series";
import { formatG, formatRatio, ratio } from "../lib/format";
import { groupByObsoleteDeck, isCurrent, splitByDeck } from "../lib/obsolete";
import { boardSeasons, latestCapture } from "../lib/rankings";
import { optionalInt, optionalKey, optionalText } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import { DeckLink } from "./DeckLink";
import { ModeViewHeader } from "./ModeViewHeader";
import { ObsoleteDeckRows } from "./ObsoleteDeckRows";

/** The scores view's search params: a deck for the scores, a season and board for the leaderboard. */
export interface ScoresSearch {
  deck?: string;
  season?: number;
  board?: RankingBoardFilter;
}

/**
 * Builds the search-param reader of a mode's scores view.
 *
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
  top: "scores-top",
  chart: "scores-chart",
  rng: "scores-rng",
  table: "scores-table",
  obsolete: "scores-obsolete",
  leaderboard: "scores-leaderboard",
} as const;

/**
 * Sorts scores by damage, highest first, without mutating the input.
 *
 * @param scores - the scores
 * @returns a sorted copy
 */
function byDamage(scores: readonly Score[]): Score[] {
  return [...scores].sort((a, b) => b.damageG - a.damageG);
}

/**
 * A score's evidence as a pill: "screenshot" for a verified score, "claimed" for a text claim.
 *
 * @param props - the score
 * @returns the pill
 */
function EvidencePill({ score }: { score: Pick<Score, "verified"> }) {
  return score.verified ? <Pill kind="verified">screenshot</Pill> : <Pill kind="claimed" />;
}

/**
 * Builds the scores table's columns: the rank by damage first, then the
 * damage, deck, evidence, power and 배 (a normaliser, never the rank), the
 * note cut to one line, the date and the sources.
 *
 * @param rows - the ranking's rows, highest damage first, a row's rank being its place in
 *   them; null for rows outside the ranking (an obsolete deck's), which get no rank column
 * @param series - names each score's deck
 * @param sources - the source index for the chips
 * @returns the columns, in display order
 */
function scoreColumns(
  rows: readonly Score[] | null,
  series: DeckSeries,
  sources: SourceIndex,
): Column<Score>[] {
  const rank = new Map(rows?.map((s, i) => [s.id, i + 1] as const));
  return [
    ...(rows
      ? [
          {
            header: "#",
            cell: (s: Score) => rank.get(s.id) ?? "",
            className: "n rank",
          },
        ]
      : []),
    {
      header: "Damage",
      cell: (s) => <b>{formatG(s.damageG)}</b>,
      className: "n",
    },
    {
      header: "Deck",
      cell: (s) => series.name(s.deckId),
    },
    {
      header: "Evidence",
      cell: (s) => <EvidencePill score={s} />,
    },
    {
      header: "Power",
      cell: (s) => formatG(s.powerG),
      className: "n",
    },
    {
      header: "배",
      cell: (s) => formatRatio(ratio(s)),
      className: "n muted",
    },
    {
      header: "Notes",
      cell: (s) =>
        s.note ? (
          <Clamp lines={1} perLine={45}>
            {s.note}
          </Clamp>
        ) : (
          ""
        ),
      className: "wide",
    },
    {
      header: "Date",
      cell: (s) => s.date ?? "",
      className: "n",
    },
    {
      header: "Source",
      cell: (s) => <SourceChips ids={s.sources} sources={sources} max={2} />,
    },
  ];
}

/**
 * The best run by damage, set apart above the chart: its damage large, its
 * power, 배 and deck, its evidence pill, its note cut to one line, and its
 * sources at the end. Nothing when there are no scores.
 *
 * @param props - the ranked scores, highest damage first, the deck series and the source index
 * @returns the card, or null
 */
function TopRun({
  scores,
  series,
  sources,
}: {
  scores: readonly Score[];
  series: DeckSeries;
  sources: SourceIndex;
}) {
  const top = scores[0];
  if (!top) return null;
  const r = ratio(top);
  return (
    <section className="card top-run" aria-labelledby={PARTS.top}>
      <span className="top-rank" aria-hidden="true">
        #1
      </span>
      <div className="top-main">
        <h3 id={PARTS.top}>Best run</h3>
        <div className="top-figure">
          <span className="top-dmg">{formatG(top.damageG)}</span>
          <EvidencePill score={top} />
        </div>
        <div className="top-meta">
          <span>{top.powerG != null ? `at ${formatG(top.powerG)} power` : "power not shown"}</span>
          {r != null ? <span>{r}배</span> : null}
          <span>{series.name(top.deckId)}</span>
          {top.date ? <span>{top.date}</span> : null}
        </div>
        {top.note ? (
          <div className="muted">
            <Clamp lines={1}>{top.note}</Clamp>
          </div>
        ) : null}
      </div>
      <SourceChips ids={top.sources} sources={sources} max={2} />
    </section>
  );
}

/**
 * A mode's posted scores (the best run by damage set apart, the scatter, a
 * damage-ranked table and the RNG factor cards, narrowed by `?deck=`) and,
 * when the mode has one, its leaderboard
 * (`?season=`, `?board=`), with an "On this page" list of those parts. A
 * failed deck list is reported; the scores then show without deck names or
 * colours. The chart and the damage-ordered table hold the scores of
 * current decks and of none; an obsolete deck's scores end the ranking in
 * the collapsed Obsolete section, under the deck's notice. The picker
 * marks obsolete decks, and picking one shows its scores in the chart and
 * the table under its notice.
 *
 * @param props - the mode, the search params and their setter
 * @returns the scores view
 */
export function ScoresView({ mode, search, onSearch }: ScoresViewProps) {
  const decks = useQuery(decksQuery(mode.scope));
  const scores = useQuery(scoresQuery(mode.scope, search.deck));
  const rng = useQuery(rngFactorsQuery(mode.scope));
  const sources = useSourceIndex();
  const series = useMemo(() => deckSeries(decks.data ?? []), [decks.data]);
  const allDecks = decks.data ?? [];
  /**
   * Finds a deck of the mode.
   *
   * @param id - the deck's id
   * @returns the deck, or `undefined` when it isn't listed
   */
  const deckOf = (id: string) => allDecks.find((d) => d.id === id);
  const picked = search.deck === undefined ? undefined : deckOf(search.deck);
  const pickedObsolete = picked !== undefined && !isCurrent(picked);
  /**
   * The scores the chart and the table rank: every listed score when the
   * picked deck is obsolete, else the scores of current decks and of none.
   *
   * @param rows - the listed scores
   * @returns the ranked scores
   */
  const ranked = (rows: readonly Score[]) =>
    pickedObsolete ? [...rows] : splitByDeck(rows, allDecks).current;
  const retired =
    scores.data && !pickedObsolete
      ? groupByObsoleteDeck(scores.data, allDecks).map((g) => ({ ...g, rows: byDamage(g.rows) }))
      : [];
  const table = scores.data ? byDamage(ranked(scores.data)) : [];
  const toc = [
    { id: PARTS.chart, label: "Score chart" },
    ...(scores.data ? [{ id: PARTS.table, label: "Posted scores" }] : []),
    ...(rng.data?.length ? [{ id: PARTS.rng, label: "RNG factors" }] : []),
    ...(retired.length ? [{ id: PARTS.obsolete, label: "Obsolete" }] : []),
    ...(mode.leaderboard ? [{ id: PARTS.leaderboard, label: mode.leaderboard.title }] : []),
  ];

  return (
    <>
      <ModeViewHeader mode={mode} view="scores" fallbackTitle="Scores" />
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
                {isCurrent(d) ? d.nameEn : `${d.nameEn} (obsolete)`}
              </option>
            ))}
          </select>
        </div>
        {pickedObsolete && picked.obsoleteSince ? (
          <ObsoleteNotice
            subject={picked.nameEn}
            since={picked.obsoleteSince}
            reason={picked.obsoleteReason}
            sources={picked.obsoleteSources}
            sourceIndex={sources}
            superseded={
              picked.supersededBy ? (
                <DeckLink mode={mode} id={picked.supersededBy} deck={deckOf(picked.supersededBy)} />
              ) : null
            }
          />
        ) : null}
        <QueryResult query={scores} resource="scores">
          {(rows) => (
            <>
              <TopRun scores={byDamage(ranked(rows))} series={series} sources={sources} />
              <ScoreChart scores={ranked(rows)} series={series} />
            </>
          )}
        </QueryResult>
        {scores.data && (
          <div className="grid ranked" role="region" aria-label="Posted scores" id={PARTS.table}>
            <DataTable
              columns={scoreColumns(table, series, sources)}
              rows={table}
              rowKey={(s) => s.id}
              layout="stack"
            />
          </div>
        )}
        <QueryResult query={rng} resource="RNG factors">
          {(factors) =>
            factors.length > 0 && (
              <div className="grid g3" id={PARTS.rng}>
                {factors.map((r) => (
                  <div key={r.id} className="card rng-card">
                    <h3>{r.factor}</h3>
                    <div className="rng-effect">
                      <Clamp lines={2}>{r.effect}</Clamp>
                    </div>
                    {r.mitigation && (
                      <div className="flag">
                        <Clamp lines={1}>{r.mitigation}</Clamp>
                      </div>
                    )}
                    <div className="card-foot">
                      <SourceChips ids={r.sources} sources={sources} max={2} />
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </QueryResult>
        <ObsoleteSection id={PARTS.obsolete} latest={retired[0]?.deck.obsoleteSince ?? null}>
          <ObsoleteDeckRows
            groups={retired}
            columns={scoreColumns(null, series, sources)}
            rowKey={(s) => s.id}
            sources={sources}
            mode={mode}
            deck={deckOf}
          />
        </ObsoleteSection>
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

/**
 * The damage–power scatter in a card, with a legend of the decks it plots.
 *
 * @param props - the scores and the deck series
 * @returns the card
 */
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
  /** Switches the leaderboard to `board`. */
  onBoard: (board: RankingBoardFilter) => void;
  /** Switches the leaderboard to `season`. */
  onSeason: (season: number) => void;
  sources: SourceIndex;
}

/**
 * Builds the leaderboard table's columns for `board`: guilds have no guild column, only players carry team power.
 *
 * @param board - the leaderboard board
 * @param sources - the source index for the chips
 * @returns the columns, in display order
 */
function rankingColumns(board: RankingBoardFilter, sources: SourceIndex): Column<Ranking>[] {
  return [
    {
      header: "Rank",
      cell: (r) => r.rank,
      className: "n rank",
    },
    {
      header: board === "guilds" ? "Guild" : "Player",
      cell: (r) => r.name,
    },
    ...(board === "guilds"
      ? []
      : [
          {
            header: "Guild",
            cell: (r: Ranking) => r.guild ?? "",
          },
        ]),
    {
      header: board === "power" ? "Power" : "Damage",
      cell: (r) => formatG(r.valueG),
      className: "n",
    },
    ...(board === "players"
      ? [
          {
            header: "Power",
            cell: (r: Ranking) => formatG(r.powerG),
            className: "n",
          },
        ]
      : []),
    {
      header: "Source",
      cell: (r) => <SourceChips ids={[r.sourceId]} sources={sources} />,
    },
  ];
}

/**
 * The leaderboard for one board and season, in rank order. With no
 * `?season=` it shows the board's latest captured season; a board without
 * seasons (power) shows its seasonless capture. The first of the config's
 * boards is the default.
 *
 * @param props - the leaderboard config, the search params, the board and season setters, and the source index
 * @returns the leaderboard section
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
    <div className="grid ranked" role="region" aria-label={config.title} id={PARTS.leaderboard}>
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
