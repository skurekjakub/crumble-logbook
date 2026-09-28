import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { CountersView } from "../../views/CountersView";

export const Route = createFileRoute("/arena/counters")({
  /**
   * Renders the Arena counters view.
   *
   * @returns the view
   */
  component: () => <CountersView mode={ARENA} />,
});
