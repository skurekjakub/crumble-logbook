import { createFileRoute } from "@tanstack/react-router";
import { resolveMode } from "../app/mode-route";

export const Route = createFileRoute("/$mode")({
  beforeLoad: ({ params }) => resolveMode(params.mode),
});
