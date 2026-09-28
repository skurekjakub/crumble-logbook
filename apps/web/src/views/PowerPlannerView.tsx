import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useSourceIndex } from "../api/hooks";
import { powerBracketsQuery, stageChaptersQuery } from "../api/queries";
import type { PlannerStep, PowerBracket, StageChapter } from "../api/types";
import type { ModeSection, TeamPowerConfig } from "../app/modes";
import { STAGE, modeLink } from "../app/modes";
import { BasisLegend, BasisMark } from "../components/BasisMark";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { PowerField } from "../components/PowerField";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";
import type { SourceIndex } from "../lib/sources";
import { formatPower, parsePower } from "../lib/stage";
import type { Reach } from "../lib/team-power";
import { chaptersGained, formatPct, postedGainPct, reachAt } from "../lib/team-power";
import type { TeamPowerData } from "./TeamPowerData";
import { TeamPowerLoaded, useTeamPowerData } from "./TeamPowerData";
import { PowerSourceLink } from "./TeamPowerParts";
import type { PowerSearch } from "./StageBracketsView";

/** The brackets the planner reports, each with the share of damage it keeps. */
interface Share {
  share: number;
  bracket: PowerBracket;
}

/**
 * Where a reach stops: the chapter's last stage and its boss, every
 * chapter, or not yet the first.
 *
 * @param reach - the reach at one bracket
 * @param chapters - the chapters, in push order
 * @returns the text
 */
function reachText(reach: Reach<StageChapter>, chapters: readonly StageChapter[]): string {
  const { reached } = reach;
  if (!reached) return `not yet at ${chapters[0]?.lastStage ?? "the first chapter"}`;
  if (reached === chapters.at(-1)) return `every chapter to ${reached.lastStage}`;
  return `through ${reached.lastStage} (${reached.bossEn ?? reached.bossKr})`;
}

/**
 * Where the reader's power stands at each reported bracket: how far it
 * pushes and what the next chapter's last stage takes.
 *
 * @param props - the power, the brackets reported and the chapters
 * @returns the card
 */
