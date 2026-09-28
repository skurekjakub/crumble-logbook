import { createFileRoute } from "@tanstack/react-router";
import { requireStage } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { RiftSearch } from "../../views/RiftView";
import { RiftView, validateRiftSearch } from "../../views/RiftView";

export const Route = createFileRoute("/$mode/rift")({
  validateSearch: validateRiftSearch,
  beforeLoad: ({ context, location }) => requireStage(context.mode, location.pathname),
  component: Rift,
});

/**
 * The stage mode's Dimensional Rift page, with the typed power and the season in the URL.
 *
 * @returns the view
 */
function Rift() {
  const { mode, stage } = Route.useRouteContext();
  const onSearch = useSearchPatch<RiftSearch>();
  return <RiftView mode={mode} stage={stage} search={Route.useSearch()} onSearch={onSearch} />;
}
