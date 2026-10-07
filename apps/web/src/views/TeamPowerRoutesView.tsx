import { useSourceIndex } from "../api/hooks";
import type { SpendingOrder, SpendingStep } from "../api/types";
import type { ModeSection, TeamPowerConfig } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { ViewHeader } from "../components/ViewHeader";
import type { SourceIndex } from "../lib/sources";
import type { TeamPowerData } from "./TeamPowerData";
import { TeamPowerLoaded, useTeamPowerData } from "./TeamPowerData";
import { BasisKey } from "./TeamPowerParts";
import { OrderNote, RouteColumns } from "./TeamPowerSteps";

/**
 * One ranked order: its note as a callout, then the free and the paid
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
      <OrderNote order={order} index={index} />
      <RouteColumns
        steps={steps}
        context={{ mode, data, index, stage: "at22g", shared: order.sources }}
      />
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
 * its paid route as numbered steps, each with its basis pill, the gain the
 * record ties to it and its cost or price as short figures, and the why
 * on one line.
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
      <BasisKey />
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
