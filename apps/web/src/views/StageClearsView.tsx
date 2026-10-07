import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import {
  decksQuery,
  stageChaptersQuery,
  stageClearsQuery,
  stageZoneSlotsQuery,
} from "../api/queries";
import type { StageClear } from "../api/types";
import type { ModeSection, StageConfig } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { CookieName } from "../components/CookieName";
import type { Column, TableFilter, TableSelect } from "../components/DataTable";
import { applyFilters, DataTable, TableTools } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { optionalKey, optionalText } from "../lib/search";
import { CopyHeader } from "./ModeViewHeader";
import { BracketTag, EvidencePill, PowerCell, Rank, ResultPill, ShortDeckLink } from "./StageParts";

/** Select labels per result. */
const RESULTS: Readonly<Record<StageClear["result"], string>> = {
  clear: "Cleared",
  fail: "Failed",
};

/** Select labels per era. */
const ERAS: Readonly<Record<StageClear["era"], string>> = {
  "post-easing": "After the easing",
  "pre-easing": "Before the easing",
};

/** One heading the attempts are shown under. */
interface ClearGroup {
  /** The section's DOM id. */
  id: string;
  /** Its heading. */
  title: string;
  /** What its rows are, in a line; none when the view's own explainer says it. */
  lede: string | null;
  /** Whether its rows are a ranking, numbered from #1. */
  ranked: boolean;
  /**
   * Tells whether an attempt belongs under the heading.
   *
   * @param c - the attempt
   * @returns `true` if it does
   */
  test(c: StageClear): boolean;
}

/**
 * The groups the attempts are shown in, in order: each takes the rows its
 * `test` keeps, in the API's order. Only the first is a ranking.
 */
const GROUPS: readonly ClearGroup[] = [
  {
    id: "clears-ranked",
    title: "Ranked clears",
    lede: null,
    ranked: true,
    test: (c) => c.standing === "accepted" && c.result === "clear",
  },
  {
    id: "clears-failed",
    title: "Failures",
    lede: "Accepted attempts that didn't clear.",
    ranked: false,
    test: (c) => c.standing === "accepted" && c.result === "fail",
  },
  {
    id: "clears-unverified",
    title: "Unverified claims",
    lede: "No screenshot: neither relied on nor rejected.",
    ranked: false,
    test: (c) => c.standing === "unverified",
  },
  {
    id: "clears-rejected",
    title: "Rejected claims",
    lede: "Claims the record argues against.",
    ranked: false,
    test: (c) => c.standing === "rejected",
  },
];

/** The clears view's search params: a result, an era and a text filter. */
export interface ClearsSearch {
  result?: StageClear["result"];
  era?: StageClear["era"];
  q?: string;
}

/**
 * Reads the clears view's search params.
 *
 * @param search - the decoded query values
 * @returns the result, era and text filter, each dropped when unusable
 */
export function validateClearsSearch(search: Record<string, unknown>): ClearsSearch {
  return {
    result: optionalKey(search.result, RESULTS),
    era: optionalKey(search.era, ERAS),
    q: optionalText(search.q),
  };
}

/** Props for {@link StageClearsView}. */
export interface StageClearsViewProps {
  /** The stage mode. */
  mode: ModeSection;
  /** Its stage screens' config. */
  stage: StageConfig;
  /** The current search params. */
  search: ClearsSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: ClearsSearch) => void;
}

/**
 * The documented stage attempts: the clears the record accepts, ranked
 * furthest stage first and, at one stage, lowest power first, each with its
 * place (#1 marked); then, each under its own heading, the failures, the
 * unverified claims and the rejected ones. A row reads verdict first: the
 * stage (flagged when it was played before the easing), the boss with its
 * portrait, the team power short (as posted in the tooltip, the stage's
 * recommended power under it), the bracket as a tinted tag, the result and
 * what backs it as pills (how it was played under the result), the deck by
 * its short name (marked when obsolete; an attempt on an obsolete deck keeps
 * its place, since it is a dated measurement), the note cut to a line and
 * the sources last. A boss is named in English as its row names it, else as
 * the stage tables do, else as the glossary does. The result, era and a
 * text filter live in the URL and apply to every group; the text filter
 * matches the names a row shows (stage, boss in Korean and English, deck),
 * its team power and its note.
 *
 * @param props - the stage mode, its stage config, the search params and their setter
 * @returns the clears view
 */
