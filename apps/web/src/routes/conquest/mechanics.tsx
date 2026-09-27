import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "../../components/Placeholder";

export const Route = createFileRoute("/conquest/mechanics")({
  component: () => <Placeholder title="Mechanics" />,
});
