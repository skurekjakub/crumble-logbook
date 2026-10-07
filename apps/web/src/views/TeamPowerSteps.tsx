import type { SpendingOrder, SpendingStep } from "../api/types";
import type { ModeSection } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { EmptyState } from "../components/EmptyState";
import { Pill } from "../components/Pill";
import { SourceChips } from "../components/SourceChips";
import { formatG } from "../lib/format";
import type { SourceIndex } from "../lib/sources";
import type { EfficiencyStage } from "../lib/team-power";
import {
  efficiencyGrade,
  formatKrw,
  formatPct,
  postedGainPoint,
  usdPrice,
} from "../lib/team-power";
import type { TeamPowerData } from "./TeamPowerData";
import { BasisPill, CostTag, GradePill, PackageLink, PowerSourceLink } from "./TeamPowerParts";

/** What a step list reads besides its steps. */
export interface StepContext {
  /** The team-power mode, for the links. */
  mode: ModeSection;
  /** The loaded lists. */
  data: TeamPowerData;
  /** The source index, for the chips. */
  index: SourceIndex;
  /** The account stage a power source's grade is read at. */
  stage: EfficiencyStage;
  /** The order's own sources, which its callout shows once; a step leaves them out. */
  shared?: readonly string[];
}

/**
 * A step's gain as one short figure: the posted change the record ties to
 * its power source (≈ when given loosely), with the powers before and
 * after; "not measured" when the record ties only words to it; a dash
 * when it ties nothing.
 *
 * @param props - the step and what the list reads
 * @returns the figure
 */
export function GainFigure({ step, context }: { step: SpendingStep; context: StepContext }) {
  const planned = context.data.planner.find((p) => p.powerSource === step.powerSource);
  if (step.powerSource === null || !planned) {
    return <span className="fig none">no gain posted</span>;
  }
  const point = postedGainPoint(planned, context.data.points);
  if (point?.deltaPct == null) {
    return (
      <span className="fig none" title={planned.gain}>
        not measured
      </span>
    );
  }
  return (
    <span className="fig gain" title={point.note}>
      {formatPct(point.deltaPct, point.approximate)}
      {point.beforeG != null && point.afterG != null ? (
        <span className="fig-sub">
          {formatG(point.beforeG)} → {formatG(point.afterG)}
        </span>
      ) : null}
    </span>
  );
}

/**
 * A step's cost as short figures: a package's KRW price with its USD
 * price and kind, or a power source's cost type and its grade at the
 * list's stage.
 *
 * @param props - the step and what the list reads
 * @returns the cost, or null when the step names neither
 */
export function CostFigure({ step, context }: { step: SpendingStep; context: StepContext }) {
  const { data, stage } = context;
  const pack = data.packages.find((p) => p.slug === step.packageSlug);
  if (pack) {
    const usd = usdPrice(pack);
    return (
      <span className="fig price">
        {formatKrw(pack.priceKrw)}
        <span className="fig-sub">{[usd?.text, pack.kind].filter(Boolean).join(" · ")}</span>
      </span>
    );
  }
  const source = data.sources.find((s) => s.slug === step.powerSource);
  if (!source) return null;
  return (
    <span className="cost-fig">
      <CostTag type={source.costType} />
      {efficiencyGrade(source.efficiency[stage]) === null ? null : (
        <GradePill note={source.efficiency[stage]} />
      )}
    </span>
  );
}

/**
 * One step: its power source or package and basis pill, the gain and the
 * cost as short figures, then what to do and why on one line (expanding
 * on demand), and its sources at the end.
 *
 * @param props - the step and what the list reads
 * @returns the step's list item
 */
function StepItem({ step, context }: { step: SpendingStep; context: StepContext }) {
  const { mode, data, index } = context;
  const planned = data.planner.find((p) => p.powerSource === step.powerSource);
  const words = [step.step, step.why, planned ? `Gain: ${planned.gain}` : null].filter(
    (w): w is string => Boolean(w),
  );
  const shared = new Set(context.shared ?? []);
  const chips = [...new Set([...step.sources, ...(planned?.sources ?? [])])].filter(
    (id) => !shared.has(id),
  );
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
          <BasisPill basis={step.basis} note={step.basisNote} />
        </div>
        <div className="step-figs">
          <GainFigure step={step} context={context} />
          <CostFigure step={step} context={context} />
        </div>
        {words.length ? (
          <div className="step-why">
            <Clamp lines={1}>{words.join(" · ")}</Clamp>
          </div>
        ) : null}
        <SourceChips ids={chips} sources={index} max={2} />
      </div>
    </li>
  );
}

/**
 * An order's note as a one-line callout: a pill saying it is a stated
 * order, the note clamped to a line, and its sources at the end.
 *
 * @param props - the order and the source index
 * @returns the callout, or null when the order has neither a note nor sources
 */
export function OrderNote({ order, index }: { order: SpendingOrder; index: SourceIndex }) {
  if (!order.note && !order.sources.length) return null;
  return (
    <div className="callout order-note">
      <Pill kind="claimed">Stated order</Pill>
      <span className="callout-body">
        {order.note ? <Clamp lines={1}>{order.note}</Clamp> : null}
      </span>
      <SourceChips ids={order.sources} sources={index} max={2} />
    </div>
  );
}

/**
 * An order's free and paid routes side by side, each as numbered steps
 * (see {@link StepItem}).
 *
 * @param props - the order's steps and what the list reads
 * @returns the two routes
 */
export function RouteColumns({
  steps,
  context,
}: {
  steps: readonly SpendingStep[];
  context: StepContext;
}) {
  return (
    <div className="routes">
      {(["free", "paid"] as const).map((route) => {
        const onRoute = steps.filter((s) => s.route === route);
        const heading = route === "free" ? "Free route" : "Paid route";
        return (
          <section key={route} className="route" aria-label={heading}>
            <h3>{heading}</h3>
            {onRoute.length ? (
              <ol className="steps">
                {onRoute.map((s) => (
                  <StepItem key={s.id} step={s} context={context} />
                ))}
              </ol>
            ) : (
              <EmptyState>No steps on this route.</EmptyState>
            )}
          </section>
        );
      })}
    </div>
  );
}
