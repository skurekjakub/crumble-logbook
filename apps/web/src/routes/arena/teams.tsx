import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { DecksView } from "../../views/DecksView";

export const Route = createFileRoute("/arena/teams")({
  /**
   * Renders the Arena teams view.
   *
   * @returns the view
   */
  component: () => <DecksView mode={ARENA} />,
});
