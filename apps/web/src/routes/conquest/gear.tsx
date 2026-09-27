import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "../../components/Placeholder";

export const Route = createFileRoute("/conquest/gear")({
  component: () => <Placeholder title="Gear substats" />,
});
