import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaceStack, MemberChips } from "../src/components/Faces";
import { UsageBars } from "../src/components/UsageBars";
import { deckFaces, shortDeckName } from "../src/lib/deck-names";
import { recordLabel } from "../src/lib/sources";
import { hoistNote, ownSources, shareRanks } from "../src/lib/usage";

/**
 * Builds a deck cookie as `deckFaces` reads it.
 *
 * @param cookieKr - the Korean name
 * @param en - the English name, or null
 * @returns the cookie
 */
const c = (cookieKr: string, en: string | null) => ({ cookieKr, en });

describe("deck names", () => {
  it("drops parenthesised asides and a trailing 'deck'", () => {
    expect(shortDeckName("Rye one-carry deck")).toBe("Rye one-carry");
    expect(shortDeckName("Standard 12 (Oven–Bari charge core + tank line)")).toBe("Standard 12");
    expect(shortDeckName("Five-ranged 'spear' deck (pre-Bari)")).toBe("Five-ranged 'spear'");
    expect(shortDeckName("Rye deck, Brightseeker version")).toBe("Rye deck, Brightseeker version");
    expect(shortDeckName("(deck)")).toBe("(deck)");
  });

  it("finds the cookies a deck's name mentions, in the name's order", () => {
    const deck = {
      nameEn: "Bari–Oven Wanderer–Cherry Cola dive deck",
      cookies: [
        c("마카롱", "Macaron Cookie"),
        c("체리콜라", "Cherry Cola Cookie"),
        c("오방", "Oven Wanderer Cookie"),
        c("바리", "Princess Bari Cookie"),
        c("우유", "Milk Cookie's Crunchy Strong Pediatrician"),
      ],
    };
    expect(deckFaces(deck).map((f) => f.kr)).toEqual(["바리", "오방", "체리콜라"]);
    expect(deckFaces(deck, 2).map((f) => f.kr)).toEqual(["바리", "오방"]);
  });

  it("falls back to the ATK order, then to the first cookies", () => {
    const cookies = [c("a", "Alpha Cookie"), c("b", "Beta Cookie"), c("a", "Alpha Cookie")];
    expect(
      deckFaces({ nameEn: "Evasion deck", cookies, atkOrder: [{ kr: "b", en: "Beta Cookie" }] }),
    ).toEqual([{ kr: "b", en: "Beta Cookie" }]);
    expect(deckFaces({ nameEn: "Evasion deck", cookies, atkOrder: null })).toEqual([
      { kr: "a", en: "Alpha Cookie" },
      { kr: "b", en: "Beta Cookie" },
    ]);
    expect(deckFaces({ nameEn: "Empty deck", cookies: [] })).toEqual([]);
  });

  it("ignores generic words and names with no English", () => {
    const deck = {
      nameEn: "Cookie deck",
      cookies: [c("x", null), c("y", "Deck Cookie")],
      atkOrder: null,
    };
    expect(deckFaces(deck).map((f) => f.kr)).toEqual(["x", "y"]);
  });
});

describe("usage helpers", () => {
  it("ranks shares with ties sharing a rank", () => {
    expect(shareRanks([97, 97, 94, 50])).toEqual([1, 1, 3, 4]);
    expect(shareRanks([])).toEqual([]);
  });

  it("lifts out the note rows repeat, keeping what a row adds after it", () => {
    expect(
      hoistNote([
        "Lower bound: hidden slots.",
        "Lower bound: hidden slots. Always in Oven's slot.",
        "Lower bound: hidden slots.",
        null,
        "Pets are never hidden.",
      ]),
    ).toEqual({
      common: "Lower bound: hidden slots.",
      rest: [null, "Always in Oven's slot.", null, null, "Pets are never hidden."],
    });
  });

  it("lifts nothing when no note repeats", () => {
    expect(hoistNote(["a", "b", null])).toEqual({ common: null, rest: ["a", "b", null] });
  });

  it("keeps a row's sources only where most rows don't cite them", () => {
    expect(
      ownSources([
        { sources: ["live"] },
        { sources: ["live", "stats"] },
        { sources: ["live"] },
        { sources: ["live"] },
      ]),
    ).toEqual([[], ["stats"], [], []]);
    expect(ownSources([{ sources: ["one"] }])).toEqual([[]]);
  });
});

describe("record labels", () => {
  const modes = [{ label: "Arena", scope: { mode: "arena" } }];
  it("names a record by its number and filed mode", () => {
    expect(recordLabel("002-pvp-meta", [{ slug: "002-pvp-meta", mode: "arena" }], modes)).toBe(
      "002 Arena",
    );
    expect(recordLabel("009-new", [], modes)).toBe("009");
    expect(recordLabel("scratch", [], modes)).toBe("scratch");
  });
});

describe("usage bars", () => {
  it("shows each bar's rank and sets a narrow lead apart", () => {
    render(
      <UsageBars
        bars={[
          { key: 1, label: "A", pct: 90, confirmedPct: null },
          { key: 2, label: "B", pct: 60, confirmedPct: 40 },
          { key: 3, label: "C", pct: 60, confirmedPct: null },
        ]}
      />,
    );
    const rows = screen.getAllByRole("listitem");
    expect(rows.map((r) => r.querySelector(".bar-rank")!.textContent)).toEqual(["1", "2", "2"]);
    expect(rows[0]).toHaveClass("top");
    expect(rows[1]).not.toHaveClass("top");
    expect(rows[1]).toHaveTextContent("40% confirmed");
    expect(rows[1]!.querySelector(".bar-confirmed")).toHaveStyle({ width: "40%" });
    expect(within(rows[0]!).getByLabelText("rank 1")).toBeVisible();
  });

  it("sets no row apart when every row shares first place", () => {
    render(
      <UsageBars
        bars={[1, 2, 3, 4].map((key) => ({ key, label: `${key}`, pct: 100, confirmedPct: null }))}
      />,
    );
    expect(screen.getAllByRole("listitem").filter((r) => r.classList.contains("top"))).toEqual([]);
  });

  it("renders an empty list with no bars", () => {
    const { container } = render(<UsageBars bars={[]} />);
    expect(container.querySelector("ol.bars")!.children).toHaveLength(0);
  });
});

describe("faces", () => {
  it("stacks a team's portraits with their names in the tooltip", () => {
    const { container } = render(
      <FaceStack
        faces={[
          { kr: "호밀", en: "Rye Cookie" },
          { kr: "미확인", en: null },
        ]}
      />,
    );
    expect(container.querySelector(".faces")).toHaveAttribute("title", "Rye, 미확인");
    expect(container.querySelectorAll(".cicon")).toHaveLength(2);
  });

  it("renders nothing with no faces or members", () => {
    expect(render(<FaceStack faces={[]} />).container).toBeEmptyDOMElement();
    expect(render(<MemberChips members={[]} />).container).toBeEmptyDOMElement();
  });

  it("lists members with a portrait and the short name, Korean when unresolved", () => {
    render(
      <MemberChips
        members={[
          { kr: "우유", en: "Milk Cookie's Crunchy Strong Pediatrician" },
          { kr: "미확인", en: null },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items.map((i) => i.textContent)).toEqual(["Milk · Pediatrician", "미확인"]);
    expect(items[0]).toHaveAttribute("title", "Milk Cookie's Crunchy Strong Pediatrician 우유");
  });
});
