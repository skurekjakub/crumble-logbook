import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  Deck,
  Mechanic,
  PowerBracket,
  Recommendation,
  ResearchRecord,
  RiftBoss,
  RiftClear,
  RiftLevel,
  RiftSeason,
  RuneBuild,
  Source,
  StageChapter,
  StageClear,
  StageZoneSlot,
  Takeaway,
} from "../src/api/types";
import { STAGE } from "../src/app/modes";
import { FINDINGS_SHOWN } from "../src/views/RiftFindings";
import { LEVELS_SHOWN } from "../src/views/RiftView";
import type { Canned } from "./helpers";
import { CURRENT, CURRENT_DECK } from "./helpers";
import { bodyRows, renderRoute, VIEW_SOURCES } from "./view-harness";

const SLUG = "003-stage-pushing-meta";

const RECORD = {
  slug: SLUG,
  question: "What pushes stages under-powered?",
  status: "active",
  startedAt: "2026-09-28",
  updatedAt: "2026-09-28",
  seasonLabel: "Game 1.4.002",
  lede: "What Korean players push stages with.",
  caveat: "Snapshot of 2026-09-28.",
  mode: "stage",
  modes: [
    { mode: "stage", lede: "Main stages and the Rift.", caveat: "Pre-easing clears differ." },
  ],
} satisfies ResearchRecord;

const SOURCES = [
  { ...VIEW_SOURCES[0]!, id: "web:crumblehub-stages", site: "web", records: [SLUG] },
  { ...VIEW_SOURCES[0]!, id: "dc:76835", records: [SLUG] },
] satisfies Source[];

const BRACKETS: PowerBracket[] = [
  [0, 1],
  [10, 5],
  [20, 15],
  [40, 35],
  [60, 55],
  [80, 75],
  [100, 100],
  [120, 120],
].map(([minRatioPct, damagePct], i) => ({
  id: i + 1,
  minRatioPct: minRatioPct!,
  damagePct: damagePct!,
  label: `${minRatioPct}% 이상`,
  sources: ["web:crumblehub-stages"],
}));

/**
 * Builds a chapter with a given recommended power.
 *
 * @param chapter - the chapter
 * @param recommendedPower - its last stage's recommended power
 * @returns the chapter
 */
function chapter(chapter: number, recommendedPower: number): StageChapter {
  return {
    id: chapter,
    chapter,
    zoneIndex: ((chapter - 1) % 8) + 1,
    zone: "폐허 도시 (ruined city)",
    lastStage: `${chapter}-30`,
    bossKr: "비겁한 쿠키",
    bossEn: "GingerCraven",
    recommendedPower,
    accuracyReq: 1203.5,
    focusReq: 1079,
    sources: ["web:crumblehub-stages"],
  };
}

const CHAPTERS = [chapter(1, 1_000_000_000), chapter(2, 4_000_000_000), chapter(3, 10_000_000_000)];

/**
 * Builds a stage deck with one cookie.
 *
 * @param id - the deck's id
 * @param nameEn - its English name
 * @returns the deck
 */
function deck(id: string, nameEn: string): Deck {
  return {
    ...CURRENT_DECK,
    id,
    position: 0,
    mode: "stage",
    recordSlug: SLUG,
    nameEn,
    nameKr: null,
    status: "meta",
    ceilingText: null,
    summary: null,
    formation: null,
    perks: null,
    rng: null,
    atkOrder: null,
    atkOrderNote: null,
    sources: ["dc:76835"],
    cookies: [
      {
        id: 1,
        position: 0,
        cookieKr: "전갈맛 쿠키",
        en: "Scorpion Cookie",
        level: "100",
        levelRule: null,
        stars: null,
        slot: null,
        why: "Poison to 20 stacks.",
      },
    ],
    pets: [],
    notes: [],
  };
}

const DECKS = [deck("stage-charge", "Charge deck"), deck("rift-shred", "Rift shred deck")];

const SLOTS: StageZoneSlot[] = [
  {
    id: 1,
    zoneIndex: 3,
    zoneKr: "폐허 도시",
    zoneEn: "Ruined City",
    position: 0,
    stage: "-30",
    bossKr: "비겁한 쿠키",
    bossEn: "GingerCraven",
    plan: "The GingerCraven deck with damage-reduction perks.",
    deckId: "stage-charge",
    bracketNote: "35%; fails at 15%",
    recordSlug: SLUG,
    sources: ["dc:76835"],
  },
];

/**
 * Builds a documented attempt.
 *
 * @param id - the row's id
 * @param stageNo - the stage within chapter 328
 * @param result - how it ended
 * @param era - before or after the easing
 * @param standing - whether the record accepts it
 * @returns the attempt
 */
