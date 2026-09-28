import { createFileRoute } from "@tanstack/react-router";
import { CONQUEST } from "../../app/modes";
import { useSearchPatch } from "../../app/search";
import type { RunesSearch } from "../../views/RunesView";
import { RunesView, validateRunesSearch } from "../../views/RunesView";

export const Route = createFileRoute("/conquest/runes")({
  validateSearch: validateRunesSearch,
  component: ConquestRunes,
});

/**
 * The Guild Conquest rune builds, with the deck and text filters in the URL.
 *
 * @returns the view
 */
function ConquestRunes() {
  const onSearch = useSearchPatch<RunesSearch>();
  return <RunesView mode={CONQUEST} search={Route.useSearch()} onSearch={onSearch} />;
}
