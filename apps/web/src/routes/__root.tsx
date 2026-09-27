import { useQuery } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { decksQuery, recordQuery, sourcesQuery } from "../api/queries";
import type { AppPath, Section, SectionTab, StampStat } from "../app/modes";
import { activeTab, SECTIONS, sectionForPath } from "../app/modes";
import type { RouterContext } from "../app/router-context";
import { ErrorBox } from "../components/ErrorBox";
import { PageHeader } from "../components/PageHeader";
import { TabNav } from "../components/TabNav";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

/** Stamp labels, per stat. */
const STAT_LABEL: Record<StampStat, string> = {
  updated: "Updated",
  season: "Season",
  sources: "Sources",
  decks: "Decks",
};

/**
 * The header label's suffix: a mode's Korean name, or its English label
 * when that's unknown. Shared sections have none.
 */
function headerContext(section: Section | undefined): ReactNode {
  if (section?.kind !== "mode") return null;
  return section.labelKr ? <span className="kr">{section.labelKr}</span> : section.label;
}

/** The DOM id of the tab labelling the panel: the selected sub-tab, else the section's tab. */
function panelLabelId(
  section: Section | undefined,
  tab: SectionTab | undefined,
): string | undefined {
  if (!section) return undefined;
  return tab ? `tab-${section.id}-${tab.id}` : `tab-${section.id}`;
}

/**
 * The app chrome: header (from the active mode's research record), mode and
 * shared-section tabs, the active section's sub-tabs, the view in a tab
 * panel, and the footer.
 */
function RootLayout() {
  const pathname = useLocation({ select: (l) => l.pathname });
  const navigate = useNavigate();
  const section = sectionForPath(pathname);
  const tab = section ? activeTab(section.tabs, pathname) : undefined;
  const stamp = section?.stamp ?? [];
  const slug = section?.recordSlug ?? null;

  const record = useQuery({ ...recordQuery(slug ?? ""), enabled: slug != null });
  const sources = useQuery({ ...sourcesQuery(), enabled: stamp.includes("sources") });
  const decks = useQuery({ ...decksQuery(), enabled: stamp.includes("decks") });

  const values: Record<StampStat, string | number | null | undefined> = {
    updated: record.data?.updatedAt,
    season: record.data?.seasonLabel,
    sources: sources.data?.length,
    decks: decks.data?.length,
  };
  const lede = record.isError ? (
    <ErrorBox resource="research record" error={record.error} />
  ) : (
    (record.data?.lede ?? section?.lede ?? "")
  );

  const go = (target: { to: AppPath }) => () => void navigate({ to: target.to });

  return (
    <div className="wrap">
      <PageHeader
        context={headerContext(section)}
        title={section?.title ?? "Crumble Logbook"}
        lede={lede}
        stats={stamp.map((s) => [STAT_LABEL[s], values[s]] as const)}
      />
      <TabNav
        className="modes"
        label="Game modes and shared sections"
        items={SECTIONS.map((s, i) => ({
          domId: `tab-${s.id}`,
          label: s.label,
          selected: s.id === section?.id,
          startsGroup: s.kind === "shared" && SECTIONS[i - 1]?.kind === "mode",
          onSelect: go(s),
        }))}
      />
      {section && section.tabs.length > 0 && (
        <TabNav
          className="sub"
          label={`${section.label} sections`}
          items={section.tabs.map((t) => ({
            domId: `tab-${section.id}-${t.id}`,
            label: t.label,
            selected: t.id === tab?.id,
            onSelect: go(t),
          }))}
        />
      )}
      <main>
        <section className="panel" role="tabpanel" aria-labelledby={panelLabelId(section, tab)}>
          <Outlet />
        </section>
      </main>
      <footer>
        {slug ? (
          <>
            Built from the research record's evidence captures. Research record:{" "}
            <span className="mono">research/{slug}/</span>.
          </>
        ) : (
          "Built from the research records' evidence captures."
        )}
      </footer>
    </div>
  );
}