function clear(
  id: number,
  stageNo: number,
  result: StageClear["result"],
  era: StageClear["era"],
  standing: StageClear["standing"] = "accepted",
): StageClear {
  return {
    id,
    chapter: 328,
    stageNo,
    bossKr: "비겁한 쿠키",
    bossEn: null,
    en: "Cowardly Cookie",
    era,
    teamPower: `${id}.00G`,
    powerG: id,
    recommendedPower: era === "post-easing" ? 10_004_798_560 : null,
    bracket: 35,
    result,
    play: null,
    evidence: "screenshot",
    standing,
    deckId: "stage-charge",
    note: `note ${id}`,
    recordSlug: SLUG,
    sources: ["dc:76835"],
  };
}

/** In the API's order: the ranked clear, then an accepted failure, then a rejected claim. */
const CLEARS = [
  clear(4, 30, "clear", "post-easing"),
  clear(2, 20, "fail", "pre-easing"),
  clear(3, 30, "clear", "post-easing", "rejected"),
];

const SEASONS: RiftSeason[] = [
  {
    id: 1,
    season: 1,
    firstLevel: 1,
    lastLevel: 2,
    startsAt: "2000-01-01T00:00:00.000Z",
    endsAt: "2100-01-01T00:00:00.000Z",
    sources: ["web:crumblehub-stages"],
  },
  {
    id: 2,
    season: 2,
    firstLevel: 3,
    lastLevel: 3,
    startsAt: "2100-01-01T00:00:00.000Z",
    endsAt: "2100-02-01T00:00:00.000Z",
    sources: ["web:crumblehub-stages"],
  },
];

const LEVELS: RiftLevel[] = [1, 2, 3].map((level) => ({
  id: level,
  level,
  recommendedPower: level * 10_000_000_000,
  sources: ["web:crumblehub-stages"],
}));

const BOSSES: RiftBoss[] = [
  {
    id: 1,
    level: 2,
    bossKr: "폭주단 트럭",
    bossEn: "Rowdy Truck",
    note: "Dark Choco and Devil for shred.",
    recordSlug: SLUG,
    sources: ["dc:76835"],
  },
];

/**
 * Builds a documented Rift attempt: an accepted 15% clear at season 1,
 * level 2, on the Rift shred deck, with `over` applied on top.
 *
 * @param id - the row's id
 * @param over - fields to set instead
 * @returns the attempt
 */
function riftClear(id: number, over: Partial<RiftClear> = {}): RiftClear {
  return {
    id,
    season: 1,
    level: 2,
    bossKr: "폭주단 트럭",
    bossEn: null,
    en: null,
    teamPower: `2.3${id}G`,
    powerG: 2.3,
    powerBasis: "rift",
    riftPowerLevel: 14,
    recommendedPower: null,
    bracket: 15,
    result: "clear",
    play: "manual",
    evidence: "screenshot",
    standing: "accepted",
    deckId: "rift-shred",
    note: `rift note ${id}`,
    recordSlug: SLUG,
    sources: ["dc:76835"],
    ...over,
  };
}

/** In the API's order: the 15% clears, accepted then unverified, then the attempts that bound them. */
const RIFT_CLEARS = [
  riftClear(1),
  riftClear(2, {
    level: 1,
    deckId: null,
    note: "Dark Choco, Devil, Scorpion.",
    standing: "unverified",
  }),
  riftClear(3, { bracket: 35 }),
  riftClear(4, { season: 2, level: 3, result: "fail" }),
];

const TAKEAWAYS: Takeaway[] = [
  {
    id: 1,
    position: 0,
    text: "The Dimensional Rift is a 35% fight at every level.",
    detail: null,
    mode: "stage",
    recordSlug: SLUG,
    sources: ["dc:76835"],
  },
  {
    id: 2,
    position: 1,
    text: "Pad displayed power across the next line.",
    detail: null,
    mode: "stage",
    recordSlug: SLUG,
    sources: ["dc:76835"],
  },
];

const API: Record<string, Canned> = {
  [`/api/records/${SLUG}`]: { body: RECORD },
  "/api/sources": { body: SOURCES },
  [`/api/sources?record=${SLUG}`]: { body: SOURCES },
  "/api/decks?mode=stage": { body: DECKS },
  "/api/decks?mode=stage&current=true": { body: DECKS },
  "/api/power-brackets": { body: BRACKETS },
  "/api/stage-chapters": { body: CHAPTERS },
  "/api/stage-zone-slots": { body: SLOTS },
  "/api/stage-clears": { body: CLEARS },
  "/api/rift-levels": { body: LEVELS },
  "/api/rift-seasons": { body: SEASONS },
  "/api/rift-bosses": { body: BOSSES },
  "/api/rift-clears": { body: RIFT_CLEARS },
  "/api/rift-unlocks": { body: [{ id: 1, stage: "2-30", sources: ["nv:44477"] }] },
  "/api/takeaways?mode=stage": { body: TAKEAWAYS },
  "/api/timeline?mode=stage": { body: [] },
  "/api/rng-factors?mode=stage": { body: [] },
  "/api/rune-builds?mode=stage": { body: [] },
  "/api/rune-builds?mode=stage&current=true": { body: [] },
  "/api/mechanics?mode=stage": { body: [] },
  "/api/mechanics?mode=stage&topic=rules": { body: [] },
  [`/api/recommendations?record=${SLUG}`]: { body: [] },
};

