import { createFileRoute } from "@tanstack/react-router";
import { useSearchPatch } from "../../app/search";
import type { DailySearch } from "../../views/DailyDungeonsView";
import { BestSetupView } from "../../views/BestSetupView";
import { DailyDungeonsView, validateDailySearch } from "../../views/DailyDungeonsView";
import { OverviewView } from "../../views/OverviewView";

export const Route = createFileRoute("/$mode/")({
  validateSearch: validateDailySearch,
  component: Landing,
});

/**
 * A mode's landing page, as its first tab names it: Best setup, the daily
 * dungeon board (the dungeon shown in the URL) for the mode that has one,
 * and the findings for a mode that lands on them.
 *
 * @returns the view
 */
function Landing() {
  const { mode } = Route.useRouteContext();
  const search = Route.useSearch();
  const onSearch = useSearchPatch<DailySearch>();
  if (mode.daily) {
    return <DailyDungeonsView mode={mode} daily={mode.daily} search={search} onSearch={onSearch} />;
  }
  if (mode.tabs[0]?.id === "setup") return <BestSetupView mode={mode} />;
  return <OverviewView mode={mode} />;
}
