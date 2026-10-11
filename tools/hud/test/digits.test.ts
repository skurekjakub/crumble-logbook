import { describe, expect, it } from "vitest";
import type { DigitTemplate, Shape } from "../src/digits.ts";
import { isConfident, learn, match } from "../src/digits.ts";

/**
 * Builds a two-cell shape whose aspect and first cell both equal `ink`.
 *
 * @param ink - the first cell's ink coverage, 0 to 1.
 * @returns the shape.
 */
function shape(ink: number): Shape {
  return { aspect: ink, cells: [ink, 1 - ink] };
}

describe("learn", () => {
  it("folds each digit's samples into their running mean, the templates in digit order", () => {
    let templates: DigitTemplate[] = [];
    for (const ink of [0, 0.5, 1]) templates = learn(templates, "7", shape(ink));
    templates = learn(templates, "1", shape(0.25));
    expect(templates).toEqual([
      { digit: "1", samples: 1, aspect: 0.25, cells: [0.25, 0.75] },
      { digit: "7", samples: 3, aspect: 0.5, cells: [0.5, 0.5] },
    ]);
  });
});

describe("match", () => {
  it("won't call a glyph that sits about as near another digit", () => {
    const templates: DigitTemplate[] = [
      { digit: "1", samples: 1, aspect: 0.5, cells: [0] },
      { digit: "7", samples: 1, aspect: 0.5, cells: [3 / 64] },
    ];
    const m = match({ aspect: 0.5, cells: [1 / 64] }, templates);
    expect(m.digit).toBe("1");
    expect(isConfident(m)).toBe(false);
  });
});
