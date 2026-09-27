import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { MechanicsView } from "../../views/MechanicsView";

export const Route = createFileRoute("/arena/mechanics")({
  component: () => <MechanicsView mode={ARENA} />,
});
