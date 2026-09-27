import { useQuery } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { decksQuery, recordQuery, sourcesQuery } from "../api/queries";
import type { Section, StampStat } from "../app/modes";
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

/**
 * The app chrome: header (from the active mode's research record, with the
 * record's own lede for that mode when it has one, and figures scoped to
 * the record and mode), the mode and shared-section links, the active
 * section's links, the view in the main landmark, and the footer.
 */
function RootLayout() {
  const pathname = useLocation({ select: (l) => l.pathname });
  const section = sectionForPath(pathname);
  const tab = section ? activeTab(section.tabs, pathname) : undefined;
  const stamp = section?.stamp ?? [];
  const slug = section?.recordSlug ?? null;
  const scope = section?.kind === "mode" ? section.scope : undefined;

  const record = useQuery({ ...recordQuery(slug ?? ""), enabled: slug != null });
  const sources = useQuery({
    ...sourcesQuery(slug ? { record: slug } : {}),
    enabled: stamp.includes("sources"),
  });
  const decks = useQuery({ ...decksQuery(scope), enabled: stamp.includes("decks") });

  const values: Record<StampStat, string | number | null | undefined> = {
    updated: record.data?.updatedAt,
    season: record.data?.seasonLabel,
    sources: sources.data?.length,
    decks: decks.data?.length,
  };
  const modeLede = record.data?.modes.find((m) => m.mode === scope?.mode)?.lede;
  const lede = record.isError ? (
    <ErrorBox resource="research record" error={record.error} />
  ) : (
    (modeLede ?? record.data?.lede ?? section?.lede ?? "")
  );

  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

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
          id: s.id,
          label: s.label,
          to: s.to,
          current: s.id !== section?.id ? null : path === s.to ? "page" : "section",
          startsGroup: s.kind === "shared" && SECTIONS[i - 1]?.kind === "mode",
        }))}
      />
      {section && section.tabs.length > 0 && (
        <TabNav
          className="sub"
          label={`${section.label} sections`}
          items={section.tabs.map((t) => ({
            id: t.id,
            label: t.label,
            to: t.to,
            current: t.id === tab?.id ? "page" : null,
          }))}
        />
      )}
      <main>
        <section className="panel">
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
