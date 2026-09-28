import { createFileRoute } from "@tanstack/react-router";
import { CONQUEST } from "../../app/modes";
import { GearView } from "../../views/GearView";

export const Route = createFileRoute("/conquest/gear")({
  /**
   * Renders the Guild Conquest gear view.
   *
   * @returns the view
   */
  component: () => <GearView mode={CONQUEST} />,
});
