import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { GearView } from "../../views/GearView";

export const Route = createFileRoute("/arena/gear")({
  component: () => <GearView mode={ARENA} />,
});
