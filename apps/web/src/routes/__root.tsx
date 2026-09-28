import { useQuery } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { decksQuery, recordQuery, sourcesQuery } from "../api/queries";
import type { Section, StampStat } from "../app/modes";
import { activeTab, SECTIONS, sectionForPath } from "../app/modes";
import type { RouterContext } from "../app/router-context";
import { ErrorBox } from "../components/ErrorBox";
import { PageHeader } from "../components/PageHeader";
import { SideNav } from "../components/SideNav";
import { TopBar } from "../components/TopBar";
import { isCurrent } from "../lib/obsolete";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

/** The navigation's element id, which the phone's menu button opens it by. */
const NAV_ID = "site-nav";

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
 *
 * @param section - the active section, if any
 * @returns the suffix, or null outside a mode
 */
function headerContext(section: Section | undefined): ReactNode {
  if (section?.kind !== "mode") return null;
  return section.labelKr ? <span className="kr">{section.labelKr}</span> : section.label;
}

/**
 * The app chrome: the phone's top bar, the logbook navigation (every
 * section, the active section's pages beneath it), the header (from the
 * active mode's research record, with the record's own lede for that mode
 * on the section's landing page, and figures scoped to the record and
 * mode), the view in the main landmark, and the footer.
 *
 * @returns the app chrome around the current view
 */
function RootLayout() {
  const pathname = useLocation({
    select: (l) => l.pathname,
  });
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
    decks: decks.data?.filter(isCurrent).length,
  };
  const modeLede = record.data?.modes.find((m) => m.mode === scope?.mode)?.lede;
  const lede = record.isError ? (
    <ErrorBox resource="research record" error={record.error} />
  ) : (
    (modeLede ?? record.data?.lede ?? section?.lede ?? "")
  );

  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const landing = section != null && path === section.to;

  return (
    <div className="wrap">
      <TopBar
        navId={NAV_ID}
        trail={[section?.label ?? "Crumble Logbook", ...(tab ? [tab.label] : [])]}
      />
      <SideNav
        id={NAV_ID}
        label="Logbook"
        sections={SECTIONS.map((s, i) => ({
          id: s.id,
          label: s.label,
          labelKr: s.labelKr,
          link: s.link,
          current: s.id !== section?.id ? null : landing ? "page" : "section",
          startsGroup: s.kind === "shared" && SECTIONS[i - 1]?.kind === "mode",
          hasPages: s.tabs.length > 0,
          pages:
            s.id === section?.id
              ? s.tabs.map((t) => ({
                  id: t.id,
                  label: t.label,
                  link: t.link,
                  current: t.id === tab?.id,
                }))
              : [],
        }))}
      />
      <div className="page">
        <PageHeader
          context={headerContext(section)}
          title={section?.title ?? "Crumble Logbook"}
          // The record's lede introduces a section, so it shows on the landing page only; a failure shows everywhere.
          lede={landing || record.isError ? lede : ""}
          stats={stamp.map((s) => [STAT_LABEL[s], values[s]] as const)}
        />
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
    </div>
  );
}
