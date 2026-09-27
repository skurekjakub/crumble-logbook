import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Mechanic, TimelineEvent } from "../src/api/types";
import { renderRoute } from "./view-harness";

const MECHANICS = [
  {
    id: 1,
    mode: "guild_conquest",
    topic: null,
    recordSlug: null,
    title: "Pomegranate's beams (빨대)",
    body: "Her skill gives +69% skill amp for 9 s through beams.",
    confidence: "high",
    sources: ["dc:76135"],
  },
  {
    id: 2,
    mode: "guild_conquest",
    topic: null,
    recordSlug: null,
    title: "Power correction",
    body: "Unclear whether raids use it.",
    confidence: "low",
    sources: [],
  },
] satisfies Mechanic[];

const TIMELINE = [
  {
    id: 2,
    date: "2026-09-01",
    event: "Season 5 opens.",
    mode: "guild_conquest",
    recordSlug: null,
    sources: ["nv:43653"],
  },
  {
    id: 1,
    date: "2026-08-13",
    event: "Patch: skill amp scales Milk's buff.",
    mode: "guild_conquest",
    recordSlug: null,
    sources: [],
  },
] satisfies TimelineEvent[];

describe("mechanics view", () => {
  it("renders a card per mechanic with its confidence pill and sources", async () => {
    await renderRoute("/conquest/mechanics", {
      "/api/mechanics?mode=guild_conquest": { body: MECHANICS },
    });
    expect(await screen.findByRole("heading", { name: "Mechanics" })).toBeVisible();
    expect(screen.getByText(/Confidence reflects how well each point is sourced/)).toHaveClass(
      "lede",
    );
    const card = (await screen.findByRole("heading", { name: MECHANICS[0]!.title })).closest(
      ".card",
    ) as HTMLElement;
    expect(card.parentElement).toHaveClass("grid", "g2");
    expect(within(card).getByText("high")).toHaveClass("pill", "high");
    expect(within(card).getByText(MECHANICS[0]!.body)).toBeInTheDocument();
    expect(await within(card).findByRole("link", { name: "DC 76135" })).toHaveAttribute(
      "href",
      "https://example.test/dc/76135",
    );
    expect(screen.getByText("low")).toHaveClass("pill", "low");
  });

  it("shows the legacy empty message", async () => {
    await renderRoute("/conquest/mechanics", {
      "/api/mechanics?mode=guild_conquest": { body: [] },
    });
    expect(await screen.findByText("No mechanics recorded yet.")).toHaveClass("empty");
  });

  it("names the resource when the API fails", async () => {
    await renderRoute("/conquest/mechanics", {
      "/api/mechanics?mode=guild_conquest": { status: 500, body: { error: "internal" } },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load mechanics");
  });
});

describe("timeline view", () => {
  it("lists events oldest first with their dates and sources", async () => {
    await renderRoute("/conquest/timeline", {
      "/api/timeline?mode=guild_conquest": { body: TIMELINE },
    });
    expect(await screen.findByRole("heading", { name: "How the meta moved" })).toBeVisible();
    expect(screen.getByText(/oldest first/)).toHaveClass("lede");
    const list = await screen.findByRole("list");
    expect(list).toHaveClass("tl");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((li) => li.querySelector(".d")!.textContent)).toEqual([
      "2026-08-13",
      "2026-09-01",
    ]);
    expect(items[0]).toHaveTextContent(TIMELINE[1]!.event);
    expect(await within(items[1]!).findByRole("link", { name: "Naver 43653" })).toBeVisible();
  });

  it("shows an empty message with no events", async () => {
    await renderRoute("/conquest/timeline", { "/api/timeline?mode=guild_conquest": { body: [] } });
    expect(await screen.findByText("No timeline events recorded yet.")).toHaveClass("empty");
  });
});
