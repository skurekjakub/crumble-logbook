import { describe, expect, it } from "vitest";
import { formatDungeonG, keptExclusions, ordinal, scorePerPower } from "../src/lib/dungeon";
import { formatPower } from "../src/lib/stage";

describe("Crumble Dungeon arithmetic", () => {
  it("prints scores and total powers in G as the stage pages print power", () => {
    expect(formatDungeonG(379.313)).toBe("379.31G");
    expect(formatDungeonG(15.579)).toBe("15.58G");
    expect(formatDungeonG(10.102)).toBe("10.1G");
    expect(formatDungeonG(0.575)).toBe("575M");
    expect(formatDungeonG(350)).toBe("350G");
    expect(formatDungeonG(null)).toBe("–");
    for (const g of [379.313, 10.102, 4.847, 0.575]) {
      expect(formatDungeonG(g)).toBe(formatPower(Math.round(g * 1e9)));
    }
  });

  it("divides score by total power only when the power is known and positive", () => {
    expect(scorePerPower(379.313, 15.579)).toBe(24.3);
    expect(scorePerPower(350, null)).toBeNull();
    expect(scorePerPower(1, 0)).toBeNull();
  });

  it("prints a board place as an ordinal", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 101].map(ordinal)).toEqual([
      "1st",
      "2nd",
      "3rd",
      "4th",
      "11th",
      "12th",
      "13th",
      "21st",
      "22nd",
      "101st",
    ]);
  });

  it("finds the excluded or disputed cookies a lineup keeps, but not a patched one", () => {
    const list = [
      { cookieKr: "a", status: "excluded" as const },
      { cookieKr: "b", status: "patched" as const },
      { cookieKr: "c", status: "disputed" as const },
      { cookieKr: "d", status: "excluded" as const },
    ];
    expect(keptExclusions(["a", "b", "c", "x"], list).map((e) => e.cookieKr)).toEqual(["a", "c"]);
  });
});
