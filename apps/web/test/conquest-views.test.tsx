import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  Deck,
  GearRec,
  Mechanic,
  Recommendation,
  ResearchRecord,
  RuneBuild,
  Source,
  Takeaway,
} from "../src/api/types";
import type { Canned } from "./helpers";
import { renderRoute } from "./view-harness";

const RECORD = {
  slug: "001-guild-conquest-meta",
  question: "Which teams reach 1T?",
  status: "active",
  startedAt: "2026-09-27",
  updatedAt: "2026-09-27",
  seasonLabel: "S5 (live)",
  lede: "What Korean and global players run in Guild Conquest.",
  caveat: "Snapshot of 2026-09-27; Season 5 closes 2026-09-28.",
  mode: "guild_conquest",
  modes: [],
} satisfies ResearchRecord;

const SOURCES = [
  { id: "dc:76135", site: "dc", url: "https://example.test/dc/76135", title: "1T" },
  { id: "nv:43653", site: "nv", url: "https://example.test/nv/43653", title: "Cherry" },
] satisfies Partial<Source>[];

const TAKEAWAYS = [
  {
    id: 1,
    position: 1,
    text: "Stack skill amp on the buffers.",
    detail: "Their buffs scale with the caster's skill amp.",
    mode: "guild_conquest",
    recordSlug: null,
    sources: ["nv:43653"],
  },
  {
    id: 2,
    position: 2,
    text: "Keep fillers at Lv.1.",
    detail: null,
    mode: "guild_conquest",
    recordSlug: null,
    sources: ["dc:76135"],
  },
] satisfies Takeaway[];

const RECOMMENDATIONS = [
  {
    id: 1,
    summary: "Your lineup matches the meta deck.",
    changes: ["Level Scorpion to Lv.10–45.", "Raise Candy Shade Pouch."],
    recordSlug: null,
    sources: ["dc:76135"],
  },
] satisfies Recommendation[];

const DECKS = [
  {
    id: "cherry",
    position: 1,
    mode: "guild_conquest",
    recordSlug: null,
    nameEn: "Cherry deck",
    nameKr: "체리덱",
    status: "meta",
    ceilingText: "1T 312G at 1.8G (729×)",
    summary: "The standard high-end deck.",
    formation: "No move speed on any rune or gear piece.",
    perks: "Leader Milk.",
    rng: "1T lands in 1–2 of 10 runs.",
    atkOrder: [
      { kr: "우유", en: "Milk" },
      { kr: "브시커", en: "Brightseeker" },
      { kr: "미확인", en: null },
    ],
    atkOrderNote: "Order by ATK, not power.",
    sources: ["nv:43653", "dc:76135"],
    cookies: [
      {
        id: 1,
        position: 1,
        cookieKr: "우유",
        en: "Milk",
        level: "100",
        levelRule: null,
        stars: null,
        slot: null,
        why: "ATK #1 on purpose.",
      },
      {
        id: 2,
        position: 2,
        cookieKr: "피겨",
        en: "Skating Queen",
        level: null,
        levelRule: "As high as possible while ATK < Milk",
        stars: null,
        slot: null,
        why: "Ranks into the beams on base ATK.",
      },
      {
        id: 3,
        position: 3,
        cookieKr: "체리",
        en: null,
        level: "1",
        levelRule: null,
        stars: null,
        slot: null,
        why: "Formation only.",
      },
    ],
    pets: [
      { kr: "와사비문어", en: "Octo Wasabi" },
      { kr: "핫도그", en: null },
    ],
    notes: [
      { kind: "substitution", text: "Tiger Lily → Herb if the team dies at the 30 s slam." },
      { kind: "unorthodox", text: "An R-rarity Cherry Cookie in an endgame team." },
    ],
  },
  {
    id: "meso",
    position: 2,
    mode: "guild_conquest",
    recordSlug: null,
    nameEn: "Melon Soda deck",
    nameKr: null,
    status: "alt",
    ceilingText: null,
    summary: null,
    formation: null,
    perks: null,
    rng: null,
    atkOrder: null,
    atkOrderNote: null,
    sources: [],
    cookies: [],
    pets: [],
    notes: [],
  },
] satisfies Deck[];

