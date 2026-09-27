import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "../../components/EmptyState";

export const Route = createFileRoute("/rumble/")({
  component: () => <EmptyState>Rumble Arena research in progress.</EmptyState>,
});
