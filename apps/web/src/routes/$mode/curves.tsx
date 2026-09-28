import { createFileRoute } from "@tanstack/react-router";
import { requireTeamPower } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { CurvesSearch } from "../../views/GrowthCurvesView";
import { GrowthCurvesView, validateCurvesSearch } from "../../views/GrowthCurvesView";

export const Route = createFileRoute("/$mode/curves")({
  validateSearch: validateCurvesSearch,
  beforeLoad: ({ context, location }) => requireTeamPower(context.mode, location.pathname),
  component: Curves,
});

/**
 * The team-power mode's growth curves, with the power source in the URL.
 *
 * @returns the view
 */
function Curves() {
  const { mode, teamPower } = Route.useRouteContext();
  const onSearch = useSearchPatch<CurvesSearch>();
  return (
    <GrowthCurvesView
      mode={mode}
      teamPower={teamPower}
      search={Route.useSearch()}
      onSearch={onSearch}
    />
  );
}
