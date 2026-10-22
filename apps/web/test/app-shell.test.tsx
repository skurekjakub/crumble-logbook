import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  Counter,
  DailyDungeon,
  Deck,
  DungeonExclusion,
  DungeonLineup,
  GlossaryEntry,
  PowerBracket,
  PowerSource,
  ResearchRecord,
  RiftBoss,
  RiftClear,
  RuneBuild,
  ShopPackage,
  Source,
  SpendingOrder,
  SpendingStep,
  StageChapter,
  StageClear,
  StageZoneSlot,
  UsageStat,
} from "../src/api/types";
import type { ModeSection } from "../src/app/modes";
import { CONQUEST, MODES, SHARED_SECTIONS, STAGE } from "../src/app/modes";
import type { Canned } from "./helpers";
import { CURRENT, CURRENT_DECK } from "./helpers";
import { renderRoute } from "./view-harness";

/** The router's not-found state, as the panel shows it. */
const NOT_FOUND = "Nothing lives at this address. Pick a section above.";

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
  modes: [],
} satisfies ResearchRecord;

const SOURCES = [
  { id: "dc:76135", site: "dc", url: "https://example.test/dc/76135", title: "1T" },
  { id: "nv:43653", site: "nv", url: "https://example.test/nv/43653", title: "Cherry" },
] satisfies Partial<Source>[];

const DECKS = [{ id: "cherry" }, { id: "meso" }, { id: "herb" }] satisfies Partial<Deck>[];

const API: Record<string, Canned> = {
  "/api/records/001-guild-conquest-meta": { body: RECORD },
  "/api/sources": { body: SOURCES },
  "/api/sources?record=001-guild-conquest-meta": { body: SOURCES },
  "/api/decks?mode=guild_conquest": { body: DECKS },
  "/api/takeaways?mode=guild_conquest": { body: [] },
  "/api/recommendations?record=001-guild-conquest-meta": { body: [] },
  "/api/rune-builds?mode=guild_conquest&current=true": { body: [] },
  "/api/gear-recs?mode=guild_conquest&current=true": { body: [] },
};

/**
 * Renders the whole app at `path` against this file's stubbed API.
 *
 * @param path - the URL to open
 * @param api - the canned responses, by request path
 * @returns the router
 */
const renderAt = (path: string, api: Record<string, Canned> = API) => renderRoute(path, api);

/**
 * Lists the navigation's top-level section links, in order.
 *
 * @param nav - the navigation landmark
 * @returns the links
 */
const sectionLinks = (nav: HTMLElement) => [
  ...nav.querySelectorAll<HTMLAnchorElement>("a.nav-section-link"),
];

