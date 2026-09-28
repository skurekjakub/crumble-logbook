import { createFileRoute } from "@tanstack/react-router";
import { RUMBLE } from "../../app/modes";
import { TimelineView } from "../../views/TimelineView";

export const Route = createFileRoute("/rumble/timeline")({
  /**
   * Renders the Rumble Arena timeline view.
   *
   * @returns the view
   */
  component: () => <TimelineView mode={RUMBLE} />,
});