const RUNES = [
  {
    id: 1,
    cookieKr: "우유",
    en: "Milk",
    mode: "guild_conquest",
    recordSlug: null,
    lines: "All ATK%",
    why: "Milk's buff scales with her own ATK.",
    disputed: "One commenter says skill amp is better on Milk.",
    decks: ["cherry", "meso"],
    sources: ["nv:43653"],
  },
  {
    id: 2,
    cookieKr: "석류",
    en: "Pomegranate",
    mode: "guild_conquest",
    recordSlug: null,
    lines: "All skill amp",
    why: "Her buffs scale with the caster's skill amp.",
    disputed: null,
    decks: ["cherry"],
    sources: ["dc:76135"],
  },
  {
    id: 3,
    cookieKr: "메소",
    en: null,
    mode: "guild_conquest",
    recordSlug: null,
    lines: "Move speed",
    why: "Placement cookie.",
    disputed: null,
    decks: ["meso"],
    sources: [],
  },
] satisfies RuneBuild[];

const GEAR = [
  {
    id: 1,
    mode: "guild_conquest",
    recordSlug: null,
    slot: "top_left",
    substats: "Skill amp + crit dmg",
    context: "raid",
    why: "Macaron already pushes crit rate past 300%.",
    sources: ["dc:76135"],
  },
  {
    id: 2,
    mode: "guild_conquest",
    recordSlug: null,
    slot: "top_left",
    substats: "Skill amp + crit rate (arena)",
    context: "arena",
    why: "Enemy crit resistance eats crit rate.",
    sources: [],
  },
  {
    id: 3,
    mode: "guild_conquest",
    recordSlug: null,
    slot: "general",
    substats: "No move speed, accuracy or focus",
    context: "raid",
    why: "Move speed breaks the Cherry formation.",
    sources: ["nv:43653"],
  },
] satisfies GearRec[];

const MECHANICS = [
  {
    id: 7,
    mode: "guild_conquest",
    recordSlug: null,
    topic: "filler_levels",
    title: "Why fillers sit at Lv.1",
    body: "Beams go to the highest-ATK allies, so the fillers stay low.",
    confidence: "high",
    sources: ["dc:76135"],
  },
  {
    id: 8,
    mode: "guild_conquest",
    recordSlug: null,
    topic: null,
    title: "Crit above 100%",
    body: "Crit rate past 100% rolls extra crit tiers.",
    confidence: "high",
    sources: [],
  },
] satisfies Mechanic[];

const API: Record<string, Canned> = {
  "/api/records/001-guild-conquest-meta": { body: RECORD },
  "/api/sources": { body: SOURCES },
  "/api/decks?mode=guild_conquest": { body: DECKS },
  "/api/takeaways?mode=guild_conquest": { body: TAKEAWAYS },
  "/api/recommendations?record=001-guild-conquest-meta": { body: RECOMMENDATIONS },
  "/api/rune-builds?mode=guild_conquest": { body: RUNES },
  "/api/gear-recs?mode=guild_conquest": { body: GEAR },
  "/api/mechanics?mode=guild_conquest": { body: MECHANICS },
};

/** Renders the whole app at `path` against this file's stubbed API, overriding some responses. */
const renderAt = (path: string, overrides: Record<string, Canned> = {}) =>
  renderRoute(path, { ...API, ...overrides });

/** The view's main landmark. */
const panel = () => within(screen.getByRole("main"));

