import { createFileRoute } from "@tanstack/react-router";
import { requireStage } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { RiftClearsSearch } from "../../views/RiftClearsView";
import { RiftClearsView, validateRiftClearsSearch } from "../../views/RiftClearsView";

export const Route = createFileRoute("/$mode/rift-15")({
  validateSearch: validateRiftClearsSearch,
  beforeLoad: ({ context, location }) => requireStage(context.mode, location.pathname),
  component: RiftClears,
});

/**
 * The stage mode's Dimensional Rift clears at 15%, with the result and text filters in the URL.
 *
 * @returns the view
 */
function RiftClears() {
  const { mode, stage } = Route.useRouteContext();
  const onSearch = useSearchPatch<RiftClearsSearch>();
  return (
    <RiftClearsView mode={mode} stage={stage} search={Route.useSearch()} onSearch={onSearch} />
  );
}
