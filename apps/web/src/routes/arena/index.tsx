import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "../../components/EmptyState";

export const Route = createFileRoute("/arena/")({
  component: () => <EmptyState>Arena research in progress.</EmptyState>,
});