describe("/conquest overview", () => {
  it("renders the caveat, takeaways in order with sources, and the account block", async () => {
    await renderAt("/conquest");
    expect(await panel().findByText(RECORD.caveat)).toHaveClass("note");
    expect(panel().getByRole("heading", { name: "What the top players do" })).toBeVisible();
    expect(
      panel().getByText("The load-bearing findings, each with the posts it stands on."),
    ).toHaveClass("lede");

    const items = (await panel().findAllByRole("listitem")).filter((li) => li.closest("ol.take"));
    expect(items.map((li) => li.querySelector("div > div")!.textContent)).toEqual([
      "Stack skill amp on the buffers.",
      "Keep fillers at Lv.1.",
    ]);
    expect(within(items[0]!).getByText(TAKEAWAYS[0]!.detail!)).toHaveClass("muted");
    expect(within(items[0]!).getByRole("link", { name: "Naver 43653" })).toHaveAttribute(
      "href",
      "https://example.test/nv/43653",
    );

    const card = (
      await panel().findByRole("heading", { name: "Your lineup against the meta" })
    ).closest(".card") as HTMLElement;
    expect(within(card).getByText(RECOMMENDATIONS[0]!.summary)).toBeVisible();
    expect(within(card).getByText("Level Scorpion to Lv.10–45.")).toBeVisible();
    expect(within(card).getByText("DC 76135")).toHaveClass("chip");
  });

  it("shows the legacy empty message with no takeaways and omits the account block", async () => {
    await renderAt("/conquest", {
      "/api/takeaways?mode=guild_conquest": { body: [] },
      "/api/recommendations?record=001-guild-conquest-meta": { body: [] },
    });
    expect(await panel().findByText("No takeaways yet.")).toHaveClass("empty");
    expect(panel().queryByText("Your lineup against the meta")).toBeNull();
  });

  it("names the failed resource when takeaways fail, and still shows the account block", async () => {
    await renderAt("/conquest", {
      "/api/takeaways?mode=guild_conquest": { status: 500, body: { error: "x" } },
    });
    expect(await panel().findByRole("alert")).toHaveTextContent("Couldn't load takeaways");
    expect(await panel().findByText(RECOMMENDATIONS[0]!.summary)).toBeVisible();
  });
});

describe("/conquest/decks", () => {
  it("keeps the filler claim out of the lede and shows its cited mechanic under it", async () => {
    await renderAt("/conquest/decks");
    const lede = await panel().findByText(/Striped slots are deliberate Lv\.1 fillers/, {
      selector: ".lede",
    });
    expect(lede).not.toHaveTextContent(/Pomegranate|beam/);
    const note = (await panel().findByText(MECHANICS[0]!.body)).closest(".note") as HTMLElement;
    expect(within(note).getByText("high")).toHaveClass("pill", "high");
    expect(await within(note).findByRole("link", { name: "DC 76135" })).toBeVisible();
    expect(panel().queryByText(MECHANICS[1]!.body)).toBeNull();
  });

  it("renders each deck as a card with lineup, levels, ATK order, pets and notes", async () => {
    await renderAt("/conquest/decks");
    const card = (await panel().findByRole("heading", { name: /Cherry deck/ })).closest(
      "article",
    ) as HTMLElement;
    expect(card).toHaveAttribute("id", "deck-cherry");
    expect(
      panel().getByText(/Striped slots are deliberate Lv\.1 fillers/, { selector: ".lede" }),
    ).toBeVisible();
    const c = within(card);
    expect(c.getByText("meta")).toHaveClass("pill", "meta");
    expect(c.getByText("ceiling 1T 312G at 1.8G (729×)")).toHaveClass("chip");
    expect(c.getByText("The standard high-end deck.")).toHaveClass("muted");

    const slots = [...card.querySelectorAll(".lineup .slot")];
    expect(slots.map((s) => s.className)).toEqual(["slot max", "slot", "slot filler"]);
    expect(slots[2]!.querySelector(".nm")).toHaveTextContent("체리");

    expect(c.getByText("Leader Milk.")).toBeVisible();
    expect(c.getByText("No move speed on any rune or gear piece.")).toBeVisible();
    expect(c.getByText("1T lands in 1–2 of 10 runs.")).toBeVisible();
    expect([...card.querySelectorAll(".order .step")].map((s) => s.textContent)).toEqual([
      "Milk",
      "Brightseeker",
      "미확인",
    ]);
    expect(c.getByText("Order by ATK, not power.")).toHaveClass("muted");
    const pets = c.getByText("Pets").nextElementSibling as HTMLElement;
    expect(pets).toHaveTextContent("Octo Wasabi 와사비문어 · 핫도그");
    expect(pets).not.toHaveTextContent("null");

    const swaps = c.getByText("Swaps").nextElementSibling as HTMLElement;
    expect(swaps).toHaveTextContent("Tiger Lily → Herb");
    expect(swaps).not.toHaveTextContent("R-rarity");
    expect(c.getByText("An R-rarity Cherry Cookie in an endgame team.")).toHaveClass("flag");
    expect(c.getByRole("link", { name: "DC 76135" })).toBeVisible();
  });

  it("shows the level, else the level rule, with each cookie's why", async () => {
    await renderAt("/conquest/decks");
    const card = (await panel().findByRole("heading", { name: /Cherry deck/ })).closest(
      "article",
    ) as HTMLElement;
    const levels = card.querySelector("details.levels") as HTMLElement;
    expect(within(levels).getByText("Levels and why")).toBeVisible();
    const rows = [...levels.querySelectorAll("tbody tr")].map((tr) =>
      [...tr.querySelectorAll("td")].map((td) => td.textContent),
    );
    expect(rows).toEqual([
      ["Milk우유", "Lv.100", "ATK #1 on purpose."],
      [
        "Skating Queen피겨",
        "As high as possible while ATK < Milk",
        "Ranks into the beams on base ATK.",
      ],
      ["체리", "Lv.1", "Formation only."],
    ]);
  });

  it("drops the parts a sparse deck doesn't have", async () => {
    await renderAt("/conquest/decks");
    const card = (await panel().findByRole("heading", { name: /Melon Soda deck/ })).closest(
      "article",
    ) as HTMLElement;
    expect(card.querySelector(".lineup")).toBeNull();
    expect(card.querySelector("details.levels")).toBeNull();
    expect(card.querySelector("dl.kv dt")).toBeNull();
    expect(card).not.toHaveTextContent("ceiling");
  });

  it("links each deck's card from the On this page list, in deck order", async () => {
    await renderAt("/conquest/decks");
    const toc = await panel().findByRole("navigation", { name: "On this page" });
    const links = within(toc).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Cherry deck", "#deck-cherry"],
      ["Melon Soda deck", "#deck-meso"],
    ]);
    for (const a of links) {
      expect(document.querySelector(a.getAttribute("href")!)).toHaveClass("card");
    }
  });

  it("shows the legacy empty message with no decks", async () => {
    await renderAt("/conquest/decks", { "/api/decks?mode=guild_conquest": { body: [] } });
    expect(await panel().findByText("No decks recorded yet.")).toHaveClass("empty");
  });
});

