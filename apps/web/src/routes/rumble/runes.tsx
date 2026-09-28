import { createFileRoute } from "@tanstack/react-router";
import { RUMBLE } from "../../app/modes";
import { useSearchPatch } from "../../app/search";
import type { RunesSearch } from "../../views/RunesView";
import { RunesView, validateRunesSearch } from "../../views/RunesView";

export const Route = createFileRoute("/rumble/runes")({
  validateSearch: validateRunesSearch,
  component: RumbleRunes,
});

/**
 * The Rumble Arena rune builds, with the deck and text filters in the URL.
 *
 * @returns the view
 */
function RumbleRunes() {
  const onSearch = useSearchPatch<RunesSearch>();
  return <RunesView mode={RUMBLE} search={Route.useSearch()} onSearch={onSearch} />;
}
