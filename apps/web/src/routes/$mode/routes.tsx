import { createFileRoute } from "@tanstack/react-router";
import { requireTeamPower } from "../../app/mode-route";
import { TeamPowerRoutesView } from "../../views/TeamPowerRoutesView";

export const Route = createFileRoute("/$mode/routes")({
  beforeLoad: ({ context, location }) => requireTeamPower(context.mode, location.pathname),
  component: Routes,
});

/**
 * The team-power mode's free and paid routes.
 *
 * @returns the view
 */
function Routes() {
  const { mode, teamPower } = Route.useRouteContext();
  return <TeamPowerRoutesView mode={mode} teamPower={teamPower} />;
}
