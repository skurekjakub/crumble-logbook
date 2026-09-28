import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ObsoleteNotice } from "../src/components/ObsoleteNotice";
import { ObsoleteSection } from "../src/components/ObsoleteSection";
import { indexSources } from "../src/lib/sources";
import { VIEW_SOURCES } from "./view-harness";

const SOURCES = indexSources(VIEW_SOURCES);

describe("ObsoleteNotice", () => {
  it("says since when, why, what superseded it, and links the reason's sources", () => {
    render(
      <ObsoleteNotice
        since="2026-10-12"
        reason="Patched out."
        sources={["dc:76135"]}
        sourceIndex={SOURCES}
        superseded={<a href="#deck-rye">Rye deck</a>}
      />,
    );
    const note = screen.getByRole("note");
    expect(note).toHaveTextContent(
      "Obsolete since 2026-10-12: Patched out. Superseded by Rye deck.",
    );
    expect(within(note).getByRole("link", { name: "Rye deck" })).toHaveAttribute(
      "href",
      "#deck-rye",
    );
    expect(within(note).getByRole("link", { name: "DC 76135" })).toBeVisible();
  });

  it("leaves out the reason and the successor when there are none", () => {
    render(<ObsoleteNotice since="2026-10-12" reason={null} sources={[]} sourceIndex={SOURCES} />);
    expect(screen.getByRole("note")).toHaveTextContent(/^Obsolete since 2026-10-12$/);
  });
});

describe("ObsoleteSection", () => {
  it("renders nothing without an obsolete item", () => {
    const { container } = render(
      <ObsoleteSection id="x" latest={null}>
        <p>old</p>
      </ObsoleteSection>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("is collapsed, dated by its latest item, and opens when asked", () => {
    const { rerender } = render(
      <ObsoleteSection id="decks-obsolete" latest="2026-10-12">
        <p>old deck</p>
      </ObsoleteSection>,
    );
    const section = document.getElementById("decks-obsolete")!;
    expect(section.tagName).toBe("DETAILS");
    expect(section).not.toHaveAttribute("open");
    expect(section.querySelector("summary")).toHaveTextContent("Obsolete · latest 2026-10-12");
    expect(within(section).getByText("old deck")).toBeInTheDocument();
    rerender(
      <ObsoleteSection id="decks-obsolete" latest="2026-10-12" open>
        <p>old deck</p>
      </ObsoleteSection>,
    );
    expect(document.getElementById("decks-obsolete")).toHaveAttribute("open");
  });
});
