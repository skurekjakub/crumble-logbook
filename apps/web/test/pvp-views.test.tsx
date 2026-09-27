import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  Counter,
  Deck,
  DeckCookie,
  GearRec,
  GlossaryEntry,
  Mechanic,
  ResearchRecord,
  RuneBuild,
  Source,
  Takeaway,
  TimelineEvent,
  UsageStat,
} from "../src/api/types";
import type { ModeSection } from "../src/app/modes";
import { ARENA, RUMBLE } from "../src/app/modes";
import type { Canned } from "./helpers";
import { renderRoute, VIEW_SOURCES } from "./view-harness";

const SLUG = "002-pvp-meta";

const RECORD = {
  slug: SLUG,
  question: "What wins in PvP?",
  status: "active",
  startedAt: "2026-09-27",
  updatedAt: "2026-09-27",
  seasonLabel: "Arena Season 5 · Rumble Arena Season 1",
  lede: "What players run in PvP.",
  caveat: "Stars are rarely readable in screenshots.",
  mode: "arena",
  modes: [
    {
      mode: "arena",
      lede: "Regular Arena: two decks lead.",
      caveat: "No stats site covers regular Arena.",
    },
    {
      mode: "rumble_arena",
      lede: "Rumble Arena: one 12-cookie team.",
      caveat: "The game hides some defenders, so usage counts are lower bounds.",
    },
  ],
} satisfies ResearchRecord;

const PVP_SOURCES = [
  {
    ...VIEW_SOURCES[0]!,
    id: "dc:75148",
    url: "https://example.test/dc/75148",
    records: [SLUG],
  },
  {
    ...VIEW_SOURCES[0]!,
    id: "web:crumbgg-rumble-live",
    site: "web",
    url: "https://example.test/crumbgg/rumble",
    records: [SLUG],
  },
] satisfies Source[];

/** A deck cookie with the fields the fixtures don't vary filled in. */
function cookie(
  id: number,
  cookieKr: string,
  en: string | null,
  slot: string | null,
  extra: Partial<DeckCookie> = {},
): DeckCookie {
  return {
    id,
    position: id,
    cookieKr,
    en,
    level: "100",
    levelRule: null,
    stars: "?",
    slot,
    why: `${en ?? cookieKr} why.`,
    ...extra,
  };
}

/** A PvP deck with the fields the fixtures don't vary filled in. */
function deck(id: string, position: number, nameEn: string, over: Partial<Deck> = {}): Deck {
  return {
    id,
    position,
    mode: "arena",
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
    sources: ["dc:75148"],
    cookies: [],
    pets: [],
    notes: [],
    ...over,
  };
}

const DECKS = [
  deck("rye", 1, "Rye one-carry deck", {
    nameKr: "호밀 원툴덱",
    cookies: [
      cookie(1, "마카롱", "Macaron", "row1-1"),
      cookie(2, "호밀", "Rye", "row2-1", { stars: "8" }),
      cookie(3, "허브", "Herb", "row1-6", {
        level: "1",
        stars: "~7 (inferred from the skill effect)",
      }),
    ],
  }),
  deck("bari", 2, "Bari–Oven deck", {
    cookies: [cookie(4, "바리", "Princess Bari", null), cookie(5, "오방", null, null)],
  }),
  deck("crepe", 3, "Crepe–Espresso deck", { status: "niche" }),
] satisfies Deck[];

const COUNTERS = [
  {
    id: 1,
    slug: "rye-vs-bari",
    mode: "arena",
    teamDeckId: "rye",
    beatenByDeckId: "bari",
    conditions: "Bari and Oven at 8–10★.",
    why: "The chargers dive Milk before the shields cycle.",
    confidence: "medium",
    recordSlug: SLUG,
    sources: ["dc:75148"],
  },
  {
    id: 2,
    slug: "bari-vs-crepe",
    mode: "arena",
    teamDeckId: "bari",
    beatenByDeckId: "crepe",
    conditions: null,
    why: "Knockback pushes the divers away.",
    confidence: "low",
    recordSlug: SLUG,
    sources: [],
  },
  {
    id: 3,
    slug: "crepe-vs-rye",
    mode: "arena",
    teamDeckId: "crepe",
    beatenByDeckId: "rye",
    conditions: null,
    why: "Rye outlasts the burst.",
    confidence: "high",
    recordSlug: SLUG,
    sources: ["dc:75148"],
  },
] satisfies Counter[];

