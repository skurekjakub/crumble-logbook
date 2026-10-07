import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ResearchRecord, Source } from "../src/api/types";
import type { Canned } from "./helpers";
import { renderRoute, VIEW_SOURCES } from "./view-harness";

const RECORDS = [
  {
    slug: "001-guild-conquest-meta",
    question: "Which teams reach 1T in Guild Conquest?",
    status: "active",
    startedAt: "2026-09-20",
    updatedAt: "2026-09-27",
    seasonLabel: "S5 (live)",
    lede: "What Korean and global players run in Guild Conquest.",
    caveat: null,
    mode: "guild_conquest",
    modes: [],
  },
  {
    slug: "002-pvp-meta",
    question: "What wins in Arena and Rumble Arena?",
    status: "done",
    startedAt: "2026-09-27",
    updatedAt: "2026-09-28",
    seasonLabel: null,
    lede: "What players run in PvP.",
    caveat: null,
    mode: "arena",
    modes: [
      { mode: "arena", lede: null, caveat: null },
      { mode: "rumble_arena", lede: null, caveat: null },
    ],
  },
] satisfies ResearchRecord[];

const SOURCES = [
  ...VIEW_SOURCES,
  { ...VIEW_SOURCES[0]!, id: "dc:1", records: ["002-pvp-meta"] },
  { ...VIEW_SOURCES[0]!, id: "dc:2", records: ["001-guild-conquest-meta", "002-pvp-meta"] },
] satisfies Source[];

const API: Record<string, Canned> = {
  "/api/records": { body: RECORDS },
  "/api/sources": { body: SOURCES },
};

/**
 * Finds the card of the record whose slug is `slug`.
 *
 * @param slug - the record's slug
 * @returns the card
 */
const card = async (slug: string) =>
  (await screen.findByText(slug)).closest("article") as HTMLElement;

describe("/research", () => {
  it("sits among the shared sections with the generic chrome", async () => {
    await renderRoute("/research", API);
    const modes = screen.getByRole("navigation", { name: "Logbook" });
    expect(within(modes).getByRole("link", { name: "Research" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Crumble Logbook");
  });

  it("lists every record as a compact card: status pill, slug, modes, lede, question, dates and source count", async () => {
    await renderRoute("/research", API);
    const pvp = await card("002-pvp-meta");
    const p = within(pvp);
    expect(
      p.getByRole("heading", { name: "Arena 아레나 Rumble Arena 와글와글 아레나" }),
    ).toBeVisible();
    expect(p.getByText("done")).toHaveClass("pill", "legacy");
    expect(within(await card("001-guild-conquest-meta")).getByText("active")).toHaveClass(
      "pill",
      "good",
    );
    expect(p.getByText("What players run in PvP.")).toBeVisible();
    expect(p.getByText("What wins in Arena and Rumble Arena?")).toBeVisible();
    expect(pvp).toHaveTextContent("Started 2026-09-27");
    expect(pvp).toHaveTextContent("Updated 2026-09-28");
    expect(await p.findByText("2 sources")).toHaveClass("chip");
    expect(p.getByText("002-pvp-meta")).toHaveAttribute("title", "research/002-pvp-meta/");
    expect(within(await card("001-guild-conquest-meta")).getByText("4 sources")).toBeVisible();
    expect(within(await card("001-guild-conquest-meta")).getByText("S5 (live)")).toHaveClass(
      "chip",
    );
  });

  it("links each record to every mode it covers, as mode chips", async () => {
    await renderRoute("/research", API);
    const pvp = await card("002-pvp-meta");
    const p = within(pvp);
    expect(p.getByRole("link", { name: "Arena 아레나" })).toHaveAttribute("href", "/arena");
    expect(p.getByRole("link", { name: "Rumble Arena 와글와글 아레나" })).toHaveAttribute(
      "href",
      "/rumble",
    );
    expect(p.queryByRole("link", { name: "Counters" })).toBeNull();
    const conquest = within(await card("001-guild-conquest-meta"));
    expect(conquest.getByRole("link", { name: "Guild Conquest 길드 토벌전" })).toHaveAttribute(
      "href",
      "/conquest",
    );
    expect(conquest.queryByRole("link", { name: /^Arena/ })).toBeNull();
  });

  it("links each record to its capture ledger", async () => {
    await renderRoute("/research", API);
    expect(
      within(await card("002-pvp-meta")).getByRole("link", { name: "Capture ledger" }),
    ).toHaveAttribute("href", "/research/002-pvp-meta/captures");
  });

  it("navigates to a mode's screens from its link", async () => {
    const router = await renderRoute("/research", {
      ...API,
      "/api/records/002-pvp-meta": { body: RECORDS[1] },
    });
    fireEvent.click(
      within(await card("002-pvp-meta")).getByRole("link", { name: /^Rumble Arena/ }),
    );
    await waitFor(() => expect(router.state.location.pathname).toBe("/rumble"));
  });

  it("shows the empty message with no records", async () => {
    await renderRoute("/research", { ...API, "/api/records": { body: [] } });
    expect(await screen.findByText("No research records yet.")).toHaveClass("empty");
  });
});
