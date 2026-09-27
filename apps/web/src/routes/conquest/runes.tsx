import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "../../components/Placeholder";

export const Route = createFileRoute("/conquest/runes")({
  component: () => <Placeholder title="Sugar runes" />,
});
