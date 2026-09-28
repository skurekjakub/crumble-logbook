import { createFileRoute } from "@tanstack/react-router";
import { requireTeamPower } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { SpendingSearch } from "../../views/SpendingOrderView";
import { SpendingOrderView, validateSpendingSearch } from "../../views/SpendingOrderView";

export const Route = createFileRoute("/$mode/spending")({
  validateSearch: validateSpendingSearch,
  beforeLoad: ({ context, location }) => requireTeamPower(context.mode, location.pathname),
  component: Spending,
});

/**
 * The team-power mode's spending order, with the account stage in the URL.
 *
 * @returns the view
 */
function Spending() {
  const { mode, teamPower } = Route.useRouteContext();
  const onSearch = useSearchPatch<SpendingSearch>();
  return (
    <SpendingOrderView
      mode={mode}
      teamPower={teamPower}
      search={Route.useSearch()}
      onSearch={onSearch}
    />
  );
}
