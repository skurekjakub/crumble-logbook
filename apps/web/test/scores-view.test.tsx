import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Deck, Ranking, RngFactor, Score } from "../src/api/types";
import type { Canned } from "./helpers";
import { bodyRows, renderRoute } from "./view-harness";

const DECKS = [
  { id: "cherry", nameEn: "Cherry deck" },
  { id: "meso", nameEn: "Melon Soda deck" },
] satisfies Partial<Deck>[];

const score = (o: Pick<Score, "id" | "damageG"> & Partial<Score>): Score => ({
  powerG: null,
  deckId: null,
  verified: true,
  date: "2026-09-20",
  season: 5,
  player: null,
  note: null,
  ratio: null,
  recordSlug: null,
  sources: [],
  ...o,
});

/** Deliberately not in damage order, and with a higher 배 on a lower-damage run. */
const SCORES = [
  score({ id: 1, damageG: 867, powerG: 12, deckId: "meso", ratio: 72, verified: false }),
  score({ id: 2, damageG: 1312, powerG: 26, deckId: "cherry", ratio: 50, sources: ["dc:76135"] }),
  score({ id: 3, damageG: 1000, powerG: 5, deckId: null, ratio: 200, note: "no lineup" }),
];

const RNG = [
  {
    id: 1,
    factor: "Who Pomegranate's beams hit",
    effect: "Beams go to the top-ATK cookies.",
    mitigation: "Lv.1 fillers.",
    mode: "guild_conquest",
    recordSlug: null,
    sources: ["nv:43653"],
  },
] satisfies RngFactor[];

const SEASONS = [
  { board: "players", season: 4, count: 50, capturedAt: "2026-09-27" },
  { board: "players", season: 5, count: 100, capturedAt: "2026-09-27" },
  { board: "guilds", season: 3, count: 50, capturedAt: "2026-09-27" },
  { board: "guilds", season: 5, count: 100, capturedAt: "2026-09-27" },
  { board: "power", season: null, count: 500, capturedAt: "2026-09-27" },
];

const ranking = (
  o: Pick<Ranking, "id" | "rank" | "name" | "valueG"> & Partial<Ranking>,
): Ranking => ({
  season: 5,
  board: "players",
  guild: null,
  powerG: null,
  ref: null,
  capturedAt: "2026-09-27",
  sourceId: "web:crumbgg:rankings-s5",
  recordSlug: null,
  ...o,
});

const API: Record<string, Canned> = {
  "/api/decks?mode=guild_conquest": { body: DECKS },
  "/api/scores": { body: SCORES },
  "/api/rng-factors?mode=guild_conquest": { body: RNG },
  "/api/rankings/seasons": { body: SEASONS },
  "/api/rankings?season=5&board=players": {
    body: [
      ranking({ id: 2, rank: 2, name: "김개똥", guild: "월드", valueG: 1916, powerG: 20.4 }),
      ranking({ id: 1, rank: 1, name: "도리", guild: "Carpediem", valueG: 2448, powerG: 25 }),
    ],
  },
  "/api/rankings?season=3&board=guilds": {
    body: [
      ranking({ id: 9, season: 3, board: "guilds", rank: 1, name: "Eden", valueG: 2450 }),
      // An older capture of the same board and season: the view shows only the latest.
      ranking({
        id: 8,
        season: 3,
        board: "guilds",
        rank: 1,
        name: "Stale",
        valueG: 100,
        capturedAt: "2026-09-01",
      }),
    ],
  },
};

const scoresTable = () => screen.getByRole("region", { name: "Posted scores" });
const rankingsRegion = () => screen.getByRole("region", { name: "crumb.gg leaderboard" });

