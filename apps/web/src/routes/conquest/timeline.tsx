import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "../../components/Placeholder";

export const Route = createFileRoute("/conquest/timeline")({
  component: () => <Placeholder title="Timeline" />,
});