export function StageClearsView({ mode, stage, search, onSearch }: StageClearsViewProps) {
  const sources = useSourceIndex();
  const clears = useQuery(stageClearsQuery());
  const decks = useQuery({
    ...decksQuery(mode.scope),
    select: (list) => new Map(list.map((d) => [d.id, d] as const)),
  }).data;
  const chapters = useQuery(stageChaptersQuery()).data ?? [];
  const slots = useQuery(stageZoneSlotsQuery()).data ?? [];
  const bossNames = new Map(
    [...chapters, ...slots].flatMap((b) => (b.bossEn ? [[b.bossKr, b.bossEn] as const] : [])),
  );
  /**
   * The English a row shows for its boss: the row's own, else the stage
   * tables', else the glossary's.
   *
   * @param c - the attempt
   * @returns the English name, or null when none is known
   */
  const bossEnOf = (c: StageClear) => c.bossEn ?? bossNames.get(c.bossKr) ?? c.en;
  /**
   * The deck name a row's filter matches.
   *
   * @param c - the attempt
   * @returns the deck's English name (its id before the decks load), or null without a deck
   */
  const deckOf = (c: StageClear) => (c.deckId ? (decks?.get(c.deckId)?.nameEn ?? c.deckId) : null);
  /**
   * A group's columns: its place first when the group is a ranking.
   *
   * @param rankOf - each ranked clear's place, by id
   * @param ranked - whether the group is the ranking
   * @returns the columns
   */
  const columnsFor = (rankOf: ReadonlyMap<number, number>, ranked: boolean) => {
    const columns: Column<StageClear>[] = [
      {
        header: "Stage",
        cell: (c) => (
          <span className="stage-at">
            <b>
              {c.chapter}-{c.stageNo}
            </b>
            {c.era === "pre-easing" ? (
              <span className="era" title="Played before the 2026-09-23 easing">
                pre-easing
              </span>
            ) : null}
          </span>
        ),
        className: "n",
      },
      { header: "Boss", cell: (c) => <CookieName kr={c.bossKr} en={bossEnOf(c)} /> },
      {
        header: "Team power",
        cell: (c) => (
          <PowerCell posted={c.teamPower} powerG={c.powerG} recommended={c.recommendedPower} />
        ),
        className: "n",
      },
      { header: "Bracket", cell: (c) => <BracketTag pct={c.bracket} /> },
      {
        header: "Result",
        cell: (c) => (
          <span className="st-verdict">
            <ResultPill result={c.result} />
            <EvidencePill evidence={c.evidence} />
            {c.play ? <span className="play">{c.play}</span> : null}
          </span>
        ),
      },
      {
        header: "Deck",
        cell: (c) =>
          c.deckId ? <ShortDeckLink mode={mode} id={c.deckId} deck={decks?.get(c.deckId)} /> : "–",
        className: "deck",
      },
      {
        header: "Note",
        cell: (c) =>
          c.note ? (
            <Clamp lines={2} perLine={50}>
              {c.note}
            </Clamp>
          ) : null,
        className: "wide clear-note",
      },
      {
        header: "Sources",
        cell: (c) => <SourceChips ids={c.sources} sources={sources} max={1} />,
        className: "src",
      },
    ];
    return ranked
      ? [
          { header: "#", cell: (c: StageClear) => <Rank n={rankOf.get(c.id) ?? null} /> },
          ...columns,
        ]
      : columns;
  };
  const filter: TableFilter<StageClear> = {
    value: search.q ?? "",
    onChange: (q) => onSearch({ q }),
    text: (c) =>
      [
        `${c.chapter}-${c.stageNo}`,
        c.bossKr,
        bossEnOf(c) ?? "",
        c.teamPower,
        deckOf(c) ?? "",
        c.note ?? "",
      ].join(" "),
    placeholder: "Filter by stage, boss, deck or note",
  };
  const select: TableSelect<StageClear> = {
    name: "Result",
    label: "Any result",
    options: Object.entries(RESULTS),
    value: search.result ?? "",
    onChange: (value) => onSearch({ result: optionalKey(value, RESULTS) }),
    test: (c, value) => c.result === value,
  };
  const selects: TableSelect<StageClear>[] = [
    {
      name: "Era",
      label: "Either era",
      options: Object.entries(ERAS),
      value: search.era ?? "",
      onChange: (value) => onSearch({ era: optionalKey(value, ERAS) }),
      test: (c, value) => c.era === value,
    },
  ];
  return (
    <>
      <CopyHeader scope={mode.scope} copy={stage.clears} fallbackTitle="Clears" />
      <QueryResult query={clears} resource="stage clears">
        {(rows) => {
          if (!rows.length) return <EmptyState>No clears recorded yet.</EmptyState>;
          // Places come from the whole ranking, so a filtered row keeps its number.
          const rankOf = new Map(
            rows.filter((c) => GROUPS[0]!.test(c)).map((c, i) => [c.id, i + 1] as const),
          );
          const kept = applyFilters(rows, filter, select, selects);
          const groups = GROUPS.map((g) => ({ ...g, rows: kept.filter((c) => g.test(c)) })).filter(
            (g) => g.rows.length > 0,
          );
          return (
            <>
              <TableTools filter={filter} select={select} selects={selects} />
              {groups.length ? (
                groups.map((g) => (
                  <section
                    key={g.id}
                    id={g.id}
                    className={g.ranked ? "clears ranked" : "clears"}
                    aria-labelledby={`${g.id}-title`}
                  >
                    <h3 id={`${g.id}-title`}>{g.title}</h3>
                    {g.lede ? <p className="st-group-lede">{g.lede}</p> : null}
                    <DataTable
                      columns={columnsFor(rankOf, g.ranked)}
                      rows={g.rows}
                      rowKey={(c) => c.id}
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
    </>
  );
}
