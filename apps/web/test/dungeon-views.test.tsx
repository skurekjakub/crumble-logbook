import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  Deck,
  DungeonExclusion,
  DungeonLineup,
  DungeonRun,
  GlossaryEntry,
  Mechanic,
  ResearchRecord,
  RngFactor,
  Source,
} from "../src/api/types";
import { DUNGEON } from "../src/app/modes";
import type { Canned } from "./helpers";
import { bodyRows, renderRoute, VIEW_SOURCES } from "./view-harness";

const SLUG = "004-golden-drop-meta";

const RECORD = {
  slug: SLUG,
  question: "What tops Crumble Dungeon?",
  status: "active",
  startedAt: "2026-09-28",
  updatedAt: "2026-09-28",
  seasonLabel: "Game 1.4.002",
  lede: "What Korean players post in Crumble Dungeon.",
  caveat: "Snapshot of 2026-09-28.",
  mode: "crumble_dungeon",
  modes: [
    {
      mode: "crumble_dungeon",
      lede: "The whole collection against the Holy Golden Drop.",
      caveat: "The fight length comes from the wiki.",
    },
  ],
} satisfies ResearchRecord;

const SOURCES = [
  { ...VIEW_SOURCES[0]!, id: "dc:77306", records: [SLUG] },
  { ...VIEW_SOURCES[0]!, id: "dc:72084", records: [SLUG] },
] satisfies Source[];

const MILK = "바삭튼튼 소아과 의사 우유맛 쿠키";
const SCORPION = "전갈맛 쿠키";
const OVEN = "오븐방랑자 쿠키";
const ION = "이온맛 쿠키로봇";

/**
 * Builds a glossary entry.
 *
 * @param kr - the Korean name
 * @param en - its English gloss
 * @returns the entry
 */
function entry(kr: string, en: string): GlossaryEntry {
  return {
    kr,
    shorthand: [],
    en,
    kind: "cookie",
    element: null,
    class: null,
    rarity: null,
    extra: {},
    recordSlug: SLUG,
  };
}

const GLOSSARY = [
  entry(MILK, "Milk Cookie"),
  entry(SCORPION, "Scorpion Cookie"),
  entry(OVEN, "Oven Wanderer Cookie"),
  entry(ION, "Ion Cookie Robot"),
];

const DECK: Deck = {
  id: "dungeon-milk-scorpion-figure",
  position: 0,
  mode: "crumble_dungeon",
  recordSlug: SLUG,
  nameEn: "Milk–Scorpion beam lineup",
  nameKr: null,
  status: "meta",
  ceilingText: "379.3G at 15.58G total power",
  summary: null,
  formation: null,
  perks: "Passion Pay + Rapid Promotion",
  rng: null,
  atkOrder: [
    { kr: MILK, en: "Milk Cookie" },
    { kr: SCORPION, en: "Scorpion Cookie" },
  ],
  atkOrderNote: null,
  sources: ["dc:77306"],
  cookies: [
    {
      id: 1,
      position: 0,
      cookieKr: MILK,
      en: "Milk Cookie",
      level: "100",
      levelRule: null,
      stars: null,
      slot: null,
      why: "Captain with the top ATK.",
    },
    {
      id: 2,
      position: 1,
      cookieKr: SCORPION,
      en: "Scorpion Cookie",
      level: null,
      levelRule: "ATK #2: levelled down until only Milk's ATK is higher",
      stars: null,
      slot: null,
      why: "First beam target after Milk.",
    },
  ],
  pets: [],
  notes: [],
};

/**
 * Builds a documented run.
 *
 * @param id - the row's id
 * @param slug - its curated id
 * @param scoreG - its score, in G
 * @param over - fields to set on top
 * @returns the run
 */
