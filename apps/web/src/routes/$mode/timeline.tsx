import { createFileRoute } from "@tanstack/react-router";
import { requireTab } from "../../app/mode-route";
import { TimelineView } from "../../views/TimelineView";

export const Route = createFileRoute("/$mode/timeline")({
  beforeLoad: ({ context, location }) => requireTab(context.mode, location.pathname),
  component: Timeline,
});

/**
 * A mode's timeline.
 *
 * @returns the view
 */
function Timeline() {
  return <TimelineView mode={Route.useRouteContext().mode} />;
}
