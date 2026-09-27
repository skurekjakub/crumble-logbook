import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AtkOrder } from "../src/components/AtkOrder";
import { CookieName } from "../src/components/CookieName";
import { Kv } from "../src/components/Kv";
import { Pill } from "../src/components/Pill";
import { SourceChips } from "../src/components/SourceChips";
import { indexSources, sourceLabel } from "../src/lib/sources";

describe("CookieName", () => {
  it("shows the English name with the Korean beneath it", () => {
    const { container } = render(<CookieName kr="우유" en="Milk" />);
    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(container.querySelector(".kr")).toHaveTextContent("우유");
  });

  it("shows the Korean name alone when en is null, never 'null'", () => {
    const { container } = render(<CookieName kr="브시커" en={null} />);
    expect(container).toHaveTextContent(/^브시커$/);
    expect(container.textContent).not.toContain("null");
    expect(container.querySelector(".kr")).toBeNull();
  });
});

describe("sourceLabel", () => {
  it("expands the site prefix", () => {
    expect(sourceLabel("dc:76135")).toBe("DC 76135");
    expect(sourceLabel("nv:43653")).toBe("Naver 43653");
    expect(sourceLabel("web:crumbgg:patches")).toBe("crumbgg:patches");
    expect(sourceLabel("other")).toBe("other");
  });
});

describe("SourceChips", () => {
  const sources = indexSources([
    { id: "dc:76135", url: "https://m.dcinside.com/board/projectcc/76135", title: "1T 999G" },
  ]);

  it("links known ids to their URL and leaves unknown ids as plain chips", () => {
    render(<SourceChips ids={["dc:76135", "nv:1"]} sources={sources} />);
    const link = screen.getByRole("link", { name: "DC 76135" });
    expect(link).toHaveAttribute("href", "https://m.dcinside.com/board/projectcc/76135");
    expect(link).toHaveAttribute("title", "1T 999G");
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByText("Naver 1").tagName).toBe("SPAN");
  });

  it("renders nothing for no ids", () => {
    const { container } = render(<SourceChips ids={[]} sources={sources} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Pill", () => {
  it("uses the kind as the CSS modifier and default text", () => {
    render(<Pill kind="meta" />);
    expect(screen.getByText("meta")).toHaveClass("pill", "meta");
  });

  it("accepts custom text", () => {
    render(<Pill kind="verified">screenshot</Pill>);
    expect(screen.getByText("screenshot")).toHaveClass("pill", "verified");
  });
});

describe("Kv", () => {
  it("drops rows with empty content", () => {
    const { container } = render(
      <Kv
        rows={[
          ["Perks", "Leader Milk"],
          ["Formation", ""],
          ["RNG", null],
          ["Swaps", "   "],
        ]}
      />,
    );
    expect([...container.querySelectorAll("dt")].map((dt) => dt.textContent)).toEqual(["Perks"]);
  });
});

describe("AtkOrder", () => {
  it("chains English names with arrows and falls back to Korean", () => {
    const { container } = render(
      <AtkOrder
        order={[
          { kr: "우유", en: "Milk" },
          { kr: "브시커", en: null },
        ]}
      />,
    );
    expect([...container.querySelectorAll(".step")].map((s) => s.textContent)).toEqual([
      "Milk",
      "브시커",
    ]);
    expect(container.querySelectorAll(".arr")).toHaveLength(1);
  });
});
