import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AccountOverview } from "../src/api/types";
import {
  byPriority,
  compactFigures,
  costTone,
  figure,
  gauge,
  humanize,
  leadClause,
  payoffTone,
  readingTime,
} from "../src/lib/account";
import { keyLabel } from "../src/views/AccountLineups";
import { renderRoute } from "./view-harness";

const CHERRY = { kr: "체리 쿠키", en: "Cherry Cookie", resourceKey: "cookie0024" };

const OVERVIEW = {
  snapshot: {
    id: "2026-10-07",
    date: "2026-10-07",
    capturedAt: "2026-10-07T12:30",
    file: "snapshots/2026-10-07.json",
    profile: [
      { name: "level", value: "192" },
      { name: "combatPower", value: "47813382000", at: "2026-10-07T17:13:00+02:00" },
    ],
    lineups: [
      {
        id: 1,
        lineup: "arena_def",
        label: null,
        gameMode: "arena",
        power: "24270000",
        captain: CHERRY,
        pets: [{ kr: "갓난갓방울", en: "Holy Baby Drop", resourceKey: "pet4001" }],
        gearPreset: "Conquest (equipped); lineup editor lists Power",
        deck: {
          record: "002-pvp-meta",
          entity: "deck",
          id: "arena-rye",
          label: "Rye deck",
          mode: "arena",
          found: true,
          obsolete: true,
        },
        note: null,
        cookies: [
          {
            id: 1,
            position: 0,
            name: "체리맛 쿠키",
            ...CHERRY,
            level: "100",
            stars: "9",
            skillLevel: "V",
            power: "4510000000",
            promotion: "max",
            gear: [],
            runes: ["Skill Haste 21 ×5 +1?"],
            pet: null,
          },
          {
            id: 2,
            position: 1,
            name: "미확인 쿠키",
            kr: "미확인 쿠키",
            en: null,
            resourceKey: null,
            level: null,
            stars: null,
            skillLevel: null,
            power: null,
            promotion: null,
            gear: [],
            runes: [],
            pet: null,
          },
        ],
      },
      {
        id: 2,
        lineup: "crumble_dungeon",
        label: null,
        gameMode: "crumble_dungeon",
        power: null,
        captain: null,
        pets: [],
        gearPreset: null,
        deck: null,
        note: "all owned cookies",
        cookies: [],
      },
    ],
    pets: [
      {
        name: "Holy Baby Drop",
        kr: "갓난갓방울",
        en: "Holy Baby Drop",
        resourceKey: "pet4001",
        chips: ["SSR", "20★"],
        detail: "Ally ATK +20%",
      },
    ],
    resources: [{ name: "gems", value: "216560" }],
    unread: ["guild research screen"],
  },
  roadmap: {
    id: "2026-10-07",
    date: "2026-10-07",
    snapshotId: "2026-10-07",
    verdict: "A top-3 account.",
    items: [
      {
        id: 2,
        position: 1,
        priority: "later",
        area: null,
        action: "Level runes to 15",
        why: null,
        payoff: "power: +3%",
        size: "big",
        cost: "Paid pulls.",
        refs: [],
      },
      {
        id: 1,
        position: 0,
        priority: "now",
        area: "arena",
        action: "Swap to the Bari dive deck",
        why: "It beats the Rye defence at your spec.",
        payoff: "The record's top Arena deck. You're 4th with the Rye deck.",
        size: null,
        cost: "Free; lineup slots 3–5 are spare.",
        refs: [
          {
            record: "002-pvp-meta",
            entity: "deck",
            id: "arena-bari",
            label: "Bari dive",
            mode: "arena",
            found: true,
            obsolete: false,
          },
          {
            record: "002-pvp-meta",
            entity: "file",
            id: "curated/runes.json",
            label: "runes",
            mode: "arena",
            found: true,
            obsolete: false,
          },
          {
            record: null,
            entity: null,
            id: "gone",
            label: "gone",
            mode: null,
            found: false,
            obsolete: false,
          },
        ],
      },
    ],
    parked: [{ avenue: "Stage pushing", why: "328-30 is the last stage.", refs: [] }],
  },
  snapshots: [
    { id: "2026-10-07", date: "2026-10-07" },
    { id: "2026-10-01", date: "2026-10-01" },
  ],
  roadmaps: [{ id: "2026-10-07", date: "2026-10-07" }],
} satisfies AccountOverview;

