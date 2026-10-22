import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Deck, DeckCookie, GearRec, RuneBuild, Takeaway } from "../src/api/types";
import type { ModeSection } from "../src/app/modes";
import { CONQUEST, DAILY, DUNGEON, STAGE, TEAM_POWER } from "../src/app/modes";
import type { Canned } from "./helpers";
import { CURRENT, CURRENT_DECK } from "./helpers";
import { renderRoute } from "./view-harness";

/**
 * Builds a deck slot with the fields the fixtures don't vary filled in.
 *
 * @param id - the slot's id, also its position
 * @param cookieKr - the cookie's Korean name
 * @param en - its English name
 * @returns the slot
 */
function slot(id: number, cookieKr: string, en: string): DeckCookie {
  return {
    id,
    position: id,
    cookieKr,
    en,
    key: null,
    level: "100",
    levelRule: null,
    stars: null,
    slot: null,
    why: `${en} why.`,
  };
}

/** The cookies of the deck Best setup should pick: one per rune case. */
const COOKIES = [
  slot(1, "우유", "Milk Cookie"),
  slot(2, "석류", "Pomegranate Cookie"),
  slot(3, "허브", "Herb Cookie"),
];

/**
 * Builds a deck of a mode with the fields the fixtures don't vary filled in.
 *
 * @param mode - the mode it belongs to
 * @param id - its id
 * @param position - its curated position
 * @param over - fields to set on top
 * @returns the deck
 */
function deck(mode: ModeSection, id: string, position: number, over: Partial<Deck> = {}): Deck {
  return {
    ...CURRENT_DECK,
    id,
    position,
    mode: mode.scope.mode,
    recordSlug: mode.recordSlug,
    nameEn: `${id} deck`,
    nameKr: null,
    status: "meta",
    ceilingText: null,
    summary: null,
    formation: null,
    perks: null,
    rng: null,
    atkOrder: null,
    atkOrderNote: null,
    sources: ["dc:76135"],
    cookies: COOKIES,
    pets: [],
    notes: [],
    ...over,
  };
}

/**
 * Builds a current rune build of a mode.
 *
 * @param mode - the mode it belongs to
 * @param id - its id
 * @param cookieKr - the cookie's Korean name
 * @param en - its English name
 * @param decks - the decks it's linked to; empty for none
 * @param lines - its rune lines
 * @returns the build
 */
function rune(
  mode: ModeSection,
  id: number,
  cookieKr: string,
  en: string,
  decks: string[],
  lines: string,
): RuneBuild {
  return {
    ...CURRENT,
    id,
    cookieKr,
    en,
    key: null,
    mode: mode.scope.mode,
    recordSlug: mode.recordSlug,
    lines,
    why: `${en} on ${lines}.`,
    disputed: null,
    decks,
    sources: ["nv:43653"],
  };
}

/** In the API's order, not by position: the meta deck at 3 is the one to show. */
const DECKS = [
  deck(CONQUEST, "late", 4, { nameEn: "Late meta deck" }),
  deck(CONQUEST, "alt", 2, { nameEn: "Alt deck", status: "alt" }),
  deck(CONQUEST, "cherry", 3, {
    nameEn: "Cherry deck",
    nameKr: "체리덱",
    ceilingText: "1.3T",
  }),
  deck(CONQUEST, "old", 1, {
    nameEn: "Old deck",
    obsoleteSince: "2026-10-12",
    obsoleteReason: "Patched out.",
    obsoleteSources: ["dc:76135"],
  }),
];

const RUNES = [
  rune(CONQUEST, 1, "우유", "Milk Cookie", ["cherry"], "All ATK%"),
  rune(CONQUEST, 2, "우유", "Milk Cookie", [], "All crit damage"),
  rune(CONQUEST, 3, "석류", "Pomegranate Cookie", ["alt"], "All crit rate"),
  rune(CONQUEST, 4, "석류", "Pomegranate Cookie", [], "All skill amp"),
  rune(CONQUEST, 5, "허브", "Herb Cookie", ["alt"], "All HP"),
];

const GEAR = [
  {
    ...CURRENT,
    id: 1,
    mode: "guild_conquest",
    recordSlug: null,
    slot: "top_left",
    substats: "Skill amp + crit dmg",
    context: "raid",
    why: "Crit rate is capped already.",
    sources: ["dc:76135"],
  },
] satisfies GearRec[];

