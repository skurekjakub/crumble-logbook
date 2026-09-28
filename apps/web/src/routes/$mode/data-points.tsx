import { createFileRoute } from "@tanstack/react-router";
import { requireTeamPower } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { DataPointsSearch } from "../../views/PowerDataPointsView";
import { PowerDataPointsView, validateDataPointsSearch } from "../../views/PowerDataPointsView";

export const Route = createFileRoute("/$mode/data-points")({
  validateSearch: validateDataPointsSearch,
  beforeLoad: ({ context, location }) => requireTeamPower(context.mode, location.pathname),
  component: DataPoints,
});

/**
 * The team-power mode's data points, with the kind, power source and text filters in the URL.
 *
 * @returns the view
 */
function DataPoints() {
  const { mode, teamPower } = Route.useRouteContext();
  const onSearch = useSearchPatch<DataPointsSearch>();
  return (
    <PowerDataPointsView
      mode={mode}
      teamPower={teamPower}
      search={Route.useSearch()}
      onSearch={onSearch}
    />
  );
}
