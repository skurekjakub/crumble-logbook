import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { UsageView } from "../../views/UsageView";

export const Route = createFileRoute("/arena/usage")({
  /**
   * Renders the Arena usage view.
   *
   * @returns the view
   */
  component: () => <UsageView mode={ARENA} />,
});
