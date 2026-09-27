import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "../../components/Placeholder";

export const Route = createFileRoute("/conquest/scores")({
  component: () => <Placeholder title="Scores and RNG" />,
});
