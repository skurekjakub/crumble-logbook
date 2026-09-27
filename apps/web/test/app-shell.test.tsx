import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Deck, ResearchRecord, Source } from "../src/api/types";
import type { Canned } from "./helpers";
import { renderRoute } from "./view-harness";

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

/** Renders the whole app at `path` against this file's stubbed API. */
const renderAt = (path: string, api: Record<string, Canned> = API) => renderRoute(path, api);

/** The stamp's label → value pairs. */
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

  it("shows mode links, shared sections and the Guild Conquest section links, marking the current ones", async () => {
    await renderAt("/conquest/decks");
    const modes = screen.getByRole("navigation", { name: "Game modes and shared sections" });
    expect(
      within(modes)
        .getAllByRole("link")
        .map((t) => t.textContent),
    ).toEqual(["Guild Conquest", "Arena", "Rumble Arena", "Research", "Sources", "Glossary"]);
    const conquest = within(modes).getByRole("link", { name: "Guild Conquest" });
    expect(conquest).toHaveAttribute("href", "/conquest");
    expect(conquest).toHaveAttribute("aria-current", "true");
    expect(within(modes).getByRole("link", { name: "Arena" })).not.toHaveAttribute("aria-current");
    const sub = screen.getByRole("navigation", { name: "Guild Conquest sections" });
    const decks = within(sub).getByRole("link", { name: "Decks" });
    expect(decks).toHaveAttribute("href", "/conquest/decks");
    expect(decks).toHaveAttribute("aria-current", "page");
    expect(within(sub).getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByRole("tabpanel")).toBeNull();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("marks a mode link as the current page on the mode's landing page", async () => {
    await renderAt("/conquest");
    const modes = screen.getByRole("navigation", { name: "Game modes and shared sections" });
    expect(within(modes).getByRole("link", { name: "Guild Conquest" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("redirects / to /conquest", async () => {
    const router = await renderAt("/");
    await waitFor(() => expect(router.state.location.pathname).toBe("/conquest"));
  });

  it("navigates when a link is clicked", async () => {
    const router = await renderAt("/conquest");
    fireEvent.click(screen.getByRole("link", { name: "Arena" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/arena"));
    expect(await screen.findByRole("navigation", { name: "Arena sections" })).toBeVisible();
    expect(screen.queryByRole("navigation", { name: "Guild Conquest sections" })).toBeNull();
  });

  it("keeps the app working when the research record fails to load", async () => {
    await renderAt("/conquest", {
      ...API,
      "/api/records/001-guild-conquest-meta": { status: 500, body: { error: "internal" } },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load research record");
    expect(
      screen.getByRole("navigation", { name: "Game modes and shared sections" }),
    ).toBeVisible();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("shows the generic chrome on a shared section, with no empty lede", async () => {
    await renderAt("/sources");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Crumble Logbook");
    expect(screen.getByRole("link", { name: "Sources" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("navigation", { name: "Guild Conquest sections" })).toBeNull();
    expect(document.querySelector("header.top .lede")).toBeNull();
  });
});
