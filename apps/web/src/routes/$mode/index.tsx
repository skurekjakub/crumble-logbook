import { createFileRoute } from "@tanstack/react-router";
import { OverviewView } from "../../views/OverviewView";

export const Route = createFileRoute("/$mode/")({
  component: Overview,
});

/**
 * A mode's overview.
 *
 * @returns the view
 */
function Overview() {
  return <OverviewView mode={Route.useRouteContext().mode} />;
}
