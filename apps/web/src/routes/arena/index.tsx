import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { EmptyState } from "../../components/EmptyState";

export const Route = createFileRoute("/arena/")({
  component: () => <EmptyState>{ARENA.placeholder}</EmptyState>,
});
