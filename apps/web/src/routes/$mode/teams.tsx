import { createFileRoute } from "@tanstack/react-router";
import { requireTab } from "../../app/mode-route";
import { DecksView } from "../../views/DecksView";

export const Route = createFileRoute("/$mode/teams")({
  beforeLoad: ({ context, location }) => requireTab(context.mode, location.pathname),
  component: Teams,
});

/**
 * A mode's decks, for a mode whose tab calls them teams.
 *
 * @returns the view
 */
function Teams() {
  return <DecksView mode={Route.useRouteContext().mode} />;
}
