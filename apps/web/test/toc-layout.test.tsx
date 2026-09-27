import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TocLayout } from "../src/components/TocLayout";

describe("TocLayout", () => {
  it("lists a link per section, in order, each pointing at its section's id", () => {
    render(
      <TocLayout
        items={[
          { id: "a", label: "Alpha" },
          { id: "b", label: "Beta" },
        ]}
      >
        <section id="a">A</section>
        <section id="b">B</section>
      </TocLayout>,
    );
    const toc = screen.getByRole("navigation", { name: "On this page" });
    const links = within(toc).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Alpha", "#a"],
      ["Beta", "#b"],
    ]);
    for (const a of links) {
      expect(document.getElementById(a.getAttribute("href")!.slice(1))).not.toBeNull();
    }
  });

  it("renders the body alone when there's only one section to jump to", () => {
    render(
      <TocLayout items={[{ id: "a", label: "Alpha" }]}>
        <p>Body</p>
      </TocLayout>,
    );
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});
