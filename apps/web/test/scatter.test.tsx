import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PLOT, Scatter } from "../src/components/Scatter";

const POINTS = [
  { id: 1, damageG: 100, powerG: 1, verified: true, ratio: 100 },
  { id: 2, damageG: 1999, powerG: 3.07, verified: false, ratio: 651 },
  { id: 3, damageG: 1312, powerG: 1.8, verified: true, ratio: 729 },
  { id: 4, damageG: 900, powerG: null, verified: true, ratio: null },
];

const props = {
  points: POINTS,
  color: () => "var(--s1)",
  label: (p: (typeof POINTS)[number]) => `run ${p.id}`,
};

const box = {
  left: PLOT.margin.l,
  right: PLOT.width - PLOT.margin.r,
  top: PLOT.margin.t,
  bottom: PLOT.height - PLOT.margin.b,
};

function inBox(x: number, y: number) {
  return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
}

describe("Scatter", () => {
  it("plots only points with both damage and power, all inside the plot box", () => {
    const { container } = render(<Scatter {...props} />);
    const dots = [...container.querySelectorAll("circle.dot")];
    expect(dots).toHaveLength(3);
    for (const dot of dots) {
      expect(inBox(Number(dot.getAttribute("cx")), Number(dot.getAttribute("cy")))).toBe(true);
    }
  });

  it("maps the min point below-left of the max point", () => {
    const { container } = render(<Scatter {...props} />);
    const [min, max] = [...container.querySelectorAll("circle.dot")];
    expect(Number(min!.getAttribute("cx"))).toBeLessThan(Number(max!.getAttribute("cx")));
    expect(Number(min!.getAttribute("cy"))).toBeGreaterThan(Number(max!.getAttribute("cy")));
  });

  it("fades claimed points", () => {
    const { container } = render(<Scatter {...props} />);
    const dots = [...container.querySelectorAll("circle.dot")];
    expect(dots.map((d) => d.classList.contains("claimed"))).toEqual([false, true, false]);
  });

  it("draws the 100× and 300× iso lines inside the plot box", () => {
    const { container } = render(<Scatter {...props} />);
    const labels = [...container.querySelectorAll(".iso text")].map((t) => t.textContent);
    expect(labels).toContain("100배");
    expect(labels).toContain("300배");
    for (const line of container.querySelectorAll(".iso line")) {
      const [x1, y1, x2, y2] = ["x1", "y1", "x2", "y2"].map((a) => Number(line.getAttribute(a)));
      expect(inBox(x1!, y1!)).toBe(true);
      expect(inBox(x2!, y2!)).toBe(true);
    }
  });

  it("shows a tooltip on focus and hides it on blur", () => {
    const { container } = render(<Scatter {...props} />);
    const tip = container.querySelector(".tip") as HTMLElement;
    expect(tip).not.toBeVisible();
    const point = screen.getByRole("img", { name: "2T at 3.07G power, 651배: run 2" });
    fireEvent.focus(point);
    expect(tip).toBeVisible();
    expect(tip).toHaveTextContent("2T at 3.07G power · 651배");
    expect(tip).toHaveTextContent("run 2");
    fireEvent.blur(point);
    expect(tip).not.toBeVisible();
  });

  it("names each focusable point with its numbers and label, inside a group rather than an image", () => {
    render(<Scatter {...props} />);
    const chart = screen.getByRole("group", { name: /damage against team power/ });
    const points = within(chart).getAllByRole("img");
    expect(points.map((p) => p.getAttribute("aria-label"))).toEqual([
      "100G at 1G power, 100배: run 1",
      "2T at 3.07G power, 651배: run 2",
      "1.31T at 1.8G power, 729배: run 3",
    ]);
    for (const p of points) expect(p).toHaveAttribute("tabindex", "0");
    expect(chart.closest("[role=img]")).toBeNull();
  });

  it("shows the tooltip on hover", () => {
    const { container } = render(<Scatter {...props} />);
    fireEvent.mouseEnter(screen.getByRole("img", { name: /^100G at 1G power/ }));
    expect(container.querySelector(".tip")).toHaveTextContent("100G at 1G power · 100배");
  });

  it("shows the empty state when nothing is plottable", () => {
    render(<Scatter {...props} points={[POINTS[3]!]} />);
    expect(screen.getByText("No scores with both damage and power yet.")).toHaveClass("empty");
  });
});
