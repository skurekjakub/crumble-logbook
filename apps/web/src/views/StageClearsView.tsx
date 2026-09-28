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
import { CookieName } from "../components/CookieName";
import type { Column, TableFilter, TableSelect } from "../components/DataTable";
import { applyFilters, DataTable, TableTools } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { optionalKey, optionalText } from "../lib/search";
import { formatPower } from "../lib/stage";
import { CopyHeader } from "./ModeViewHeader";

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
  /** What its rows are. */
  lede: string;
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
    lede: "Clears the record accepts, furthest stage first and, at one stage, lowest power first.",
    test: (c) => c.standing === "accepted" && c.result === "clear",
  },
  {
    id: "clears-failed",
    title: "Failures",
    lede: "Attempts the record accepts that didn't clear.",
    test: (c) => c.standing === "accepted" && c.result === "fail",
  },
  {
    id: "clears-unverified",
    title: "Unverified claims",
    lede: "Claimed without a screenshot; the record neither rests on them nor rejects them.",
    test: (c) => c.standing === "unverified",
  },
  {
    id: "clears-rejected",
    title: "Rejected claims",
    lede: "Claims the record argues against.",
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
 * furthest stage first and, at one stage, lowest power first; then, each
 * under its own heading, the failures, the unverified claims and the
 * rejected ones. Every row shows the stage and boss, era, team power as
 * posted (with the stage's recommended power when known), bracket,
 * result, how it was played, what backs it, the deck, a note and sources.
 * A boss is named in English as its row names it, else as the stage
 * tables do, else as the glossary does. The result, era and a text filter
 * live in the URL and apply to every group; the text filter matches the
 * names a row shows (stage, boss in Korean and English, deck), its team
 * power and its note.
 *
 * @param props - the stage mode, its stage config, the search params and their setter
 * @returns the clears view
 */
export function StageClearsView({ mode, stage, search, onSearch }: StageClearsViewProps) {
  const sources = useSourceIndex();
  const clears = useQuery(stageClearsQuery());
  const decks = useQuery({
    ...decksQuery(mode.scope),
    select: (list) => new Map(list.map((d) => [d.id, d.nameEn] as const)),
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
   * The deck name a row shows.
   *
   * @param c - the attempt
   * @returns the deck's English name (its id before the decks load), or null without a deck
   */
  const deckOf = (c: StageClear) => (c.deckId ? (decks?.get(c.deckId) ?? c.deckId) : null);
  const columns: Column<StageClear>[] = [
    { header: "Stage", cell: (c) => `${c.chapter}-${c.stageNo}`, className: "n" },
    { header: "Boss", cell: (c) => <CookieName kr={c.bossKr} en={bossEnOf(c)} /> },
    { header: "Era", cell: (c) => ERAS[c.era] },
    {
      header: "Team power",
      cell: (c) => (
        <>
          {c.teamPower}
          {c.recommendedPower ? (
            <div className="muted">of {formatPower(c.recommendedPower)} recommended</div>
          ) : null}
        </>
      ),
    },
    { header: "Bracket", cell: (c) => `${c.bracket}%`, className: "n" },
    {
      header: "Result",
      cell: (c) => <span className={`result ${c.result}`}>{RESULTS[c.result]}</span>,
    },
    { header: "Play", cell: (c) => c.play ?? "?" },
    {
      header: "Evidence",
      cell: (c) => (
        <Pill kind={c.evidence === "screenshot" ? "verified" : "claimed"}>{c.evidence}</Pill>
      ),
    },
    { header: "Deck", cell: (c) => deckOf(c) ?? "–" },
    { header: "Note", cell: (c) => c.note ?? "", className: "wide" },
    { header: "Sources", cell: (c) => <SourceChips ids={c.sources} sources={sources} /> },
  ];
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
          const kept = applyFilters(rows, filter, select, selects);
          const groups = GROUPS.map((g) => ({ ...g, rows: kept.filter((c) => g.test(c)) })).filter(
            (g) => g.rows.length > 0,
          );
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
