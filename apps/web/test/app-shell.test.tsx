import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Deck, ResearchRecord, Source } from "../src/api/types";
import { MODES } from "../src/app/modes";
import type { Canned } from "./helpers";
import { renderRoute } from "./view-harness";

/** The router's not-found state, as the panel shows it. */
const NOT_FOUND = "Nothing lives at this address. Pick a section above.";

const RECORD = {
  slug: "001-guild-conquest-meta",
  question: "Which teams reach 1T?",
  status: "active",
  startedAt: "2026-09-27",
  updatedAt: "2026-09-27",
  seasonLabel: "S5 (live)",
  lede: "What Korean and global players run in Guild Conquest.",
  caveat: "Snapshot of 2026-09-27.",
  mode: "guild_conquest",
  modes: [],
} satisfies ResearchRecord;

const SOURCES = [
  { id: "dc:76135", site: "dc", url: "https://example.test/dc/76135", title: "1T" },
  { id: "nv:43653", site: "nv", url: "https://example.test/nv/43653", title: "Cherry" },
] satisfies Partial<Source>[];

const DECKS = [{ id: "cherry" }, { id: "meso" }, { id: "herb" }] satisfies Partial<Deck>[];

const API: Record<string, Canned> = {
  "/api/records/001-guild-conquest-meta": { body: RECORD },
  "/api/sources": { body: SOURCES },
  "/api/sources?record=001-guild-conquest-meta": { body: SOURCES },
  "/api/decks?mode=guild_conquest": { body: DECKS },
  "/api/takeaways?mode=guild_conquest": { body: [] },
  "/api/recommendations?record=001-guild-conquest-meta": { body: [] },
};

/**
 * Renders the whole app at `path` against this file's stubbed API.
 *
 * @param path - the URL to open
 * @param api - the canned responses, by request path
 * @returns the router
 */
const renderAt = (path: string, api: Record<string, Canned> = API) => renderRoute(path, api);

/**
 * Lists the navigation's top-level section links, in order.
 *
 * @param nav - the navigation landmark
 * @returns the links
 */
const sectionLinks = (nav: HTMLElement) => [
  ...nav.querySelectorAll<HTMLAnchorElement>("a.nav-section-link"),
];

/**
 * Reads the stamp's label → value pairs.
 *
 * @returns the pairs, by label
 */
function stamp(): Record<string, string> {
  const el = document.querySelector(".stamp")!;
  return Object.fromEntries(
    [...el.querySelectorAll("div")].map((d) => [
      d.querySelector(".label")!.textContent,
      d.querySelector("b")!.textContent,
    ]),
  );
}

