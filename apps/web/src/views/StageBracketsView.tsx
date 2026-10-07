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
import { ViewHeader } from "../components/ViewHeader";
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
import { TopicNotes } from "./ModeViewHeader";
import type { ReachTile } from "./StageParts";
import { BracketTag, ReachTiles } from "./StageParts";

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
 * The power gate as a ladder: a step per bracket, from what share of
 * recommended power it starts, the damage it keeps as a tinted tag and the
 * game's label; the sources once, beside the heading.
 *
 * @param props - the brackets and the source index
 * @returns the card
 */
function Gate({ brackets, sources }: { brackets: readonly PowerBracket[]; sources: SourceIndex }) {
  const steps = [...brackets].sort((a, b) => a.minRatioPct - b.minRatioPct);
  return (
    <section className="card" aria-labelledby="power-gate-title">
      <div className="card-row">
        <h3 id="power-gate-title">The power gate</h3>
        <SourceChips ids={citedBy(steps)} sources={sources} />
      </div>
      {steps.length ? (
        <ol className="gate" aria-label="Share of recommended power, then damage kept">
          {steps.map((b) => (
            <li key={b.id} title={`${b.minRatioPct}% of recommended or more keeps ${b.damagePct}%`}>
              <span className="from">{b.minRatioPct}%+</span>
              <BracketTag pct={b.damagePct} />
              <span className="kr">{b.label}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">No power brackets recorded yet.</p>
      )}
    </section>
  );
}

/**
 * The answer, first and large: for each reported share, the furthest
 * chapter whose last stage the reader enters at that bracket or better,
 * with the boss there.
 *
 * @param props - the chapters, the brackets, the reader's power and the shares to report
 * @returns the answer card
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
  const tiles = shares.flatMap((share): ReachTile[] => {
    const bracket = brackets.find((b) => b.damagePct === share);
    if (!bracket) return [];
    const reached = furthest(chapters, (c) => c.recommendedPower, power, bracket.minRatioPct);
    if (!reached) {
      return [
        { share, value: "–", sub: `not yet at ${chapters[0]?.lastStage ?? "1-30"}`, none: true },
      ];
    }
    return [
      {
        share,
        value: reached.lastStage,
        sub:
          reached === last ? (
            "every chapter"
          ) : (
            <CookieName kr={reached.bossKr} en={reached.bossEn} inline />
          ),
      },
    ];
  });
  return (
    <ReachTiles
      label="How far you push"
      heading={
        <>
          At {formatPower(power)}
          <span className="unit">furthest boss stage per damage share</span>
        </>
      }
      tiles={tiles}
    />
  );
}

/**
 * The chapters' table, folded: each chapter's last stage, boss, recommended
 * power and requirements, then either the entry power of each reported
 * share or, with a power, the reader's bracket there as a tinted tag and
 * the power the next bracket up takes.
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
    { header: "Stage", cell: (c) => <b>{c.lastStage}</b>, className: "n" },
    { header: "Boss", cell: (c) => <CookieName kr={c.bossKr} en={c.bossEn} inline /> },
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
              return at ? <BracketTag pct={at.damagePct} /> : "–";
            },
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
    <section className="card" aria-labelledby="chapters-title">
      <div className="card-row">
        <h3 id="chapters-title">Chapter by chapter</h3>
        <SourceChips ids={citedBy(chapters)} sources={sources} />
      </div>
      <details className="chapters">
        <summary>
          {power === null ? "Entry powers" : "Your bracket"} at every boss stage ({chapters.length})
        </summary>
        <DataTable
          columns={[...base, ...withPower]}
          rows={chapters}
          rowKey={(c) => c.id}
          empty="No stage chapters recorded yet."
        />
      </details>
    </section>
  );
}

/**
 * The bracket calculator: the reader types their team power, and the view
 * answers first how far that power pushes at each reported damage share,
 * then shows the power gate as a ladder with the cited mechanics of the
 * copy's topic, and, folded, their bracket at every chapter's last stage,
 * from the bracket table and each stage's recommended power. Without a
 * power it asks for one where the answer goes. The power lives in the URL
 * as `?power=`.
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
                  {power === null ? (
                    <p className="reach-prompt">
                      Type your team power above to see how far you push.
                    </p>
                  ) : (
                    <Reach chapters={rows} brackets={table} power={power} shares={stage.reach} />
                  )}
                  <Gate brackets={table} sources={sources} />
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
