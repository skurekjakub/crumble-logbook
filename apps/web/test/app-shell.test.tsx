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
} satisfies ResearchRecord;

const SOURCES = [
  { id: "dc:76135", site: "dc", url: "https://example.test/dc/76135", title: "1T" },
  { id: "nv:43653", site: "nv", url: "https://example.test/nv/43653", title: "Cherry" },
] satisfies Partial<Source>[];

const DECKS = [{ id: "cherry" }, { id: "meso" }, { id: "herb" }] satisfies Partial<Deck>[];

const API: Record<string, Canned> = {
  "/api/records/001-guild-conquest-meta": { body: RECORD },
  "/api/sources": { body: SOURCES },
  "/api/decks": { body: DECKS },
  "/api/takeaways": { body: [] },
  "/api/recommendations": { body: [] },
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

  it("shows mode tabs, shared sections and the Guild Conquest sub-tabs", async () => {
    await renderAt("/conquest/decks");
    const modes = screen.getByRole("tablist", { name: "Game modes and shared sections" });
    expect(
      within(modes)
        .getAllByRole("tab")
        .map((t) => t.textContent),
    ).toEqual(["Guild Conquest", "Arena", "Rumble Arena", "Sources", "Glossary"]);
    expect(within(modes).getByRole("tab", { name: "Guild Conquest" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const sub = screen.getByRole("tablist", { name: "Guild Conquest sections" });
    expect(within(sub).getByRole("tab", { name: "Decks" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(within(sub).getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "tab-conquest-decks");
  });

  it("redirects / to /conquest", async () => {
    const router = await renderAt("/");
    await waitFor(() => expect(router.state.location.pathname).toBe("/conquest"));
  });

  it("navigates when a tab is clicked", async () => {
    const router = await renderAt("/conquest");
    fireEvent.click(screen.getByRole("tab", { name: "Arena" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/arena"));
    expect(await screen.findByText(/research in progress/i)).toHaveClass("empty");
    expect(screen.queryByRole("tablist", { name: "Guild Conquest sections" })).toBeNull();
  });

  it("keeps the app working when the research record fails to load", async () => {
    await renderAt("/conquest", {
      ...API,
      "/api/records/001-guild-conquest-meta": { status: 500, body: { error: "internal" } },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load research record");
    expect(screen.getByRole("tablist", { name: "Game modes and shared sections" })).toBeVisible();
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("shows the generic chrome on a shared section", async () => {
    await renderAt("/sources");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Crumble Logbook");
    expect(screen.getByRole("tab", { name: "Sources" })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByRole("tablist", { name: "Guild Conquest sections" })).toBeNull();
  });
});
