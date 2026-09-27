import { createFileRoute } from "@tanstack/react-router";
import { RUMBLE } from "../../app/modes";
import { EmptyState } from "../../components/EmptyState";

export const Route = createFileRoute("/rumble/")({
  component: () => <EmptyState>{RUMBLE.placeholder}</EmptyState>,
});
