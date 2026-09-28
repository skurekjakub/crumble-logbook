import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { powerBracketsQuery, stageChaptersQuery } from "../api/queries";
import type { PowerBracket, StageChapter } from "../api/types";
import type { ModeSection, StageConfig } from "../app/modes";
import { CookieName } from "../components/CookieName";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { PowerField } from "../components/PowerField";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { optionalText } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import { citedBy } from "../lib/sources";
import {
  bracketAt,
  entryPower,
  formatPower,
  furthest,
  nextBracket,
  parsePower,
} from "../lib/stage";
import { ViewHeader } from "../components/ViewHeader";
import { TopicNotes } from "./ModeViewHeader";

/** The stage calculators' search params: the team power as typed. */
export interface PowerSearch {
  power?: string;
}

/**
 * Reads the stage calculators' search params.
 *
 * @param search - the decoded query values
 * @returns the typed power, when there is one
 */
export function validatePowerSearch(search: Record<string, unknown>): PowerSearch {
  return { power: optionalText(search.power) };
}

/** Props for {@link StageBracketsView}. */
export interface StageBracketsViewProps {
  /** The stage mode. */
  mode: ModeSection;
  /** Its stage screens' config. */
  stage: StageConfig;
  /** The current search params. */
  search: PowerSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: PowerSearch) => void;
}

/**
 * The power gate as a table: from what share of recommended power each
 * bracket starts, how much damage it keeps, the game's label and sources.
 *
 * @param props - the brackets and the source index
 * @returns the card
 */
function BracketTable({
  brackets,
  sources,
}: {
  brackets: readonly PowerBracket[];
  sources: SourceIndex;
}) {
  const columns: Column<PowerBracket>[] = [
    {
      header: "Team power vs recommended",
      cell: (b) => `${b.minRatioPct}% or more`,
      className: "n",
    },
    { header: "Damage kept", cell: (b) => `${b.damagePct}%`, className: "n" },
    { header: "In game", cell: (b) => <span className="kr">{b.label}</span> },
    { header: "Sources", cell: (b) => <SourceChips ids={b.sources} sources={sources} /> },
  ];
  return (
    <section className="card">
      <h3>The power gate</h3>
      <DataTable
        columns={columns}
        rows={[...brackets].sort((a, b) => a.minRatioPct - b.minRatioPct)}
        rowKey={(b) => b.id}
        empty="No power brackets recorded yet."
      />
    </section>
  );
}

/**
 * How far the reader pushes at each reported share: the furthest chapter
 * whose last stage they enter at that bracket or better.
 *
 * @param props - the chapters, the brackets, the reader's power and the shares to report
 * @returns the card
 */
function Reach({
  chapters,
  brackets,
  power,
  shares,
}: {
  chapters: readonly StageChapter[];
  brackets: readonly PowerBracket[];
  power: number;
  shares: readonly number[];
}) {
  const last = chapters.at(-1);
  return (
    <section className="card reach" aria-label="How far you push">
      <h3>At {formatPower(power)}</h3>
      <ul className="clean">
        {shares.flatMap((share) => {
          const bracket = brackets.find((b) => b.damagePct === share);
          if (!bracket) return [];
          const reached = furthest(chapters, (c) => c.recommendedPower, power, bracket.minRatioPct);
          return [
            <li key={share}>
              <b>{share}% of damage or more</b>:{" "}
              {!reached
                ? `not yet at ${chapters[0]?.lastStage ?? "the first chapter"}`
                : reached === last
                  ? `every chapter to ${reached.lastStage}`
                  : `through ${reached.lastStage} (${reached.bossEn ?? reached.bossKr})`}
            </li>,
          ];
        })}
      </ul>
    </section>
  );
}

/**
 * The chapters' table: each chapter's last stage, zone, boss, recommended
 * power and requirements, then either the entry power of each reported
 * share or, with a power, the reader's bracket there and the power the next
 * bracket up takes.
 *
 * @param props - the chapters, the brackets, the reader's power, the shares and the source index
 * @returns the card
 */