const TAKEAWAYS = [
  {
    id: 1,
    position: 0,
    text: "Milk leads every 1T run.",
    detail: null,
    mode: "guild_conquest",
    recordSlug: null,
    sources: ["dc:76135"],
  },
] satisfies Takeaway[];

/**
 * The answers a mode's Best setup asks for: its decks, its current rune
 * builds and its current gear.
 *
 * @param mode - the mode
 * @param decks - its decks
 * @param runes - its current rune builds
 * @param gear - its current gear rows
 * @returns the canned responses, by request path
 */
function setupApi(
  mode: ModeSection,
  decks: readonly Deck[],
  runes: readonly RuneBuild[],
  gear: readonly GearRec[] = [],
): Record<string, Canned> {
  const m = mode.scope.mode;
  return {
    [`/api/decks?mode=${m}`]: { body: decks },
    [`/api/rune-builds?mode=${m}&current=true`]: { body: runes },
    [`/api/gear-recs?mode=${m}&current=true`]: { body: gear },
  };
}

/**
 * The rune rows of a block, each row's text.
 *
 * @param block - the block's region
 * @returns one string per row
 */
const runeRows = (block: HTMLElement) =>
  within(within(block).getByRole("list", { name: "Sugar runes" }))
    .getAllByRole("listitem")
    .map((li) => li.textContent);

