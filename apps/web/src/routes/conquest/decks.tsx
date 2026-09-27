import { createFileRoute } from "@tanstack/react-router";
import { CONQUEST } from "../../app/modes";
import { DecksView } from "../../views/DecksView";

export const Route = createFileRoute("/conquest/decks")({
  component: () => <DecksView mode={CONQUEST} />,
});