/**
 * Renders the app at a stage path against this file's stubbed API.
 *
 * @param path - the URL to open
 * @returns the router
 */
const renderStage = (path: string) => renderRoute(path, API, { mode: STAGE });

describe("the stage section", () => {
  it("lists Stage in the navigation with its pages, and a stamp of sources and decks", async () => {
    await renderStage("/stage");
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    const pages = within(nav).getByRole("list", { name: "Stage sections" });
    expect(
      within(pages)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(STAGE.tabs.map((t) => t.to));
    await waitFor(() => expect(document.querySelector(".stamp")).toHaveTextContent("Sources2"));
    expect(document.querySelector(".stamp")).toHaveTextContent("Decks2");
    expect(await screen.findByText("Main stages and the Rift.")).toBeVisible();
  });

  it("lists the stage decks on Teams, each cookie with its level and why", async () => {
    await renderStage("/stage/teams");
    expect(await screen.findByRole("heading", { name: /Charge deck/ })).toBeVisible();
    expect(screen.getAllByText("Poison to 20 stacks.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Lv.100").length).toBeGreaterThan(0);
  });
});

/**
 * Each row's text, its cells joined with a space, for checks that don't
 * care which cell holds a word.
 *
 * @param root - where to look
 * @returns a line per body row
 */
const rowTexts = (root: ParentNode) => bodyRows(root).map((cells) => cells.join(" "));

describe("the bracket calculator", () => {
  it("shows each chapter's entry powers from the bracket table without a power, and asks for one where the answer goes", async () => {
    await renderStage("/stage/brackets");
    expect(await screen.findByText(/Type your team power above/)).toBeVisible();
    const card = await screen.findByRole("region", { name: "Chapter by chapter" });
    await waitFor(() => expect(bodyRows(card)).toHaveLength(CHAPTERS.length));
    // Chapter 2: 4G recommended, 35% from 40% of it.
    expect(bodyRows(card)[1]).toContain("1.6G");
    expect(within(card).getAllByRole("link", { name: "crumblehub-stages" }).length).toBe(1);
    expect(card.querySelector("details.chapters")).not.toBeNull();
  });

  it("draws the power gate as a ladder of tinted brackets", async () => {
    await renderStage("/stage/brackets");
    const gate = await screen.findByRole("region", { name: "The power gate" });
    const steps = within(gate).getAllByRole("listitem");
    expect(steps).toHaveLength(BRACKETS.length);
    expect(steps[3]).toHaveTextContent("40%+35%40% 이상");
    expect(steps[3]!.querySelector(".bk.bk-mid")).not.toBeNull();
    expect(steps[2]!.querySelector(".bk.bk-low")).not.toBeNull();
  });

  it("answers first how far each share reaches, then places the power on every chapter", async () => {
    await renderStage("/stage/brackets?power=2G");
    const reach = await screen.findByRole("region", { name: "How far you push" });
    expect(within(reach).getByRole("heading")).toHaveTextContent(/^At 2G/);
    const tiles = within(reach).getAllByRole("listitem");
    expect(tiles.map((t) => t.querySelector(".reach-value")!.textContent)).toEqual([
      "1-30",
      "1-30",
      "1-30",
      "2-30",
      "3-30",
    ]);
    expect(tiles[3]).toHaveTextContent("35%+2-30GingerCraven");
    expect(tiles[4]).toHaveTextContent("every chapter");
    const order = [...document.querySelectorAll("h3")].map((h) => h.textContent);
    expect(order.findIndex((t) => t.startsWith("At 2G"))).toBeLessThan(
      order.indexOf("The power gate"),
    );
    const card = screen.getByRole("region", { name: "Chapter by chapter" });
    const rows = bodyRows(card);
    expect(rows[0]).toContain("120%");
    expect(rows[1]).toContain("35%");
    expect(rows[1]).toContain("55% at 2.4G");
    expect(rows[2]).toContain("15%");
  });

  it("marks a share the power doesn't reach at the first chapter", async () => {
    await renderStage("/stage/brackets?power=100M");
    const reach = await screen.findByRole("region", { name: "How far you push" });
    const tiles = within(reach).getAllByRole("listitem");
    expect(tiles[0]).toHaveClass("none");
    expect(tiles[0]).toHaveTextContent("not yet at 1-30");
  });

  it("asks for a power it can read when the text isn't one", async () => {
    await renderStage("/stage/brackets?power=lots");
    expect(await screen.findByText(/Type a power as the game shows it/)).toBeVisible();
    expect(screen.queryByRole("region", { name: "How far you push" })).toBeNull();
  });

  it("puts a typed power in the URL", async () => {
    const router = await renderStage("/stage/brackets");
    fireEvent.change(await screen.findByLabelText("Team power"), { target: { value: "971.8M" } });
    await waitFor(() => expect(router.state.location.search).toEqual({ power: "971.8M" }));
    expect(await screen.findByText("Read as 971.8M.")).toBeVisible();
  });
});

describe("the zone board", () => {
  it("shows each slot as a tile: boss, bracket cleared at, what to bring as portraits, plan and sources", async () => {
    await renderStage("/stage/zones");
    const zone = await screen.findByRole("region", { name: /Ruined City/ });
    expect(zone).toHaveTextContent("Chapters 171, 179, 187 … every 8th from 169");
    expect(zone).not.toHaveTextContent("Chapters 3,");
    const [slot] = within(zone).getAllByRole("listitem");
    expect(slot).toHaveTextContent("The GingerCraven deck with damage-reduction perks.");
    const cleared = slot!.querySelector(".zslot-cleared")!;
    expect(cleared).toHaveTextContent("35%fails at 15%");
    expect(cleared).toHaveAttribute("title", "35%; fails at 15%");
    expect(cleared.querySelector(".bk.bk-mid")).not.toBeNull();
    expect(slot).toHaveTextContent("GingerCraven");
    expect(await within(zone).findByRole("link", { name: "Charge deck" })).toHaveAttribute(
      "href",
      "/stage/teams#deck-stage-charge",
    );
    const icons = slot!.querySelectorAll(".bring-icons > span");
    expect([...icons].map((i) => i.getAttribute("title"))).toEqual(["Scorpion"]);
    expect(within(zone).getByRole("link", { name: "DC 76835" })).toBeVisible();
  });

  it("names a deck short, its full name in the tooltip", async () => {
    await renderRoute(
      "/stage/zones",
      {
        ...API,
        "/api/decks?mode=stage": {
          body: [deck("stage-charge", "Charge deck (post-easing general deck)"), DECKS[1]!],
        },
      },
      { mode: STAGE },
    );
    const zone = await screen.findByRole("region", { name: /Ruined City/ });
    const link = await within(zone).findByRole("link", { name: "Charge deck" });
    expect(link).toHaveAttribute("title", "Charge deck (post-easing general deck)");
  });

  it("says when no zone plans are recorded", async () => {
    await renderRoute(
      "/stage/zones",
      { ...API, "/api/stage-zone-slots": { body: [] } },
      { mode: STAGE },
    );
    expect(await screen.findByText("No zone plans recorded yet.")).toBeVisible();
  });
});

describe("rows that name an obsolete deck", () => {
  const retired: Record<string, Canned> = {
    ...API,
    "/api/decks?mode=stage": {
      body: [{ ...DECKS[0]!, obsoleteSince: "2026-10-12", obsoleteReason: "Patched." }, DECKS[1]!],
    },
  };

  it("marks the deck obsolete beside its link on the zone board", async () => {
    await renderRoute("/stage/zones", retired, { mode: STAGE });
    const zone = await screen.findByRole("region", { name: /Ruined City/ });
    const link = await within(zone).findByRole("link", { name: "Charge deck" });
    await waitFor(() =>
      expect(link.parentElement!.querySelector(".pill.obsolete")).toHaveTextContent("obsolete"),
    );
  });

  it("marks the deck obsolete on the clears list, and keeps the clears in their ranking", async () => {
    await renderRoute("/stage/clears", retired, { mode: STAGE });
    const ranked = await screen.findByRole("region", { name: "Ranked clears" });
    await waitFor(() => expect(ranked.querySelector(".pill.obsolete")).not.toBeNull());
    expect(bodyRows(ranked)).toHaveLength(1);
    expect(bodyRows(ranked)[0]).toContain("Charge deck obsolete");
  });
});

describe("the clears list", () => {
  it("lists attempts in the API's order, furthest stage first", async () => {
    await renderStage("/stage/clears");
    await waitFor(() => expect(bodyRows(document)).toHaveLength(CLEARS.length));
    expect([...document.querySelectorAll(".stage-at b")].map((b) => b.textContent)).toEqual([
      "328-30",
      "328-20",
      "328-30",
    ]);
  });

  it("ranks only the clears the record accepts, #1 marked, and shows the rest under their own headings", async () => {
    await renderStage("/stage/clears");
    const ranked = await screen.findByRole("region", { name: "Ranked clears" });
    await waitFor(() => expect(bodyRows(ranked)).toHaveLength(1));
    const [first] = bodyRows(ranked);
    expect(first![0]).toBe("#1");
    expect(ranked.querySelector("tr .rank.r1")).not.toBeNull();
    expect(first![1]).toBe("328-30");
    expect(first![3]).toBe("4Gof 10G");
    expect(ranked.querySelector(".pw b")).toHaveAttribute("title", "4.00G");
    expect(first![4]).toBe("35%");
    expect(first![5]).toBe("Clearedscreenshot");
    const failures = screen.getByRole("region", { name: "Failures" });
    expect(rowTexts(failures)[0]).toContain("Failed");
    expect(bodyRows(failures)[0]![0]).toBe("328-20pre-easing");
    expect(bodyRows(failures)[0]).toContain("DC 76835");
    expect(failures.querySelector(".rank")).toBeNull();
    const rejected = screen.getByRole("region", { name: "Rejected claims" });
    expect(bodyRows(rejected)[0]![2]).toBe("3Gof 10G");
    expect(rowTexts(rejected)[0]).toContain("Cleared");
    expect(screen.queryByRole("region", { name: "Unverified claims" })).toBeNull();
    const order = [...document.querySelectorAll("h3")].map((h) => h.textContent);
    expect(order.indexOf("Ranked clears")).toBeLessThan(order.indexOf("Failures"));
    expect(order.indexOf("Failures")).toBeLessThan(order.indexOf("Rejected claims"));
  });

  it("shows a text-only claim as a claim, and keeps a filtered clear's place", async () => {
    const claims = [
      clear(4, 30, "clear", "post-easing"),
      { ...clear(6, 25, "clear", "post-easing"), evidence: "text" as const },
    ];
    await renderRoute(
      "/stage/clears?q=328-25",
      { ...API, "/api/stage-clears": { body: claims } },
      { mode: STAGE },
    );
    const ranked = await screen.findByRole("region", { name: "Ranked clears" });
    await waitFor(() => expect(bodyRows(ranked)).toHaveLength(1));
    expect(bodyRows(ranked)[0]![0]).toBe("#2");
    expect(ranked.querySelector(".pill.claimed")).toHaveTextContent("text only");
  });

  it("cuts a long note to a line or two, with More", async () => {
    const long = { ...clear(4, 30, "clear", "post-easing"), note: "A long note. ".repeat(20) };
    await renderRoute(
      "/stage/clears",
      { ...API, "/api/stage-clears": { body: [long] } },
      { mode: STAGE },
    );
    const ranked = await screen.findByRole("region", { name: "Ranked clears" });
    expect(await within(ranked).findByRole("button", { name: "More" })).toBeVisible();
  });

  it("names a boss in English as the stage tables do, over another record's glossary", async () => {
    await renderStage("/stage/clears");
    const ranked = await screen.findByRole("region", { name: "Ranked clears" });
    await waitFor(() => expect(bodyRows(ranked)[0]![2]).toContain("GingerCraven"));
    expect(bodyRows(ranked)[0]![2]).not.toContain("Cowardly Cookie");
  });

  it("filters by the boss's English and the deck the rows show", async () => {
    await renderStage("/stage/clears?q=GingerCraven");
    await waitFor(() => expect(bodyRows(document)).toHaveLength(CLEARS.length));
    cleanup();
    await renderStage("/stage/clears?q=Charge%20deck");
    await waitFor(() => expect(bodyRows(document)).toHaveLength(CLEARS.length));
    cleanup();
    await renderStage("/stage/clears?q=Cowardly");
    expect(await screen.findByText("Nothing matches.")).toBeVisible();
  });

  it("names a boss by its row's own English over a glossary gloss", async () => {
    const pack = {
      ...clear(5, 4, "fail", "pre-easing"),
      chapter: 289,
      bossKr: "케이크 들개떼",
      bossEn: "Cake Hound Pack",
      en: "Cake Hound Pack (grassland mob stages; Rift level 6)",
    };
    await renderRoute(
      "/stage/clears?q=hound",
      { ...API, "/api/stage-clears": { body: [pack] } },
      { mode: STAGE },
    );
    await waitFor(() => expect(bodyRows(document)).toHaveLength(1));
    expect(bodyRows(document)[0]![1]).toContain("Cake Hound Pack");
    expect(bodyRows(document)[0]![1]).not.toContain("grassland");
  });

  it("filters by result from the URL", async () => {
    await renderStage("/stage/clears?result=fail");
    await waitFor(() => expect(bodyRows(document)).toHaveLength(1));
    expect(rowTexts(document)[0]).toContain("Failed");
  });
});

describe("the Rift at 15% page", () => {
  it("ranks the 15% clears in the API's order: level, boss, power short, the 15% and 35% lines, verdict and team", async () => {
    await renderStage("/stage/rift-15");
    const ranked = await screen.findByRole("region", { name: "Clears at 15%" });
    await waitFor(() => expect(bodyRows(ranked)).toHaveLength(2));
    await waitFor(() => expect(bodyRows(ranked)[0]![4]).toBe("15% 4G35% 8G"));
    const [first, second] = bodyRows(ranked);
    expect(first!.slice(0, 2)).toEqual(["#1", "L2 S1of 20G"]);
    expect(first![2]).toContain("Rowdy Truck");
    expect(first![3]).toBe("2.3GRift power · 차원의 힘 Lv.14");
    expect(first![5]).toBe("acceptedscreenshotmanual");
    expect(first![6]).toBe("Rift shred deckrift note 1");
    expect(second!.slice(0, 2)).toEqual(["–", "L1 S1of 10G"]);
    expect(second![4]).toBe("15% 2G35% 4G");
    expect(second![5]).toContain("unverified");
    expect(second![6]).toBe("Dark Choco, Devil, Scorpion.");
  });

  it("shows each team's card once, under the ranking, and links the rows to it", async () => {
    await renderRoute(
      "/stage/rift-15",
      { ...API, "/api/rift-clears": { body: [riftClear(1), riftClear(5, { level: 1 })] } },
      { mode: STAGE },
    );
    const ranked = await screen.findByRole("region", { name: "Clears at 15%" });
    const links = await within(ranked).findAllByRole("link", { name: "Rift shred deck" });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "#deck-rift-shred");
    const teams = await screen.findByRole("region", { name: "Their teams" });
    expect(within(teams).getAllByRole("heading", { name: /Rift shred deck/ })).toHaveLength(1);
    const order = [...document.querySelectorAll("h3")].map((h) => h.textContent);
    expect(order.indexOf("Clears at 15%")).toBeLessThan(order.indexOf("Their teams"));
  });

  it("keeps a 15% clear that gives no Rift power out of the ranked clears, with the attempts that bound them", async () => {
    await renderRoute(
      "/stage/rift-15",
      {
        ...API,
        "/api/rift-clears": {
          body: [riftClear(1), riftClear(6, { powerBasis: null, teamPower: "not posted" })],
        },
      },
      { mode: STAGE },
    );
    const ranked = await screen.findByRole("region", { name: "Clears at 15%" });
    await waitFor(() => expect(bodyRows(ranked)).toHaveLength(1));
    const bounds = await screen.findByRole("region", { name: "Attempts that bound it" });
    await waitFor(() => expect(bodyRows(bounds)).toHaveLength(1));
    expect(bodyRows(bounds)[0]![2]).toBe("2.3Gbasis unknown · 차원의 힘 Lv.14");
  });

  it("prints a power the post doesn't give short, its words in the tooltip", async () => {
    await renderRoute(
      "/stage/rift-15",
      {
        ...API,
        "/api/rift-clears": {
          body: [
            riftClear(7, { powerBasis: null, powerG: null, teamPower: "not posted (padded)" }),
          ],
        },
      },
      { mode: STAGE },
    );
    const bounds = await screen.findByRole("region", { name: "Attempts that bound it" });
    await waitFor(() => expect(bounds.querySelector(".pw b")).toHaveTextContent("not posted"));
    expect(bounds.querySelector(".pw b")).toHaveAttribute("title", "not posted (padded)");
  });

  it("lists the attempts at other brackets and the 15% failures under their own heading", async () => {
    await renderStage("/stage/rift-15");
    const bounds = await screen.findByRole("region", { name: "Attempts that bound it" });
    await waitFor(() => expect(bodyRows(bounds)).toHaveLength(2));
    expect(bodyRows(bounds)[0]).toContain("35%");
    expect(rowTexts(bounds)[1]).toContain("Failed");
    expect(bodyRows(bounds)[1]![0]).toBe("L3 S2of 30G");
    const order = [...document.querySelectorAll("h3")].map((h) => h.textContent);
    expect(order.indexOf("Clears at 15%")).toBeLessThan(order.indexOf("Attempts that bound it"));
  });

  it("filters by result and by text from the URL", async () => {
    await renderStage("/stage/rift-15?result=fail");
    const bounds = await screen.findByRole("region", { name: "Attempts that bound it" });
    await waitFor(() => expect(bodyRows(bounds)).toHaveLength(1));
    expect(screen.queryByRole("region", { name: "Clears at 15%" })).toBeNull();
    cleanup();
    await renderStage("/stage/rift-15?q=Dark%20Choco");
    const ranked = await screen.findByRole("region", { name: "Clears at 15%" });
    expect(bodyRows(ranked)).toHaveLength(1);
    expect(screen.queryByRole("region", { name: "Attempts that bound it" })).toBeNull();
    cleanup();
    await renderStage("/stage/rift-15?q=nobody");
    expect(await screen.findByText("Nothing matches.")).toBeVisible();
  });

  it("says when the record has no Rift clears yet", async () => {
    await renderRoute(
      "/stage/rift-15",
      { ...API, "/api/rift-clears": { body: [] } },
      { mode: STAGE },
    );
    expect(await screen.findByText("No Rift clears recorded yet.")).toBeVisible();
  });
});