function Standing({
  power,
  shares,
  chapters,
}: {
  power: number;
  shares: readonly Share[];
  chapters: readonly StageChapter[];
}) {
  return (
    <section className="card reach" aria-label="Where you stand">
      <h3>At {formatPower(power)}</h3>
      <ul className="clean">
        {shares.map(({ share, bracket }) => {
          const reach = reachAt(chapters, bracket, power);
          return (
            <li key={share}>
              <b>{share}% of damage or more</b>: {reachText(reach, chapters)}
              {reach.next && reach.nextPower !== undefined ? (
                <span className="muted">
                  {" "}
                  · next, {reach.next.lastStage} at {formatPower(reach.nextPower)} (
                  {formatPct((reach.nextPower / power - 1) * 100)})
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * What each step the record weighs buys: its basis and gain, and, for a
 * posted gain with a power typed, the new power and how far it pushes at
 * each reported bracket; other steps say no reach is derived.
 *
 * @param props - the mode, the power (null when none is typed), the brackets, the chapters, the lists and the source index
 * @returns the card
 */
function StepsBuy({
  mode,
  power,
  shares,
  chapters,
  data,
  index,
}: {
  mode: ModeSection;
  power: number | null;
  shares: readonly Share[];
  chapters: readonly StageChapter[];
  data: TeamPowerData;
  index: SourceIndex;
}) {
  /**
   * The power a step leaves the reader at, when it has a posted gain and a power is typed.
   *
   * @param step - the planner step
   * @returns the new power, or null
   */
  const after = (step: PlannerStep): number | null => {
    const pct = postedGainPct(step, data.points);
    return pct === null || power === null ? null : Math.round(power * (1 + pct / 100));
  };
  const columns: Column<PlannerStep>[] = [
    {
      header: "Step",
      cell: (s) => <PowerSourceLink mode={mode} slug={s.powerSource} sources={data.sources} />,
    },
    { header: "Basis", cell: (s) => <BasisMark basis={s.basis} /> },
    {
      header: "Gain",
      cell: (s) => {
        const pct = postedGainPct(s, data.points);
        return (
          <>
            {pct === null ? null : <span className="gain-figure">{formatPct(pct)}</span>}
            <span className="muted">{s.gain}</span>
          </>
        );
      },
      className: "wide",
    },
    {
      header: "New power",
      cell: (s) => {
        const next = after(s);
        return next === null ? "not derived" : formatPower(next);
      },
      className: "n",
    },
    ...shares.map(({ share, bracket }): Column<PlannerStep> => ({
      header: `${share}% reach`,
      cell: (s) => {
        const next = after(s);
        if (next === null || power === null) return <span className="muted">not derived</span>;
        const before = reachAt(chapters, bracket, power).reached;
        const reached = reachAt(chapters, bracket, next).reached;
        const moved = chaptersGained(chapters, before, reached);
        const gained = moved === 0 ? "no change" : `+${moved} chapter${moved === 1 ? "" : "s"}`;
        return `${reached?.lastStage ?? "–"} (${gained})`;
      },
      className: "n",
    })),
    {
      header: "The record's reach",
      cell: (s) => (
        <>
          {s.reach} <SourceChips ids={s.sources} sources={index} />
        </>
      ),
      className: "wide",
    },
  ];
  return (
    <section className="card" aria-labelledby="buys-title">
      <h3 id="buys-title">What the next gains buy</h3>
      <BasisLegend />
      <DataTable
        columns={columns}
        rows={data.planner}
        rowKey={(s) => s.id}
        layout="stack"
        empty="No planner steps recorded yet."
      />
      <p className="muted">
        Reach is read chapter by chapter's last stage, where a chapter's recommended power peaks, as
        the{" "}
        <Link
          {...modeLink(STAGE.id, "/$mode/brackets")}
          search={power === null ? {} : { power: formatPower(power) }}
        >
          stage bracket calculator
        </Link>{" "}
        reads it; the record's reach is per stage, so it can run a few stages further.
      </p>
    </section>
  );
}

/** Props for {@link PowerPlannerView}. */
export interface PowerPlannerViewProps {
  /** The team-power mode. */
  mode: ModeSection;
  /** Its team-power screens' config. */
  teamPower: TeamPowerConfig;
  /** The current search params. */
  search: PowerSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: PowerSearch) => void;
}

/**
 * The power planner: the reader types a team power (in the URL as
 * `?power=`, read by the shared parser), sees how far it pushes on the
 * main stages at each reported bracket (from the stored power brackets
 * and stage chapters), and what each step the record weighs would buy.
 * Only a posted gain is multiplied in.
 *
 * @param props - the mode, its team-power config, the search params and their setter
 * @returns the view
 */
export function PowerPlannerView({ mode, teamPower, search, onSearch }: PowerPlannerViewProps) {
  const index = useSourceIndex();
  const state = useTeamPowerData();
  const brackets = useQuery(powerBracketsQuery());
  const chapters = useQuery(stageChaptersQuery());
  const typed = search.power ?? "";
  const power = parsePower(typed);
  const { title, lede } = teamPower.planner;
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
        {(bracketRows) => (
          <QueryResult query={chapters} resource="stage chapters">
            {(chapterRows) => {
              if (!chapterRows.length) {
                return <EmptyState>No stage chapters recorded yet: load record 003.</EmptyState>;
              }
              const shares = teamPower.reach.flatMap((share) => {
                const bracket = bracketRows.find((b) => b.damagePct === share);
                return bracket ? [{ share, bracket }] : [];
              });
              return (
                <>
                  {power === null ? null : (
                    <Standing power={power} shares={shares} chapters={chapterRows} />
                  )}
                  <TeamPowerLoaded state={state}>
                    {(data) => (
                      <StepsBuy
                        mode={mode}
                        power={power}
                        shares={shares}
                        chapters={chapterRows}
                        data={data}
                        index={index}
                      />
                    )}
                  </TeamPowerLoaded>
                </>
              );
            }}
          </QueryResult>
        )}
      </QueryResult>
    </>
  );
}
