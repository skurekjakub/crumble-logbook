import { createFileRoute } from "@tanstack/react-router";
import { requireDungeon } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { RunsSearch } from "../../views/DungeonRunsView";
import { DungeonRunsView, validateRunsSearch } from "../../views/DungeonRunsView";

export const Route = createFileRoute("/$mode/runs")({
  validateSearch: validateRunsSearch,
  beforeLoad: ({ context, location }) => requireDungeon(context.mode, location.pathname),
  component: Runs,
});

/**
 * Crumble Dungeon's runs board, with the board, evidence and text filters in the URL.
 *
 * @returns the view
 */
function Runs() {
  const { mode, dungeon } = Route.useRouteContext();
  const onSearch = useSearchPatch<RunsSearch>();
  return (
    <DungeonRunsView mode={mode} dungeon={dungeon} search={Route.useSearch()} onSearch={onSearch} />
  );
}
