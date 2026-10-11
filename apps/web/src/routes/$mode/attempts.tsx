import { createFileRoute } from "@tanstack/react-router";
import { requireAttempts } from "../../app/mode-route";
import { useSearchPatch } from "../../app/search";
import type { AttemptsSearch } from "../../views/AttemptsView";
import { AttemptsView, validateAttemptsSearch } from "../../views/AttemptsView";

export const Route = createFileRoute("/$mode/attempts")({
  validateSearch: validateAttemptsSearch,
  beforeLoad: ({ context, location }) => requireAttempts(context.mode, location.pathname),
  component: Attempts,
});

/**
 * The macro's attempts, with the checkpoint an earlier cut is tested at in the URL.
 *
 * @returns the view
 */
function Attempts() {
  const { mode, attempts } = Route.useRouteContext();
  const onSearch = useSearchPatch<AttemptsSearch>();
  return (
    <AttemptsView mode={mode} copy={attempts} search={Route.useSearch()} onSearch={onSearch} />
  );
}