/**
 * Reads the stamp's label → value pairs.
 *
 * @returns the pairs, by label
 */
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
    expect(document.querySelector("header.top h1 .title-tag")).toHaveTextContent(
      /^Guild Conquest$/,
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

  it("counts only the current decks in the header", async () => {
    await renderAt("/conquest", {
      ...API,
      "/api/decks?mode=guild_conquest": {
        body: [...DECKS.slice(0, 2), { id: "herb", obsoleteSince: "2026-10-12" }],
      },
    });
    await waitFor(() => expect(stamp().Decks).toBe("2"));
  });

  it("groups the sections under labelled lists, the game modes first, leaving out a group with no sections", async () => {
    await renderAt("/conquest/decks");
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    const play = [
      "Guild Conquest",
      "Arena",
      "Rumble Arena",
      "Stage",
      "Crumble Dungeon",
      "Daily Dungeons",
    ];
    const you = ["Team power", "Account"];
    const reference = ["Damage formula", "Research", "Sources", "Glossary"];
    for (const [name, members] of [
      ["Play", play],
      ["You", you],
      ["Reference", reference],
    ] as const) {
      const group = within(nav).getByRole("list", { name });
      expect(sectionLinks(group).map((a) => a.textContent)).toEqual(members);
      expect(within(nav).getByText(name, { selector: ".nav-group-label" })).toBeVisible();
    }
    expect(within(nav).queryByRole("list", { name: "Builds" })).toBeNull();
    expect(sectionLinks(nav).map((a) => a.textContent)).toEqual([...play, ...you, ...reference]);
  });

  it("nests the current section's pages under it in its group, marking the current ones", async () => {
    await renderAt("/conquest/decks");
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    const conquest = within(within(nav).getByRole("list", { name: "Play" })).getByRole("link", {
      name: "Guild Conquest",
    });
    expect(conquest).toHaveAttribute("href", "/conquest");
    expect(conquest).toHaveAttribute("aria-current", "true");
    expect(within(nav).getByRole("link", { name: "Arena" })).not.toHaveAttribute("aria-current");
    const setup = within(nav).getByRole("list", { name: "Guild Conquest Setup" });
    const decks = within(setup).getByRole("link", { name: "Decks" });
    expect(decks).toHaveAttribute("href", "/conquest/decks");
    expect(decks).toHaveAttribute("aria-current", "page");
    expect(within(setup).getByRole("link", { name: "Best setup" })).not.toHaveAttribute(
      "aria-current",
    );
    const details = within(nav).getByRole("list", { name: "Guild Conquest Details" });
    expect(within(details).getByRole("link", { name: "Scores & RNG" })).toHaveAttribute(
      "href",
      "/conquest/scores",
    );
    expect(within(nav).getAllByRole("link", { current: "page" })).toEqual([decks]);
    expect(screen.queryByRole("list", { name: "Arena Setup" })).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByRole("tabpanel")).toBeNull();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("splits a mode's pages into its Setup and Details lists, each in the mode's order", async () => {
    await renderRoute("/stage/rift", {}, { mode: STAGE });
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    const labels = (list: HTMLElement) =>
      within(list)
        .getAllByRole("link")
        .map((a) => a.textContent);
    const setup = within(nav).getByRole("list", { name: "Stage Setup" });
    expect(labels(setup)).toEqual([
      "Best setup",
      "Teams",
      "Sugar runes",
      "Gear",
      "Bracket calculator",
      "Dimensional Rift",
      "Rift at 15%",
    ]);
    expect(within(setup).getByRole("link", { current: "page" })).toHaveTextContent(
      "Dimensional Rift",
    );
    const details = within(nav).getByRole("list", { name: "Stage Details" });
    expect(labels(details)).toEqual([
      "Findings",
      "Zones & bosses",
      "Clears",
      "Usage",
      "Mechanics",
      "Timeline",
    ]);
    expect(within(details).queryByRole("link", { current: "page" })).toBeNull();
    expect(within(nav).getByText("Setup", { selector: ".nav-pages-label" })).toBeVisible();
    expect(within(nav).getByText("Details", { selector: ".nav-pages-label" })).toBeVisible();
  });

  it("heads every mode page with a strip of the mode's Setup pages, as links, the current one marked", async () => {
    const router = await renderRoute("/stage/rift", {}, { mode: STAGE });
    const strip = screen.getByRole("navigation", { name: "Setup pages" });
    const links = within(strip).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual(
      STAGE.tabs.filter((t) => t.group === "setup").map((t) => [t.label, t.to]),
    );
    expect(within(strip).getByRole("link", { current: "page" })).toHaveTextContent(
      "Dimensional Rift",
    );
    expect(strip.compareDocumentPosition(screen.getByRole("main"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.queryByRole("tab")).toBeNull();

    await router.navigate({ to: "/$mode/mechanics", params: { mode: "stage" } });
    await waitFor(() => expect(router.state.location.pathname).toBe("/stage/mechanics"));
    const onDetails = screen.getByRole("navigation", { name: "Setup pages" });
    expect(within(onDetails).queryByRole("link", { current: "page" })).toBeNull();
  });

  it("draws no page strip outside a mode", async () => {
    await renderAt("/sources");
    expect(screen.queryByRole("navigation", { name: "Setup pages" })).toBeNull();
  });

  it("marks a mode link and its Best setup page as the current page on the mode's landing page", async () => {
    await renderAt("/conquest");
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    expect(
      within(nav)
        .getAllByRole("link", { current: "page" })
        .map((a) => a.textContent),
    ).toEqual(["Guild Conquest", "Best setup"]);
  });

  it("opens the navigation from the phone's menu button, which names where the reader is", async () => {
    await renderAt("/conquest/boss");
    const menu = screen.getByRole("button", { name: "Menu: Guild Conquest / Piñata" });
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    expect(nav).toHaveAttribute("id", "site-nav");
    expect(nav).toHaveAttribute("popover", "auto");
    expect(menu).toHaveAttribute("popovertarget", "site-nav");
  });

  it("keeps the phone drawer open after a mode link, so one of its pages can be picked, and closes it after a page link", async () => {
    const router = await renderAt("/conquest/decks");
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    const hidePopover = vi.fn();
    // jsdom has no popover API; stand in for an open drawer.
    Object.assign(nav, { hidePopover, matches: (s: string) => s === ":popover-open" });
    fireEvent.click(within(nav).getByRole("link", { name: "Arena" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/arena"));
    expect(hidePopover).not.toHaveBeenCalled();
    const arena = await within(nav).findByRole("list", { name: "Arena Setup" });
    fireEvent.click(within(arena).getByRole("link", { name: "Gear" }));
    expect(hidePopover).toHaveBeenCalledTimes(1);
    fireEvent.click(within(nav).getByRole("link", { name: "Sources" }));
    expect(hidePopover).toHaveBeenCalledTimes(2);
  });

  it("shows the record's lede on a mode's landing page only", async () => {
    const router = await renderAt("/conquest");
    expect(await screen.findByText(RECORD.lede)).toHaveClass("lede");
    await router.navigate({ to: "/$mode/decks", params: { mode: "conquest" } });
    await waitFor(() => expect(document.querySelector("header.top .lede")).toBeNull());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Piñata Raid Logbook");
  });

  it("serves every mode's every tab at its own URL, and a mode's own copy on it", async () => {
    for (const mode of MODES) {
      for (const tab of mode.tabs) {
        const router = await renderRoute(tab.to, {}, { mode });
        expect(router.state.location.pathname, tab.to).toBe(tab.to);
        expect(screen.queryByText(NOT_FOUND), tab.to).toBeNull();
        const nav = screen.getByRole("navigation", { name: "Logbook" });
        const pages = within(nav).getByRole("list", {
          name: `${mode.label} ${tab.group === "setup" ? "Setup" : "Details"}`,
        });
        expect(within(pages).getByRole("link", { current: "page" }), tab.to).toHaveTextContent(
          tab.label,
        );
        cleanup();
      }
    }
  }, 30_000);

  it("serves a mode's page at a mixed-case path, as the router matches a static segment", async () => {
    for (const [path, id] of [
      ["/Arena/teams", "arena"],
      ["/arena/Teams", "arena"],
      ["/STAGE/Clears", "stage"],
    ] as const) {
      const mode = MODES.find((m) => m.id === id)!;
      await renderRoute(path, {}, { mode });
      expect(await screen.findByRole("list", { name: `${mode.label} Setup` }), path).toBeVisible();
      expect(screen.queryByText(NOT_FOUND), path).toBeNull();
      cleanup();
    }
  });

  it("answers not found for a page the mode doesn't have, and for an unknown mode", async () => {
    for (const path of [
      "/arena/scores",
      "/arena/boss",
      "/conquest/teams",
      "/stage/runs",
      "/dungeon/clears",
      "/stage/planner",
      "/team-power/teams",
      "/nowhere",
    ]) {
      await renderAt(path);
      expect(await screen.findByText(NOT_FOUND), path).toBeVisible();
      cleanup();
    }
  });

  it("redirects / to /conquest", async () => {
    const router = await renderAt("/");
    await waitFor(() => expect(router.state.location.pathname).toBe("/conquest"));
  });

  it("navigates when a link is clicked", async () => {
    const router = await renderAt("/conquest");
    fireEvent.click(screen.getByRole("link", { name: "Arena" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/arena"));
    expect(await screen.findByRole("list", { name: "Arena Setup" })).toBeVisible();
    expect(screen.queryByRole("list", { name: "Guild Conquest Setup" })).toBeNull();
  });

  it("keeps the app working when the research record fails to load, reporting it on every page", async () => {
    const router = await renderAt("/conquest", {
      ...API,
      "/api/records/001-guild-conquest-meta": { status: 500, body: { error: "internal" } },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load research record");
    expect(screen.getByRole("navigation", { name: "Logbook" })).toBeVisible();
    expect(screen.getByRole("main")).toBeInTheDocument();
    await router.navigate({ to: "/$mode/gear", params: { mode: "conquest" } });
    await waitFor(() => expect(router.state.location.pathname).toBe("/conquest/gear"));
    expect(document.querySelector("header.top [role=alert]")).toHaveTextContent(
      "Couldn't load research record",
    );
  });

  it("shows the generic chrome on a shared section, with no empty lede", async () => {
    await renderAt("/sources");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Crumble Logbook");
    expect(screen.getByRole("link", { name: "Sources" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("list", { name: "Guild Conquest Setup" })).toBeNull();
    expect(screen.getByRole("button", { name: "Menu: Sources" })).toBeInTheDocument();
    expect(document.querySelector("header.top .lede")).toBeNull();
  });
});

/** A run of Hangul with a little of the text around it, to name where it sits. */
const HANGUL = /.{0,24}\p{Script=Hangul}[\p{Script=Hangul}\s]*.{0,24}/gu;

/**
 * The Hangul in a string, each run with its surroundings.
 *
 * @param s - the text
 * @returns the runs, empty when there's none
 */
const hangulIn = (s: string): string[] => s.match(HANGUL) ?? [];

/** Korean names the fixtures below carry; each must reach a tooltip, never the page's text. */
const KR = {
  milk: "우유맛 쿠키",
  pet: "와사비문어",
  deck: "체리덱",
  rival: "호밀덱",
  daily: "경험치 던전",
  dailyBoss: "도서관 사서",
  zone: "폐허 도시",
  stageBoss: "비겁한 쿠키",
  riftBoss: "폭주단 트럭",
  bracket: "60% 이상",
  powerSource: "스텔라 링크",
  pack: "열쇠 세트",
} as const;

/** The English chrome's fixtures cite this source. */
const CITE = ["dc:76135"];

/** A cookie with an English name, an element and a class, as the glossary stores them. */
const KR_GLOSSARY = [
  {
    kr: KR.milk,
    shorthand: [],
    en: "Milk Cookie",
    kind: "cookie",
    element: "물/Water",
    class: "지원/Support",
    rarity: null,
    extra: {},
    recordSlug: CONQUEST.recordSlug,
  },
  {
    kr: KR.pet,
    shorthand: [],
    en: "Octo Wasabi",
    kind: "pet",
    element: null,
    class: null,
    rarity: null,
    extra: {},
    recordSlug: CONQUEST.recordSlug,
  },
] satisfies GlossaryEntry[];

/**
 * Builds a deck of a mode whose names are Korean and English, with one
 * Milk slot; its slot's why is curated text in Korean.
 *
 * @param mode - the mode the deck belongs to
 * @param id - the deck's id
 * @param nameEn - its English name
 * @param nameKr - its Korean name
 * @returns the deck
 */
function krDeck(mode: ModeSection, id: string, nameEn: string, nameKr: string): Deck {
  return {
    ...CURRENT_DECK,
    id,
    position: 0,
    mode: mode.scope.mode,
    recordSlug: mode.recordSlug ?? CONQUEST.recordSlug,
    nameEn,
    nameKr,
    status: "meta",
    ceilingText: null,
    summary: "Milk buffs the line.",
    formation: null,
    perks: null,
    rng: null,
    atkOrder: [{ kr: KR.milk, en: "Milk Cookie" }],
    atkOrderNote: null,
    sources: CITE,
    cookies: [
      {
        id: 1,
        position: 0,
        cookieKr: KR.milk,
        en: "Milk Cookie",
        level: "100",
        levelRule: null,
        stars: "8",
        slot: "row1-1",
        why: "공증 8줄",
      },
    ],
    pets: [{ kr: KR.pet, en: "Octo Wasabi" }],
    notes: [],
    dailyDungeon:
      mode.scope.mode === "daily_dungeon"
        ? {
            dungeon: "exp",
            auto: "full",
            stage: 52,
            power: "2.1G",
            powerG: 2.1,
            recommendedPower: null,
            recommendedPowerG: null,
            gearPreset: null,
            captain: { kr: KR.milk, en: "Milk Cookie" },
          }
        : null,
  };
}

/**
 * The mode-scoped answers for one mode: its decks, a Milk rune build whose
 * lines are curated Korean shorthand, a counter between its decks, and
 * Milk's and the pet's usage.
 *
 * @param mode - the mode
 * @returns the canned responses, by request path
 */
function krModeApi(mode: ModeSection): Record<string, Canned> {
  const m = mode.scope.mode;
  const record = mode.recordSlug ?? CONQUEST.recordSlug;
  const decks = [
    krDeck(mode, "cherry", "Cherry deck", KR.deck),
    krDeck(mode, "rye", "Rye deck", KR.rival),
  ];
  const runes = [
    {
      ...CURRENT,
      id: 1,
      cookieKr: KR.milk,
      en: "Milk Cookie",
      mode: m,
      recordSlug: record,
      lines: "All ATK% (8 × 공증)",
      why: "Milk's buff scales with her own ATK.",
      disputed: null,
      decks: ["cherry"],
      sources: CITE,
    },
  ] satisfies RuneBuild[];
  const counters = [
    {
      ...CURRENT,
      id: 1,
      slug: "cherry-vs-rye",
      mode: m,
      teamDeckId: "cherry",
      beatenByDeckId: "rye",
      conditions: null,
      why: "Rye outlasts the burst.",
      confidence: "high",
      recordSlug: record,
      sources: CITE,
    },
  ] satisfies Counter[];
  const usage = [
    {
      id: 1,
      mode: m,
      kind: "cookie",
      subject: KR.milk,
      en: "Milk Cookie",
      members: null,
      usagePct: 80,
      confirmedPct: null,
      sample: "shared decks",
      capturedAt: "2026-09-27",
      note: null,
      recordSlug: record,
      sources: CITE,
    },
    {
      id: 2,
      mode: m,
      kind: "pet",
      subject: KR.pet,
      en: "Octo Wasabi",
      members: null,
      usagePct: 60,
      confirmedPct: null,
      sample: "shared decks",
      capturedAt: "2026-09-27",
      note: null,
      recordSlug: record,
      sources: CITE,
    },
  ] satisfies UsageStat[];
  return {
    [`/api/decks?mode=${m}`]: { body: decks },
    [`/api/decks?mode=${m}&current=true`]: { body: decks },
    [`/api/rune-builds?mode=${m}`]: { body: runes },
    [`/api/rune-builds?mode=${m}&current=true`]: { body: runes },
    [`/api/rune-builds?mode=${m}&deck=cherry&current=true`]: { body: runes },
    [`/api/counters?mode=${m}`]: { body: counters },
    [`/api/counters?mode=${m}&current=true`]: { body: counters },
    [`/api/usage?mode=${m}`]: { body: usage },
  };
}

/** The stage, dungeon, daily dungeon and team-power answers, each naming things in Korean. */
const KR_SHARED_API: Record<string, Canned> = {
  "/api/glossary": { body: KR_GLOSSARY },
  ...Object.fromEntries(
    [
      "power-data-points",
      "price-tiers",
      "growth-curves",
      "planner-steps",
      "rift-levels",
      "rift-seasons",
      "rift-unlocks",
    ].map((path) => [`/api/${path}`, { body: [] }]),
  ),
  "/api/daily-dungeons": {
    body: [
      {
        id: 1,
        slug: "exp",
        position: 1,
        nameEn: "EXP Dungeon",
        nameKr: KR.daily,
        drops: ["EXP jelly"],
        entryKeys: "2 a day",
        ticketBackOnLoss: true,
        quickClear: false,
        entryNote: null,
        bossKr: KR.dailyBoss,
        bossEn: "Librarian",
        bossElement: "어둠/Dark",
        bossWeakness: "빛/Light",
        bossRotates: false,
        bossRotation: null,
        topStage: 52,
        topStageDate: "2026-10-06",
        topStageSource: "dc:76135",
        notes: [],
        recordSlug: "006-daily-dungeons",
        sources: CITE,
      },
    ] satisfies DailyDungeon[],
  },
  "/api/daily-dungeon-clears": { body: [] },
  "/api/stage-zone-slots": {
    body: [
      {
        id: 1,
        zoneIndex: 3,
        zoneKr: KR.zone,
        zoneEn: "Ruined City",
        position: 0,
        stage: "-30",
        bossKr: KR.stageBoss,
        bossEn: "GingerCraven",
        plan: "The Cherry deck with damage-reduction perks.",
        deckId: "cherry",
        bracketNote: "35%",
        recordSlug: "003-stage-pushing-meta",
        sources: CITE,
      },
    ] satisfies StageZoneSlot[],
  },
  "/api/power-brackets": {
    body: [
      { id: 1, minRatioPct: 60, damagePct: 55, label: KR.bracket, sources: CITE },
      { id: 2, minRatioPct: 100, damagePct: 100, label: "100% 이상", sources: CITE },
    ] satisfies PowerBracket[],
  },
  "/api/stage-chapters": {
    body: [
      {
        id: 1,
        chapter: 1,
        zoneIndex: 1,
        zone: "Ruined City",
        lastStage: "1-30",
        bossKr: KR.stageBoss,
        bossEn: "GingerCraven",
        recommendedPower: 1_000_000_000,
        accuracyReq: 1203.5,
        focusReq: 1079,
        sources: CITE,
      },
    ] satisfies StageChapter[],
  },
  "/api/stage-clears": {
    body: [
      {
        id: 1,
        chapter: 1,
        stageNo: 30,
        bossKr: KR.stageBoss,
        bossEn: "GingerCraven",
        en: "Cowardly Cookie",
        era: "post-easing",
        teamPower: "1.00G",
        powerG: 1,
        recommendedPower: 1_000_000_000,
        bracket: 100,
        result: "clear",
        play: null,
        evidence: "screenshot",
        standing: "accepted",
        deckId: "cherry",
        note: "A clean clear.",
        recordSlug: "003-stage-pushing-meta",
        sources: CITE,
      },
    ] satisfies StageClear[],
  },
  "/api/rift-bosses": {
    body: [
      {
        id: 1,
        level: 1,
        bossKr: KR.riftBoss,
        bossEn: "Rowdy Truck",
        note: "Bring shred.",
        recordSlug: "003-stage-pushing-meta",
        sources: CITE,
      },
    ] satisfies RiftBoss[],
  },
  "/api/rift-clears": {
    body: [
      {
        id: 1,
        season: 1,
        level: 1,
        bossKr: KR.riftBoss,
        bossEn: "Rowdy Truck",
        en: null,
        teamPower: "2.30G",
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
        note: "A rift clear.",
        recordSlug: "003-stage-pushing-meta",
        sources: CITE,
      },
    ] satisfies RiftClear[],
  },
  "/api/dungeon-lineups": {
    body: [
      {
        id: 1,
        slug: "ndrunner-2026-09-18",
        author: "NDRunner",
        date: "2026-09-18",
        deckId: "cherry",
        complete: true,
        first40: [KR.milk],
        excluded: [],
        atkOrder: [KR.milk],
        levelRule: "Excluded cookies at Lv.1.",
        recordSlug: "004-golden-drop-meta",
        sources: CITE,
      },
    ] satisfies DungeonLineup[],
  },
  "/api/dungeon-exclusions": {
    body: [
      {
        id: 1,
        cookieKr: KR.milk,
        en: "Milk Cookie",
        kind: "charger",
        why: "Drags the boss off the dealers.",
        status: "excluded",
        recordSlug: "004-golden-drop-meta",
        sources: CITE,
      },
    ] satisfies DungeonExclusion[],
  },
  "/api/power-sources": {
    body: [
      {
        id: 1,
        slug: "stellar_link",
        nameEn: "Stellar Link",
        nameKr: KR.powerSource,
        raises: "Stats.",
        appliesIn: ["stage"],
        materials: [],
        costType: "mixed",
        costPerRoll: null,
        cap: "a cap",
        diminishing: null,
        postedGains: [],
        efficiency: { early: "high", mid: "high", late: "medium", at22g: "high" },
        bracketEffect: "Steady.",
        spendOrder: null,
        patchNotes: null,
        confidence: "high",
        recordSlug: "005-team-power-growth",
        sources: CITE,
      },
    ] satisfies PowerSource[],
  },
  "/api/packages": {
    body: [
      {
        id: 1,
        slug: "keys",
        nameKr: KR.pack,
        nameEn: "Key Set",
        priceKrw: 6000,
        priceUsd: 3.99,
        usdTier: null,
        usdSource: "listed",
        kind: "weekly",
        feeds: ["stellar_link"],
        crystalValuePct: null,
        crystalValueBasis: null,
        contents: null,
        verdict: "Buy it weekly.",
        tier: "light",
        recordSlug: "005-team-power-growth",
        sources: CITE,
      },
    ] satisfies ShopPackage[],
  },
  "/api/spending-orders": {
    body: [
      {
        id: 1,
        slug: "endgame",
        kind: "stage",
        label: "Stages 300–328",
        note: null,
        position: 1,
        recordSlug: "005-team-power-growth",
        sources: CITE,
      },
    ] satisfies SpendingOrder[],
  },
  "/api/spending-steps": {
    body: [
      {
        id: 1,
        orderSlug: "endgame",
        route: "paid",
        position: 1,
        step: null,
        powerSource: "stellar_link",
        packageSlug: "keys",
        basis: "posted",
        basisNote: null,
        why: null,
        recordSlug: "005-team-power-growth",
        sources: CITE,
      },
    ] satisfies SpendingStep[],
  },
};

/**
 * The page's text and its `placeholder` and `aria-label` values, leaving
 * out what sits inside a `data-curated` element: curated research text,
 * which keeps its Korean until the refresh round translates it.
 *
 * @returns the strings
 */
function chromeStrings(): string[] {
  const body = document.body.cloneNode(true) as HTMLElement;
  for (const el of body.querySelectorAll("[data-curated]")) el.remove();
  const attrs = [...body.querySelectorAll("[placeholder], [aria-label]")].flatMap((el) =>
    ["placeholder", "aria-label"].map((a) => el.getAttribute(a) ?? ""),
  );
  return [body.textContent, ...attrs];
}

describe("the English chrome", () => {
  it("shows no Korean outside curated text on any mode's page, moving each Korean name into a tooltip", async () => {
    const api = Object.assign({}, KR_SHARED_API, ...MODES.map(krModeApi)) as Record<string, Canned>;
    const pages: [string, ModeSection][] = [
      ...MODES.flatMap((mode) => mode.tabs.map((t) => [t.to, mode] as [string, ModeSection])),
      ...SHARED_SECTIONS.filter((s) => s.id !== "glossary" && s.id !== "sources").map(
        (s) => [s.to, CONQUEST] as [string, ModeSection],
      ),
    ];
    const titles = new Set<string>();
    const korean: Record<string, string[]> = {};
    for (const [path, mode] of pages) {
      const router = await renderRoute(path, api, { mode });
      const client = router.options.context.queryClient;
      await waitFor(() => expect(client.isFetching(), path).toBe(0));
      await waitFor(() => expect(client.isFetching(), path).toBe(0));
      const hits = chromeStrings().flatMap(hangulIn);
      if (hits.length) korean[path] = hits;
      for (const el of document.querySelectorAll("[title]")) titles.add(el.getAttribute("title")!);
      cleanup();
    }
    expect(korean).toEqual({});
    const tooltips = [...titles].join("\n");
    for (const kr of [...Object.values(KR), CONQUEST.boss.kr]) expect(tooltips).toContain(kr);
  }, 60_000);

  it("keeps the curated text the exemption covers on the page", async () => {
    await renderRoute("/conquest/runes", krModeApi(CONQUEST));
    const lines = await screen.findByText("All ATK% (8 × 공증)");
    expect(lines.closest("[data-curated]")).not.toBeNull();
  });

  it("shows the Korean names on the Glossary", async () => {
    await renderRoute("/glossary", KR_SHARED_API);
    expect(await screen.findByText(KR.milk)).toBeVisible();
  });
});
