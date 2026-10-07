import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  DailyDungeon,
  DailyDungeonClear,
  Deck,
  GlossaryEntry,
  ResearchRecord,
  Source,
} from "../src/api/types";
import { DAILY } from "../src/app/modes";
import type { Canned } from "./helpers";
import { CURRENT_DECK } from "./helpers";
import { renderRoute, VIEW_SOURCES } from "./view-harness";

const SLUG = "006-daily-dungeons";

const RECORD = {
  slug: SLUG,
  question: "Which decks clear each daily dungeon furthest?",
  status: "active",
  startedAt: "2026-10-07",
  updatedAt: "2026-10-07",
  seasonLabel: "Game 1.4.002",
  lede: "The daily dungeons, full auto first.",
  caveat: null,
  mode: "daily_dungeon",
  modes: [],
} satisfies ResearchRecord;

const SOURCES = [{ ...VIEW_SOURCES[0]!, id: "dc:90001", records: [SLUG] }] satisfies Source[];

const MILK = "바삭튼튼 소아과 의사 우유맛 쿠키";
const HERB = "허브맛 쿠키";

const GLOSSARY: GlossaryEntry[] = [
  {
    kr: MILK,
    shorthand: [],
    en: "Milk Cookie",
    kind: "cookie",
    element: null,
    class: null,
    rarity: null,
    extra: {},
    recordSlug: SLUG,
  },
];

/**
 * Builds a daily dungeon.
 *
 * @param id - the row's id
 * @param slug - its curated id
 * @param nameEn - its English name
 * @param over - fields to set on top
 * @returns the dungeon
 */
function dungeon(
  id: number,
  slug: string,
  nameEn: string,
  over: Partial<DailyDungeon> = {},
): DailyDungeon {
  return {
    id,
    slug,
    position: id,
    nameEn,
    nameKr: null,
    drops: [],
    entryKeys: null,
    ticketBackOnLoss: null,
    quickClear: null,
    entryNote: null,
    bossKr: null,
    bossEn: null,
    bossElement: null,
    bossWeakness: null,
    bossRotates: null,
    bossRotation: null,
    topStage: null,
    topStageDate: null,
    topStageSource: null,
    notes: [],
    recordSlug: SLUG,
    sources: ["dc:90001"],
    ...over,
  };
}

const DUNGEONS = [
  dungeon(1, "exp", "EXP Dungeon", {
    nameKr: "경험치 던전",
    drops: ["EXP jelly"],
    entryKeys: "2 a day",
    ticketBackOnLoss: true,
    quickClear: false,
    bossElement: "Fire",
    bossWeakness: "Water",
    bossRotates: false,
    topStage: 52,
    topStageDate: "2026-10-06",
    topStageSource: "dc:90001",
    notes: ["Full auto stalls past 45 without a second healer."],
  }),
  dungeon(2, "dough", "Dough Dungeon", { bossRotates: true }),
];

/**
 * Builds a daily dungeon deck.
 *
 * @param id - its id
 * @param nameEn - its English name
 * @param run - its run facts, on `exp` unless they say otherwise
 * @param over - deck fields to set on top
 * @returns the deck
 */
function deck(
  id: string,
  nameEn: string,
  run: Partial<NonNullable<Deck["dailyDungeon"]>>,
  over: Partial<Deck> = {},
): Deck {
  return {
    ...CURRENT_DECK,
    id,
    position: 0,
    mode: "daily_dungeon",
    recordSlug: SLUG,
    nameEn,
    nameKr: null,
    status: "meta",
    ceilingText: null,
    summary: `${nameEn} mechanism.`,
    formation: null,
    perks: null,
    rng: null,
    atkOrder: null,
    atkOrderNote: null,
    sources: ["dc:90001"],
    cookies: [
      {
        id: 1,
        position: 0,
        cookieKr: MILK,
        en: "Milk Cookie",
        level: "100",
        levelRule: null,
        stars: null,
        slot: "row1-1",
        why: "Heals and buffs the line.",
      },
      {
        id: 2,
        position: 1,
        cookieKr: HERB,
        en: null,
        level: null,
        levelRule: "below Milk",
        stars: null,
        slot: "row1-2",
        why: "Second healer.",
      },
    ],
    pets: [{ kr: "황금방울", en: "Gold Drop" }],
    notes: [],
    dailyDungeon: {
      dungeon: "exp",
      auto: "full",
      stage: null,
      power: null,
      powerG: null,
      recommendedPower: null,
      recommendedPowerG: null,
      gearPreset: null,
      captain: null,
      ...run,
    },
    ...over,
  };
}

const DECKS = [
  deck("exp-semi", "Scorpion push", { auto: "semi", stage: 52, power: "2.1G", powerG: 2.1 }),
  deck(
    "exp-auto",
    "Milk auto",
    {
      stage: 45,
      power: "1.85G",
      powerG: 1.85,
      recommendedPower: "2.4G",
      recommendedPowerG: 2.4,
      gearPreset: "Crit-damage preset",
      captain: { kr: MILK, en: "Milk Cookie" },
    },
    { perks: "Heal-boost perk" },
  ),
  deck("exp-manual", "Cherry budget", { auto: "manual", stage: 30 }),
  deck("dough-partial", "Dough weakness", { dungeon: "dough", auto: "semi", stage: 20 }),
];

