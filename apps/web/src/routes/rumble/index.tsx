import { createFileRoute } from "@tanstack/react-router";
import { RUMBLE } from "../../app/modes";
import { OverviewView } from "../../views/OverviewView";

export const Route = createFileRoute("/rumble/")({
  component: () => <OverviewView mode={RUMBLE} />,
});
