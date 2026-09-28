import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { OverviewView } from "../../views/OverviewView";

export const Route = createFileRoute("/arena/")({
  /**
   * Renders the Arena overview.
   *
   * @returns the view
   */
  component: () => <OverviewView mode={ARENA} />,
});