function run(id: number, slug: string, scoreG: number, over: Partial<DungeonRun> = {}): DungeonRun {
  return {
    id,
    slug,
    date: "2026-09-28",
    player: `player ${id}`,
    server: null,
    scoreG,
    totalPowerG: null,
    board: "run",
    serverRank: null,
    timeLeftS: null,
    cookiesLeft: null,
    evidence: "screenshot",
    standing: "verified",
    deckId: null,
    atkOrder: null,
    perks: null,
    preset: null,
    note: null,
    recordSlug: SLUG,
    sources: ["dc:77306"],
    ...over,
  };
}

/** In the API's order: the shown runs by score, then the claims by score. */
const RUNS = [
  run(1, "run-top", 379.313, {
    totalPowerG: 15.579,
    serverRank: 1,
    timeLeftS: 0,
    deckId: DECK.id,
    atkOrder: "Milk, Scorpion, Figure",
    server: "a server in the 100s",
  }),
  run(2, "run-efficient", 244.687, { totalPowerG: 6.623, timeLeftS: 2, cookiesLeft: 0 }),
  run(3, "run-weekly", 219.532, { board: "weekly-best", evidence: "video", totalPowerG: 7.26 }),
  run(4, "run-claim", 350, {
    board: "claim",
    evidence: "text",
    standing: "claim",
    player: null,
    server: "1",
    sources: ["dc:72084"],
  }),
];

const LINEUPS: DungeonLineup[] = [
  {
    id: 1,
    slug: "ndrunner-2026-09-18",
    author: "ND러너",
    date: "2026-09-18",
    deckId: DECK.id,
    complete: true,
    first40: [MILK, SCORPION, ION],
    excluded: [OVEN],
    atkOrder: [MILK, SCORPION],
    levelRule: "Excluded cookies at Lv.1.",
    recordSlug: SLUG,
    sources: ["dc:77306"],
  },
];

const EXCLUSIONS: DungeonExclusion[] = [
  {
    id: 1,
    cookieKr: OVEN,
    en: "Oven Wanderer Cookie",
    kind: "charger",
    why: "Drags Milk off the ranged dealers.",
    status: "excluded",
    recordSlug: SLUG,
    sources: ["dc:77306"],
  },
  {
    id: 2,
    cookieKr: ION,
    en: "Ion Cookie Robot",
    kind: "charger",
    why: "Shields the lowest-HP ally; one guide keeps it.",
    status: "disputed",
    recordSlug: SLUG,
    sources: ["dc:77306"],
  },
];

const RULES: Mechanic[] = [
  {
    id: 1,
    mode: "crumble_dungeon",
    topic: "rules",
    alsoTopics: [],
    title: "Every cookie enters; the top 40 by power deploy first",
    body: "No formation, no pet choice and no manual control.",
    confidence: "high",
    recordSlug: SLUG,
    sources: ["dc:77306"],
  },
];

const RNG: RngFactor[] = [
  {
    id: 1,
    mode: "crumble_dungeon",
    factor: "Run-to-run spread",
    effect: "The same lineup lands tens of G apart.",
    mitigation: "Spend every key.",
    recordSlug: SLUG,
    sources: ["dc:77306"],
  },
];

const API: Record<string, Canned> = {
  [`/api/records/${SLUG}`]: { body: RECORD },
  "/api/sources": { body: SOURCES },
  [`/api/sources?record=${SLUG}`]: { body: SOURCES },
  "/api/decks?mode=crumble_dungeon": { body: [DECK] },
  "/api/dungeon-runs": { body: RUNS },
  "/api/dungeon-lineups": { body: LINEUPS },
  "/api/dungeon-exclusions": { body: EXCLUSIONS },
  "/api/glossary": { body: GLOSSARY },
  "/api/takeaways?mode=crumble_dungeon": { body: [] },
  "/api/rng-factors?mode=crumble_dungeon": { body: RNG },
  "/api/mechanics?mode=crumble_dungeon": { body: [] },
  "/api/mechanics?mode=crumble_dungeon&topic=rules": { body: RULES },
  [`/api/recommendations?record=${SLUG}`]: { body: [] },
};

