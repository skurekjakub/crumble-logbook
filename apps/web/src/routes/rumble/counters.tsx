import { createFileRoute } from "@tanstack/react-router";
import { RUMBLE } from "../../app/modes";
import { CountersView } from "../../views/CountersView";

export const Route = createFileRoute("/rumble/counters")({
  /**
   * Renders the Rumble Arena counters view.
   *
   * @returns the view
   */
  component: () => <CountersView mode={RUMBLE} />,
});
