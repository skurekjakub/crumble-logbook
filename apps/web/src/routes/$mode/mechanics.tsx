import { createFileRoute } from "@tanstack/react-router";
import { requireTab } from "../../app/mode-route";
import { MechanicsView } from "../../views/MechanicsView";

export const Route = createFileRoute("/$mode/mechanics")({
  beforeLoad: ({ context, location }) => requireTab(context.mode, location.pathname),
  component: Mechanics,
});

/**
 * A mode's mechanics.
 *
 * @returns the view
 */
function Mechanics() {
  return <MechanicsView mode={Route.useRouteContext().mode} />;
}
