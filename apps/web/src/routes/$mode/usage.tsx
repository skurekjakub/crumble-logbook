import { createFileRoute } from "@tanstack/react-router";
import { requireTab } from "../../app/mode-route";
import { UsageView } from "../../views/UsageView";

export const Route = createFileRoute("/$mode/usage")({
  beforeLoad: ({ context, location }) => requireTab(context.mode, location.pathname),
  component: Usage,
});

/**
 * A mode's usage figures.
 *
 * @returns the view
 */
function Usage() {
  return <UsageView mode={Route.useRouteContext().mode} />;
}
