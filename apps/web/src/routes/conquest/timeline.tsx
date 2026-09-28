import { createFileRoute } from "@tanstack/react-router";
import { CONQUEST } from "../../app/modes";
import { TimelineView } from "../../views/TimelineView";

export const Route = createFileRoute("/conquest/timeline")({
  component: () => <TimelineView mode={CONQUEST} />,
});
