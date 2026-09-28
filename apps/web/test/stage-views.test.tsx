import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  Deck,
  Mechanic,
  PowerBracket,
  Recommendation,
  ResearchRecord,
  RiftBoss,
  RiftLevel,
  RiftSeason,
  Source,
  StageChapter,
  StageClear,
  StageZoneSlot,
  Takeaway,
} from "../src/api/types";
import { STAGE } from "../src/app/modes";
import type { Canned } from "./helpers";
import { CURRENT_DECK } from "./helpers";
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
  "/api/power-brackets": { body: BRACKETS },
  "/api/stage-chapters": { body: CHAPTERS },
  "/api/stage-zone-slots": { body: SLOTS },
  "/api/stage-clears": { body: CLEARS },
  "/api/rift-levels": { body: LEVELS },
  "/api/rift-seasons": { body: SEASONS },
  "/api/rift-bosses": { body: BOSSES },
  "/api/rift-unlocks": { body: [{ id: 1, stage: "2-30", sources: ["nv:44477"] }] },
  "/api/takeaways?mode=stage": { body: TAKEAWAYS },
  "/api/timeline?mode=stage": { body: [] },
  "/api/rng-factors?mode=stage": { body: [] },
  "/api/rune-builds?mode=stage": { body: [] },
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

describe("the bracket calculator", () => {
  it("shows each chapter's entry powers from the bracket table without a power", async () => {
    await renderStage("/stage/brackets");
    const table = await screen.findByRole("heading", { name: "Chapter by chapter" });
    const card = table.closest("section")!;
    await waitFor(() => expect(bodyRows(card)).toHaveLength(CHAPTERS.length));
    // Chapter 2: 4G recommended, 35% from 40% of it.
    expect(bodyRows(card)[1]).toContain("1.6G");
    expect(within(card).getAllByRole("link", { name: "crumblehub-stages" }).length).toBe(1);
  });

  it("places a typed power on every chapter and says how far each share reaches", async () => {
    await renderStage("/stage/brackets?power=2G");
    const reach = await screen.findByRole("region", { name: "How far you push" });
    expect(reach).toHaveTextContent("100% of damage or more: through 1-30");
    expect(reach).toHaveTextContent("35% of damage or more: through 2-30 (GingerCraven)");
    expect(reach).toHaveTextContent("15% of damage or more: every chapter to 3-30");
    const card = screen.getByRole("heading", { name: "Chapter by chapter" }).closest("section")!;
    const rows = bodyRows(card);
    expect(rows[0]).toContain("120%");
    expect(rows[1]).toContain("35%");
    expect(rows[1]).toContain("55% at 2.4G");
    expect(rows[2]).toContain("15%");
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
  it("shows each zone's slots with the plan, a link to the deck's card and the sources", async () => {
    await renderStage("/stage/zones");
    const zone = (await screen.findByRole("heading", { name: /Ruined City/ })).closest("section")!;
    expect(zone).toHaveTextContent("Chapters 171, 179, 187, … every 8th chapter (fixed from 169).");
    expect(zone).not.toHaveTextContent("Chapters 3,");
    expect(zone).toHaveTextContent("The GingerCraven deck with damage-reduction perks.");
    expect(zone).toHaveTextContent("35%; fails at 15%");
    expect(await within(zone).findByRole("link", { name: "Charge deck" })).toHaveAttribute(
      "href",
      "/stage/teams#deck-stage-charge",
    );
    expect(within(zone).getByRole("link", { name: "DC 76835" })).toBeVisible();
  });
});

describe("the clears list", () => {
  it("lists attempts in the API's order, furthest stage first", async () => {
    await renderStage("/stage/clears");
    await waitFor(() => expect(bodyRows(document)).toHaveLength(CLEARS.length));
    expect(bodyRows(document).map((r) => r[0])).toEqual(["328-30", "328-20", "328-30"]);
    expect(bodyRows(document)[0]).toContain("Cleared");
  });

  it("ranks only the clears the record accepts, and shows the rest under their own headings", async () => {
    await renderStage("/stage/clears");
    const ranked = await screen.findByRole("region", { name: "Ranked clears" });
    await waitFor(() => expect(bodyRows(ranked)).toHaveLength(1));
    expect(bodyRows(ranked)[0]![3]).toMatch(/^4\.00G/);
    const failures = screen.getByRole("region", { name: "Failures" });
    expect(bodyRows(failures)[0]).toContain("Failed");
    expect(bodyRows(failures)[0]).toContain("DC 76835");
    const rejected = screen.getByRole("region", { name: "Rejected claims" });
    expect(bodyRows(rejected)[0]![3]).toMatch(/^3\.00G/);
    expect(bodyRows(rejected)[0]).toContain("Cleared");
    expect(screen.queryByRole("region", { name: "Unverified claims" })).toBeNull();
    const order = [...document.querySelectorAll("h3")].map((h) => h.textContent);
    expect(order.indexOf("Ranked clears")).toBeLessThan(order.indexOf("Failures"));
    expect(order.indexOf("Failures")).toBeLessThan(order.indexOf("Rejected claims"));
  });

  it("names a boss in English as the stage tables do, over another record's glossary", async () => {
    await renderStage("/stage/clears");
    await waitFor(() => expect(bodyRows(document)[0]![1]).toContain("GingerCraven"));
    expect(bodyRows(document)[0]![1]).not.toContain("Cowardly Cookie");
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
    expect(bodyRows(document)[0]).toContain("Failed");
  });
});

describe("the Dimensional Rift page", () => {
  it("marks the running season and lists its levels with entry powers and reported bosses", async () => {
    await renderStage("/stage/rift");
    const seasons = (await screen.findByRole("heading", { name: "Seasons" })).closest("section")!;
    expect(seasons).toHaveTextContent("1 (running)");
    const levels = screen.getByRole("heading", { name: "Levels" }).closest("section")!;
    await waitFor(() => expect(bodyRows(levels)).toHaveLength(2));
    expect(bodyRows(levels)[1]).toContain("8G");
    expect(levels).toHaveTextContent("Rowdy Truck");
    expect(levels).toHaveTextContent("Dark Choco and Devil for shred.");
  });

  it("names where the Rift opens from the stored unlock, cited to its own sources, whatever the last chapter", async () => {
    await renderStage("/stage/rift");
    const entry = (await screen.findByRole("heading", { name: "Getting in" })).closest("section")!;
    await waitFor(() => expect(entry).toHaveTextContent("The Rift opens after clearing 2-30."));
    expect(entry).not.toHaveTextContent("3-30");
    expect(entry).toHaveTextContent("4G recommended, the 35% bracket from 1.6G");
    const [rule, gate] = [...entry.querySelectorAll("p")];
    expect(within(rule!).getByText("Naver 44477")).toBeVisible();
    expect(within(rule!).queryByText("crumblehub-stages")).toBeNull();
    expect(within(gate!).getByText("crumblehub-stages")).toBeVisible();
  });

  it("lists every season's levels on request, and places a typed power on them", async () => {
    await renderStage("/stage/rift?season=2&power=5G");
    const levels = (await screen.findByRole("heading", { name: "Levels" })).closest("section")!;
    await waitFor(() => expect(bodyRows(levels)).toHaveLength(1));
    expect(bodyRows(levels)[0]![0]).toBe("3");
    expect(bodyRows(levels)[0]).toContain("5%15% at 6G");
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
      "/api/decks?mode=stage": {
        body: [
          {
            ...charge,
            cookies: [...charge.cookies, { ...charge.cookies[0]!, id: 2, why: "His Rift deck." }],
          },
          DECKS[1]!,
        ],
      },
    };
    await renderRoute("/stage/rift", api, { mode: STAGE });
    expect(await screen.findByText("In the Rift, every miss costs more.")).toBeVisible();
    expect(screen.queryByText("The table also gates the daily dungeons and the Rift.")).toBeNull();
    const findings = (
      await screen.findByRole("heading", { name: "Elsewhere in the record" })
    ).closest("section")!;
    await waitFor(() => expect(findings).toHaveTextContent("the Rift's 차원의 힘 compounds"));
    expect(findings).not.toHaveTextContent("Pad power.");
    await waitFor(() => expect(findings).toHaveTextContent("Clear 328-30 Entered the Rift after."));
    expect(findings).toHaveTextContent("Deck: Charge deck Scorpion Cookie: His Rift deck.");
    expect(findings).not.toHaveTextContent("Deck: Rift shred deck");
  });

  it("shows the Rift decks with their cookies and the record's other Rift findings", async () => {
    await renderStage("/stage/rift");
    expect(await screen.findByRole("heading", { name: /Rift shred deck/ })).toBeVisible();
    expect(screen.queryByRole("heading", { name: /Charge deck/ })).toBeNull();
    const findings = (
      await screen.findByRole("heading", { name: "Elsewhere in the record" })
    ).closest("section")!;
    expect(findings).toHaveTextContent("The Dimensional Rift is a 35% fight at every level.");
    expect(findings).not.toHaveTextContent("Pad displayed power");
  });
});
