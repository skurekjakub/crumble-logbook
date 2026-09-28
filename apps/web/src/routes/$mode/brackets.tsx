import { createFileRoute } from "@tanstack/react-router";
import { requireStage } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { PowerSearch } from "../../views/StageBracketsView";
import { StageBracketsView, validatePowerSearch } from "../../views/StageBracketsView";

export const Route = createFileRoute("/$mode/brackets")({
  validateSearch: validatePowerSearch,
  beforeLoad: ({ context, location }) => requireStage(context.mode, location.pathname),
  component: Brackets,
});

/**
 * The stage mode's bracket calculator, with the typed power in the URL.
 *
 * @returns the view
 */
function Brackets() {
  const { mode, stage } = Route.useRouteContext();
  const onSearch = useSearchPatch<PowerSearch>();
  return (
    <StageBracketsView mode={mode} stage={stage} search={Route.useSearch()} onSearch={onSearch} />
  );
}
