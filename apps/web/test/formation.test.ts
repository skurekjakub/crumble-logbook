import { describe, expect, it } from "vitest";
import { formationGrid, parseSlot } from "../src/lib/formation";

describe("parseSlot", () => {
  it("reads row<R>-<C>", () => {
    expect(parseSlot("row2-6")).toEqual({ row: 2, col: 6 });
    expect(parseSlot(" row1-1 ")).toEqual({ row: 1, col: 1 });
  });

  it("rejects anything else", () => {
    for (const slot of [null, undefined, "", "back-1", "row0-1", "row1-0", "row1"]) {
      expect(parseSlot(slot), String(slot)).toBeNull();
    }
  });
});

describe("formationGrid", () => {
  const slotOf = (e: { slot: string | null }) => e.slot;

  it("places entries by row and column, six columns wide, with empty cells as null", () => {
    const a = { slot: "row1-1" };
    const b = { slot: "row2-6" };
    const { rows, unplaced } = formationGrid([b, a], slotOf);
    expect(rows).toEqual([
      [a, null, null, null, null, null],
      [null, null, null, null, null, b],
    ]);
    expect(unplaced).toEqual([]);
  });

  it("widens for a slot past column six", () => {
    expect(formationGrid([{ slot: "row1-7" }], slotOf).rows[0]).toHaveLength(7);
  });

  it("keeps unslotted entries and a second claim on a taken cell apart, in input order", () => {
    const a = { slot: "row1-1" };
    const clash = { slot: "row1-1" };
    const loose = { slot: null };
    const { rows, unplaced } = formationGrid([a, loose, clash], slotOf);
    expect(rows[0]![0]).toBe(a);
    expect(unplaced).toEqual([loose, clash]);
  });

  it("has no rows when no entry has a slot", () => {
    expect(formationGrid([{ slot: null }], slotOf).rows).toEqual([]);
  });
});