describe("Best setup", () => {
  it("is Guild Conquest's landing page, the current page in the nav", async () => {
    await renderRoute("/conquest", setupApi(CONQUEST, DECKS, RUNES, GEAR));
    expect(await screen.findByRole("heading", { level: 2 })).toHaveTextContent(
      CONQUEST.copy.setup.title,
    );
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    expect(
      within(nav)
        .getAllByRole("link", { current: "page" })
        .map((a) => a.textContent),
    ).toEqual(["Guild Conquest", "Best setup"]);
  });

  it("leads with the first current meta deck by position: its name, tier, ceiling and a link to its card", async () => {
    await renderRoute("/conquest", setupApi(CONQUEST, DECKS, RUNES, GEAR));
    const block = await screen.findByRole("region", { name: "Cherry deck" });
    expect(within(block).getByRole("heading", { name: "Cherry deck" })).toHaveAttribute(
      "title",
      "체리덱",
    );
    expect(within(block).getByText("meta")).toHaveClass("pill", "meta");
    expect(within(block).getByText("ceiling 1.3T")).toHaveClass("chip");
    expect(within(block).getByRole("link", { name: "Levels and why" })).toHaveAttribute(
      "href",
      "/conquest/decks#deck-cherry",
    );
    expect(block.querySelector(".lineup, .formation")).not.toBeNull();
    for (const other of ["Old deck", "Alt deck", "Late meta deck"]) {
      expect(screen.queryByRole("region", { name: other })).toBeNull();
    }
  });

  it("gives each cookie its build linked to the deck, else its unlinked build, else a muted row", async () => {
    await renderRoute("/conquest", setupApi(CONQUEST, DECKS, RUNES, GEAR));
    const block = await screen.findByRole("region", { name: "Cherry deck" });
    await waitFor(() => expect(runeRows(block)).toHaveLength(3));
    const [milk, pom, herb] = within(within(block).getByRole("list", { name: "Sugar runes" }))
      .getAllByRole("listitem")
      .map((li) => within(li));
    expect(milk!.getByText("recommended")).toHaveClass("pill", "good");
    expect(milk!.getByText("All ATK%")).toBeVisible();
    expect(milk!.queryByText("All crit damage")).toBeNull();
    expect(milk!.getByText("Milk Cookie on All ATK%.")).toBeVisible();
    expect(milk!.getByRole("link", { name: "Naver 43653" })).toBeVisible();
    expect(pom!.getByText("All skill amp")).toBeVisible();
    expect(pom!.queryByText("All crit rate")).toBeNull();
    expect(herb!.getByText("No build recorded")).toHaveClass("muted");
    expect(herb!.queryByText("All HP")).toBeNull();
    expect(runeRows(block).map((t) => t.split(/recommended|No build/)[0])).toEqual([
      "Milk",
      "Pomegranate",
      "Herb",
    ]);
  });

  it("shows the mode's current gear board", async () => {
    await renderRoute("/conquest", setupApi(CONQUEST, DECKS, RUNES, GEAR));
    const gear = await screen.findByRole("region", { name: "Gear" });
    expect(await within(gear).findByText("Skill amp + crit dmg")).toBeVisible();
    expect(within(gear).getByRole("link", { name: "All gear notes" })).toHaveAttribute(
      "href",
      "/conquest/gear",
    );
  });

  it("says so when the mode has no current meta deck", async () => {
    await renderRoute("/conquest", setupApi(CONQUEST, [DECKS[1]!, DECKS[3]!], RUNES));
    expect(await screen.findByText("No current meta deck recorded yet.")).toHaveClass("empty");
  });

  it("gives the stage mode a block for its main team, then one per Rift deck, with an On this page list", async () => {
    const decks = [
      deck(STAGE, "rift-shred", 1, { nameEn: "Rift shred deck" }),
      deck(STAGE, "stage-charge", 2, { nameEn: "Charge deck" }),
    ];
    const runes = [rune(STAGE, 1, "우유", "Milk Cookie", ["rift-shred"], "All skill haste")];
    await renderRoute("/stage", setupApi(STAGE, decks, runes), { mode: STAGE });
    const main = await screen.findByRole("region", { name: "Charge deck" });
    const rift = screen.getByRole("region", { name: "Rift shred deck" });
    expect(STAGE.stage.rift.decks).toContain("rift-shred");
    expect(main.compareDocumentPosition(rift) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(rift).getByText(STAGE.stage.rift.title)).toHaveClass("chip");
    await waitFor(() => expect(runeRows(rift)[0]).toContain("All skill haste"));
    expect(runeRows(main)[0]).toContain("No build recorded");
    const toc = screen.getByRole("navigation", { name: "On this page" });
    expect(
      within(toc)
        .getAllByRole("link")
        .map((a) => a.textContent),
    ).toEqual(["Charge deck", "Rift shred deck"]);
  });

  it("lists runes for the Crumble Dungeon's first cookies only, pointing to the card for the rest", async () => {
    const many = Array.from({ length: DUNGEON.dungeon.setupRunes + 2 }, (_, i) =>
      slot(i + 1, `쿠키${i + 1}`, `Cookie ${i + 1}`),
    );
    await renderRoute(
      "/dungeon",
      setupApi(
        DUNGEON,
        [deck(DUNGEON, "dungeon-beam", 1, { nameEn: "Beam lineup", cookies: many })],
        [],
      ),
      { mode: DUNGEON },
    );
    const block = await screen.findByRole("region", { name: "Beam lineup" });
    expect(runeRows(block)).toHaveLength(DUNGEON.dungeon.setupRunes);
    expect(runeRows(block)[0]).toContain("Cookie 1");
    expect(within(block).getByText(/^2 more on the deck's card/)).toHaveClass("muted");
  });
});

describe("the landing pages", () => {
  it("moves a mode's findings to /findings, with the mode's findings copy", async () => {
    await renderRoute("/conquest/findings", {
      "/api/takeaways?mode=guild_conquest": { body: TAKEAWAYS },
    });
    expect(await screen.findByRole("heading", { level: 2 })).toHaveTextContent(
      CONQUEST.copy.findings.title,
    );
    expect(await screen.findByText("Milk leads every 1T run.")).toBeVisible();
    const nav = screen.getByRole("navigation", { name: "Logbook" });
    expect(
      within(within(nav).getByRole("list", { name: "Guild Conquest Details" })).getByRole("link", {
        current: "page",
      }),
    ).toHaveTextContent("Findings");
  });

  it("keeps the daily dungeon board at /daily-dungeons", async () => {
    await renderRoute("/daily-dungeons", {}, { mode: DAILY });
    expect(await screen.findByRole("heading", { level: 2 })).toHaveTextContent(
      DAILY.daily.board.title,
    );
  });

  it("sends /daily-dungeons/overview to /daily-dungeons/findings", async () => {
    const router = await renderRoute("/daily-dungeons/overview", {}, { mode: DAILY });
    await waitFor(() => expect(router.state.location.pathname).toBe("/daily-dungeons/findings"));
    expect(await screen.findByRole("heading", { level: 2 })).toHaveTextContent(
      DAILY.copy.findings.title,
    );
  });

  it("keeps team power's own landing page", async () => {
    await renderRoute("/team-power", {}, { mode: TEAM_POWER });
    expect(await screen.findByRole("heading", { level: 2 })).toHaveTextContent(
      TEAM_POWER.copy.findings.title,
    );
    expect(TEAM_POWER.tabs.map((t) => t.id)).not.toContain("findings");
  });
});
