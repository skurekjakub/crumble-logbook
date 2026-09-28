import { createFileRoute } from "@tanstack/react-router";
import { RUMBLE } from "../../app/modes";
import { MechanicsView } from "../../views/MechanicsView";

export const Route = createFileRoute("/rumble/mechanics")({
  component: () => <MechanicsView mode={RUMBLE} />,
});