describe("the Dimensional Rift page", () => {
  it("marks the running season and lists its levels with entry powers and reported bosses", async () => {
    await renderStage("/stage/rift");
    const seasons = await screen.findByRole("region", { name: "Seasons" });
    expect(seasons).toHaveTextContent("1 (running)");
    expect(seasons.querySelector(".fact-line")).toHaveTextContent("runningSeason 1levels 1–2");
    expect(seasons).toHaveTextContent("nextSeason 2levels 3–3from 2100-01-01 UTC");
    const levels = screen.getByRole("region", { name: "Levels" });
    await waitFor(() => expect(bodyRows(levels)).toHaveLength(2));
    expect(bodyRows(levels)[1]).toContain("8G");
    expect(levels).toHaveTextContent("Rowdy Truck");
    expect(levels).toHaveTextContent("Dark Choco and Devil for shred.");
  });

  it("asks for a Rift power, then answers first how high each share climbs in the season", async () => {
    await renderStage("/stage/rift");
    expect(await screen.findByText(/Type your Rift power above/)).toBeVisible();
    cleanup();
    await renderStage("/stage/rift?power=5G");
    const reach = await screen.findByRole("region", { name: "How far you climb" });
    const tiles = within(reach).getAllByRole("listitem");
    expect(tiles.map((t) => t.querySelector(".reach-value")!.textContent)).toEqual([
      "–",
      "–",
      "–",
      "L1",
      "L2",
    ]);
    expect(tiles[0]).toHaveTextContent("not yet at L1");
    expect(tiles[4]).toHaveTextContent("every level");
  });

  it("names where the Rift opens from the stored unlock, cited to its own sources, whatever the last chapter", async () => {
    await renderStage("/stage/rift");
    const entry = await screen.findByRole("region", { name: "Getting in" });
    await waitFor(() => expect(entry).toHaveTextContent(/Opens after clearing\s*2-30/));
    expect(entry).not.toHaveTextContent("3-30");
    expect(entry).toHaveTextContent("4G recommended");
    expect(entry).toHaveTextContent("35% from 1.6G");
    const [rule, gate] = [...entry.querySelectorAll("p")];
    expect(within(rule!).getByText("Naver 44477")).toBeVisible();
    expect(within(rule!).queryByText("crumblehub-stages")).toBeNull();
    expect(within(gate!).getByText("crumblehub-stages")).toBeVisible();
  });

  it("lists every season's levels on request, and places a typed power on them", async () => {
    await renderStage("/stage/rift?season=2&power=5G");
    const levels = await screen.findByRole("region", { name: "Levels" });
    await waitFor(() => expect(bodyRows(levels)).toHaveLength(1));
    expect(bodyRows(levels)[0]![0]).toBe("3");
    expect(bodyRows(levels)[0]).toContain("5%15% at 6G");
  });

  it("lists a long season's first levels, and the rest on request", async () => {
    const many: RiftLevel[] = Array.from({ length: 40 }, (_, i) => ({
      id: i + 1,
      level: i + 1,
      recommendedPower: (i + 1) * 10_000_000_000,
      sources: ["web:crumblehub-stages"],
    }));
    await renderRoute(
      "/stage/rift",
      {
        ...API,
        "/api/rift-levels": { body: many },
        "/api/rift-seasons": { body: [{ ...SEASONS[0]!, lastLevel: 40 }] },
      },
      { mode: STAGE },
    );
    const levels = await screen.findByRole("region", { name: "Levels" });
    await waitFor(() => expect(bodyRows(levels)).toHaveLength(LEVELS_SHOWN));
    fireEvent.click(within(levels).getByRole("button", { name: "Show all 40 levels" }));
    expect(bodyRows(levels)).toHaveLength(40);
    expect(within(levels).queryByRole("button", { name: /Show all/ })).toBeNull();
  });

  it("gathers the Rift facts the record keeps elsewhere: mechanics filed under the Rift too, account advice, clear notes and other decks' whys", async () => {
    /**
     * Builds a stage mechanic.
     *
     * @param id - its id
     * @param topic - the topic it is filed under
     * @param alsoTopics - further topics it is filed under
     * @param body - its text
     * @returns the mechanic
     */
    const mechanic = (id: number, topic: string, alsoTopics: string[], body: string) =>
      ({
        id,
        title: `m${id}`,
        body,
        confidence: "high",
        mode: "stage",
        topic,
        alsoTopics,
        recordSlug: SLUG,
        sources: ["dc:76835"],
      }) satisfies Mechanic;
    const charge = DECKS[0]!;
    const riftDecks = [
      {
        ...charge,
        cookies: [...charge.cookies, { ...charge.cookies[0]!, id: 2, why: "His Rift deck." }],
      },
      DECKS[1]!,
    ];
    const api: Record<string, Canned> = {
      ...API,
      "/api/mechanics?mode=stage": {
        body: [
          mechanic(1, "rift", [], "Rift rules: boss-only."),
          mechanic(2, "accuracy-focus", ["rift"], "In the Rift, every miss costs more."),
          mechanic(3, "power-gate", [], "The table also gates the daily dungeons and the Rift."),
        ],
      },
      [`/api/recommendations?record=${SLUG}`]: {
        body: [
          {
            id: 1,
            summary: "Push at 35%.",
            changes: ["Reach 328-30 early: the Rift's 차원의 힘 compounds.", "Pad power."],
            recordSlug: SLUG,
            sources: ["dc:76835"],
          },
        ] satisfies Recommendation[],
      },
      "/api/stage-clears": { body: [{ ...CLEARS[0]!, note: "Entered the Rift after." }] },
      "/api/decks?mode=stage": { body: riftDecks },
      "/api/decks?mode=stage&current=true": { body: riftDecks },
    };
    await renderRoute("/stage/rift", api, { mode: STAGE });
    expect(await screen.findByText("In the Rift, every miss costs more.")).toBeVisible();
    expect(screen.queryByText("The table also gates the daily dungeons and the Rift.")).toBeNull();
    const findings = await screen.findByRole("region", { name: "Elsewhere in the record" });
    await waitFor(() => expect(findings).toHaveTextContent("the Rift's 차원의 힘 compounds"));
    expect(findings).not.toHaveTextContent("Pad power.");
    await waitFor(() => expect(findings).toHaveTextContent("Clear 328-30 Entered the Rift after."));
    expect(findings).toHaveTextContent("Deck: Charge deck Scorpion Cookie: His Rift deck.");
    expect(findings).not.toHaveTextContent("Deck: Rift shred deck");
  });

  it("lists the first findings, cuts a long one to a line, and shows the rest on request", async () => {
    const many: Takeaway[] = Array.from({ length: FINDINGS_SHOWN + 2 }, (_, i) => ({
      id: i + 1,
      position: i,
      text: i === 0 ? `The Rift ${"runs long. ".repeat(20)}` : `Rift finding ${i + 1}.`,
      detail: null,
      mode: "stage",
      recordSlug: SLUG,
      sources: ["dc:76835"],
    }));
    await renderRoute(
      "/stage/rift",
      { ...API, "/api/takeaways?mode=stage": { body: many } },
      { mode: STAGE },
    );
    const findings = await screen.findByRole("region", { name: "Elsewhere in the record" });
    await waitFor(() =>
      expect(within(findings).getAllByRole("listitem")).toHaveLength(FINDINGS_SHOWN),
    );
    expect(within(findings).getByRole("button", { name: "More" })).toBeVisible();
    fireEvent.click(within(findings).getByRole("button", { name: `Show all ${many.length}` }));
    expect(within(findings).getAllByRole("listitem")).toHaveLength(many.length);
  });

  it("leaves obsolete decks and rune builds off the Rift page, asking the API for current ones", async () => {
    const retired = { obsoleteSince: "2026-10-12", obsoleteReason: "Patched." };
    const oldShred = { ...DECKS[1]!, ...retired };
    const oldCharge = {
      ...deck("old-charge", "Old charge deck"),
      ...retired,
      summary: "Ran the Rift before the patch.",
    };
    const oldRune: RuneBuild = {
      ...CURRENT,
      ...retired,
      id: 9,
      cookieKr: "호밀",
      en: "Rye",
      mode: "stage",
      recordSlug: SLUG,
      lines: "Old Rift lines",
      why: "For the Rift before the patch.",
      disputed: null,
      decks: ["rift-shred"],
      sources: ["dc:76835"],
    };
    await renderRoute(
      "/stage/rift",
      {
        ...API,
        "/api/decks?mode=stage": { body: [DECKS[0]!, oldShred, oldCharge] },
        "/api/decks?mode=stage&current=true": { body: [DECKS[0]!] },
        "/api/rune-builds?mode=stage": { body: [oldRune] },
        "/api/rune-builds?mode=stage&current=true": { body: [] },
      },
      { mode: STAGE },
    );
    expect(await screen.findByText("No Rift decks recorded yet.")).toBeVisible();
    expect(screen.queryByRole("heading", { name: /Rift shred deck/ })).toBeNull();
    const main = screen.getByRole("main");
    await waitFor(() => expect(main).toHaveTextContent("Levels"));
    expect(main).not.toHaveTextContent("Old charge deck");
    expect(main).not.toHaveTextContent("Old Rift lines");
  });

  it("shows the Rift decks with their cookies and the record's other Rift findings", async () => {
    await renderStage("/stage/rift");
    expect(await screen.findByRole("heading", { name: /Rift shred deck/ })).toBeVisible();
    expect(screen.queryByRole("heading", { name: /Charge deck/ })).toBeNull();
    const findings = await screen.findByRole("region", { name: "Elsewhere in the record" });
    expect(findings).toHaveTextContent("The Dimensional Rift is a 35% fight at every level.");
    expect(findings).not.toHaveTextContent("Pad displayed power");
  });
});
