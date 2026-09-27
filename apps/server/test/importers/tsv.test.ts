import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseTsv } from "../../src/importers/tsv";

const fixture = readFileSync(join(import.meta.dirname, "fixtures", "players.tsv"), "utf-8");

describe("parseTsv", () => {
  it("keys every data row by the header line", () => {
    const rows = parseTsv(fixture);
    expect(rows).toHaveLength(3);
    expect(rows[1]).toEqual({
      season: "1",
      rank: "2",
      player: "Arsen",
      guild: "Eden",
      score_text: "212.757G",
      score_G: "212.757",
      power_G: "26.545",
      power_source: "lookup(cp)",
      ratio: "8.0",
      power_contemporaneous: "no",
      crumb_player_id: "pa178af0b469e59",
    });
  });

  it("keeps empty cells as empty strings", () => {
    const rows = parseTsv(fixture);
    expect(rows[0]!.power_G).toBe("");
    expect(rows[0]!.player).toBe("도리");
  });

  it("tolerates CRLF line endings", () => {
    expect(parseTsv(fixture.replace(/\n/g, "\r\n"))).toEqual(parseTsv(fixture));
  });

  it("ignores trailing blank lines", () => {
    expect(parseTsv("a\tb\n1\t2\n\n\r\n")).toEqual([{ a: "1", b: "2" }]);
  });

  it("returns no rows for a header-only file", () => {
    expect(parseTsv("a\tb\n")).toEqual([]);
  });

  it("throws naming the line when a row has the wrong cell count", () => {
    expect(() => parseTsv("a\tb\n1\t2\n1\t2\t3\n")).toThrow("line 3: expected 2 cells, got 3");
  });
});
