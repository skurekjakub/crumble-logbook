import type { ReactNode } from "react";
import { useSourceIndex } from "../api/hooks";
import type { PowerDataPoint, PowerSource } from "../api/types";
import type { ModeSection, TeamPowerConfig } from "../app/modes";
import { BasisMark } from "../components/BasisMark";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Kv } from "../components/Kv";
import { Pill } from "../components/Pill";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";
import { optionalKey } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import type { EfficiencyGrade, EfficiencyStage } from "../lib/team-power";
import {
  COST_TYPES,
  EFFICIENCY_GRADES,
  EFFICIENCY_STAGES,
  PLACES,
  efficiencyGrade,
  formatPct,
  postedGainPct,
} from "../lib/team-power";
import { formatG } from "../lib/format";
import type { TeamPowerData } from "./TeamPowerData";
import { TeamPowerLoaded, useTeamPowerData } from "./TeamPowerData";
import { PowerSourceLink, Switch, powerSourceAnchor } from "./TeamPowerParts";

/** The account stages, by value, for reading the search param. */
const STAGES = Object.fromEntries(EFFICIENCY_STAGES) as Record<EfficiencyStage, string>;

/** The stage the page grades at when the URL names none: the reader's 2.2G team. */
const DEFAULT_STAGE: EfficiencyStage = "at22g";

/** The cost and efficiency page's search params: the account stage graded at. */
export interface PowerSourcesSearch {
  stage?: EfficiencyStage;
}

/**
 * Reads the cost and efficiency page's search params.
 *
 * @param search - the decoded query values
 * @returns the account stage, dropped when unusable
 */
export function validatePowerSourcesSearch(search: Record<string, unknown>): PowerSourcesSearch {
  return { stage: optionalKey(search.stage, STAGES) };
}

/**
 * The power sources the planner has a posted gain for.
 *
 * @param data - the lists
 * @returns their slugs, in the planner's order
 */
function measuredSources(data: TeamPowerData): ReadonlySet<string> {
  return new Set(
    data.planner.filter((s) => postedGainPct(s, data.points) !== null).map((s) => s.powerSource),
  );
}

/** Labels per efficiency grade. */
const GRADE_LABELS: Readonly<Record<EfficiencyGrade, string>> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "None",
};

/**
 * The grid of cost against efficiency: cost types across, the record's
 * grades at the chosen stage down, and a last row for the power sources
 * whose note there leads with no grade. Each cell links to its sources'
 * cards; a source the planner has a posted gain for carries the posted
 * mark, so a grade backed by a measurement stands apart from one that isn't.
 *
 * @param props - the mode, the power sources, the stage graded at, and
 *   the slugs of the sources with a posted gain
 * @returns the card
 */
