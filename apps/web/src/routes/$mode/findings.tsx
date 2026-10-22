import { createFileRoute } from "@tanstack/react-router";
import { requireTab } from "../../app/mode-route";
import { OverviewView } from "../../views/OverviewView";

export const Route = createFileRoute("/$mode/findings")({
  beforeLoad: ({ context, location }) => requireTab(context.mode, location.pathname),
  component: Findings,
});

/**
 * A mode's research findings, for the modes that list the page among their
 * tabs: its rules, its ranked takeaways and the advice for the reader's account.
 *
 * @returns the view
 */
function Findings() {
  return <OverviewView mode={Route.useRouteContext().mode} />;
}
