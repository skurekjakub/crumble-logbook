import { createFileRoute } from "@tanstack/react-router";
import { CONQUEST } from "../../app/modes";
import { MechanicsView } from "../../views/MechanicsView";

export const Route = createFileRoute("/conquest/mechanics")({
  /**
   * Renders the Guild Conquest mechanics view.
   *
   * @returns the view
   */
  component: () => <MechanicsView mode={CONQUEST} />,
});
