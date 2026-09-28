import { createFileRoute } from "@tanstack/react-router";
import { RUMBLE } from "../../app/modes";
import { UsageView } from "../../views/UsageView";

export const Route = createFileRoute("/rumble/usage")({
  /**
   * Renders the Rumble Arena usage view.
   *
   * @returns the view
   */
  component: () => <UsageView mode={RUMBLE} />,
});
