import { useSourceIndex } from "../api/hooks";
import type { PowerDataPoint, PowerSource } from "../api/types";
import type { ModeSection, TeamPowerConfig } from "../app/modes";
import { Clamp } from "../components/Clamp";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Kv } from "../components/Kv";
import { Pill } from "../components/Pill";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";
import { formatG } from "../lib/format";
import { optionalKey } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import type { EfficiencyStage } from "../lib/team-power";
import {
  COST_TYPES,
  EFFICIENCY_STAGES,
  PLACES,
  formatPct,
  gradeRank,
  postedGainPoint,
} from "../lib/team-power";
import type { TeamPowerData } from "./TeamPowerData";
import { TeamPowerLoaded, useTeamPowerData } from "./TeamPowerData";
import {
  BasisPill,
  CostTag,
  GradePill,
  PowerSourceLink,
  Switch,
  powerSourceAnchor,
} from "./TeamPowerParts";

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
 * The posted gain the planner may multiply by for each power source.
 *
 * @param data - the lists
 * @returns each measured source's slug with its data point, in the planner's order
 */
function measuredSources(data: TeamPowerData): ReadonlyMap<string, PowerDataPoint> {
  const measured = new Map<string, PowerDataPoint>();
  for (const step of data.planner) {
    const point = postedGainPoint(step, data.points);
    if (point) measured.set(step.powerSource, point);
  }
  return measured;
}

/**
 * Every power source in one comparison table, best grade at the chosen
 * stage first (cheaper cost types first within a grade): its cost type,
 * its grade at every stage (the chosen stage's column marked), and the
 * posted gain the record measured for it, when there is one. Each name
 * links to its card.
 *
 * @param props - the mode, the power sources, the stage graded at, and the measured gains
 * @returns the card
 */
