import { createFileRoute } from "@tanstack/react-router";
import { requireStage } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { ClearsSearch } from "../../views/StageClearsView";
import { StageClearsView, validateClearsSearch } from "../../views/StageClearsView";

export const Route = createFileRoute("/$mode/clears")({
  validateSearch: validateClearsSearch,
  beforeLoad: ({ context, location }) => requireStage(context.mode, location.pathname),
  component: Clears,
});

/**
 * The stage mode's documented clears, with the result, era and text filters in the URL.
 *
 * @returns the view
 */
function Clears() {
  const { mode, stage } = Route.useRouteContext();
  const onSearch = useSearchPatch<ClearsSearch>();
  return (
    <StageClearsView mode={mode} stage={stage} search={Route.useSearch()} onSearch={onSearch} />
  );
}
