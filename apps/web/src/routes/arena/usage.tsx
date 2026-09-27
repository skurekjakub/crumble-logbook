import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { UsageView } from "../../views/UsageView";

export const Route = createFileRoute("/arena/usage")({
  component: () => <UsageView mode={ARENA} />,
});