const CLEARS: DailyDungeonClear[] = [
  {
    id: 1,
    dungeon: "exp",
    stage: 52,
    power: "2.1G",
    powerG: 2.1,
    deckId: "exp-semi",
    auto: "semi",
    date: "2026-10-06",
    player: "player-a",
    evidence: "screenshot",
    note: null,
    recordSlug: SLUG,
    sources: ["dc:90001"],
  },
  {
    id: 2,
    dungeon: "dough",
    stage: 18,
    power: null,
    powerG: null,
    deckId: null,
    auto: null,
    date: "2026-10-04",
    player: null,
    evidence: "text",
    note: "Claimed in a comment.",
    recordSlug: SLUG,
    sources: ["dc:90001"],
  },
];

const API: Record<string, Canned> = {
  [`/api/records/${SLUG}`]: { body: RECORD },
  "/api/sources": { body: SOURCES },
  [`/api/sources?record=${SLUG}`]: { body: SOURCES },
  "/api/glossary": { body: GLOSSARY },
  "/api/daily-dungeons": { body: DUNGEONS },
  "/api/daily-dungeon-clears": { body: CLEARS },
  "/api/decks?mode=daily_dungeon": { body: DECKS },
  "/api/mechanics?mode=daily_dungeon": { body: [] },
};

/**
 * Renders the app at a daily dungeon path against this file's stubbed API.
 *
 * @param path - the URL to open
 * @returns the router
 */
const renderDaily = (path: string) => renderRoute(path, API, { mode: DAILY });

describe("the daily dungeon board", () => {
  it("lists Daily Dungeons in the navigation, the board as its landing tab", async () => {
    await renderDaily("/daily-dungeons");
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    const pages = within(nav).getByRole("list", { name: "Daily Dungeons sections" });
    expect(
      within(pages)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(DAILY.tabs.map((t) => t.to));
    expect(within(pages).getByRole("link", { name: "Dungeons" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("leads with the best full-auto deck: AUTO, stage, power, the crowned captain and pets", async () => {
    await renderDaily("/daily-dungeons");
    const hero = (await screen.findByRole("region", { name: "Best full auto" })).querySelector(
      ".dd-hero",
    ) as HTMLElement;
    expect(within(hero).getByText("AUTO")).toBeVisible();
    expect(hero.querySelector(".dd-stage-fig")).toHaveTextContent("45");
    expect(hero).toHaveTextContent("1.85G");
    expect(hero).toHaveTextContent("rec 2.4G");
    expect(hero).toHaveTextContent("Crit-damage preset");
    expect(hero).toHaveTextContent("Heal-boost perk");
    expect(within(hero).getByRole("link", { name: "Milk auto" })).toBeVisible();
    expect(within(hero).getByRole("img", { name: "Captain" })).toBeVisible();
    expect(hero.querySelector(".slot.captain")).toHaveTextContent("Lv.100");
    expect(hero).toHaveTextContent("Gold Drop");
    expect(hero).toHaveTextContent("Milk auto mechanism.");
  });

  it("ranks the other decks by stage reached, each with its auto badge", async () => {
    await renderDaily("/daily-dungeons");
    const list = await screen.findByRole("region", { name: "Decks by stage" });
    const rows = within(list).getAllByRole("listitem");
    expect(rows.map((r) => r.querySelector(".dd-stage-fig b")?.textContent)).toEqual(["52", "30"]);
    expect(rows.map((r) => r.querySelector(".dd-auto")?.textContent)).toEqual([
      "SEMI-AUTO",
      "MANUAL",
    ]);
    expect(list).not.toHaveTextContent("Milk auto");
    expect(list).not.toHaveTextContent("Dough weakness");
  });

  it("shows the boss and entry facts as chips, and the shown dungeon's clears", async () => {
    await renderDaily("/daily-dungeons");
    const panel = await screen.findByRole("tabpanel");
    const facts = panel.querySelector(".dd-facts") as HTMLElement;
    expect(within(facts).getByText("Fire")).toHaveClass("dd-el", "el-fire");
    expect(within(facts).getByText("Weak: Water")).toHaveClass("el-water");
    expect(within(facts).getByText(/Ticket back on loss/)).toHaveClass("yes");
    expect(within(facts).getByText(/Quick clear/)).toHaveClass("no");
    expect(within(facts).getByText("Fixed boss")).toHaveClass("dd-rotation");
    expect(facts).toHaveTextContent("Top 52 · 2026-10-06");
    const clears = within(panel).getByRole("region", { name: "Clears" });
    expect(within(clears).getAllByRole("listitem")).toHaveLength(1);
    expect(clears).toHaveTextContent("player-a");
  });

  it("switches dungeons through the tabs, the shown one in the URL", async () => {
    const router = await renderDaily("/daily-dungeons");
    const tab = await screen.findByRole("tab", { name: /Dough Dungeon/ });
    expect(screen.getByRole("tab", { name: /EXP Dungeon/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(tab);
    await waitFor(() => expect(router.state.location.search).toEqual({ dungeon: "dough" }));
    expect(
      await screen.findByText("No full-auto deck recorded for this dungeon yet."),
    ).toBeVisible();
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByRole("region", { name: "Decks by stage" })).toHaveTextContent(
      "Dough weakness",
    );
    expect(within(panel).getByRole("region", { name: "Clears" })).toHaveTextContent("text only");
  });

  it("opens the dungeon the URL names", async () => {
    await renderDaily("/daily-dungeons?dungeon=dough");
    expect(await screen.findByRole("tab", { name: /Dough Dungeon/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
