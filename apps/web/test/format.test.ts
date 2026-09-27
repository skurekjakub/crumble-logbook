import { describe, expect, it } from "vitest";
import { formatG, formatRatio, ratio } from "../src/lib/format";

describe("formatG", () => {
  it.each([
    [1312, "1.31T"],
    [867, "867G"],
    [0.97, "0.97G"],
    [1000, "1T"],
    [1999, "2T"],
    [10, "10G"],
    [9.5, "9.5G"],
    [3.07, "3.07G"],
  ])("formats %s as %s", (g, expected) => {
    expect(formatG(g)).toBe(expected);
  });

  it.each([null, undefined, Number.NaN])("renders a dash for %s", (g) => {
    expect(formatG(g)).toBe("–");
  });
});

describe("ratio", () => {
  it("divides damage by power and rounds", () => {
    expect(ratio({ damageG: 1999, powerG: 3.07, ratio: null })).toBe(651);
  });

  it("falls back to the stored ratio when power is unknown", () => {
    expect(ratio({ damageG: 1312, powerG: null, ratio: 729 })).toBe(729);
  });

  it("is null when neither power nor a stored ratio is known", () => {
    expect(ratio({ damageG: 1312, powerG: null, ratio: null })).toBeNull();
    expect(ratio({ damageG: 1312, powerG: 0 })).toBeNull();
  });
});

describe("formatRatio", () => {
  it("shows the number, or a dash when missing", () => {
    expect(formatRatio(651)).toBe("651");
    expect(formatRatio(null)).toBe("–");
  });
});
