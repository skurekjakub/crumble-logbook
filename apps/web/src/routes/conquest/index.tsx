import { createFileRoute } from "@tanstack/react-router";
import { CONQUEST } from "../../app/modes";
import { OverviewView } from "../../views/OverviewView";

export const Route = createFileRoute("/conquest/")({
  /**
   * Renders the Guild Conquest overview.
   *
   * @returns the view
   */
  component: () => <OverviewView mode={CONQUEST} />,
});
