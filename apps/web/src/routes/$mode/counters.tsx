import { createFileRoute } from "@tanstack/react-router";
import { requireTab } from "../../app/mode-route";
import { CountersView } from "../../views/CountersView";

export const Route = createFileRoute("/$mode/counters")({
  beforeLoad: ({ context, location }) => requireTab(context.mode, location.pathname),
  component: Counters,
});

/**
 * A mode's counter matrix.
 *
 * @returns the view
 */
function Counters() {
  return <CountersView mode={Route.useRouteContext().mode} />;
}
