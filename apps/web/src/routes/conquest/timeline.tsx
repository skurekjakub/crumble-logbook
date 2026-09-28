import { createFileRoute } from "@tanstack/react-router";
import { CONQUEST } from "../../app/modes";
import { TimelineView } from "../../views/TimelineView";

export const Route = createFileRoute("/conquest/timeline")({
  /**
   * Renders the Guild Conquest timeline view.
   *
   * @returns the view
   */
  component: () => <TimelineView mode={CONQUEST} />,
});
