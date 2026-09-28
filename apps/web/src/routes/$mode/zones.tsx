import { createFileRoute } from "@tanstack/react-router";
import { requireStage } from "../../app/mode-route";
import { StageZonesView } from "../../views/StageZonesView";

export const Route = createFileRoute("/$mode/zones")({
  beforeLoad: ({ context, location }) => requireStage(context.mode, location.pathname),
  component: Zones,
});

/**
 * The stage mode's zone and boss-slot board.
 *
 * @returns the view
 */
function Zones() {
  const { mode, stage } = Route.useRouteContext();
  return <StageZonesView mode={mode} stage={stage} />;
}