describe("app shell", () => {
  it("renders the Guild Conquest chrome from the mode's research record", async () => {
    await renderAt("/conquest");
    expect(await screen.findByText(RECORD.lede)).toHaveClass("lede");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Piñata Raid Logbook");
    expect(document.querySelector("header.top .label")).toHaveTextContent(
      "Cookie Run: Crumble · 길드 토벌전",
    );
    await waitFor(() =>
      expect(stamp()).toEqual({
        Updated: "2026-09-27",
        Season: "S5 (live)",
        Sources: "2",
        Decks: "3",
      }),
    );
    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      "Research record: research/001-guild-conquest-meta/",
    );
  });

  it("lists every section with its Korean name and nests the current section's pages, marking the current ones", async () => {
    await renderAt("/conquest/decks");
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    expect(sectionLinks(nav).map((a) => a.textContent)).toEqual([
      "Guild Conquest 길드 토벌전",
      "Arena 아레나",
      "Rumble Arena 와글와글 아레나",
      "Stage 스테이지",
      "Research",
      "Sources",
      "Glossary",
    ]);
    const conquest = within(nav).getByRole("link", { name: "Guild Conquest 길드 토벌전" });
    expect(conquest).toHaveAttribute("href", "/conquest");
    expect(conquest).toHaveAttribute("aria-current", "true");
    expect(within(nav).getByRole("link", { name: "Arena 아레나" })).not.toHaveAttribute(
      "aria-current",
    );
    const pages = within(nav).getByRole("list", { name: "Guild Conquest sections" });
    const decks = within(pages).getByRole("link", { name: "Decks" });
    expect(decks).toHaveAttribute("href", "/conquest/decks");
    expect(decks).toHaveAttribute("aria-current", "page");
    expect(within(pages).getByRole("link", { name: "Overview" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(within(nav).getAllByRole("link", { current: "page" })).toEqual([decks]);
    expect(screen.queryByRole("list", { name: "Arena sections" })).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByRole("tabpanel")).toBeNull();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("marks a mode link and its overview as the current page on the mode's landing page", async () => {
    await renderAt("/conquest");
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    expect(
      within(nav)
        .getAllByRole("link", { current: "page" })
        .map((a) => a.textContent),
    ).toEqual(["Guild Conquest 길드 토벌전", "Overview"]);
  });

  it("opens the navigation from the phone's menu button, which names where the reader is", async () => {
    await renderAt("/conquest/boss");
    const menu = screen.getByRole("button", { name: "Menu: Guild Conquest / Piñata" });
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    expect(nav).toHaveAttribute("id", "site-nav");
    expect(nav).toHaveAttribute("popover", "auto");
    expect(menu).toHaveAttribute("popovertarget", "site-nav");
  });

  it("keeps the phone drawer open after a mode link, so one of its pages can be picked, and closes it after a page link", async () => {
    const router = await renderAt("/conquest/decks");
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    const hidePopover = vi.fn();
    // jsdom has no popover API; stand in for an open drawer.
    Object.assign(nav, { hidePopover, matches: (s: string) => s === ":popover-open" });
    fireEvent.click(within(nav).getByRole("link", { name: "Arena 아레나" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/arena"));
    expect(hidePopover).not.toHaveBeenCalled();
    const arena = await within(nav).findByRole("list", { name: "Arena sections" });
    fireEvent.click(within(arena).getByRole("link", { name: "Gear" }));
    expect(hidePopover).toHaveBeenCalledTimes(1);
    fireEvent.click(within(nav).getByRole("link", { name: "Sources" }));
    expect(hidePopover).toHaveBeenCalledTimes(2);
  });

  it("shows the record's lede on a mode's landing page only", async () => {
    const router = await renderAt("/conquest");
    expect(await screen.findByText(RECORD.lede)).toHaveClass("lede");
    await router.navigate({ to: "/$mode/decks", params: { mode: "conquest" } });
    await waitFor(() => expect(document.querySelector("header.top .lede")).toBeNull());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Piñata Raid Logbook");
  });

  it("serves every mode's every tab at its own URL, and a mode's own copy on it", async () => {
    for (const mode of MODES) {
      for (const tab of mode.tabs) {
        const router = await renderRoute(tab.to, {}, { mode });
        expect(router.state.location.pathname, tab.to).toBe(tab.to);
        expect(screen.queryByText(NOT_FOUND), tab.to).toBeNull();
        const nav = screen.getByRole("navigation", { name: "Logbook" });
        const pages = within(nav).getByRole("list", { name: `${mode.label} sections` });
        expect(within(pages).getByRole("link", { current: "page" }), tab.to).toHaveTextContent(
          tab.label,
        );
        cleanup();
      }
    }
  }, 15_000);

  it("serves a mode's page at a mixed-case path, as the router matches a static segment", async () => {
    for (const [path, id] of [
      ["/Arena/teams", "arena"],
      ["/arena/Teams", "arena"],
      ["/STAGE/Clears", "stage"],
    ] as const) {
      const mode = MODES.find((m) => m.id === id)!;
      await renderRoute(path, {}, { mode });
      expect(
        await screen.findByRole("list", { name: `${mode.label} sections` }),
        path,
      ).toBeVisible();
      expect(screen.queryByText(NOT_FOUND), path).toBeNull();
      cleanup();
    }
  });

  it("answers not found for a page the mode doesn't have, and for an unknown mode", async () => {
    for (const path of ["/arena/scores", "/arena/boss", "/conquest/teams", "/nowhere"]) {
      await renderAt(path);
      expect(await screen.findByText(NOT_FOUND), path).toBeVisible();
      cleanup();
    }
  });

  it("redirects / to /conquest", async () => {
    const router = await renderAt("/");
    await waitFor(() => expect(router.state.location.pathname).toBe("/conquest"));
  });

  it("navigates when a link is clicked", async () => {
    const router = await renderAt("/conquest");
    fireEvent.click(screen.getByRole("link", { name: "Arena 아레나" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/arena"));
    expect(await screen.findByRole("list", { name: "Arena sections" })).toBeVisible();
    expect(screen.queryByRole("list", { name: "Guild Conquest sections" })).toBeNull();
  });

  it("keeps the app working when the research record fails to load, reporting it on every page", async () => {
    const router = await renderAt("/conquest", {
      ...API,
      "/api/records/001-guild-conquest-meta": { status: 500, body: { error: "internal" } },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load research record");
    expect(screen.getByRole("navigation", { name: "Logbook" })).toBeVisible();
    expect(screen.getByRole("main")).toBeInTheDocument();
    await router.navigate({ to: "/$mode/gear", params: { mode: "conquest" } });
    await waitFor(() => expect(router.state.location.pathname).toBe("/conquest/gear"));
    expect(document.querySelector("header.top [role=alert]")).toHaveTextContent(
      "Couldn't load research record",
    );
  });

  it("shows the generic chrome on a shared section, with no empty lede", async () => {
    await renderAt("/sources");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Crumble Logbook");
    expect(screen.getByRole("link", { name: "Sources" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("list", { name: "Guild Conquest sections" })).toBeNull();
    expect(screen.getByRole("button", { name: "Menu: Sources" })).toBeInTheDocument();
    expect(document.querySelector("header.top .lede")).toBeNull();
  });
});
