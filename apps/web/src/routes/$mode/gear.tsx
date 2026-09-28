import { createFileRoute } from "@tanstack/react-router";
import { requireTab } from "../../app/mode-route";
import { GearView } from "../../views/GearView";

export const Route = createFileRoute("/$mode/gear")({
  beforeLoad: ({ context, location }) => requireTab(context.mode, location.pathname),
  component: Gear,
});

/**
 * A mode's gear board.
 *
 * @returns the view
 */
function Gear() {
  return <GearView mode={Route.useRouteContext().mode} />;
}
