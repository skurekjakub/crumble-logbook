import { createFileRoute } from "@tanstack/react-router";
import { CONQUEST } from "../../app/modes";
import { MechanicsView } from "../../views/MechanicsView";

export const Route = createFileRoute("/conquest/mechanics")({
  component: () => <MechanicsView mode={CONQUEST} />,
});