function EfficiencyGrid({
  mode,
  sources,
  stage,
  measured,
}: {
  mode: ModeSection;
  sources: readonly PowerSource[];
  stage: EfficiencyStage;
  measured: ReadonlySet<string>;
}) {
  const rows: ReadonlyArray<readonly [EfficiencyGrade | null, string]> = [
    ...EFFICIENCY_GRADES.map((g) => [g, GRADE_LABELS[g]] as const),
    [null, "Not graded or unmeasured"],
  ];
  /**
   * The power sources in one cell of the grid.
   *
   * @param grade - the row's grade, or null for the ungraded row
   * @param cost - the column's cost type
   * @returns the cell's list, or a dash when it's empty
   */
  const cell = (grade: EfficiencyGrade | null, cost: string): ReactNode => {
    const inCell = sources.filter(
      (s) => s.costType === cost && efficiencyGrade(s.efficiency[stage]) === grade,
    );
    if (!inCell.length) return <span className="muted">–</span>;
    return (
      <ul className="names">
        {inCell.map((s) => (
          <li key={s.slug}>
            <PowerSourceLink mode={mode} slug={s.slug} sources={sources} />
            {measured.has(s.slug) ? (
              <>
                {" "}
                <span className="mark posted">Posted</span>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    );
  };
  return (
    <section className="card" aria-labelledby="grid-title">
      <h3 id="grid-title">
        Cost against efficiency, {STAGES[stage].charAt(0).toLowerCase() + STAGES[stage].slice(1)}
      </h3>
      <div className="tablewrap">
        <table className="scroll grid-cost">
          <thead>
            <tr>
              <th scope="col">Efficiency</th>
              {COST_TYPES.map(([type, label]) => (
                <th key={type} scope="col">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([grade, label]) => (
              <tr key={label} className={grade === null ? "ungraded" : undefined}>
                <th scope="row">{label}</th>
                {COST_TYPES.map(([type]) => (
                  <td key={type}>{cell(grade, type)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">
        <span className="mark posted">Posted</span> the record has a player's own before-and-after
        gain for the power source, which the planner multiplies. A grade without it is the record's
        judgement from costs and the community's word.
      </p>
    </section>
  );
}

/**
 * The figures behind the power sources the planner may multiply by: each
 * one's measured changes (a power before and after) and the record's own
 * arithmetic on its cost, each marked with how it is known (≈ when given
 * loosely), with the record's note near 2.2G under each. A figure with no
 * before and after, such as a gain several sources made together, is left
 * to the Data points page. Nothing here is divided by a cost.
 *
 * @param props - the mode, the lists and the source index
 * @returns the section, or null when no planner step has a posted gain
 */
function WithNumbers({
  mode,
  data,
  index,
}: {
  mode: ModeSection;
  data: TeamPowerData;
  index: SourceIndex;
}) {
  const measured = [...measuredSources(data)];
  if (!measured.length) return null;
  const columns: Column<PowerDataPoint>[] = [
    { header: "How known", cell: (p) => <BasisMark basis={p.kind} /> },
    {
      header: "Change",
      cell: (p) =>
        p.deltaPct === null
          ? "–"
          : `${formatPct(p.deltaPct, p.approximate)}${p.beforeG !== null && p.afterG !== null ? ` (${formatG(p.beforeG)} → ${formatG(p.afterG)})` : ""}`,
      className: "n",
    },
    { header: "What it took", cell: (p) => p.cost ?? "–", className: "wide" },
    { header: "Note", cell: (p) => p.note },
    { header: "Sources", cell: (p) => <SourceChips ids={p.sources} sources={index} /> },
  ];
  return (
    <section className="panel" aria-labelledby="numbers-title">
      <h3 id="numbers-title">Where the record has numbers</h3>
      <div className="note callout">
        This page doesn't divide a gain by a cost. Where the record compares two steps per won, its
        note says so; where it can't compare them, the note says that instead.
      </div>
      <div className="grid">
        {measured.map((slug) => {
          const source = data.sources.find((s) => s.slug === slug);
          const points = data.points.filter(
            (p) =>
              p.powerSource === slug &&
              ((p.beforeG !== null && p.afterG !== null) || p.kind === "inferred"),
          );
          return (
            <section key={slug} className="card">
              <h3>
                <PowerSourceLink mode={mode} slug={slug} sources={data.sources} withKr />
              </h3>
              <DataTable
                columns={columns}
                rows={points}
                rowKey={(p) => p.id}
                layout="stack"
                empty="No figures recorded."
              />
              {source ? <p className="muted">Near 2.2G: {source.efficiency.at22g}</p> : null}
            </section>
          );
        })}
      </div>
    </section>
  );
}

/**
 * One power source's card: what it raises, where it counts, its cost type,
 * its efficiency at every stage (the chosen one marked), cap and
 * diminishing returns, and, folded, its materials, posted gains, spend
 * order and patches.
 *
 * @param props - the power source, the stage graded at and the source index
 * @returns the card
 */
function PowerSourceCard({
  source,
  stage,
  index,
}: {
  source: PowerSource;
  stage: EfficiencyStage;
  index: SourceIndex;
}) {
  const cost = COST_TYPES.find(([t]) => t === source.costType)?.[1];
  return (
    <section className="card" id={powerSourceAnchor(source.slug)}>
      <div className="card-head">
        <h3>
          {source.nameEn} <span className="kr">{source.nameKr}</span>
        </h3>
        <span className="chips">
          <span className="chip">{cost}</span>
          {source.confidence === "high" ? null : (
            <Pill kind={source.confidence}>{source.confidence} confidence</Pill>
          )}
        </span>
      </div>
      <div>{source.raises}</div>
      <div className="muted">Counts in: {source.appliesIn.map((p) => PLACES[p]).join(", ")}</div>
      <dl className="kv">
        {EFFICIENCY_STAGES.map(([key, label]) => (
          <EfficiencyRow
            key={key}
            label={label}
            note={source.efficiency[key]}
            chosen={key === stage}
          />
        ))}
        {(
          [
            ["Cap", source.cap],
            ["Diminishing returns", source.diminishing],
            ["Cost per roll", source.costPerRoll],
            ["For the brackets", source.bracketEffect],
          ] as const
        ).map(([label, text]) =>
          text ? <EfficiencyRow key={label} label={label} note={text} chosen={false} /> : null,
        )}
      </dl>
      <details>
        <summary>Materials, posted gains, spend order and patches</summary>
        <DataTable
          columns={[
            { header: "Material", cell: (m) => m.name },
            { header: "Free", cell: (m) => m.free },
            { header: "Paid", cell: (m) => m.paid },
            { header: "Note", cell: (m) => m.note ?? "" },
          ]}
          rows={source.materials}
          rowKey={(m) => m.name}
          layout="stack"
        />
        {source.postedGains.length ? (
          <ul className="clean">
            {source.postedGains.map((g, i) => (
              <li key={i}>
                <b>{g.account}</b>
                {g.before || g.after ? `: ${g.before ?? "?"} → ${g.after ?? "?"}` : null}
                {g.delta ? `, ${g.delta}` : null}
                {g.cost ? <span className="muted"> ({g.cost})</span> : null}{" "}
                <span className="basis-note">{g.kind}</span>{" "}
                <SourceChips ids={g.sources} sources={index} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No posted gains.</p>
        )}
        <Kv
          rows={[
            ["Spend order", source.spendOrder],
            ["Patches", source.patchNotes],
          ]}
        />
      </details>
      <SourceChips ids={source.sources} sources={index} />
    </section>
  );
}

/**
 * One term and its text in a power source's facts, marked when it is the
 * efficiency at the stage graded at.
 *
 * @param props - the term, the text and whether it is the chosen stage's efficiency
 * @returns the term and its text
 */
function EfficiencyRow({ label, note, chosen }: { label: string; note: string; chosen: boolean }) {
  const className = chosen ? "chosen" : undefined;
  return (
    <>
      <dt className={className}>{label}</dt>
      <dd className={className}>{note}</dd>
    </>
  );
}

/** Props for {@link PowerSourcesView}. */
export interface PowerSourcesViewProps {
  /** The team-power mode. */
  mode: ModeSection;
  /** Its team-power screens' config. */
  teamPower: TeamPowerConfig;
  /** The current search params. */
  search: PowerSourcesSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: PowerSourcesSearch) => void;
}

/**
 * Every power source on cost and efficiency: the account stage to grade
 * at (in the URL as `?stage=`), the grid of cost type against the
 * record's grade there, the figures behind the steps the planner may
 * multiply by, and a card per power source.
 *
 * @param props - the mode, its team-power config, the search params and their setter
 * @returns the view
 */
export function PowerSourcesView({ mode, teamPower, search, onSearch }: PowerSourcesViewProps) {
  const index = useSourceIndex();
  const state = useTeamPowerData();
  const stage = search.stage ?? DEFAULT_STAGE;
  const { title, lede } = teamPower.powerSources;
  return (
    <>
      <ViewHeader title={title} lede={lede} />
      <Switch
        label="Account stage"
        options={EFFICIENCY_STAGES}
        value={stage}
        onChange={(value) => onSearch({ stage: value === DEFAULT_STAGE ? undefined : value })}
      />
      <TeamPowerLoaded state={state}>
        {(data) =>
          data.sources.length === 0 ? (
            <EmptyState>No power sources recorded yet.</EmptyState>
          ) : (
            <>
              <EfficiencyGrid
                mode={mode}
                sources={data.sources}
                stage={stage}
                measured={measuredSources(data)}
              />
              <WithNumbers mode={mode} data={data} index={index} />
              <h3>Every power source</h3>
              {data.sources.map((s) => (
                <PowerSourceCard key={s.id} source={s} stage={stage} index={index} />
              ))}
            </>
          )
        }
      </TeamPowerLoaded>
    </>
  );
}
