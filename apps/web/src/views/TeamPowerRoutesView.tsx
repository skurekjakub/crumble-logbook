import { useSourceIndex } from "../api/hooks";
import type { SpendingOrder, SpendingStep } from "../api/types";
import type { ModeSection, TeamPowerConfig } from "../app/modes";
import { BasisLegend, BasisMark } from "../components/BasisMark";
import { EmptyState } from "../components/EmptyState";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";
import { formatG } from "../lib/format";
import type { SourceIndex } from "../lib/sources";
import { COST_TYPES, formatKrw, formatPct, postedGainPct, usdPrice } from "../lib/team-power";
import type { TeamPowerData } from "./TeamPowerData";
import { TeamPowerLoaded, useTeamPowerData } from "./TeamPowerData";
import { PackageLink, PowerSourceLink } from "./TeamPowerParts";

/**
 * A power source step's gain: the planner step the record ties to the
 * power source, with the posted change and powers when it has them, and
 * the record's words; "No posted gain" when the record ties none.
 *
 * @param props - the power source's slug, the lists and the source index
 * @returns the gain
 */
export function SourceGain({
  slug,
  data,
  index,
}: {
  slug: string;
  data: TeamPowerData;
  index: SourceIndex;
}) {
  const step = data.planner.find((s) => s.powerSource === slug);
  if (!step) return <span className="muted">No posted gain</span>;
  const pct = postedGainPct(step, data.points);
  const point = data.points.find((p) => p.slug === step.dataPoint);
  return (
    <span>
      {pct === null ? null : <span className="gain-figure">{formatPct(pct)}</span>}
      {pct !== null && point?.beforeG != null && point.afterG != null ? (
        <span className="gain-figure">
          ({formatG(point.beforeG)} → {formatG(point.afterG)})
        </span>
      ) : null}
      <span className={pct === null ? undefined : "muted"}>{step.gain}</span>{" "}
      <SourceChips ids={step.sources} sources={index} />
    </span>
  );
}

/**
 * One step of a ranked route: its power source or package, its basis, the
 * gain the record ties to it and what it costs.
 *
 * @param props - the step, the mode, the lists and the source index
 * @returns the step's list item
 */
function RouteStep({
  step,
  mode,
  data,
  index,
}: {
  step: SpendingStep;
  mode: ModeSection;
  data: TeamPowerData;
  index: SourceIndex;
}) {
  const source = data.sources.find((s) => s.slug === step.powerSource);
  const pack = data.packages.find((p) => p.slug === step.packageSlug);
  const usd = pack ? usdPrice(pack) : null;
  return (
    <li>
      <div>
        <div className="step-head">
          <span className="name">
            {step.packageSlug === null ? (
              <PowerSourceLink mode={mode} slug={step.powerSource!} sources={data.sources} withKr />
            ) : (
              <PackageLink mode={mode} slug={step.packageSlug} packages={data.packages} withKr />
            )}
          </span>
          <BasisMark basis={step.basis} note={step.basisNote} />
        </div>
        {step.step ? <div>{step.step}</div> : null}
        <dl className="facts">
          <dt>Gain</dt>
          <dd>
            {step.powerSource === null ? (
              <span className="muted">No posted power figure</span>
            ) : (
              <SourceGain slug={step.powerSource} data={data} index={index} />
            )}
          </dd>
          <dt>{pack ? "Price" : "Cost"}</dt>
          <dd>
            {pack ? (
              <>
                {formatKrw(pack.priceKrw)}
                {usd ? ` · ${usd.text}` : null}
                <span className="muted"> ({pack.kind})</span>
              </>
            ) : source ? (
              <>
                <b>{COST_TYPES.find(([t]) => t === source.costType)?.[1]}.</b>{" "}
                <span className="muted">Near 2.2G: {source.efficiency.at22g}</span>
              </>
            ) : null}
          </dd>
          {step.why ? (
            <>
              <dt>Why</dt>
              <dd>{step.why}</dd>
            </>
          ) : null}
        </dl>
      </div>
    </li>
  );
}

/**
 * One ranked order: its note and sources, then the free and the paid
 * route as numbered steps.
 *
 * @param props - the order, its steps, the mode, the lists and the source index
 * @returns the section
 */
function RankedOrder({
  order,
  steps,
  mode,
  data,
  index,
}: {
  order: SpendingOrder;
  steps: readonly SpendingStep[];
  mode: ModeSection;
  data: TeamPowerData;
  index: SourceIndex;
}) {
  return (
    <section className="panel" aria-labelledby={`order-${order.slug}`}>
      <h3 id={`order-${order.slug}`}>{order.label}</h3>
      {order.note ? <div className="note">{order.note}</div> : null}
      <SourceChips ids={order.sources} sources={index} />
      <div className="routes">
        {(["free", "paid"] as const).map((route) => {
          const onRoute = steps.filter((s) => s.route === route);
          const heading = route === "free" ? "Free route" : "Paid route";
          return (
            <section key={route} className="card" aria-label={heading}>
              <h3>{heading}</h3>
              {onRoute.length ? (
                <ol className="steps">
                  {onRoute.map((s) => (
                    <RouteStep key={s.id} step={s} mode={mode} data={data} index={index} />
                  ))}
                </ol>
              ) : (
                <EmptyState>No steps on this route.</EmptyState>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}

/** Props for {@link TeamPowerRoutesView}. */
export interface TeamPowerRoutesViewProps {
  /** The team-power mode. */
  mode: ModeSection;
  /** Its team-power screens' config. */
  teamPower: TeamPowerConfig;
}

/**
 * The ranked routes: for every ranked spending order, its free route and
 * its paid route as numbered steps, each with its basis mark, the gain the
 * record ties to it (from the planner's steps) and its cost or price.
 *
 * @param props - the mode and its team-power config
 * @returns the view
 */
export function TeamPowerRoutesView({ mode, teamPower }: TeamPowerRoutesViewProps) {
  const index = useSourceIndex();
  const state = useTeamPowerData();
  const { title, lede } = teamPower.routes;
  return (
    <>
      <ViewHeader title={title} lede={lede} />
      <BasisLegend />
      <TeamPowerLoaded state={state}>
        {(data) => {
          const ranked = data.orders.filter((o) => o.kind === "ranked");
          if (!ranked.length) return <EmptyState>No ranked order recorded yet.</EmptyState>;
          return ranked.map((order) => (
            <RankedOrder
              key={order.id}
              order={order}
              steps={data.steps.filter((s) => s.orderSlug === order.slug)}
              mode={mode}
              data={data}
              index={index}
            />
          ));
        }}
      </TeamPowerLoaded>
    </>
  );
}