describe("scores view", () => {
  it("renders the legacy heading, scatter, RNG cards and a damage-ordered table", async () => {
    await renderRoute("/conquest/scores", API);
    expect(await screen.findByRole("heading", { name: "Scores and RNG" })).toBeVisible();
    expect(screen.getByText(/Dashed lines mark 배 multiples/)).toHaveClass("lede");
    await waitFor(() => expect(bodyRows(scoresTable())).toHaveLength(3));
    expect(bodyRows(scoresTable()).map((r) => r[0])).toEqual(["1.31T", "1T", "867G"]);
    const [top, , last] = bodyRows(scoresTable());
    expect(top!.slice(0, 5)).toEqual(["1.31T", "26G", "50", "Cherry deck", "screenshot"]);
    expect(last![3]).toBe("Melon Soda deck");
    expect(last![4]).toBe("claimed");
    expect(within(scoresTable()).getByText("Other")).toBeInTheDocument();

    expect(screen.getByRole("group", { name: /damage against team power/ })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "1.31T at 26G power, 50배: Cherry deck · screenshot" }),
    ).toBeInTheDocument();
    const legend = document.querySelector(".legend-row")!;
    expect(legend).toHaveTextContent("Melon Soda deck");
    expect(legend).toHaveTextContent("Cherry deck");

    const rng = screen.getByRole("heading", { name: "Who Pomegranate's beams hit" }).parentElement!;
    expect(rng).toHaveClass("card");
    expect(within(rng).getByText("Lv.1 fillers.")).toHaveClass("flag");
    expect(within(rng).getByRole("link", { name: "Naver 43653" })).toHaveAttribute(
      "href",
      "https://example.test/nv/43653",
    );
    await waitFor(() =>
      expect(within(scoresTable()).getByRole("link", { name: "DC 76135" })).toBeInTheDocument(),
    );
  });

  it("links the chart, RNG factors, posted scores and leaderboard from the On this page list", async () => {
    await renderRoute("/conquest/scores", API);
    await waitFor(() => expect(bodyRows(scoresTable())).toHaveLength(3));
    const toc = await screen.findByRole("navigation", { name: "On this page" });
    await waitFor(() =>
      expect(
        within(toc)
          .getAllByRole("link")
          .map((a) => a.textContent),
      ).toEqual(["Score chart", "RNG factors", "Posted scores", "crumb.gg leaderboard"]),
    );
    const target = (label: string) =>
      document.querySelector(within(toc).getByRole("link", { name: label }).getAttribute("href")!);
    expect(target("Score chart")).toContainElement(screen.getByRole("combobox", { name: "Deck" }));
    expect(target("RNG factors")).toContainElement(
      screen.getByRole("heading", { name: "Who Pomegranate's beams hit" }),
    );
    expect(target("Posted scores")).toBe(scoresTable());
    expect(target("crumb.gg leaderboard")).toBe(rankingsRegion());
  });

  it("colours each deck by its display order, whatever the filter", async () => {
    await renderRoute("/conquest/scores?deck=meso", {
      ...API,
      "/api/scores?deck=meso": { body: [SCORES[0]] },
    });
    await waitFor(() => expect(bodyRows(scoresTable())).toHaveLength(1));
    const dot = document.querySelector("circle.dot") as SVGCircleElement;
    expect(dot.style.fill).toBe("var(--s2)");
    expect(screen.getByRole("combobox", { name: "Deck" })).toHaveValue("meso");
  });

  it("names the failed resource when decks fail, instead of silently losing names and colours", async () => {
    await renderRoute("/conquest/scores", {
      ...API,
      "/api/decks?mode=guild_conquest": { status: 500, body: { error: "internal" } },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load decks");
    await waitFor(() => expect(bodyRows(scoresTable())).toHaveLength(3));
  });

  it("filters by deck through the ?deck= search param", async () => {
    const router = await renderRoute("/conquest/scores", {
      ...API,
      "/api/scores?deck=cherry": { body: [SCORES[1]] },
    });
    const select = await screen.findByRole("combobox", { name: "Deck" });
    await waitFor(() => expect(within(select).getAllByRole("option")).toHaveLength(3));
    fireEvent.change(select, { target: { value: "cherry" } });
    await waitFor(() => expect(router.state.location.search).toEqual({ deck: "cherry" }));
    await waitFor(() => expect(bodyRows(scoresTable()).map((r) => r[0])).toEqual(["1.31T"]));
  });

  it("drops unusable search params from the URL when a filter changes", async () => {
    const router = await renderRoute("/conquest/scores?board=junk&season=x", {
      ...API,
      "/api/scores?deck=cherry": { body: [SCORES[1]] },
    });
    const select = await screen.findByRole("combobox", { name: "Deck" });
    await waitFor(() => expect(within(select).getAllByRole("option")).toHaveLength(3));
    fireEvent.change(select, { target: { value: "cherry" } });
    await waitFor(() => expect(router.state.location.search).toEqual({ deck: "cherry" }));
  });

  it("shows the legacy empty messages with no scores or RNG factors", async () => {
    await renderRoute("/conquest/scores", {
      ...API,
      "/api/scores": { body: [] },
      "/api/rng-factors?mode=guild_conquest": { body: [] },
    });
    expect(await screen.findByText("No scores with both damage and power yet.")).toHaveClass(
      "empty",
    );
    await waitFor(() => expect(bodyRows(scoresTable())).toEqual([["Nothing to show."]]));
    expect(document.querySelector(".grid.g3")).toBeNull();
  });

  it("shows the latest season's players board in rank order by default", async () => {
    await renderRoute("/conquest/scores", API);
    await waitFor(() => expect(bodyRows(rankingsRegion())).toHaveLength(2));
    const rows = bodyRows(rankingsRegion());
    expect(rows.map((r) => r.slice(0, 5))).toEqual([
      ["1", "도리", "Carpediem", "2.45T", "25G"],
      ["2", "김개똥", "월드", "1.92T", "20G"],
    ]);
    expect(within(rankingsRegion()).getByRole("combobox", { name: "Board" })).toHaveValue(
      "players",
    );
    expect(within(rankingsRegion()).getByRole("combobox", { name: "Season" })).toHaveValue("5");
  });

  it("follows the season and board search params, keeping only the latest capture", async () => {
    await renderRoute("/conquest/scores?season=3&board=guilds", API);
    await waitFor(() => expect(bodyRows(rankingsRegion())).toHaveLength(1));
    expect(bodyRows(rankingsRegion())[0]!.slice(0, 3)).toEqual(["1", "Eden", "2.45T"]);
    const season = within(rankingsRegion()).getByRole("combobox", { name: "Season" });
    expect(
      within(season)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["Season 5", "Season 3"]);
  });

  it("changes board through the search params", async () => {
    const router = await renderRoute("/conquest/scores", {
      ...API,
      "/api/rankings?season=5&board=guilds": {
        body: [ranking({ id: 7, board: "guilds", rank: 1, name: "Eden", valueG: 3000 })],
      },
    });
    const board = await screen.findByRole("combobox", { name: "Board" });
    fireEvent.change(board, { target: { value: "guilds" } });
    await waitFor(() => expect(router.state.location.search).toEqual({ board: "guilds" }));
    await waitFor(() =>
      expect(bodyRows(rankingsRegion())[0]!.slice(0, 3)).toEqual(["1", "Eden", "3T"]),
    );
  });

  it("shows an empty message when the board has no capture", async () => {
    await renderRoute("/conquest/scores?season=2&board=players", {
      ...API,
      "/api/rankings?season=2&board=players": { body: [] },
    });
    expect(
      await within(rankingsRegion()).findByText("No crumb.gg capture for this board and season."),
    ).toBeInTheDocument();
  });
});

