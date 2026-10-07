import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Clamp } from "../src/components/Clamp";
import { Pill } from "../src/components/Pill";
import { Points } from "../src/components/Points";
import { SourceChips } from "../src/components/SourceChips";
import { ThemeToggle } from "../src/components/ThemeToggle";
import { ViewHeader } from "../src/components/ViewHeader";
import { indexSources } from "../src/lib/sources";

const LONG =
  "Pomegranate's beams go to the highest-ATK allies, so a cookie that shouldn't take a beam is kept at a low level, under the beam recipients in ATK order.";

describe("Clamp", () => {
  it("renders a short text as it is, with no toggle", () => {
    const { container } = render(
      <p>
        <Clamp>Formation only.</Clamp>
      </p>,
    );
    expect(container.querySelector("p")).toHaveTextContent(/^Formation only\.$/);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("cuts a long text to its lines and expands it on demand", () => {
    const { container } = render(<Clamp lines={1}>{LONG}</Clamp>);
    const text = container.querySelector(".clamp-text") as HTMLElement;
    expect(text).toHaveTextContent(LONG);
    expect(text.style.getPropertyValue("--clamp")).toBe("1");
    const more = screen.getByRole("button", { name: "More" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    expect(more).toHaveAttribute("aria-controls", text.id);

    fireEvent.click(more);
    expect(text.style.getPropertyValue("--clamp")).toBe("");
    expect(container.querySelector(".clamp")).toHaveClass("open");
    const less = screen.getByRole("button", { name: "Less" });
    expect(less).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(less);
    expect(screen.getByRole("button", { name: "More" })).toBeVisible();
  });

  it("gives more lines more room before it clamps", () => {
    render(<Clamp lines={2}>{LONG}</Clamp>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("treats inline content as long unless told its length", () => {
    const { rerender } = render(
      <Clamp>
        <b>bold</b> text
      </Clamp>,
    );
    expect(screen.getByRole("button", { name: "More" })).toBeVisible();
    rerender(
      <Clamp length={9}>
        <b>bold</b> text
      </Clamp>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("Points and ViewHeader", () => {
  it("lists short bullets, and nothing for none", () => {
    const { container, rerender } = render(
      <Points items={["Lv.1 fillers are striped.", "Why under each deck."]} />,
    );
    expect([...container.querySelectorAll("ul.points li")].map((li) => li.textContent)).toEqual([
      "Lv.1 fillers are striped.",
      "Why under each deck.",
    ]);
    rerender(<Points items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a bullet explainer as a list and a single line as a lede", () => {
    const { container, rerender } = render(
      <ViewHeader
        title="Decks"
        lede={["Best documented lineups.", "Striped slots are fillers."]}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Decks" })).toBeVisible();
    expect(container.querySelectorAll("ul.points li")).toHaveLength(2);
    expect(container.querySelector(".lede")).toBeNull();

    rerender(<ViewHeader title="Decks" lede="Best documented lineups." />);
    expect(container.querySelector("p.lede")).toHaveTextContent("Best documented lineups.");
    expect(container.querySelector("ul.points")).toBeNull();

    rerender(<ViewHeader title="Decks" />);
    expect(container.querySelector(".lede, ul.points")).toBeNull();
  });
});

describe("Pill verdicts", () => {
  it("carries its verdict as a tone class and a glyph outside its text", () => {
    const cases = [
      ["meta", "t-good", "✓"],
      ["verified", "t-good", "✓"],
      ["alt", "t-info", "◆"],
      ["medium", "t-warn", "!"],
      ["low", "t-bad", "✕"],
      ["avoid", "t-bad", "✕"],
      ["obsolete", "t-quiet", "–"],
    ] as const;
    for (const [kind, tone, glyph] of cases) {
      const { unmount } = render(<Pill kind={kind} />);
      const pill = screen.getByText(kind);
      expect(pill).toHaveClass("pill", kind, tone);
      expect(pill).toHaveAttribute("data-glyph", glyph);
      expect(pill.textContent).toBe(kind);
      unmount();
    }
  });
});

describe("SourceChips folding", () => {
  const sources = indexSources([{ id: "dc:1", url: "https://example.test/1", title: "one" }]);
  const ids = ["dc:1", "dc:2", "dc:3", "dc:4", "dc:5", "dc:6"];

  it("shows the first chips and folds the rest behind +N", () => {
    const { container } = render(<SourceChips ids={ids} sources={sources} />);
    expect(container.querySelectorAll(".chip:not(button)")).toHaveLength(3);
    const more = screen.getByRole("button", { name: "Show 3 more sources" });
    expect(more).toHaveTextContent("+3");
    fireEvent.click(more);
    expect(container.querySelectorAll(".chip:not(button)")).toHaveLength(6);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows a list one over the limit whole, since folding one chip saves nothing", () => {
    const { container } = render(<SourceChips ids={ids.slice(0, 4)} sources={sources} />);
    expect(container.querySelectorAll(".chip")).toHaveLength(4);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("takes its own limit", () => {
    render(<SourceChips ids={ids} sources={sources} max={1} />);
    expect(screen.getByRole("button", { name: "Show 5 more sources" })).toBeVisible();
  });
});

describe("ThemeToggle", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    localStorage.clear();
  });

  it("steps auto → light → dark → auto, setting and clearing data-theme", () => {
    render(<ThemeToggle />);
    const root = document.documentElement;
    expect(root).not.toHaveAttribute("data-theme");
    fireEvent.click(screen.getByRole("button", { name: /Theme: Auto/ }));
    expect(root).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("crumble-theme")).toBe("light");
    fireEvent.click(screen.getByRole("button", { name: /Theme: Light/ }));
    expect(root).toHaveAttribute("data-theme", "dark");
    fireEvent.click(screen.getByRole("button", { name: /Theme: Dark/ }));
    expect(root).not.toHaveAttribute("data-theme");
    expect(localStorage.getItem("crumble-theme")).toBeNull();
  });

  it("starts from the remembered choice", () => {
    localStorage.setItem("crumble-theme", "dark");
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /Theme: Dark/ })).toBeVisible();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
});
