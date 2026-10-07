import { useSourceIndex } from "../api/hooks";
import type { ModeSection, TeamPowerConfig } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { ViewHeader } from "../components/ViewHeader";
import { optionalText } from "../lib/search";
import type { EfficiencyStage } from "../lib/team-power";
import { EFFICIENCY_STAGES } from "../lib/team-power";
import { TeamPowerLoaded, useTeamPowerData } from "./TeamPowerData";
import { BasisKey, Switch, useDropUnknown } from "./TeamPowerParts";
import { OrderNote, RouteColumns } from "./TeamPowerSteps";

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
 * The account stage a stage order's power sources are graded at: the
 * order's own stage when the record grades one by that name, near 2.2G
 * otherwise (the endgame and the Rift).
 *
 * @param slug - the order's slug
 * @returns the efficiency stage
 */
export function stageOf(slug: string): EfficiencyStage {
  return EFFICIENCY_STAGES.find(([s]) => s === slug)?.[0] ?? "at22g";
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
 * and paid routes as numbered steps, each with its basis pill, its gain
 * and cost as short figures (graded at the stage) and its why on one line.
 *
 * @param props - the mode, its team-power config, the search params and their setter
 * @returns the view
 */
export function SpendingOrderView({ mode, teamPower, search, onSearch }: SpendingOrderViewProps) {
  const index = useSourceIndex();
  const state = useTeamPowerData();
  const { title, lede } = teamPower.spending;
  const known =
    state.status === "ready"
      ? state.data.orders.filter((o) => o.kind === "stage").map((o) => o.slug)
      : undefined;
  useDropUnknown(search.order, known, () => onSearch({ order: undefined }));
  return (
    <>
      <ViewHeader title={title} lede={lede} />
      <BasisKey />
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
              <h3 className="order-title">
                {shortLabel(order.label)}
                {order.label !== shortLabel(order.label) ? (
                  <span className="muted">
                    {" "}
                    {order.label.slice(shortLabel(order.label).length + 1)}
                  </span>
                ) : null}
              </h3>
              <OrderNote order={order} index={index} />
              <RouteColumns
                steps={steps}
                context={{ mode, data, index, stage: stageOf(order.slug), shared: order.sources }}
              />
            </>
          );
        }}
      </TeamPowerLoaded>
    </>
  );
}
