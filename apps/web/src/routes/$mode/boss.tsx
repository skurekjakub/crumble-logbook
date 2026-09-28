import { createFileRoute, notFound } from "@tanstack/react-router";
import { requireTab } from "../../app/mode-route";
import { BossView } from "../../views/BossView";

export const Route = createFileRoute("/$mode/boss")({
  beforeLoad: ({ context, location }) => {
    requireTab(context.mode, location.pathname);
    const { boss } = context.mode;
    if (!boss) throw notFound();
    return { boss };
  },
  component: Boss,
});

/**
 * A mode's boss screen, for a mode that has one.
 *
 * @returns the view
 */
function Boss() {
  const { mode, boss } = Route.useRouteContext();
  return <BossView mode={mode} boss={boss} />;
}
