import { createFileRoute } from "@tanstack/react-router";
import { requireTab } from "../../app/mode-route";
import { DecksView } from "../../views/DecksView";

export const Route = createFileRoute("/$mode/decks")({
  beforeLoad: ({ context, location }) => requireTab(context.mode, location.pathname),
  component: Decks,
});

/**
 * A mode's decks, for a mode whose tab calls them decks.
 *
 * @returns the view
 */
function Decks() {
  return <DecksView mode={Route.useRouteContext().mode} />;
}
