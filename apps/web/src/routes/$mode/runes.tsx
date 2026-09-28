import { createFileRoute } from "@tanstack/react-router";
import { requireTab } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { RunesSearch } from "../../views/RunesView";
import { RunesView, validateRunesSearch } from "../../views/RunesView";

export const Route = createFileRoute("/$mode/runes")({
  validateSearch: validateRunesSearch,
  beforeLoad: ({ context, location }) => requireTab(context.mode, location.pathname),
  component: Runes,
});

/**
 * A mode's rune builds, with the deck and text filters in the URL.
 *
 * @returns the view
 */
function Runes() {
  const onSearch = useSearchPatch<RunesSearch>();
  return (
    <RunesView mode={Route.useRouteContext().mode} search={Route.useSearch()} onSearch={onSearch} />
  );
}
