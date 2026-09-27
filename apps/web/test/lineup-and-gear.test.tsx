import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GearBoard } from "../src/components/GearBoard";
import { Lineup, slotKind } from "../src/components/Lineup";
import { indexSources } from "../src/lib/sources";

describe("slotKind", () => {
  it("classifies Lv.100 as max and Lv.1 as filler", () => {
    expect(slotKind("100")).toBe("max");
    expect(slotKind("1")).toBe("filler");
    expect(slotKind("45")).toBe("");
    expect(slotKind(null)).toBe("");
  });
});

describe("Lineup", () => {
  it("styles slots by level and falls back to Korean for unresolved names", () => {
    const { container } = render(
      <Lineup
        cookies={[
          { cookieKr: "우유", en: "Milk", level: "100", stars: "10" },
          { cookieKr: "체리", en: null, level: "1", stars: null },
          { cookieKr: "피겨", en: "Skating Queen", level: null, stars: null },
        ]}
      />,
    );
    const slots = [...container.querySelectorAll(".slot")];
    expect(slots.map((s) => s.className)).toEqual(["slot max", "slot filler", "slot"]);
    expect(slots[0]).toHaveTextContent("Lv.100 · 10★");
    expect(slots[1]!.querySelector(".nm")).toHaveTextContent("체리");
    expect(slots[1]!.textContent).not.toContain("null");
  });

  it("renders nothing for an empty lineup", () => {
    const { container } = render(<Lineup cookies={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("GearBoard", () => {
  it("lays out the four slots and marks empty ones", () => {
    const { container } = render(
      <GearBoard
        gear={[
          {
            id: 1,
            slot: "top_left",
            substats: "Skill amp + crit dmg",
            context: "raid",
            why: "Scales every buff",
            sources: ["dc:1"],
          },
        ]}
        sources={indexSources([])}
      />,
    );
    expect(container.querySelectorAll(".gslot")).toHaveLength(4);
    expect(screen.getByText("Skill amp + crit dmg")).toHaveClass("stat");
    expect(screen.getByText("raid")).toHaveClass("chip");
    expect(screen.getAllByText("No data yet.")).toHaveLength(3);
  });
});
