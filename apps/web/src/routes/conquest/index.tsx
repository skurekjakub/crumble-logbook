import { createFileRoute } from "@tanstack/react-router";
import { CONQUEST } from "../../app/modes";
import { OverviewView } from "../../views/OverviewView";

export const Route = createFileRoute("/conquest/")({
  component: () => <OverviewView mode={CONQUEST} />,
});