/** A rules row. */
function rule(id: number, mode: Mechanic["mode"], title: string, body: string): Mechanic {
  return {
    id,
    title,
    body,
    confidence: "high",
    mode,
    topic: "rules",
    recordSlug: SLUG,
    sources: ["dc:75148"],
  };
}

const ARENA_RULES = [
  rule(1, "arena", "Format", "Asynchronous auto-battle against a saved defense."),
  rule(2, "arena", "Team size", "12 cookies and 3 pets per side."),
  rule(3, "arena", "Season buffs", "Regular Arena has no season passive."),
] satisfies Mechanic[];

const RUMBLE_RULES = [
  rule(11, "rumble_arena", "Format", "The same auto-battle, cross-server."),
  rule(
    12,
    "rumble_arena",
    "Season buffs",
    "Season 1: Charge cookies get +30% max HP, and all cookies and summons get +30% DMG reduction.",
  ),
] satisfies Mechanic[];

const MECHANICS = [
  {
    id: 20,
    title: "Rye beats Bari is mostly Rumble evidence",
    body: "Rumble's DR lets the tanks survive.",
    confidence: "medium",
    mode: "arena",
    topic: null,
    recordSlug: SLUG,
    sources: ["dc:75148"],
  },
  ...ARENA_RULES,
] satisfies Mechanic[];

const TAKEAWAYS = [
  {
    id: 1,
    position: 1,
    text: "Two decks lead regular Arena.",
    detail: null,
    mode: "arena",
    recordSlug: SLUG,
    sources: ["dc:75148"],
  },
] satisfies Takeaway[];

/** A Rumble usage row with the sample fields filled in. */
function usage(id: number, over: Partial<UsageStat>): UsageStat {
  return {
    id,
    mode: "rumble_arena",
    kind: "cookie",
    subject: "석류맛 쿠키",
    en: "Pomegranate Cookie",
    members: null,
    usagePct: 100,
    confirmedPct: null,
    sample: "top 100 Rumble Arena defenses on crumb.gg",
    capturedAt: "2026-09-27",
    note: "Lower bound: hidden slots.",
    recordSlug: SLUG,
    sources: ["web:crumbgg-rumble-live"],
    ...over,
  };
}

const USAGE = [
  usage(1, {}),
  usage(2, { subject: "허브맛 쿠키", en: "Herb Cookie", usagePct: 64.5 }),
  usage(3, {
    kind: "core",
    subject: "tank line",
    en: null,
    members: ["이온맛 쿠키로봇", "미확인 쿠키"],
    usagePct: 98,
    confirmedPct: 52,
    note: "usage_pct is the upper bound; confirmed_pct has every member revealed.",
  }),
  usage(4, { kind: "pet", subject: "핫도그도그", en: "Hot Doggie", usagePct: 90, note: null }),
] satisfies UsageStat[];

const GLOSSARY = [
  {
    kr: "이온맛 쿠키로봇",
    shorthand: [],
    en: "Ion Cookie Robot",
    kind: "cookie",
    element: null,
    class: null,
    rarity: null,
    extra: {},
    recordSlug: SLUG,
  },
] satisfies GlossaryEntry[];

const RUNES = [
  {
    id: 1,
    cookieKr: "호밀",
    en: "Rye",
    mode: "arena",
    recordSlug: SLUG,
    lines: "ATK% ×2 + skill amp",
    why: "Rank behind Milk for the first beam.",
    disputed: null,
    decks: ["rye"],
    sources: ["dc:75148"],
  },
] satisfies RuneBuild[];

