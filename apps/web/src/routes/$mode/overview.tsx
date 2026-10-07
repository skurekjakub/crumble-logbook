import { createFileRoute } from "@tanstack/react-router";
import { requireTab } from "../../app/mode-route";
import { OverviewView } from "../../views/OverviewView";

export const Route = createFileRoute("/$mode/overview")({
  beforeLoad: ({ context, location }) => requireTab(context.mode, location.pathname),
  component: Overview,
});

/**
 * The overview of a mode whose landing page is another screen (the daily
 * dungeon board), for the modes that list it among their tabs.
 *
 * @returns the view
 */
function Overview() {
  return <OverviewView mode={Route.useRouteContext().mode} />;
}
