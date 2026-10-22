import { useQuery } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, useLocation } from "@tanstack/react-router";
import { decksQuery, recordQuery, sourcesQuery } from "../api/queries";
import type { Section, SectionTab, StampStat, TabGroup } from "../app/modes";
import { activeTab, NAV_GROUPS, sectionForPath, sectionsIn, TAB_GROUPS } from "../app/modes";
import type { RouterContext } from "../app/router-context";
import { useIconIndex } from "../api/hooks";
import { IconIndexContext } from "../components/CookieIcon";
import { ErrorBox } from "../components/ErrorBox";
import { ModePageStrip } from "../components/ModePageStrip";
import { PageHeader } from "../components/PageHeader";
import type { NavPage } from "../components/SideNav";
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
 * The header label's suffix: a mode's name. Shared sections have none.
 *
 * @param section - the active section, if any
 * @returns the suffix, or null outside a mode
 */
function headerContext(section: Section | undefined): string | null {
  return section?.kind === "mode" ? section.label : null;
}

/**
 * A section's tabs of one page list, as navigation links.
 *
 * @param tabs - the section's tabs
 * @param group - the page list to keep
 * @param shown - the tab shown, marked current; undefined when none is
 * @returns the list's pages, in tab order
 */
function navPages(
  tabs: readonly SectionTab[],
  group: TabGroup,
  shown: SectionTab | undefined,
): NavPage[] {
  return tabs
    .filter((t) => t.group === group)
    .map((t) => ({ id: t.id, label: t.label, link: t.link, current: t.id === shown?.id }));
}

/**
 * The app chrome: the phone's top bar, the logbook navigation (every
 * section in its group, the active section's Setup and Details pages
 * beneath it), the header (from the active mode's research record, with
 * the record's own lede for that mode on the section's landing page, and
 * figures scoped to the record and mode), a mode's strip of Setup pages,
 * the view in the main landmark, and the footer.
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
  const icons = useIconIndex();

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
    <IconIndexContext value={icons}>
      <div className="wrap">
        <TopBar
          navId={NAV_ID}
          trail={[section?.label ?? "Crumble Logbook", ...(tab ? [tab.label] : [])]}
        />
        <SideNav
          id={NAV_ID}
          label="Logbook"
          groups={NAV_GROUPS.map((g) => ({
            id: g.id,
            label: g.label,
            sections: sectionsIn(g.id).map((s) => ({
              id: s.id,
              label: s.label,
              link: s.link,
              current: s.id !== section?.id ? null : landing ? "page" : "section",
              hasPages: s.tabs.length > 0,
              pageLists:
                s.id === section?.id
                  ? TAB_GROUPS.map((list) => ({
                      id: list.id,
                      label: list.label,
                      pages: navPages(s.tabs, list.id, tab),
                    }))
                  : [],
            })),
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
          {section?.kind === "mode" ? (
            <ModePageStrip label="Setup pages" pages={navPages(section.tabs, "setup", tab)} />
          ) : null}
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
    </IconIndexContext>
  );
}
