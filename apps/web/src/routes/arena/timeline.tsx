import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { TimelineView } from "../../views/TimelineView";

export const Route = createFileRoute("/arena/timeline")({
  /**
   * Renders the Arena timeline view.
   *
   * @returns the view
   */
  component: () => <TimelineView mode={ARENA} />,
});
