import { createFileRoute } from "@tanstack/react-router";
import { RUMBLE } from "../../app/modes";
import { DecksView } from "../../views/DecksView";

export const Route = createFileRoute("/rumble/teams")({
  /**
   * Renders the Rumble Arena teams view.
   *
   * @returns the view
   */
  component: () => <DecksView mode={RUMBLE} />,
});