function CompareTable({
  mode,
  sources,
  stage,
  measured,
}: {
  mode: ModeSection;
  sources: readonly PowerSource[];
  stage: EfficiencyStage;
  measured: ReadonlyMap<string, PowerDataPoint>;
}) {
  /**
   * Where a power source's cost type sorts: free first, paid last.
   *
   * @param s - the power source
   * @returns its cost type's place on the cost axis
   */
  const costRank = (s: PowerSource) => COST_TYPES.findIndex(([t]) => t === s.costType);
  const sorted = [...sources].sort(
    (a, b) =>
      gradeRank(a.efficiency[stage]) - gradeRank(b.efficiency[stage]) || costRank(a) - costRank(b),
  );
  return (
    <section aria-labelledby="compare-title">
      <h3 id="compare-title">
        Compared, best at {STAGES[stage].charAt(0).toLowerCase() + STAGES[stage].slice(1)} first
      </h3>
      <div className="tablewrap">
        <table className="scroll compare">
          <thead>
            <tr>
              <th scope="col">Power source</th>
              <th scope="col">Cost</th>
              {EFFICIENCY_STAGES.map(([key, label]) => (
                <th key={key} scope="col" className={key === stage ? "stage chosen" : "stage"}>
                  {label}
                </th>
              ))}
              <th scope="col">Measured gain</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const point = measured.get(s.slug);
              return (
                <tr key={s.slug}>
                  <th scope="row">
                    <PowerSourceLink mode={mode} slug={s.slug} sources={sources} />
                  </th>
                  <td>
                    <CostTag type={s.costType} />
                  </td>
                  {EFFICIENCY_STAGES.map(([key]) => (
                    <td key={key} className={key === stage ? "stage chosen" : "stage"}>
                      <GradePill note={s.efficiency[key]} />
                    </td>
                  ))}
                  <td className="n">
                    {point?.deltaPct == null ? (
                      <span className="muted">–</span>
                    ) : (
                      <span className="fig gain" title={point.note}>
                        {formatPct(point.deltaPct, point.approximate)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted table-key">
        Hover a grade for the record's note. A dash: the note leads with no grade.
      </p>
    </section>
  );
}

/**
 * The figures behind the power sources the planner may multiply by: each
 * one's measured changes (a power before and after) and the record's own
 * arithmetic on its cost, each with its basis pill (≈ when given loosely)
 * and its note on one line. A figure with no before and after, such as a
 * gain several sources made together, is left to the Data points page.
 * Nothing here is divided by a cost.
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
  const measured = [...measuredSources(data).keys()];
  if (!measured.length) return null;
  const columns: Column<PowerDataPoint>[] = [
    { header: "How known", cell: (p) => <BasisPill basis={p.kind} /> },
    {
      header: "Change",
      cell: (p) =>
        p.deltaPct === null ? (
          "–"
        ) : (
          <>
            <span className="fig gain">{formatPct(p.deltaPct, p.approximate)}</span>
            {p.beforeG !== null && p.afterG !== null ? (
              <span className="fig-sub">
                {formatG(p.beforeG)} → {formatG(p.afterG)}
              </span>
            ) : null}
          </>
        ),
      className: "n",
    },
    {
      header: "What it took",
      cell: (p) => (p.cost ? <Clamp lines={1}>{p.cost}</Clamp> : "–"),
      className: "wide",
    },
    { header: "Note", cell: (p) => <Clamp lines={1}>{p.note}</Clamp>, className: "wide" },
    { header: "Sources", cell: (p) => <SourceChips ids={p.sources} sources={index} max={2} /> },
  ];
  return (
    <section aria-labelledby="numbers-title">
      <h3 id="numbers-title">Where the record has numbers</h3>
      <div className="callout">
        <Pill kind="medium">Not per won</Pill>
        <span className="callout-body">
          Gains aren't divided by cost; notes say where they compare.
        </span>
      </div>
      <div className="grid">
        {measured.map((slug) => {
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
            </section>
          );
        })}
      </div>
    </section>
  );
}

/**
 * One power source's card: its name, cost type, grade at the chosen
 * stage and confidence first; what it raises and the chosen stage's note,
 * each on one line; then, folded, every stage's note, cap, diminishing
 * returns, materials, posted gains, spend order and patches.
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
  return (
    <section className="card ps-card" id={powerSourceAnchor(source.slug)}>
      <div className="card-head">
        <h3>
          {source.nameEn} <span className="kr">{source.nameKr}</span>
        </h3>
        <span className="chips">
          <GradePill note={source.efficiency[stage]} />
          <CostTag type={source.costType} />
          {source.confidence === "high" ? null : (
            <Pill kind={source.confidence}>{source.confidence} confidence</Pill>
          )}
        </span>
      </div>
      <Kv
        rows={[
          ["Raises", <Clamp lines={1}>{source.raises}</Clamp>],
          [STAGES[stage], <Clamp lines={1}>{source.efficiency[stage]}</Clamp>],
          ["Counts in", source.appliesIn.map((p) => PLACES[p]).join(", ")],
        ]}
      />
      <details>
        <summary>Every stage, cap, materials, posted gains and patches</summary>
        <Kv
          rows={[
            ...EFFICIENCY_STAGES.filter(([key]) => key !== stage).map(
              ([key, label]) => [label, source.efficiency[key]] as const,
            ),
            ["Cap", source.cap],
            ["Diminishing returns", source.diminishing],
            ["Cost per roll", source.costPerRoll],
            ["For the brackets", source.bracketEffect],
            ["Spend order", source.spendOrder],
            ["Patches", source.patchNotes],
          ]}
        />
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
                <SourceChips ids={g.sources} sources={index} max={2} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No posted gains.</p>
        )}
      </details>
      <div className="card-foot">
        <SourceChips ids={source.sources} sources={index} />
      </div>
    </section>
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
 * at (in the URL as `?stage=`), one table comparing them all, best grade
 * there first, the figures behind the steps the planner may multiply by,
 * and a card per power source.
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
              <CompareTable
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
