import type { Attempt, Attempts } from "@crumble/schema";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { bodyRows, renderRoute } from "./view-harness";

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
  return { time, run: 1, end, paceScore: at30, finalScore, sample: null, curve };
}

const RULE: Attempts["rule"] = { minScore: 1_950_000_000_000, checkAtS: 30 };

const ATTEMPTS: Attempts = {
  available: true,
  rule: RULE,
  attempts: [
    run("2026-10-11 09:00:00", 1_500_000_000_000, "pruned", 1_600_000_000_000),
    run("2026-10-11 09:00:42", 2_359_000_000_000, "kept-on-pace", 4_120_000_000_000),
    run("2026-10-11 09:01:52", 1_200_000_000_000, "pruned", 1_300_000_000_000),
  ],
};

/**
 * Opens the attempts page and waits for the runs table.
 *
 * @param path - the URL, query string included
 * @param body - what `/api/attempts` answers
 * @returns the Runs section
 */
async function openRuns(path: string, body: Attempts = ATTEMPTS): Promise<HTMLElement> {
  await renderRoute(path, { "/api/attempts": { body } });
  return screen.findByRole("region", { name: "Runs" });
}

describe("the attempts page", () => {
  it("leads with how many runs made the bar and the best final", async () => {
    await openRuns("/conquest/attempts");
    const madeTheBar = screen.getByText("Made the bar", { selector: "dt" }).nextSibling;
    expect(madeTheBar?.textContent).toBe("133% of judged");
    const bestFinal = screen.getByText("Best final", { selector: "dt" }).nextSibling;
    expect(bestFinal?.textContent).toBe("4.120T2026-10-11 09:00:42");
  });

  it("lists the runs latest first with their verdicts, or by best final", async () => {
    const runs = await openRuns("/conquest/attempts");
    expect(bodyRows(runs).map((r) => [r[1], r[4]])).toEqual([
      ["1.300T", "pruned"],
      ["4.120T", "made the bar"],
      ["1.600T", "pruned"],
    ]);
    fireEvent.click(within(runs).getByRole("button", { name: "Best final" }));
    expect(bodyRows(runs).map((r) => r[1])).toEqual(["4.120T", "1.600T", "1.300T"]);
  });

  it("lists only the runs that made the bar", async () => {
    const runs = await openRuns("/conquest/attempts");
    fireEvent.click(within(runs).getByRole("button", { name: "Made the bar" }));
    expect(bodyRows(runs).map((r) => r[1])).toEqual(["4.120T"]);
  });

  it("says so when no run has made the bar", async () => {
    const pruned = ATTEMPTS.attempts.filter((a) => a.end === "pruned");
    const runs = await openRuns("/conquest/attempts", { ...ATTEMPTS, attempts: pruned });
    fireEvent.click(within(runs).getByRole("button", { name: "Made the bar" }));
    expect(within(runs).getByText("No run has made the bar yet.")).toBeInTheDocument();
  });

  it("expands a run in place to its curve and its scores at each moment, and collapses it", async () => {
    const runs = await openRuns("/conquest/attempts");
    fireEvent.click(
      within(runs).getByRole("button", { name: "Expand the run at 2026-10-11 09:00:42" }),
    );
    await screen.findByRole("img", { name: /Score curve of the run at 2026-10-11 09:00:42/ });
    const at45 = within(runs).getByText("45 s left", { selector: "dt" }).nextSibling;
    expect(at45?.textContent).toBe("1.179T");
    fireEvent.click(
      within(runs).getByRole("button", { name: "Collapse the run at 2026-10-11 09:00:42" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("img", { name: /Score curve of the run/ })).toBeNull(),
    );
  });

  it("opens a run linked from the URL, however far down the list it sits", async () => {
    const many = Array.from({ length: 30 }, (_, i) =>
      run(`2026-10-11 09:${String(i).padStart(2, "0")}:00`, 1e12, "pruned", 1e12),
    );
    await openRuns("/conquest/attempts?run=2026-10-11%2009%3A00%3A00", {
      ...ATTEMPTS,
      attempts: many,
    });
    expect(
      screen.getByRole("img", { name: /Score curve of the run at 2026-10-11 09:00:00/ }),
    ).toBeInTheDocument();
  });

  it("tests an earlier cut at the moment in the URL, then at the moment picked", async () => {
    await openRuns("/conquest/attempts?at=40");
    const cut = screen.getByRole("region", { name: "An earlier cut" });
    expect(within(cut).getByText(/prunes/).textContent).toMatch(
      /^low: 1 passing runs Cut at 1\.525T prunes 67% of runs 10 s sooner/,
    );
    fireEvent.click(within(cut).getByRole("button", { name: "45 s left" }));
    expect((await within(cut).findByText(/^Cut at/)).textContent).toBe("Cut at 1.144T");
  });

  it("says where the attempts live when this server has none", async () => {
    await renderRoute("/conquest/attempts", {
      "/api/attempts": {
        body: { available: false, rule: { minScore: null, checkAtS: null }, attempts: [] },
      },
    });
    expect(await screen.findByText(/No attempts recorded here/)).toBeInTheDocument();
  });
});