const GEAR = [
  {
    id: 1,
    mode: "arena",
    recordSlug: SLUG,
    slot: "top_right",
    substats: "Skill haste on every right-side piece",
    context: "arena",
    why: "Shields before the dive lands.",
    sources: ["dc:75148"],
  },
] satisfies GearRec[];

const TIMELINE = [
  {
    id: 1,
    date: "2026-09-23",
    event: "Rumble Arena opens.",
    mode: "arena",
    recordSlug: SLUG,
    sources: [],
  },
] satisfies TimelineEvent[];

/** The canned API every PvP test starts from, for `mode`. */
function api(mode: ModeSection): Record<string, Canned> {
  const m = mode.scope.mode;
  return {
    [`/api/records/${SLUG}`]: { body: RECORD },
    "/api/sources": { body: [...VIEW_SOURCES, ...PVP_SOURCES] },
    [`/api/sources?record=${SLUG}`]: { body: PVP_SOURCES },
    [`/api/decks?mode=${m}`]: { body: DECKS },
    [`/api/takeaways?mode=${m}`]: { body: m === "arena" ? TAKEAWAYS : [] },
    [`/api/recommendations?record=${SLUG}`]: { body: [] },
    [`/api/mechanics?mode=${m}&topic=rules`]: {
      body: m === "arena" ? ARENA_RULES : RUMBLE_RULES,
    },
    [`/api/mechanics?mode=${m}`]: { body: MECHANICS },
    [`/api/counters?mode=${m}`]: { body: COUNTERS },
    [`/api/usage?mode=${m}`]: { body: USAGE },
    "/api/glossary": { body: GLOSSARY },
    [`/api/rune-builds?mode=${m}`]: { body: RUNES },
    [`/api/gear-recs?mode=${m}`]: { body: GEAR },
    [`/api/timeline?mode=${m}`]: { body: TIMELINE },
  };
}

/** Renders the app at `path` in `mode`, with this file's API plus `overrides`. */
const renderAt = (path: string, mode: ModeSection, overrides: Record<string, Canned> = {}) =>
  renderRoute(path, { ...api(mode), ...overrides }, { mode });

/** The view's main landmark. */
const panel = () => within(screen.getByRole("main"));

/** The stamp's label → value pairs. */
function stamp(): Record<string, string> {
  const el = document.querySelector(".stamp")!;
  return Object.fromEntries(
    [...el.querySelectorAll("div")].map((d) => [
      d.querySelector(".label")!.textContent,
      d.querySelector("b")!.textContent,
    ]),
  );
}

