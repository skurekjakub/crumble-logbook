import { useQueries } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  growthCurvesQuery,
  packagesQuery,
  plannerStepsQuery,
  powerDataPointsQuery,
  powerSourcesQuery,
  priceTiersQuery,
  spendingOrdersQuery,
  spendingStepsQuery,
} from "../api/queries";
import type {
  GrowthCurve,
  PlannerStep,
  PowerDataPoint,
  PowerSource,
  PriceTier,
  ShopPackage,
  SpendingOrder,
  SpendingStep,
} from "../api/types";
import { EmptyState } from "../components/EmptyState";
import { ErrorBox } from "../components/ErrorBox";

/** Every team-power list, loaded. */
export interface TeamPowerData {
  sources: readonly PowerSource[];
  points: readonly PowerDataPoint[];
  packages: readonly ShopPackage[];
  tiers: readonly PriceTier[];
  orders: readonly SpendingOrder[];
  steps: readonly SpendingStep[];
  curves: readonly GrowthCurve[];
  planner: readonly PlannerStep[];
}

/** The team-power lists as they load: all pending, one failed, or all loaded. */
export type TeamPowerState =
  | { status: "pending" }
  | { status: "error"; resource: string; error: unknown }
  | { status: "ready"; data: TeamPowerData };

/** What each list is called in the loading and error states, in the order they load. */
const RESOURCES = [
  "power sources",
  "data points",
  "packages",
  "price tiers",
  "spending orders",
  "spending steps",
  "growth curves",
  "planner steps",
] as const;

/**
 * Loads every team-power list together: the screens cross-reference them
 * by slug, so each shows once all have loaded.
 *
 * @returns the lists' combined state
 */
export function useTeamPowerData(): TeamPowerState {
  return useQueries({
    queries: [
      powerSourcesQuery(),
      powerDataPointsQuery(),
      packagesQuery(),
      priceTiersQuery(),
      spendingOrdersQuery(),
      spendingStepsQuery(),
      growthCurvesQuery(),
      plannerStepsQuery(),
    ],
    combine: (results): TeamPowerState => {
      const failed = results.findIndex((r) => r.isError);
      if (failed !== -1) {
        return { status: "error", resource: RESOURCES[failed]!, error: results[failed]!.error };
      }
      const [sources, points, packages, tiers, orders, steps, curves, planner] = results;
      if (
        !sources.data ||
        !points.data ||
        !packages.data ||
        !tiers.data ||
        !orders.data ||
        !steps.data ||
        !curves.data ||
        !planner.data
      ) {
        return { status: "pending" };
      }
      return {
        status: "ready",
        data: {
          sources: sources.data,
          points: points.data,
          packages: packages.data,
          tiers: tiers.data,
          orders: orders.data,
          steps: steps.data,
          curves: curves.data,
          planner: planner.data,
        },
      };
    },
  });
}

/** Props for {@link TeamPowerLoaded}. */
export interface TeamPowerLoadedProps {
  /** The lists' combined state. */
  state: TeamPowerState;
  /** Renders the loaded lists. */
  children: (data: TeamPowerData) => ReactNode;
}

/**
 * Renders the team-power lists' states: "Loading …" while any is pending,
 * an error box naming the first that failed, and `children(data)` once
 * all have loaded.
 *
 * @param props - the combined state and the render function
 * @returns the loading state, the error box, or the rendered lists
 */
export function TeamPowerLoaded({ state, children }: TeamPowerLoadedProps) {
  if (state.status === "error") return <ErrorBox resource={state.resource} error={state.error} />;
  if (state.status === "pending") return <EmptyState>Loading team power…</EmptyState>;
  return <>{children(state.data)}</>;
}
