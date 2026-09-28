import { createFileRoute } from "@tanstack/react-router";
import { requireTab } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { ScoresSearch } from "../../views/ScoresView";
import { ScoresView, scoresSearchFor } from "../../views/ScoresView";

export const Route = createFileRoute("/$mode/scores")({
  // Which `?board=` values are usable depends on the mode, which the search
  // validator can't see; the component reads them through the mode's reader.
  validateSearch: (search: Record<string, unknown>) => search,
  beforeLoad: ({ context, location }) => requireTab(context.mode, location.pathname),
  component: Scores,
});

/**
 * A mode's scores and leaderboard, with the deck, season and board in the URL.
 *
 * @returns the view
 */
function Scores() {
  const { mode } = Route.useRouteContext();
  const onSearch = useSearchPatch<ScoresSearch>();
  const search = scoresSearchFor(mode)(Route.useSearch());
  return <ScoresView mode={mode} search={search} onSearch={onSearch} />;
}