/**
 * Renders the app at a Crumble Dungeon path against this file's stubbed API.
 *
 * @param path - the URL to open
 * @returns the router
 */
const renderDungeon = (path: string) => renderRoute(path, API, { mode: DUNGEON });

describe("the Crumble Dungeon section", () => {
  it("lists Crumble Dungeon in the navigation with its pages, and its rules on the overview", async () => {
    await renderDungeon("/dungeon");
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    const pages = within(nav).getByRole("list", { name: "Crumble Dungeon sections" });
    expect(
      within(pages)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(DUNGEON.tabs.map((t) => t.to));
    expect(await screen.findByRole("heading", { name: "How Crumble Dungeon works" })).toBeVisible();
    expect(screen.getByText("No formation, no pet choice and no manual control.")).toBeVisible();
    expect(screen.getByText("The fight length comes from the wiki.")).toBeVisible();
    await waitFor(() => expect(document.querySelector(".stamp")).toHaveTextContent("Decks1"));
  });

  it("shows each team's cookies with their level or level rule and why, and the ATK order", async () => {
    await renderDungeon("/dungeon/teams");
    const card = (
      await screen.findByRole("heading", { name: /Milk–Scorpion beam lineup/ })
    ).closest("article")!;
    expect(within(card).getAllByText("Lv.100").length).toBeGreaterThan(0);
    expect(card).toHaveTextContent("ATK #2: levelled down until only Milk's ATK is higher");
    expect(card).toHaveTextContent("First beam target after Milk.");
    expect(card.querySelector(".order")).toHaveTextContent("Milk Cookie›Scorpion Cookie");
  });
});

describe("the runs board", () => {
  it("ranks the shown runs by score, never by score ÷ power, and lists the text-only claims apart", async () => {
    await renderDungeon("/dungeon/runs");
    const ranked = await screen.findByRole("region", { name: "Ranked runs" });
    await waitFor(() => expect(bodyRows(ranked)).toHaveLength(3));
    expect(bodyRows(ranked).map((r) => [r[0], r[1]])).toEqual([
      ["1", "379.3G"],
      ["2", "244.7G"],
      ["3", "219.5G"],
    ]);
    // The second run has the higher score ÷ power; it still ranks below the first.
    expect(bodyRows(ranked)[0]![3]).toBe("24.3×");
    expect(bodyRows(ranked)[1]![3]).toBe("36.9×");
    const claims = screen.getByRole("region", { name: "Text-only claims" });
    expect(bodyRows(claims)).toHaveLength(1);
    expect(bodyRows(claims)[0]![0]).toBe("–");
    expect(bodyRows(claims)[0]![1]).toBe("350G");
    expect(bodyRows(claims)[0]).toContain("Text only");
    const headers = [...ranked.querySelectorAll("th")].map((th) => th.textContent);
    expect(headers).toContain("Total power (collection)");
    expect(headers).toContain("Score ÷ power (normaliser)");
  });

  it("shows each run's total power, time and cookies left, board, server place, evidence and build", async () => {
    await renderDungeon("/dungeon/runs");
    const ranked = await screen.findByRole("region", { name: "Ranked runs" });
    await waitFor(() => expect(bodyRows(ranked)).toHaveLength(3));
    const [top, efficient, weekly] = bodyRows(ranked);
    expect(top![2]).toBe("15.58G");
    expect(top![4]).toBe("0 s");
    expect(top![6]).toContain("Run result");
    expect(top![6]).toContain("1st on the server");
    expect(top![6]).toContain("Server: a server in the 100s");
    expect(top![7]).toBe("Screenshot");
    expect(top![9]).toContain("ATK order: Milk, Scorpion, Figure");
    expect(efficient![5]).toBe("0");
    expect(weekly![6]).toContain("Weekly best");
    expect(weekly![7]).toBe("Video");
    expect(
      await within(ranked).findByRole("link", { name: "Milk–Scorpion beam lineup" }),
    ).toHaveAttribute("href", "/dungeon/teams#deck-dungeon-milk-scorpion-figure");
    expect(await screen.findByText("Run-to-run spread.")).toBeVisible();
  });

  it("filters by board and evidence from the URL, and puts a picked filter in the URL", async () => {
    await renderDungeon("/dungeon/runs?evidence=text");
    const claims = await screen.findByRole("region", { name: "Text-only claims" });
    expect(bodyRows(claims)).toHaveLength(1);
    expect(screen.queryByRole("region", { name: "Ranked runs" })).toBeNull();
    cleanup();
    const router = await renderDungeon("/dungeon/runs");
    fireEvent.change(await screen.findByRole("combobox", { name: "Board" }), {
      target: { value: "weekly-best" },
    });
    await waitFor(() => expect(router.state.location.search).toEqual({ board: "weekly-best" }));
    const ranked = await screen.findByRole("region", { name: "Ranked runs" });
    await waitFor(() => expect(bodyRows(ranked)).toHaveLength(1));
    expect(bodyRows(ranked)[0]![0]).toBe("3");
  });
});

describe("the lineups", () => {
  it("shows a lineup's ATK order, level rule, first wave, what it leaves out and the exclusions it keeps", async () => {
    await renderDungeon("/dungeon/lineups");
    const card = (await screen.findByRole("heading", { name: /ND러너/ })).closest("article")!;
    await waitFor(() =>
      expect(card.querySelector(".order")).toHaveTextContent("Milk Cookie›Scorpion Cookie"),
    );
    expect(card).toHaveTextContent("Excluded cookies at Lv.1.");
    expect(card).toHaveTextContent("The list names 3 cookies; the first 40 by power deploy first.");
    const wave = card.querySelector("ol.wave")!;
    expect([...wave.querySelectorAll("li")].map((li) => li.textContent)).toEqual([
      `Milk Cookie ${MILK}`,
      `Scorpion Cookie ${SCORPION}`,
      `Ion Cookie Robot ${ION}`,
    ]);
    expect(wave.querySelector("li.flagged")).toHaveTextContent("Ion Cookie Robot");
    await waitFor(() => expect(card).toHaveTextContent(`Oven Wanderer Cookie ${OVEN} · Charger`));
    expect(card).toHaveTextContent("is on the exclusions list (Charger, disputed)");
    expect(within(card).getByRole("link", { name: "Milk–Scorpion beam lineup" })).toHaveAttribute(
      "href",
      "/dungeon/teams#deck-dungeon-milk-scorpion-figure",
    );
  });
});

describe("the exclusions", () => {
  it("lists each exclusion with its kind, status, why and the lineups that leave it out or keep it", async () => {
    await renderDungeon("/dungeon/exclusions");
    await waitFor(() => expect(bodyRows(document)).toHaveLength(EXCLUSIONS.length));
    const [oven, ion] = bodyRows(document);
    expect(oven![0]).toContain("Oven Wanderer Cookie");
    expect(oven![1]).toBe("Charger");
    expect(oven![2]).toBe("Excluded");
    expect(oven![3]).toBe("Drags Milk off the ranged dealers.");
    await waitFor(() => expect(bodyRows(document)[0]![4]).toBe("ND러너 2026-09-18"));
    expect(bodyRows(document)[0]![5]).toBe("–");
    expect(ion![2]).toBe("Disputed");
    expect(bodyRows(document)[1]![5]).toBe("ND러너 2026-09-18");
    expect(screen.getAllByRole("link", { name: "ND러너 2026-09-18" })[0]).toHaveAttribute(
      "href",
      "/dungeon/lineups#lineup-ndrunner-2026-09-18",
    );
  });

  it("filters by status from the URL", async () => {
    await renderDungeon("/dungeon/exclusions?status=disputed");
    await waitFor(() => expect(bodyRows(document)).toHaveLength(1));
    expect(bodyRows(document)[0]![0]).toContain("Ion Cookie Robot");
  });
});
