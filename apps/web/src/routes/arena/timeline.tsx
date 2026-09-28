import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { TimelineView } from "../../views/TimelineView";

export const Route = createFileRoute("/arena/timeline")({
  component: () => <TimelineView mode={ARENA} />,
});
