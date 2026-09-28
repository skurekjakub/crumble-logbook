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
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
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
 * The documented stage clears and failures, furthest stage first and, at
 * one stage, lowest power first: stage and boss, era, team power as posted
 * (with the stage's recommended power when known), bracket, result, how it
 * was played, what backs it, the deck, a note and sources. A boss is
 * named in English as the stage tables name it, else as the glossary does.
 * The result, era and a text filter live in the URL.
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
  const columns: Column<StageClear>[] = [
    { header: "Stage", cell: (c) => `${c.chapter}-${c.stageNo}`, className: "n" },
    {
      header: "Boss",
      cell: (c) => <CookieName kr={c.bossKr} en={bossNames.get(c.bossKr) ?? c.en} />,
    },
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
    { header: "Deck", cell: (c) => (c.deckId ? (decks?.get(c.deckId) ?? c.deckId) : "–") },
    { header: "Note", cell: (c) => c.note ?? "", className: "wide" },
    { header: "Sources", cell: (c) => <SourceChips ids={c.sources} sources={sources} /> },
  ];
  return (
    <>
      <CopyHeader scope={mode.scope} copy={stage.clears} fallbackTitle="Clears" />
      <QueryResult query={clears} resource="stage clears">
        {(rows) => (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(c) => c.id}
            layout="stack"
            empty="No clears recorded yet."
            filter={{
              value: search.q ?? "",
              onChange: (q) => onSearch({ q }),
              text: (c) =>
                [`${c.chapter}-${c.stageNo}`, c.bossKr, c.en ?? "", c.teamPower, c.note ?? ""].join(
                  " ",
                ),
              placeholder: "Filter by stage, boss or note",
            }}
            select={{
              name: "Result",
              label: "Any result",
              options: Object.entries(RESULTS),
              value: search.result ?? "",
              onChange: (value) => onSearch({ result: optionalKey(value, RESULTS) }),
              test: (c, value) => c.result === value,
            }}
            selects={[
              {
                name: "Era",
                label: "Either era",
                options: Object.entries(ERAS),
                value: search.era ?? "",
                onChange: (value) => onSearch({ era: optionalKey(value, ERAS) }),
                test: (c, value) => c.era === value,
              },
            ]}
          />
        )}
      </QueryResult>
    </>
  );
}
