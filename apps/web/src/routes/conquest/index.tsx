import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "../../components/Placeholder";

export const Route = createFileRoute("/conquest/")({
  component: () => <Placeholder title="What the top players do" />,
});
