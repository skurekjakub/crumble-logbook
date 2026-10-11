import type { Attempt, Attempts } from "@crumble/schema";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { bodyRows, renderRoute } from "./view-harness";

afterEach(cleanup);

/**
 * Builds a run whose score climbs linearly from 0 at 60 s left to `at30` at 30 s left.
 *
 * @param time - the run's ENTER time
 * @param at30 - its score at 30 s left
 * @param end - how it ended
 * @param finalScore - its final score
 * @returns the run, with a reading every second from 58 to 30 s left
 */
function run(time: string, at30: number, end: Attempt["end"], finalScore: number): Attempt {
  const curve: Attempt["curve"] = [];
  for (let t = 58; t >= 30; t--) curve.push([t, Math.round((at30 * (60 - t)) / 30)]);
  return { time, run: 1, end, paceScore: at30, finalScore, curve };
}

const ATTEMPTS: Attempts = {
  available: true,
  rule: { minScore: 1_950_000_000_000, checkAtS: 30 },
  attempts: [
    run("2026-10-11 09:00:00", 1_500_000_000_000, "pruned", 1_600_000_000_000),
    run("2026-10-11 09:00:42", 2_359_000_000_000, "kept-on-pace", 4_120_000_000_000),
    run("2026-10-11 09:01:52", 1_200_000_000_000, "pruned", 1_300_000_000_000),
  ],
};

describe("the attempts page", () => {
  it("leads with the runs at a glance, then lists them latest first or by final", async () => {
    await renderRoute("/conquest/attempts", { "/api/attempts": { body: ATTEMPTS } });
    expect(await screen.findByRole("heading", { name: "Your attempts" })).toBeTruthy();
    const tiles = (await screen.findByText("Made the bar", { selector: "dt" })).closest("div")!;
    expect(tiles.textContent).toContain("33% of judged");
    expect(screen.getByText("Best final", { selector: "dt" }).nextSibling?.textContent).toContain(
      "4.120T",
    );
    const runs = screen.getByRole("heading", { name: "Runs" }).closest("section")!;
    expect(bodyRows(runs).map((r) => r[1])).toEqual(["1.300T", "4.120T", "1.600T"]);
    fireEvent.click(within(runs).getByRole("button", { name: "Best final" }));
    expect(bodyRows(runs).map((r) => r[1])).toEqual(["4.120T", "1.600T", "1.300T"]);
  });

  it("expands a run in place to its curve and its scores at each moment", async () => {
    await renderRoute("/conquest/attempts", { "/api/attempts": { body: ATTEMPTS } });
    const toggle = await screen.findByRole("button", {
      name: "Expand the run at 2026-10-11 09:00:42",
    });
    fireEvent.click(toggle);
    const detail = await screen.findByRole("img", {
      name: /Score curve of the run at 2026-10-11 09:00:42/,
    });
    const moments = detail.closest("td")!.querySelector(".att-moments")!;
    expect(within(moments as HTMLElement).getByText("45 s left").nextSibling?.textContent).toBe(
      "1.179T",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Collapse the run at 2026-10-11 09:00:42" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("img", { name: /Score curve of the run/ })).toBeNull(),
    );
  });

  it("tests an earlier cut at the moment picked, keeping the run that made the bar", async () => {
    await renderRoute("/conquest/attempts?at=45", { "/api/attempts": { body: ATTEMPTS } });
    expect((await screen.findByText(/^Cut at/)).textContent).toBe("Cut at 1.144T");
    expect(screen.getByText(/prunes/).textContent).toContain("prunes 67% of runs 15 s sooner");
    fireEvent.click(screen.getByRole("button", { name: "40 s left" }));
    expect((await screen.findByText(/^Cut at/)).textContent).toBe("Cut at 1.525T");
  });

  it("says where the attempts live when this server has none", async () => {
    await renderRoute("/conquest/attempts", {
      "/api/attempts": {
        body: { available: false, rule: { minScore: null, checkAtS: null }, attempts: [] },
      },
    });
    expect(await screen.findByText(/No attempts recorded here/)).toBeTruthy();
  });
});
