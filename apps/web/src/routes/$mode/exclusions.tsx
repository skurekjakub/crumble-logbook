import { createFileRoute } from "@tanstack/react-router";
import { requireDungeon } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { ExclusionsSearch } from "../../views/DungeonExclusionsView";
import { DungeonExclusionsView, validateExclusionsSearch } from "../../views/DungeonExclusionsView";

export const Route = createFileRoute("/$mode/exclusions")({
  validateSearch: validateExclusionsSearch,
  beforeLoad: ({ context, location }) => requireDungeon(context.mode, location.pathname),
  component: Exclusions,
});

/**
 * Crumble Dungeon's exclusions list, with the kind and status filters in the URL.
 *
 * @returns the view
 */
function Exclusions() {
  const { mode, dungeon } = Route.useRouteContext();
  const onSearch = useSearchPatch<ExclusionsSearch>();
  return (
    <DungeonExclusionsView
      mode={mode}
      dungeon={dungeon}
      search={Route.useSearch()}
      onSearch={onSearch}
    />
  );
}