function Chapters({
  chapters,
  brackets,
  power,
  shares,
  sources,
}: {
  chapters: readonly StageChapter[];
  brackets: readonly PowerBracket[];
  power: number | null;
  shares: readonly number[];
  sources: SourceIndex;
}) {
  const base: Column<StageChapter>[] = [
    { header: "Stage", cell: (c) => c.lastStage, className: "n" },
    { header: "Zone", cell: (c) => c.zone },
    { header: "Boss", cell: (c) => <CookieName kr={c.bossKr} en={c.bossEn} /> },
    { header: "Recommended", cell: (c) => formatPower(c.recommendedPower), className: "n" },
    { header: "Accuracy / focus", cell: (c) => `${c.accuracyReq} / ${c.focusReq}`, className: "n" },
  ];
  const withPower: Column<StageChapter>[] =
    power === null
      ? shares.flatMap((share) => {
          const bracket = brackets.find((b) => b.damagePct === share && b.damagePct < 100);
          if (!bracket) return [];
          return [
            {
              header: `${share}% from`,
              cell: (c: StageChapter) =>
                formatPower(entryPower(c.recommendedPower, bracket.minRatioPct)),
              className: "n",
            },
          ];
        })
      : [
          {
            header: "Your damage",
            cell: (c) => {
              const at = bracketAt(brackets, power, c.recommendedPower);
              return at ? `${at.damagePct}%` : "–";
            },
            className: "n",
          },
          {
            header: "Next bracket",
            cell: (c) => {
              const next = nextBracket(brackets, bracketAt(brackets, power, c.recommendedPower));
              return next
                ? `${next.damagePct}% at ${formatPower(entryPower(c.recommendedPower, next.minRatioPct))}`
                : "top";
            },
            className: "n",
          },
        ];
  return (
    <section className="card">
      <h3>Chapter by chapter</h3>
      <p className="muted">
        Each chapter's last stage (its -30 boss), where the chapter's recommended power peaks.{" "}
        <SourceChips ids={citedBy(chapters)} sources={sources} />
      </p>
      <DataTable
        columns={[...base, ...withPower]}
        rows={chapters}
        rowKey={(c) => c.id}
        empty="No stage chapters recorded yet."
      />
    </section>
  );
}

/**
 * The bracket calculator: the reader types their team power, and the view
 * shows how far that power pushes at each reported damage share, the power
 * gate with the cited mechanics of the copy's topic, and their bracket at
 * every chapter's last stage, from the bracket table and each stage's
 * recommended power. The power lives in the URL as `?power=`.
 *
 * @param props - the stage mode, its stage config, the search params and their setter
 * @returns the calculator
 */
export function StageBracketsView({ mode, stage, search, onSearch }: StageBracketsViewProps) {
  const sources = useSourceIndex();
  const brackets = useQuery(powerBracketsQuery());
  const chapters = useQuery(stageChaptersQuery());
  const typed = search.power ?? "";
  const power = parsePower(typed);
  const { title, lede, topic } = stage.brackets;
  return (
    <>
      <ViewHeader title={title} lede={lede} />
      <PowerField
        label="Team power"
        value={typed}
        onChange={(value) => onSearch({ power: value })}
        power={power}
        shown={power === null ? null : formatPower(power)}
      />
      <QueryResult query={brackets} resource="power brackets">
        {(table) => (
          <QueryResult query={chapters} resource="stage chapters">
            {(rows) =>
              rows.length === 0 ? (
                <EmptyState>No stage chapters recorded yet.</EmptyState>
              ) : (
                <>
                  {power === null ? null : (
                    <Reach chapters={rows} brackets={table} power={power} shares={stage.reach} />
                  )}
                  <BracketTable brackets={table} sources={sources} />
                  {topic ? <TopicNotes scope={mode.scope} topic={topic} /> : null}
                  <Chapters
                    chapters={rows}
                    brackets={table}
                    power={power}
                    shares={stage.reach}
                    sources={sources}
                  />
                </>
              )
            }
          </QueryResult>
        )}
      </QueryResult>
    </>
  );
}
