import { createFileRoute } from "@tanstack/react-router";
import { CONQUEST } from "../../app/modes";
import { useSearchPatch } from "../../app/search";
import type { ScoresSearch } from "../../views/ScoresView";
import { ScoresView, scoresSearchFor } from "../../views/ScoresView";

export const Route = createFileRoute("/conquest/scores")({
  validateSearch: scoresSearchFor(CONQUEST),
  component: ConquestScores,
});

/** The Guild Conquest scores and leaderboard, with the deck, season and board in the URL. */
function ConquestScores() {
  const onSearch = useSearchPatch<ScoresSearch>();
  return <ScoresView mode={CONQUEST} search={Route.useSearch()} onSearch={onSearch} />;
}
