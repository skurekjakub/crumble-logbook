import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  Deck,
  GearRec,
  Mechanic,
  RuneBuild,
  Source,
  Takeaway,
  TimelineEvent,
} from "../src/api/types";
import type { Canned } from "./helpers";
import { CURRENT, CURRENT_DECK } from "./helpers";
import { renderRoute, VIEW_SOURCES } from "./view-harness";

const CONQUEST = "001-guild-conquest-meta";
const PVP = "002-pvp-meta";

/**
 * Pairs one conquest row and one PvP row of a list, by the field the view shows.
 *
 * @param conquest - the conquest row
 * @param pvp - the PvP row
 * @returns the conquest row, and both rows as a list
 */
function pair<T>(conquest: T, pvp: T) {
  return { conquest, both: [conquest, pvp] };
}

const deckBase: Omit<Deck, "id" | "mode" | "nameEn"> = {
  ...CURRENT_DECK,
  position: 1,
  recordSlug: CONQUEST,
  nameKr: null,
  status: "meta",
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
};

const DECKS = pair<Deck>(
  { ...deckBase, id: "cherry", mode: "guild_conquest", nameEn: "Cherry deck" },
  { ...deckBase, id: "rye", mode: "arena", recordSlug: PVP, nameEn: "Rye PvP deck" },
);

const TAKEAWAYS = pair<Takeaway>(
  {
    id: 1,
    position: 1,
    text: "Conquest takeaway.",
    detail: null,
    mode: "guild_conquest",
    recordSlug: CONQUEST,
    sources: [],
  },
  {
    id: 2,
    position: 1,
    text: "PvP takeaway.",
    detail: null,
    mode: "arena",
    recordSlug: PVP,
    sources: [],
  },
);

const RUNES = pair<RuneBuild>(
  {
    ...CURRENT,
    id: 1,
    cookieKr: "우유",
    en: "Milk",
    mode: "guild_conquest",
    recordSlug: CONQUEST,
    lines: "Conquest runes",
    why: "x",
    disputed: null,
    decks: [],
    sources: [],
  },
  {
    ...CURRENT,
    id: 2,
    cookieKr: "호밀",
    en: "Rye",
    mode: "arena",
    recordSlug: PVP,
    lines: "PvP runes",
    why: "y",
    disputed: null,
    decks: [],
    sources: [],
  },
);

const GEAR = pair<GearRec>(
  {
    ...CURRENT,
    id: 1,
    mode: "guild_conquest",
    recordSlug: CONQUEST,
    slot: "top_left",
    substats: "Conquest gear",
    context: "raid",
    why: "x",
    sources: [],
  },
  {
    ...CURRENT,
    id: 2,
    mode: "arena",
    recordSlug: PVP,
    slot: "top_left",
    substats: "PvP gear",
    context: "arena",
    why: "y",
    sources: [],
  },
);

const MECHANICS = pair<Mechanic>(
  {
    id: 1,
    title: "Conquest mechanic",
    body: "b",
    confidence: "high",
    mode: "guild_conquest",
    topic: null,
    alsoTopics: [],
    recordSlug: CONQUEST,
    sources: [],
  },
  // No topic, so only the mode filter keeps it off the conquest view.
  {
    id: 2,
    title: "PvP mechanic",
    body: "b",
    confidence: "high",
    alsoTopics: [],
    mode: "arena",
    topic: null,
    recordSlug: PVP,
    sources: [],
  },
);

const TIMELINE = pair<TimelineEvent>(
  {
    id: 1,
    date: "2026-09-01",
    event: "Conquest event.",
    mode: "guild_conquest",
    recordSlug: CONQUEST,
    sources: [],
  },
  { id: 2, date: "2026-09-23", event: "PvP event.", mode: "arena", recordSlug: PVP, sources: [] },
);

const PVP_SOURCE = { ...VIEW_SOURCES[0]!, id: "dc:99", records: [PVP] } satisfies Source;

/**
 * An API where every unfiltered list also holds a PvP row and the
 * `?mode=guild_conquest` list holds only the conquest row, so a view that
 * drops its mode filter shows the PvP row.
 */
const API: Record<string, Canned> = {
  "/api/sources": { body: [...VIEW_SOURCES, PVP_SOURCE] },
  [`/api/sources?record=${CONQUEST}`]: { body: VIEW_SOURCES },
  "/api/recommendations": { body: [] },
  [`/api/recommendations?record=${CONQUEST}`]: { body: [] },
  ...Object.fromEntries(
    (
      [
        ["decks", DECKS],
        ["takeaways", TAKEAWAYS],
        ["rune-builds", RUNES],
        ["gear-recs", GEAR],
        ["mechanics", MECHANICS],
        ["timeline", TIMELINE],
      ] as const
    ).flatMap(([path, rows]) => [
      [`/api/${path}`, { body: rows.both }],
      [`/api/${path}?mode=guild_conquest`, { body: [rows.conquest] }],
    ]),
  ),
};

/**
 * Queries within the view's main landmark.
 *
 * @returns queries bound to the landmark
 */
const panel = () => within(screen.getByRole("main"));

describe("Guild Conquest views never show PvP rows", () => {
  it.each([
    ["/conquest", "Conquest takeaway.", "PvP takeaway."],
    ["/conquest/decks", "Cherry deck", "Rye PvP deck"],
    ["/conquest/runes", "Conquest runes", "PvP runes"],
    ["/conquest/gear", "Conquest gear", "PvP gear"],
    ["/conquest/mechanics", "Conquest mechanic", "PvP mechanic"],
    ["/conquest/timeline", "Conquest event.", "PvP event."],
  ])("%s", async (path, shown, hidden) => {
    await renderRoute(path, API);
    expect(await panel().findByText(shown)).toBeVisible();
    expect(panel().queryByText(hidden)).toBeNull();
  });

  it("counts only record 001's sources in the header", async () => {
    await renderRoute("/conquest", API);
    await waitFor(() =>
      expect(
        [...document.querySelectorAll(".stamp div")]
          .find((d) => d.querySelector(".label")!.textContent === "Sources")
          ?.querySelector("b")?.textContent,
      ).toBe(String(VIEW_SOURCES.length)),
    );
  });
});
