import { useSourceIndex } from "../api/hooks";
import type { SpendingStep } from "../api/types";
import type { ModeSection, TeamPowerConfig } from "../app/modes";
import { BasisLegend, BasisMark } from "../components/BasisMark";
import { EmptyState } from "../components/EmptyState";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";
import { optionalText } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import type { TeamPowerData } from "./TeamPowerData";
import { TeamPowerLoaded, useTeamPowerData } from "./TeamPowerData";
import { PackageLink, PowerSourceLink, Switch } from "./TeamPowerParts";

/** The spending order page's search params: the order shown, by slug. */
export interface SpendingSearch {
  order?: string;
}

/**
 * Reads the spending order page's search params.
 *
 * @param search - the decoded query values
 * @returns the order's slug, when there is one
 */
export function validateSpendingSearch(search: Record<string, unknown>): SpendingSearch {
  return { order: optionalText(search.order) };
}

/**
 * An account stage's label cut to its first clause, for the switch:
 * "Stages 168–248 (rewards drop …)" → "Stages 168–248".
 *
 * @param label - the order's label
 * @returns the short label
 */
export function shortLabel(label: string): string {
  return label.split(" (")[0]!;
}

/**
 * One step of an account stage's order: what to do, its basis, what it
 * spends on, why it sits there and its sources.
 *
 * @param props - the step, the mode, the lists and the source index
 * @returns the step's list item
 */
function OrderStep({
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
  return (
    <li>
      <div>
        <div>{step.step}</div>
        <div className="step-head">
          <BasisMark basis={step.basis} note={step.basisNote} />
          <span className="muted">
            On{" "}
            {step.packageSlug === null ? (
              <PowerSourceLink mode={mode} slug={step.powerSource!} sources={data.sources} />
            ) : (
              <PackageLink mode={mode} slug={step.packageSlug} packages={data.packages} />
            )}
          </span>
        </div>
        {step.why ? <div className="muted">{step.why}</div> : null}
        <SourceChips ids={step.sources} sources={index} />
      </div>
    </li>
  );
}

/** Props for {@link SpendingOrderView}. */
export interface SpendingOrderViewProps {
  /** The team-power mode. */
  mode: ModeSection;
  /** Its team-power screens' config. */
  teamPower: TeamPowerConfig;
  /** The current search params. */
  search: SpendingSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: SpendingSearch) => void;
}

/**
 * The spending order for an account stage: a switch of the stages (in the
 * URL as `?order=`, the config's stage by default), then the stage's free
 * and paid routes as numbered steps, each with its basis mark.
 *
 * @param props - the mode, its team-power config, the search params and their setter
 * @returns the view
 */
export function SpendingOrderView({ mode, teamPower, search, onSearch }: SpendingOrderViewProps) {
  const index = useSourceIndex();
  const state = useTeamPowerData();
  const { title, lede } = teamPower.spending;
  return (
    <>
      <ViewHeader title={title} lede={lede} />
      <BasisLegend />
      <TeamPowerLoaded state={state}>
        {(data) => {
          const stages = data.orders.filter((o) => o.kind === "stage");
          const order =
            stages.find((o) => o.slug === search.order) ??
            stages.find((o) => o.slug === teamPower.defaultOrder) ??
            stages[0];
          if (!order) return <EmptyState>No spending order recorded yet.</EmptyState>;
          const steps = data.steps.filter((s) => s.orderSlug === order.slug);
          return (
            <>
              <Switch
                label="Account stage"
                options={stages.map((o) => [o.slug, shortLabel(o.label)] as const)}
                value={order.slug}
                onChange={(slug) =>
                  onSearch({ order: slug === teamPower.defaultOrder ? undefined : slug })
                }
              />
              <h3>{order.label}</h3>
              {order.note ? <div className="note">{order.note}</div> : null}
              <div className="routes">
                {(["free", "paid"] as const).map((route) => {
                  const onRoute = steps.filter((s) => s.route === route);
                  const heading = route === "free" ? "Free" : "Paid";
                  return (
                    <section key={route} className="card" aria-label={heading}>
                      <h3>{heading}</h3>
                      {onRoute.length ? (
                        <ol className="steps">
                          {onRoute.map((s) => (
                            <OrderStep key={s.id} step={s} mode={mode} data={data} index={index} />
                          ))}
                        </ol>
                      ) : (
                        <EmptyState>No steps on this route.</EmptyState>
                      )}
                    </section>
                  );
                })}
              </div>
            </>
          );
        }}
      </TeamPowerLoaded>
    </>
  );
}