describe("PvP chrome", () => {
  it("fills the Arena header from the record's Arena lede, and counts only the record's sources", async () => {
    await renderAt("/arena", ARENA);
    expect(await screen.findByText("Regular Arena: two decks lead.")).toHaveClass("lede");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Arena Logbook");
    expect(document.querySelector("header.top .label")).toHaveTextContent(
      "Cookie Run: Crumble · 아레나",
    );
    await waitFor(() =>
      expect(stamp()).toEqual({ Updated: "2026-09-27", Sources: "2", Decks: "3" }),
    );
    expect(screen.getByRole("contentinfo")).toHaveTextContent("research/002-pvp-meta/");
  });

  it("fills the Rumble Arena header from the record's Rumble lede", async () => {
    await renderAt("/rumble", RUMBLE);
    expect(await screen.findByText("Rumble Arena: one 12-cookie team.")).toHaveClass("lede");
    expect(document.querySelector("header.top .label")).toHaveTextContent("와글와글 아레나");
  });

  it("lists each PvP mode's pages under it in the navigation", async () => {
    await renderAt("/arena/counters", ARENA);
    const sub = within(screen.getByRole("navigation", { name: "Logbook" })).getByRole("list", {
      name: "Arena sections",
    });
    expect(
      within(sub)
        .getAllByRole("link")
        .map((t) => t.textContent),
    ).toEqual([
      "Overview",
      "Teams",
      "Counters",
      "Usage",
      "Sugar runes",
      "Gear",
      "Mechanics",
      "Timeline",
    ]);
    expect(within(sub).getByRole("link", { name: "Counters" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});

describe("PvP overview", () => {
  it("shows the mode's caveat, the record's caveat, the season buffs apart, the rules card and takeaways", async () => {
    await renderAt("/arena", ARENA);
    expect(await panel().findByText("No stats site covers regular Arena.")).toHaveClass("note");
    expect(panel().getByText(RECORD.caveat)).toHaveClass("note");

    const buffs = (await panel().findByRole("heading", { name: "Season buffs" })).closest(
      ".card",
    ) as HTMLElement;
    expect(within(buffs).getByText("Regular Arena has no season passive.")).toBeVisible();
    expect(within(buffs).getByRole("link", { name: "DC 75148" })).toBeVisible();

    const rules = panel()
      .getByRole("heading", { name: "How Arena works" })
      .closest(".card") as HTMLElement;
    expect([...rules.querySelectorAll("dt")].map((dt) => dt.textContent)).toEqual([
      "Format",
      "Team size",
    ]);
    expect(within(rules).getByText("12 cookies and 3 pets per side.")).toBeVisible();
    expect(within(rules).getAllByRole("link", { name: "DC 75148" })).toHaveLength(2);

    expect(await panel().findByText("Two decks lead regular Arena.")).toBeVisible();
  });

  it("states Rumble Arena's Season 1 buffs", async () => {
    await renderAt("/rumble", RUMBLE);
    const buffs = (await panel().findByRole("heading", { name: "Season buffs" })).closest(
      ".card",
    ) as HTMLElement;
    expect(buffs).toHaveTextContent("Charge cookies get +30% max HP");
    expect(buffs).toHaveTextContent("+30% DMG reduction");
    expect(await panel().findByText("No takeaways yet.")).toHaveClass("empty");
  });

  it("says so when a mode has no rules recorded", async () => {
    await renderAt("/arena", ARENA, { "/api/mechanics?mode=arena&topic=rules": { body: [] } });
    expect(await panel().findByText("No rules recorded yet.")).toHaveClass("empty");
    expect(panel().queryByRole("heading", { name: "Season buffs" })).toBeNull();
  });
});

describe("PvP teams", () => {
  /** The card of the deck whose heading matches `name`. */
  const card = async (name: RegExp) =>
    (await panel().findByRole("heading", { name })).closest("article") as HTMLElement;

  it("lays a slotted deck out by slot, not stored order: rows top to bottom, columns back to front", async () => {
    await renderAt("/arena/teams", ARENA);
    const rye = await card(/Rye one-carry deck/);
    const rows = [...rye.querySelectorAll(".formation .formation-row")].map((row) =>
      [...row.children].map((cell) => cell.querySelector(".nm")?.textContent ?? ""),
    );
    expect(rows).toEqual([
      ["Macaron", "", "", "", "", "Herb"],
      ["Rye", "", "", "", "", ""],
    ]);
    expect(rye.querySelector(".formation")).toHaveTextContent(/Back.*Front/);
    expect(rye.querySelector(".lineup")).toBeNull();
    expect(rye.querySelector('[data-slot="row1-6"]')).toHaveClass("slot", "filler");
  });

  it("lists slot, level, stars and why per cookie", async () => {
    await renderAt("/arena/teams", ARENA);
    const rye = await card(/Rye one-carry deck/);
    const levels = rye.querySelector("details.levels") as HTMLElement;
    expect([...levels.querySelectorAll("th")].map((th) => th.textContent)).toEqual([
      "Cookie",
      "Slot",
      "Level",
      "Stars",
      "Why",
    ]);
    const rows = [...levels.querySelectorAll("tbody tr")].map((tr) =>
      [...tr.querySelectorAll("td")].map((td) => td.textContent),
    );
    expect(rows[1]).toEqual(["Rye호밀", "row2-1", "Lv.100", "8", "Rye why."]);
    expect(rows[0]![3]).toBe("?");
    expect(rows[2]![3]).toBe("~7 (inferred from the skill effect)");
    expect(rye.querySelector('[data-slot="row2-1"] .lv')).toHaveTextContent("Lv.100 · 8★");
    expect(rye.querySelector('[data-slot="row1-6"] .lv')).toHaveTextContent(/^Lv\.1$/);
  });

  it("falls back to the plain lineup for a deck with no slots", async () => {
    await renderAt("/arena/teams", ARENA);
    const bari = await card(/Bari–Oven deck/);
    expect(bari.querySelector(".formation")).toBeNull();
    expect(bari.querySelectorAll(".lineup .slot")).toHaveLength(2);
    expect(
      [...bari.querySelectorAll("details.levels th")].map((th) => th.textContent),
    ).not.toContain("Slot");
  });

  it("shows the empty message with no teams", async () => {
    await renderAt("/arena/teams", ARENA, { "/api/decks?mode=arena": { body: [] } });
    expect(await panel().findByText("No decks recorded yet.")).toHaveClass("empty");
  });
});

describe("PvP counters", () => {
  /** A matrix heading's English name, without the Korean beneath it. */
  const english = (th: Element) => (th.querySelector(".name-stack")?.firstChild ?? th).textContent;

  /** The matrix's column headings and each row's heading and cell texts. */
  function matrix() {
    const table = screen.getByRole("table", { name: /beaten by/i });
    const columns = [...table.querySelectorAll("thead th")].slice(1).map(english);
    const rows = [...table.querySelectorAll("tbody tr")].map((tr) => ({
      team: english(tr.querySelector("th")!),
      cells: [...tr.querySelectorAll("td")],
    }));
    return { columns, rows };
  }

  it("puts the beaten team on the row and its counter on the column, never mirrored", async () => {
    await renderAt("/arena/counters", ARENA);
    await panel().findByRole("table", { name: /beaten by/i });
    const { columns, rows } = matrix();
    expect(columns).toEqual(["Rye one-carry deck", "Bari–Oven deck", "Crepe–Espresso deck"]);
    expect(rows.map((r) => r.team)).toEqual(columns);

    const cell = (team: string, beatenBy: string) =>
      rows.find((r) => r.team === team)!.cells[columns.indexOf(beatenBy)]!;
    const edge = cell("Rye one-carry deck", "Bari–Oven deck");
    expect(within(edge).getByRole("link")).toHaveAttribute("href", "#counter-rye-vs-bari");
    expect(within(edge).getByRole("link")).toHaveAccessibleName(
      "Rye one-carry deck is beaten by Bari–Oven deck: medium confidence. Bari and Oven at 8–10★.",
    );
    expect(within(edge).getByRole("link")).toHaveClass("medium");
    expect(edge).toHaveTextContent("mediumBari and Oven at 8–10★.");
    const reverse = cell("Bari–Oven deck", "Rye one-carry deck");
    expect(within(reverse).queryByRole("link")).toBeNull();
    expect(cell("Rye one-carry deck", "Rye one-carry deck")).toHaveClass("self");
    expect(within(cell("Bari–Oven deck", "Crepe–Espresso deck")).getByRole("link")).toHaveClass(
      "low",
    );
    expect(within(cell("Crepe–Espresso deck", "Rye one-carry deck")).getByRole("link")).toHaveClass(
      "high",
    );
  });

  it("names each team in English with its Korean name beneath, on both axes", async () => {
    await renderAt("/arena/counters", ARENA);
    const table = await panel().findByRole("table", { name: /beaten by/i });
    const col = within(table).getByRole("columnheader", { name: /Rye one-carry deck/ });
    expect(within(col).getByText("호밀 원툴덱")).toHaveClass("kr");
    const row = within(table).getByRole("rowheader", { name: /Rye one-carry deck/ });
    expect(within(row).getByText("호밀 원툴덱")).toHaveClass("kr");
    const bari = within(table).getByRole("columnheader", { name: "Bari–Oven deck" });
    expect(bari.querySelector(".kr")).toBeNull();
  });

  it("styles each edge in a cell by its own confidence", async () => {
    const second = {
      ...COUNTERS[0]!,
      id: 5,
      slug: "rye-vs-bari-late",
      conditions: "Late-season Bari.",
      confidence: "low",
    } satisfies Counter;
    await renderAt("/arena/counters", ARENA, {
      "/api/counters?mode=arena": { body: [...COUNTERS, second] },
    });
    await panel().findByRole("table", { name: /beaten by/i });
    const { columns, rows } = matrix();
    const edge = rows.find((r) => r.team === "Rye one-carry deck")!.cells[
      columns.indexOf("Bari–Oven deck")
    ]!;
    const links = within(edge).getAllByRole("link");
    expect(links.map((a) => [a.classList.contains("medium"), a.classList.contains("low")])).toEqual(
      [
        [true, false],
        [false, true],
      ],
    );
    expect(edge).not.toHaveClass("medium");
    expect(edge).not.toHaveClass("low");
  });

  it("gives a matchup that goes both ways two cells, each with its own conditions", async () => {
    const reverse = {
      ...COUNTERS[0]!,
      id: 4,
      slug: "bari-vs-rye",
      teamDeckId: "bari",
      beatenByDeckId: "rye",
      conditions: "Bari at 8★ or less.",
      confidence: "high",
    } satisfies Counter;
    await renderAt("/arena/counters", ARENA, {
      "/api/counters?mode=arena": { body: [...COUNTERS, reverse] },
    });
    await panel().findByRole("table", { name: /beaten by/i });
    const { columns, rows } = matrix();
    const cell = (team: string, beatenBy: string) =>
      rows.find((r) => r.team === team)!.cells[columns.indexOf(beatenBy)]!;
    const there = cell("Rye one-carry deck", "Bari–Oven deck");
    const back = cell("Bari–Oven deck", "Rye one-carry deck");
    expect(there).toHaveTextContent("Bari and Oven at 8–10★.");
    expect(there).not.toHaveTextContent("Bari at 8★ or less.");
    expect(back).toHaveTextContent("Bari at 8★ or less.");
    expect(within(back).getByRole("link")).toHaveClass("high");
    expect(within(back).getByRole("link")).toHaveAttribute("href", "#counter-bari-vs-rye");
  });

  it("lists every edge with its conditions, why, confidence and sources, where the matrix links", async () => {
    await renderAt("/arena/counters", ARENA);
    await panel().findByRole("table", { name: /beaten by/i });
    const item = document.getElementById("counter-rye-vs-bari")!;
    expect(item.querySelector("h3")).toHaveTextContent(
      "Rye one-carry deck 호밀 원툴덱 is beaten by Bari–Oven deck",
    );
    const i = within(item);
    expect(i.getByText("Bari and Oven at 8–10★.")).toBeVisible();
    expect(i.getByText("The chargers dive Milk before the shields cycle.")).toBeVisible();
    expect(i.getByText("medium")).toHaveClass("pill", "medium");
    expect(i.getByRole("link", { name: "DC 75148" })).toBeVisible();
    expect(document.getElementById("counter-bari-vs-crepe")).toHaveTextContent("unverified claim");
    expect([...document.querySelectorAll(".counter-list > [id]")].map((el) => el.id)).toEqual([
      "counter-rye-vs-bari",
      "counter-bari-vs-crepe",
      "counter-crepe-vs-rye",
    ]);
  });

  it("shows the empty message with no counters", async () => {
    await renderAt("/arena/counters", ARENA, { "/api/counters?mode=arena": { body: [] } });
    expect(await panel().findByText("No counters recorded yet.")).toHaveClass("empty");
    expect(panel().queryByRole("table")).toBeNull();
  });
});

describe("PvP usage", () => {
  /** The card of the usage section headed `name`. */
  const section = async (name: string) =>
    (await panel().findByRole("heading", { name })).closest(".card") as HTMLElement;

  it("shows one bar list per kind, in cookie, core, pet, team order, with the mode's caveat", async () => {
    await renderAt("/rumble/usage", RUMBLE);
    await section("Cookies");
    expect([...panel().getAllByRole("heading", { level: 3 })].map((h) => h.textContent)).toEqual([
      "Cookies",
      "Cores",
      "Pets",
    ]);
    expect(
      panel().getByText("The game hides some defenders, so usage counts are lower bounds."),
    ).toHaveClass("note");
  });

  it("draws each subject's share with its sample, capture date, note and sources", async () => {
    await renderAt("/rumble/usage", RUMBLE);
    const cookies = await section("Cookies");
    const c = within(cookies);
    expect(c.getByText("top 100 Rumble Arena defenses on crumb.gg")).toBeVisible();
    expect(c.getByText(/captured 2026-09-27/)).toBeVisible();
    expect(c.getByRole("link", { name: "crumbgg-rumble-live" })).toBeVisible();
    const bars = [...cookies.querySelectorAll("li")];
    expect(bars.map((li) => li.querySelector(".nm")!.textContent)).toEqual([
      "Pomegranate Cookie석류맛 쿠키",
      "Herb Cookie허브맛 쿠키",
    ]);
    expect(bars[1]!.querySelector(".bar-fill")).toHaveStyle({ width: "64.5%" });
    expect(bars[1]).toHaveTextContent("64.5%");
    expect(c.getAllByText("Lower bound: hidden slots.")).toHaveLength(2);
  });

  it("shows a core's members in English where the glossary knows them, and its confirmed share", async () => {
    await renderAt("/rumble/usage", RUMBLE);
    const cores = await section("Cores");
    const li = cores.querySelector("li")!;
    expect(li.querySelector(".nm")).toHaveTextContent("tank line");
    expect(await within(li).findByText(/Ion Cookie Robot/)).toBeVisible();
    expect(li).toHaveTextContent("미확인 쿠키");
    expect(li.querySelector(".bar-confirmed")).toHaveStyle({ width: "52%" });
    expect(li).toHaveTextContent("52% confirmed");
  });

  it("shows the empty message with no usage data", async () => {
    await renderAt("/arena/usage", ARENA, { "/api/usage?mode=arena": { body: [] } });
    expect(await panel().findByText("No usage data recorded yet.")).toHaveClass("empty");
  });
});

describe("PvP builds, mechanics and timeline", () => {
  it("shows the mode's rune builds", async () => {
    await renderAt("/arena/runes", ARENA);
    expect(await panel().findByText("Rank behind Milk for the first beam.")).toBeVisible();
    expect(
      (await panel().findAllByText("Rye one-carry deck", { selector: ".rune-decks li" })).length,
    ).toBeGreaterThan(0);
  });

  it("shows the mode's gear", async () => {
    await renderAt("/rumble/gear", RUMBLE);
    expect(await panel().findByText("Skill haste on every right-side piece")).toHaveClass("stat");
  });

  it("shows the mode's mechanics without its rules, which the overview shows", async () => {
    await renderAt("/arena/mechanics", ARENA);
    expect(
      await panel().findByRole("heading", { name: "Rye beats Bari is mostly Rumble evidence" }),
    ).toBeVisible();
    expect(panel().queryByRole("heading", { name: "Team size" })).toBeNull();
  });

  it("shows the mode's timeline", async () => {
    await renderAt("/rumble/timeline", RUMBLE);
    expect(await panel().findByText("Rumble Arena opens.")).toBeVisible();
  });
});
