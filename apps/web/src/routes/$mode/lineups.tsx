import { createFileRoute } from "@tanstack/react-router";
import { requireDungeon } from "../../app/mode-route";
import { DungeonLineupsView } from "../../views/DungeonLineupsView";

export const Route = createFileRoute("/$mode/lineups")({
  beforeLoad: ({ context, location }) => requireDungeon(context.mode, location.pathname),
  component: Lineups,
});

/**
 * Crumble Dungeon's published lineups.
 *
 * @returns the view
 */
function Lineups() {
  const { mode, dungeon } = Route.useRouteContext();
  return <DungeonLineupsView mode={mode} dungeon={dungeon} />;
}
