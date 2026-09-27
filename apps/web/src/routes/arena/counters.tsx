import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { CountersView } from "../../views/CountersView";

export const Route = createFileRoute("/arena/counters")({
  component: () => <CountersView mode={ARENA} />,
});
