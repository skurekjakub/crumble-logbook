import { createFileRoute } from "@tanstack/react-router";
import { RUMBLE } from "../../app/modes";
import { UsageView } from "../../views/UsageView";

export const Route = createFileRoute("/rumble/usage")({
  component: () => <UsageView mode={RUMBLE} />,
});
