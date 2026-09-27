import { fireEvent, render, screen } from "@testing-library/react";
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
    fireEvent.focus(screen.getByLabelText("2T at 3.07G"));
    expect(tip).toBeVisible();
    expect(tip).toHaveTextContent("2T at 3.07G power · 651배");
    expect(tip).toHaveTextContent("run 2");
    fireEvent.blur(screen.getByLabelText("2T at 3.07G"));
    expect(tip).not.toBeVisible();
  });

  it("shows the tooltip on hover", () => {
    const { container } = render(<Scatter {...props} />);
    fireEvent.mouseEnter(screen.getByLabelText("100G at 1G"));
    expect(container.querySelector(".tip")).toHaveTextContent("100G at 1G power · 100배");
  });

  it("shows the empty state when nothing is plottable", () => {
    render(<Scatter {...props} points={[POINTS[3]!]} />);
    expect(screen.getByText("No scores with both damage and power yet.")).toHaveClass("empty");
  });
});
