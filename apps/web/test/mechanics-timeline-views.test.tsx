import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Mechanic, TimelineEvent } from "../src/api/types";
import { renderRoute } from "./view-harness";

const MECHANICS = [
  {
    id: 1,
    mode: "guild_conquest",
    topic: null,
    alsoTopics: [],
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
    alsoTopics: [],
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
    expect(
      screen.getByText(/Confidence rates the sourcing/, { selector: "ul.points li" }),
    ).toBeVisible();
    const card = (await screen.findByRole("heading", { name: MECHANICS[0]!.title })).closest(
      ".card",
    ) as HTMLElement;
    expect(card.parentElement).toHaveClass("grid", "g2");
    const pill = within(card).getByText("high");
    expect(pill).toHaveClass("pill", "high");
    // The confidence comes before the title.
    expect(
      pill.compareDocumentPosition(within(card).getByRole("heading")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(within(card).getByText(MECHANICS[0]!.body)).toBeInTheDocument();
    expect(await within(card).findByRole("link", { name: "DC 76135" })).toHaveAttribute(
      "href",
      "https://example.test/dc/76135",
    );
    expect(screen.getByText("unverified claim")).toHaveClass("pill", "low");
  });

  it("cuts a long body to two lines with a More button", async () => {
    const body = `${"Beams go to the highest-ATK allies, not the highest power. ".repeat(6)}End.`;
    await renderRoute("/conquest/mechanics", {
      "/api/mechanics?mode=guild_conquest": { body: [{ ...MECHANICS[0]!, body }] },
    });
    const card = (await screen.findByRole("heading", { name: MECHANICS[0]!.title })).closest(
      ".card",
    ) as HTMLElement;
    const clamp = card.querySelector(".mech-body .clamp") as HTMLElement;
    expect(clamp.querySelector(".clamp-text")).toHaveStyle({ "--clamp": "2" });
    expect(within(clamp).getByRole("button", { name: "More" })).toBeVisible();
  });

  it("leaves out the topics the mode shows elsewhere, and keeps the rest", async () => {
    const row = (id: number, topic: string | null, title: string): Mechanic => ({
      ...MECHANICS[0]!,
      id,
      topic,
      title,
    });
    await renderRoute("/conquest/mechanics", {
      "/api/mechanics?mode=guild_conquest": {
        body: [
          row(10, "rules", "A rule"),
          row(11, "boss_element", "The boss's element"),
          row(12, "boss_weakness", "The boss's weakness"),
          row(13, "boss_score", "How a run is scored"),
          row(14, "buff_formula", "The buff formula"),
          row(15, "survival_wipe", "Surviving the wipe"),
          row(16, null, "No topic"),
        ],
      },
    });
    await screen.findByRole("heading", { name: "No topic" });
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["The buff formula", "Surviving the wipe", "No topic"]);
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
    expect(screen.getByText(/oldest first/).closest("ul")).toHaveClass("points");
    const list = await within(screen.getByRole("main")).findByRole("list", {
      name: (_, el) => el.classList.contains("tl"),
    });
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
