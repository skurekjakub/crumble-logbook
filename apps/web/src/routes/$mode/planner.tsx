import { createFileRoute } from "@tanstack/react-router";
import { requireTeamPower } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import { PowerPlannerView } from "../../views/PowerPlannerView";
import type { PowerSearch } from "../../views/StageBracketsView";
import { validatePowerSearch } from "../../views/StageBracketsView";

export const Route = createFileRoute("/$mode/planner")({
  validateSearch: validatePowerSearch,
  beforeLoad: ({ context, location }) => requireTeamPower(context.mode, location.pathname),
  component: Planner,
});

/**
 * The team-power mode's planner, with the typed power in the URL.
 *
 * @returns the view
 */
function Planner() {
  const { mode, teamPower } = Route.useRouteContext();
  const onSearch = useSearchPatch<PowerSearch>();
  return (
    <PowerPlannerView
      mode={mode}
      teamPower={teamPower}
      search={Route.useSearch()}
      onSearch={onSearch}
    />
  );
}
