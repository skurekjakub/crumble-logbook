import { createFileRoute } from "@tanstack/react-router";
import { ARENA } from "../../app/modes";
import { useSearchPatch } from "../../app/search";
import type { RunesSearch } from "../../views/RunesView";
import { RunesView, validateRunesSearch } from "../../views/RunesView";

export const Route = createFileRoute("/arena/runes")({
  validateSearch: validateRunesSearch,
  component: ArenaRunes,
});

/** The Arena rune builds, with the deck and text filters in the URL. */
function ArenaRunes() {
  const onSearch = useSearchPatch<RunesSearch>();
  return <RunesView mode={ARENA} search={Route.useSearch()} onSearch={onSearch} />;
}
