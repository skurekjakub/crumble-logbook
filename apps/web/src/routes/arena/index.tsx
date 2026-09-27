import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { OverviewView } from "../../views/OverviewView";

export const Route = createFileRoute("/arena/")({
  component: () => <OverviewView mode={ARENA} />,
});
