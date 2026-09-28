import { createFileRoute } from "@tanstack/react-router";
import { requireTeamPower } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { PowerSourcesSearch } from "../../views/PowerSourcesView";
import { PowerSourcesView, validatePowerSourcesSearch } from "../../views/PowerSourcesView";

export const Route = createFileRoute("/$mode/power-sources")({
  validateSearch: validatePowerSourcesSearch,
  beforeLoad: ({ context, location }) => requireTeamPower(context.mode, location.pathname),
  component: PowerSources,
});

/**
 * The team-power mode's cost and efficiency page, with the account stage in the URL.
 *
 * @returns the view
 */
function PowerSources() {
  const { mode, teamPower } = Route.useRouteContext();
  const onSearch = useSearchPatch<PowerSourcesSearch>();
  return (
    <PowerSourcesView
      mode={mode}
      teamPower={teamPower}
      search={Route.useSearch()}
      onSearch={onSearch}
    />
  );
}
