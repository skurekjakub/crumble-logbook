import { describe, expect, it } from "vitest";
import { lineupProblem, runStanding } from "../src/dungeon";

describe("Crumble Dungeon rules", () => {
  it("makes a run a claim when text alone backs it or it was posted as a claim", () => {
    expect(runStanding({ evidence: "screenshot", board: "run" })).toBe("verified");
    expect(runStanding({ evidence: "video", board: "weekly-best" })).toBe("verified");
    expect(runStanding({ evidence: "text", board: "run" })).toBe("claim");
    expect(runStanding({ evidence: "screenshot", board: "claim" })).toBe("claim");
  });

  it("names the first cookie a lineup both keeps and excludes, then the first ATK-order cookie outside its first wave", () => {
    const ok = { first40: ["a", "b"], excluded: ["c"], atkOrder: ["b", "a"] };
    expect(lineupProblem(ok)).toBeUndefined();
    expect(lineupProblem({ ...ok, excluded: ["c", "b", "a"] })).toBe(
      "b is both in first40 and excluded",
    );
    expect(lineupProblem({ ...ok, atkOrder: ["a", "d"] })).toBe(
      "atk_order names d, not in first40",
    );
  });
});
