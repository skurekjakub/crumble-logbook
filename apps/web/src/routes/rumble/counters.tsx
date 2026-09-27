import { createFileRoute } from "@tanstack/react-router";
import { RUMBLE } from "../../app/modes";
import { CountersView } from "../../views/CountersView";

export const Route = createFileRoute("/rumble/counters")({
  component: () => <CountersView mode={RUMBLE} />,
});