describe("/conquest/runes", () => {
  /** Each rune card's cookie heading text, in order. */
  const cookies = () =>
    [...screen.getByRole("main").querySelectorAll(".rune-card h3")].map((h) => h.textContent);

  it("renders one card per cookie: the reason first, then the lines, disputed note, decks and sources", async () => {
    await renderAt("/conquest/runes");
    const milk = (await panel().findByText("Milk's buff scales with her own ATK.")).closest(
      ".rune-card",
    ) as HTMLElement;
    const m = within(milk);
    const why = m.getByText("Milk's buff scales with her own ATK.");
    expect(why).toHaveClass("rune-why");
    const lines = m.getByText("All ATK%");
    expect(lines.closest(".rune-lines")).not.toBeNull();
    expect(why.compareDocumentPosition(lines) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(m.getByText("disputed")).toHaveClass("pill", "disputed");
    const disputed = m.getByText(/One commenter says skill amp is better on Milk\./);
    expect(disputed).toHaveClass("muted");
    expect(lines.compareDocumentPosition(disputed) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const decks = await m.findByRole("list", { name: "Decks" });
    expect(
      within(decks)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Cherry deck", "Melon Soda deck"]);
    expect(m.getByRole("link", { name: "Naver 43653" })).toBeVisible();
    expect(cookies()).toEqual(["Milk우유", "Pomegranate석류", "메소"]);
    expect(
      panel().getByText(/Disputed rows are where posters disagreed/, { selector: ".lede" }),
    ).toBeVisible();
  });

  it("keeps a deck whose name holds a comma apart from the other decks", async () => {
    await renderAt("/conquest/runes", {
      "/api/decks?mode=guild_conquest": {
        body: [...DECKS, { ...DECKS[0]!, id: "herb", nameEn: "Cherry deck, Herb version" }],
      },
      "/api/rune-builds?mode=guild_conquest": {
        body: [{ ...RUNES[1]!, decks: ["cherry", "herb"] }],
      },
    });
    const card = (await panel().findByText(RUNES[1]!.why)).closest(".rune-card") as HTMLElement;
    const decks = within(card).getByRole("list", { name: "Decks" });
    await waitFor(() =>
      expect(
        within(decks)
          .getAllByRole("listitem")
          .map((li) => li.textContent),
      ).toEqual(["Cherry deck", "Cherry deck, Herb version"]),
    );
  });

  it("narrows rows to one deck with ?deck=", async () => {
    await renderAt("/conquest/runes?deck=meso");
    await panel().findByText("Placement cookie.");
    expect(cookies()).toEqual(["Milk우유", "메소"]);
    expect(panel().getByRole("combobox", { name: "Deck" })).toHaveValue("meso");
  });

  it("says when the filters leave nothing", async () => {
    await renderAt("/conquest/runes?q=zzz");
    expect(await panel().findByText("Nothing matches.")).toHaveClass("empty");
  });

  it("names the failed resource when decks fail, instead of falling back to deck ids", async () => {
    await renderAt("/conquest/runes", {
      "/api/decks?mode=guild_conquest": { status: 500, body: { error: "x" } },
    });
    expect(await panel().findByRole("alert")).toHaveTextContent("Couldn't load decks");
    expect(await panel().findByText("Placement cookie.")).toBeVisible();
  });

  it("writes the deck and text filters to the URL", async () => {
    const router = await renderAt("/conquest/runes");
    await panel().findByText("Placement cookie.");
    fireEvent.change(panel().getByRole("combobox", { name: "Deck" }), {
      target: { value: "cherry" },
    });
    await waitFor(() => expect(router.state.location.search).toEqual({ deck: "cherry" }));
    expect(cookies()).toEqual(["Milk우유", "Pomegranate석류"]);

    fireEvent.change(panel().getByRole("searchbox"), { target: { value: "pomegranate" } });
    await waitFor(() =>
      expect(router.state.location.search).toEqual({ deck: "cherry", q: "pomegranate" }),
    );
    expect(cookies()).toEqual(["Pomegranate석류"]);
  });

  it("keeps a numeric text filter from the URL, which the router decodes as a number", async () => {
    await renderAt("/conquest/runes?q=9");
    expect(await panel().findByRole("searchbox")).toHaveValue("9");
  });

  it("shows the empty message with no rune builds", async () => {
    await renderAt("/conquest/runes", { "/api/rune-builds?mode=guild_conquest": { body: [] } });
    expect(await panel().findByText("No rune builds recorded yet.")).toHaveClass("empty");
  });
});

describe("/conquest/gear", () => {
  it("renders the board by slot with context chips, and the general notes", async () => {
    await renderAt("/conquest/gear");
    expect(await panel().findByText("Skill amp + crit dmg")).toHaveClass("stat");
    expect(panel().getByRole("heading", { name: "Gear substats" })).toBeVisible();
    expect(panel().getByText(/equipment screen/, { selector: ".lede" })).not.toHaveTextContent(
      /9\/23|patch/,
    );
    const slot = panel().getByText("Skill amp + crit dmg").closest(".gslot") as HTMLElement;
    expect(within(slot).getByText("raid")).toHaveClass("chip");
    expect(within(slot).getByText("arena")).toHaveClass("chip");
    expect(panel().getAllByText("No data yet.")).toHaveLength(3);

    const general = panel()
      .getByRole("heading", { name: "General gear notes" })
      .closest(".card") as HTMLElement;
    expect(within(general).getByText("No move speed, accuracy or focus").tagName).toBe("B");
    expect(within(general).getByText("Move speed breaks the Cherry formation.")).toHaveClass(
      "muted",
    );
    expect(within(general).getByRole("link", { name: "Naver 43653" })).toBeVisible();
  });

  it("shows every slot's empty message and no general card with no gear", async () => {
    await renderAt("/conquest/gear", { "/api/gear-recs?mode=guild_conquest": { body: [] } });
    await waitFor(() => expect(panel().getAllByText("No data yet.")).toHaveLength(4));
    expect(panel().queryByText("General gear notes")).toBeNull();
  });
});
