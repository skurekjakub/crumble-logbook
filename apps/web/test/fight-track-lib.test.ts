import { describe, expect, it } from "vitest";
import {
  eventLabel,
  fightLength,
  markerRows,
  secondsLeft,
  staggerRows,
  survivalTitle,
  trackPercent,
  whenLabel,
} from "../src/lib/fight-track";

/** The Piñata fight's length, in seconds. */
const FIGHT = 60;

describe("fight track scale", () => {
  it("maps 0–60 s elapsed onto 0–100% of the track", () => {
    expect(trackPercent(0, FIGHT)).toBe(0);
    expect(trackPercent(30, FIGHT)).toBe(50);
    expect(trackPercent(43, FIGHT)).toBeCloseTo(71.667, 2);
    expect(trackPercent(60, FIGHT)).toBe(100);
  });

  it("clamps times outside the fight to the track's ends", () => {
    expect(trackPercent(-5, FIGHT)).toBe(0);
    expect(trackPercent(70, FIGHT)).toBe(100);
  });

  it("scales to another fight length", () => {
    expect(trackPercent(45, 90)).toBe(50);
  });

  it("reads the in-game countdown off elapsed time", () => {
    expect(secondsLeft(43, FIGHT)).toBe(17);
    expect(secondsLeft(30, FIGHT)).toBe(30);
    expect(secondsLeft(0, FIGHT)).toBe(60);
  });

  it("says when an event happens, or that it's off the clock", () => {
    expect(whenLabel(43, FIGHT)).toBe("43 s · 17 s left");
    expect(whenLabel(null, FIGHT)).toBe("Off the clock");
  });

  it("puts positions closer than the gap on separate rows, reusing rows once clear", () => {
    expect(staggerRows([0, 30, 33, 41, 43, 60], 4)).toEqual([0, 0, 1, 0, 1, 0]);
    expect(staggerRows([10, 10, 10], 4)).toEqual([0, 1, 2]);
    expect(staggerRows([], 4)).toEqual([]);
  });

  it("staggers markers by their rendered pixel distance, so a phone-width track needs more rows", () => {
    const times = [30, 33, 41, 43, 46, 58];
    // About 3.5 px per second: markers 5 s apart are 17.5 px apart and would overlap.
    expect(markerRows(times, FIGHT, 210, 26)).toEqual([0, 1, 0, 1, 2, 0]);
    // About 18 px per second: every marker clears its neighbour on one row.
    expect(markerRows(times, FIGHT, 1100, 26)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it("titles a survival card by the in-game countdown at its anchor event", () => {
    expect(survivalTitle("slam", 30, FIGHT)).toBe("The 30 s slam");
    expect(survivalTitle("super-jump wipe", 43, FIGHT)).toBe("The 17 s super-jump wipe");
    expect(survivalTitle("super-jump wipe", 43, 90)).toBe("The 47 s super-jump wipe");
    expect(survivalTitle("slam", null, FIGHT)).toBe("Slam");
  });

  it("reads the fight's length off the event that states it, else the latest timed event", () => {
    const at = (event: string, tElapsed: number | null) => ({ event, tElapsed });
    expect(
      fightLength([at("engage", 0), at("fight_length", 90), at("wipe", 43)], "fight_length"),
    ).toBe(90);
    expect(fightLength([at("engage", 0), at("wipe", 43), at("off", null)], "fight_length")).toBe(
      43,
    );
    expect(fightLength([at("fight_length", null), at("wipe", 43)], "fight_length")).toBe(43);
    expect(fightLength([], "fight_length")).toBe(0);
  });

  it("turns an event key into a sentence-case label", () => {
    expect(eventLabel("super_jump_wipe")).toBe("Super jump wipe");
    expect(eventLabel("boss_defense_phase_0")).toBe("Boss defense phase 0");
  });
});