describe("scores of obsolete decks", () => {
  const withRanged: Record<string, Canned> = {
    ...API,
    "/api/decks?mode=guild_conquest": {
      body: [
        ...DECKS,
        {
          id: "ranged",
          nameEn: "Ranged deck",
          obsoleteSince: "2026-10-12",
          obsoleteReason: "Patched out.",
          obsoleteSources: ["dc:76135"],
        },
      ],
    },
    "/api/scores": {
      body: [...SCORES, score({ id: 4, damageG: 2000, powerG: 30, deckId: "ranged", ratio: 66 })],
    },
  };

  it("ranks by damage among current decks only, and lists an obsolete deck's scores under its notice", async () => {
    await renderRoute("/conquest/scores", withRanged);
    await waitFor(() => expect(bodyRows(scoresTable())).toHaveLength(3));
    expect(bodyRows(scoresTable()).map((r) => r[0])).toEqual(["1.31T", "1T", "867G"]);
    const group = screen.getByRole("region", { name: "Ranged deck, obsolete", hidden: true });
    expect(bodyRows(group).map((r) => r[0])).toEqual(["2T"]);
    expect(within(group).getByRole("note", { hidden: true })).toHaveTextContent(
      "Obsolete since 2026-10-12: Patched out.",
    );
    expect(group.closest("details")).not.toHaveAttribute("open");
    expect(screen.queryByRole("img", { name: /^2T at 30G power/ })).toBeNull();
  });
});
