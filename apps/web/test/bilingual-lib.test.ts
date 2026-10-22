import { describe, expect, it } from "vitest";
import { englishHalf } from "../src/lib/bilingual";

describe("englishHalf", () => {
  it("keeps the English half of a Korean/English pair", () => {
    expect(englishHalf("불/Fire")).toBe("Fire");
    expect(englishHalf("방어/Tank")).toBe("Tank");
  });

  it("trims the spaces around the slash", () => {
    expect(englishHalf("물 / Water")).toBe("Water");
  });

  it("keeps a value that is English already", () => {
    expect(englishHalf("Dark")).toBe("Dark");
  });

  it("keeps a Korean-only value, so nothing renders blank", () => {
    expect(englishHalf("어둠")).toBe("어둠");
  });

  it("answers null for null and for an empty value", () => {
    expect(englishHalf(null)).toBeNull();
    expect(englishHalf("")).toBeNull();
  });
});
