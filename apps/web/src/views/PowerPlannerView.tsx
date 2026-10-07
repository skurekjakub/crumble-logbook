import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useSourceIndex } from "../api/hooks";
import { powerBracketsQuery, stageChaptersQuery } from "../api/queries";
import type { PlannerStep, PowerBracket, StageChapter } from "../api/types";
import type { ModeSection, TeamPowerConfig } from "../app/modes";
import { STAGE, modeLink } from "../app/modes";
import { Clamp } from "../components/Clamp";
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
import {
  chaptersGained,
  formatPct,
  postedGainPct,
  postedGainPoint,
  reachAt,
  reachGained,
} from "../lib/team-power";
import type { TeamPowerData } from "./TeamPowerData";
import { TeamPowerLoaded, useTeamPowerData } from "./TeamPowerData";
import { BasisKey, BasisPill, PowerSourceLink } from "./TeamPowerParts";
import type { PowerSearch } from "./StageBracketsView";

/** The brackets the planner reports, each with the share of damage it keeps. */
interface Share {
  share: number;
  bracket: PowerBracket;
}

/**
 * Where a reach stops, as a tile shows it: the stage reached in big type
 * and a line under it (its boss, every chapter, or the first chapter's
 * last stage when none is reached yet).
 *
 * @param reach - the reach at one bracket
 * @param chapters - the chapters, in push order
 * @returns the big text and the line under it
 */
function reachText(
  reach: Reach<StageChapter>,
  chapters: readonly StageChapter[],
): { big: string; sub: string } {
  const { reached } = reach;
  if (!reached) return { big: "Not yet", sub: `first: ${chapters[0]?.lastStage ?? "–"}` };
  if (reached === chapters.at(-1)) return { big: reached.lastStage, sub: "every chapter" };
  return { big: reached.lastStage, sub: reached.bossEn ?? reached.bossKr };
}

/**
 * The planner's answer, first and big: one tile per reported bracket with
 * the furthest chapter's last stage the power keeps it to, and the power
 * the next chapter takes (any gain that large crosses it).
 *
 * @param props - the power, the brackets reported and the chapters
 * @returns the tiles
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
    <section className="standing" aria-label="Where you stand">
      <h3>
        At <span className="fig">{formatPower(power)}</span> you push
      </h3>
      <ul className="tiles">
        {shares.map(({ share, bracket }) => {
          const reach = reachAt(chapters, bracket, power);
          const { big, sub } = reachText(reach, chapters);
          return (
            <li key={share} className={reach.reached ? "tile" : "tile short"}>
              <span className="tile-label">{share}% of damage or more</span>
              <span className="tile-big">{big}</span>
              <span className="tile-sub">{sub}</span>
              {reach.next && reach.nextPower !== undefined ? (
                <span
                  className="tile-next"
                  title="Any gain of that much or more crosses it, whatever the step"
                >
                  Next {reach.next.lastStage} at {formatPower(reach.nextPower)} (
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
 * A planner step's gain: the posted figure it multiplies by (≈ when the
 * post gives it loosely), then the record's words and the figure's note
 * on one line.
 *
 * @param props - the step and the lists
 * @returns the gain
 */
export function StepGain({ step, data }: { step: PlannerStep; data: TeamPowerData }) {
  const point = postedGainPoint(step, data.points);
  const words = [step.gain, point ? `The figure: ${point.note}` : null].filter(Boolean).join(" · ");
  return (
    <>
      {point?.deltaPct == null ? null : (
        <span className="fig gain">{formatPct(point.deltaPct, point.approximate)}</span>
      )}
      <span className="muted">
        <Clamp lines={1}>{words}</Clamp>
      </span>
    </>
  );
}

/**
 * What each step the record weighs buys: its basis pill and gain, and,
 * for a posted gain with a power typed, the new power and how far it
 * pushes at each reported bracket; other steps say no reach is derived.
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
  /**
   * Whether the figure a step multiplies by is given loosely.
   *
   * @param step - the planner step
   * @returns true for an approximate posted figure
   */
  const loose = (step: PlannerStep) => postedGainPoint(step, data.points)?.approximate ?? false;
  const columns: Column<PlannerStep>[] = [
    {
      header: "Step",
      cell: (s) => <PowerSourceLink mode={mode} slug={s.powerSource} sources={data.sources} />,
    },
    { header: "Basis", cell: (s) => <BasisPill basis={s.basis} /> },
    {
      header: "Gain",
      cell: (s) => <StepGain step={s} data={data} />,
      className: "wide",
    },
    {
      header: "New power",
      cell: (s) => {
        const next = after(s);
        if (next === null) return <span className="muted">not derived</span>;
        return <span className="fig">{`${loose(s) ? "≈ " : ""}${formatPower(next)}`}</span>;
      },
      className: "n",
    },
    ...shares.map(({ share, bracket }): Column<PlannerStep> => ({
      header: `${share}% reach`,
      cell: (s) => {
        const next = after(s);
        if (next === null || power === null) return <span className="muted">not derived</span>;
        const before = reachAt(chapters, bracket, power);
        const reached = reachAt(chapters, bracket, next).reached;
        const moved = chaptersGained(chapters, before.reached, reached);
        const text = reachGained(before, reached, moved, power);
        return <span className={moved > 0 ? "moved" : undefined}>{text}</span>;
      },
      className: "reach-cell",
    })),
    {
      header: "The record's reach",
      cell: (s) => (
        <>
          <Clamp lines={1}>{s.reach}</Clamp>
          <SourceChips ids={s.sources} sources={index} max={2} />
        </>
      ),
      className: "wide",
    },
  ];
  return (
    <section aria-labelledby="buys-title">
      <h3 id="buys-title">What the next gains buy</h3>
      <BasisKey bases={["posted", "claimed", "unmeasured"]} />
      <DataTable
        columns={columns}
        rows={data.planner}
        rowKey={(s) => s.id}
        layout="stack"
        empty="No planner steps recorded yet."
      />
      <p className="muted table-key">
        Reach is read at each chapter's last stage, as the{" "}
        <Link
          {...modeLink(STAGE.id, "/$mode/brackets")}
          search={power === null ? {} : { power: formatPower(power) }}
        >
          stage bracket calculator
        </Link>{" "}
        reads it.
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
                  {power === null ? (
                    <EmptyState>Type your team power above to see how far it pushes.</EmptyState>
                  ) : (
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
