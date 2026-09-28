import { createFileRoute } from "@tanstack/react-router";
import { RUMBLE } from "../../app/modes";
import { GearView } from "../../views/GearView";

export const Route = createFileRoute("/rumble/gear")({
  /**
   * Renders the Rumble Arena gear view.
   *
   * @returns the view
   */
  component: () => <GearView mode={RUMBLE} />,
});
