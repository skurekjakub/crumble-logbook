import { createFileRoute } from "@tanstack/react-router";
import { RUMBLE } from "../../app/modes";
import { MechanicsView } from "../../views/MechanicsView";

export const Route = createFileRoute("/rumble/mechanics")({
  /**
   * Renders the Rumble Arena mechanics view.
   *
   * @returns the view
   */
  component: () => <MechanicsView mode={RUMBLE} />,
});