const EMPTY = {
  snapshot: null,
  roadmap: null,
  snapshots: [],
  roadmaps: [],
} satisfies AccountOverview;

describe("/account", () => {
  it("sits among the shared sections, marked current in the nav", async () => {
    await renderRoute("/account", { "/api/account": { body: EMPTY } });
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    expect(within(nav).getByRole("link", { name: "Account" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("shows a short empty state when no account is imported", async () => {
    await renderRoute("/account", { "/api/account": { body: EMPTY } });
    expect(await screen.findByText("No account audit yet.")).toBeVisible();
    expect(screen.queryByText(/pnpm/)).toBeNull();
    expect(screen.queryByRole("heading", { name: "Roadmap" })).toBeNull();
  });

  it("puts the profile and roadmap first, grouped now before later, with badges and ref chips", async () => {
    await renderRoute("/account", { "/api/account": { body: OVERVIEW } });
    const roadmap = await screen.findByRole("heading", { name: "Roadmap" });
    const lineups = screen.getByRole("heading", { name: "Lineups" });
    expect(
      roadmap.compareDocumentPosition(lineups) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const power = screen.getByText("Combat power").nextSibling as HTMLElement;
    expect(power).toHaveTextContent("47.8G17:13");
    expect(power).toHaveAttribute("title", "47813382000, read 2026-10-07T17:13:00+02:00");
    expect(screen.getByText("A top-3 account.")).toBeVisible();
    const groups = [...document.querySelectorAll(".road-group .prio")].map((g) => g.textContent);
    expect(groups).toEqual(["Now", "Later", "Parked"]);
    const row = screen.getByText("Swap to the Bari dive deck").closest("li")!;
    expect(within(row).getByText("arena")).toHaveClass("chip", "area");
    expect(within(row).getByTitle(/^Payoff: /)).toHaveTextContent("The record's top Arena deck");
    expect(within(row).getByTitle(/^Cost: /)).toHaveClass("pill", "t-good");
    expect(within(row).getByTitle(/^Cost: /)).toHaveTextContent(/^Free$/);
    const detail = row.querySelector(".road-why")!;
    expect(detail).toHaveTextContent("Cost: lineup slots 3–5 are spare.");
    expect(detail).not.toHaveTextContent("Cost: Free");
    expect(within(row).getByRole("link", { name: "Bari dive" })).toHaveAttribute(
      "href",
      "/arena/teams#deck-arena-bari",
    );
    expect(within(row).getByRole("link", { name: "runes" })).toHaveAttribute(
      "href",
      "/arena/runes",
    );
    expect(within(row).getByText("gone").closest(".chip")).toHaveClass("ref", "missing");
    const later = screen.getByText("Level runes to 15").closest("li")!;
    expect(within(later).getByTitle(/^Cost: /)).toHaveClass("t-bad");
    expect(within(later).getByTitle(/^Payoff: /)).toHaveTextContent(/^Big$/);
    expect(within(later).getByTitle(/^Payoff: /)).toHaveClass("t-good");
    expect(later.querySelector(".road-why")).toHaveTextContent("Payoff: power: +3%");
  });

  it("shows each lineup's cookies with level, stars, runes and the captain, and what couldn't be read", async () => {
    await renderRoute("/account", { "/api/account": { body: OVERVIEW } });
    expect(await screen.findByRole("heading", { name: "Arena defense" })).toBeVisible();
    const tile = screen.getByText("Cherry").closest("li")!;
    expect(tile).toHaveClass("captain");
    expect(within(tile).getByText("Lv.100")).toBeVisible();
    expect(within(tile).getByText("9★")).toBeVisible();
    expect(within(tile).getByText("Skill Haste 21 ×5 +1?")).toHaveClass("chip", "kit", "rune");
    expect(tile.querySelector("img.cicon")).toHaveAttribute("src", "/icons/cookie0024.webp");
    const unknown = screen.getByText("미확인 쿠키").closest("li")!;
    expect(unknown.querySelector(".cicon.badge")).not.toBeNull();
    const preset = screen.getByTitle(/^Gear preset: /);
    expect(preset).toHaveTextContent(/^Conquest \(equipped\)$/);
    expect(preset).toHaveAttribute(
      "title",
      "Gear preset: Conquest (equipped); lineup editor lists Power",
    );
    expect(screen.getByText("24.3M")).toHaveClass("chip", "power");
    expect(screen.getByText("all owned cookies")).toBeVisible();
    expect(screen.getByText("guild research screen")).toHaveClass("chip", "quiet");
    expect(screen.getAllByRole("link", { name: "Arena →" })[0]).toHaveAttribute("href", "/arena");
  });

  it("puts an obsolete deck's pill before its label, and cuts only the label short", async () => {
    await renderRoute("/account", { "/api/account": { body: OVERVIEW } });
    const chip = (await screen.findByText("Rye deck")).closest("a")!;
    expect(chip).toHaveClass("chip", "ref");
    expect(chip).toHaveAttribute("title", "002-pvp-meta · deck · arena-rye (obsolete)");
    const [pill, label] = [...chip.children];
    expect(pill).toHaveClass("pill", "obsolete");
    expect(label).toHaveClass("ref-label");
    expect(label).toHaveTextContent("Rye deck");
  });

  it("selects the latest option when the latest snapshot is asked for by id", async () => {
    await renderRoute("/account?snapshot=2026-10-07", {
      "/api/account?snapshot=2026-10-07": { body: OVERVIEW },
    });
    const picker = await screen.findByRole("combobox", { name: "Snapshot" });
    expect((picker as HTMLSelectElement).selectedOptions[0]).toHaveTextContent(
      "2026-10-07 (latest)",
    );
  });

  it("asks for an older snapshot when one is picked", async () => {
    const router = await renderRoute("/account", {
      "/api/account": { body: OVERVIEW },
      "/api/account?snapshot=2026-10-01": { body: { ...OVERVIEW, snapshot: null } },
    });
    fireEvent.change(await screen.findByRole("combobox", { name: "Snapshot" }), {
      target: { value: "2026-10-01" },
    });
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ snapshot: "2026-10-01" });
    });
    expect(await screen.findByText("No lineups read yet.")).toBeVisible();
  });
});

describe("account lib", () => {
  it("groups by priority in now, next, later order", () => {
    const groups = byPriority(OVERVIEW.roadmap.items);
    expect(groups.map((g) => g.priority)).toEqual(["now", "later"]);
  });

  it("reads a payoff and a cost as verdicts", () => {
    expect(payoffTone("high")).toBe("good");
    expect(payoffTone("+10% Elemental DMG")).toBe("good");
    expect(payoffTone("Unmeasured.")).toBe("quiet");
    expect(costTone("Free; a reset refunds all EXP.")).toBe("good");
    expect(costTone("Paid pulls.")).toBe("bad");
    expect(costTone("Rune crystals.")).toBe("warn");
  });

  it("reads a stated payoff size before the payoff's wording, and leaves the detail what the badge doesn't say", () => {
    expect(gauge("payoff", "One more beam reaches a buffer.", "big")).toEqual({
      text: "Big",
      tone: "good",
      rest: "One more beam reaches a buffer.",
    });
    expect(gauge("payoff", "Unmeasured.", "small")).toMatchObject({ text: "Small", tone: "quiet" });
    expect(gauge("payoff", "Unmeasured.")).toEqual({
      text: "Unmeasured",
      tone: "quiet",
      rest: null,
    });
    expect(gauge("cost", "Free; a reset refunds all EXP.", "big")).toEqual({
      text: "Free",
      tone: "good",
      rest: "a reset refunds all EXP.",
    });
    expect(gauge("payoff", "Beams 4–6 go back to the buffers, as in the deck")).toMatchObject({
      text: "Beams 4–6 go back to the…",
      rest: "Beams 4–6 go back to the buffers, as in the deck",
    });
  });

  it("words figures, keys and lead clauses for badges", () => {
    expect(figure("80", "level")).toBe("Lv.80");
    expect(figure("7", "stars")).toBe("7★");
    expect(figure("V", "skill")).toBe("V");
    expect(figure(null, "level")).toBeNull();
    expect(compactFigures("1120000000000 → 132360000000")).toBe("1.12T → 132G");
    expect(compactFigures("4/5")).toBe("4/5");
    expect(humanize("combatPower")).toBe("Combat power");
    expect(keyLabel("rumble_atk")).toBe("Rumble attack");
    expect(leadClause("Free; lineup slots 3–5 are spare.")).toBe("Free");
    expect(readingTime("2026-10-07T17:13:00+02:00")).toBe("17:13");
    expect(readingTime("later")).toBe("later");
    expect(leadClause("Beams 4–6 go back to the buffers, as in the deck")).toBe(
      "Beams 4–6 go back to the…",
    );
  });
});
