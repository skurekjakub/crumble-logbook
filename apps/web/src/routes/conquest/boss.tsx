import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "../../components/Placeholder";

export const Route = createFileRoute("/conquest/boss")({
  component: () => <Placeholder title="Extra Stuffed Piñata" />,
});
