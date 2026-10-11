import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GRID_COLUMNS, GRID_ROWS, isConfident, match } from "../src/digits.ts";
import type { HudTemplates } from "../src/hud.ts";

const templates = JSON.parse(
  readFileSync(join(import.meta.dirname, "..", "templates.json"), "utf8"),
) as HudTemplates;

describe("templates.json", () => {
  for (const field of ["score", "timer", "final"] as const) {
    it(`holds one ${field} template per digit, on the current grid`, () => {
      expect(templates[field].map((t) => t.digit)).toEqual("0123456789".split(""));
      for (const t of templates[field]) expect(t.cells).toHaveLength(GRID_COLUMNS * GRID_ROWS);
    });

    it(`matches each ${field} template to its own digit, clear of every other`, () => {
      for (const t of templates[field]) {
        const m = match(t, templates[field]);
        expect(m.digit).toBe(t.digit);
        expect(isConfident(m)).toBe(true);
      }
    });
  }
});
