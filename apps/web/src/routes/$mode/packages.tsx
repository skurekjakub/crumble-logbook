import { createFileRoute } from "@tanstack/react-router";
import { requireTeamPower } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { PackagesSearch } from "../../views/PackagesView";
import { PackagesView, validatePackagesSearch } from "../../views/PackagesView";

export const Route = createFileRoute("/$mode/packages")({
  validateSearch: validatePackagesSearch,
  beforeLoad: ({ context, location }) => requireTeamPower(context.mode, location.pathname),
  component: Packages,
});

/**
 * The team-power mode's packages, with the spender tier and text filters in the URL.
 *
 * @returns the view
 */
function Packages() {
  const { mode, teamPower } = Route.useRouteContext();
  const onSearch = useSearchPatch<PackagesSearch>();
  return (
    <PackagesView
      mode={mode}
      teamPower={teamPower}
      search={Route.useSearch()}
      onSearch={onSearch}
    />
  );
}
