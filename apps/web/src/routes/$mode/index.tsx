import { createFileRoute } from "@tanstack/react-router";
import { useSearchPatch } from "../../app/search";
import type { DailySearch } from "../../views/DailyDungeonsView";
import { DailyDungeonsView, validateDailySearch } from "../../views/DailyDungeonsView";
import { OverviewView } from "../../views/OverviewView";

export const Route = createFileRoute("/$mode/")({
  validateSearch: validateDailySearch,
  component: Landing,
});

/**
 * A mode's landing page: the daily dungeon board for the mode that has
 * one (the dungeon shown in the URL), the overview for every other.
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
  return <OverviewView mode={mode} />;
}
