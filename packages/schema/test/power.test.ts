import { describe, expect, it } from "vitest";
import { entryPower, parsePower, postedPower, postedPowerG } from "../src/power";

describe("parsePower", () => {
  it("reads the game's units, their sums and plain numbers", () => {
    expect(parsePower("2.2G")).toBe(2_200_000_000);
    expect(parsePower("971.8m")).toBe(971_800_000);
    expect(parsePower("4G 3M 599K")).toBe(4_003_599_000);
    expect(parsePower("1,169,780,000")).toBe(1_169_780_000);
    expect(parsePower(" 10258 ")).toBe(10258);
  });

  it("reads a unit set apart from its figure", () => {
    expect(parsePower("4 G")).toBe(4_000_000_000);
    expect(parsePower("4 G 3 M")).toBe(4_003_000_000);
  });

  it("rounds a plain number to a whole power", () => {
    expect(parsePower("1.4")).toBe(1);
    expect(parsePower("0.4")).toBeNull();
  });

  it("refuses text that isn't a positive power", () => {
    expect(parsePower("")).toBeNull();
    expect(parsePower("abc")).toBeNull();
    expect(parsePower("2.2X")).toBeNull();
    expect(parsePower("0")).toBeNull();
    expect(parsePower("2G and change")).toBeNull();
  });

  it("refuses a repeated or out-of-order unit and a malformed separator", () => {
    expect(parsePower("4G 4G")).toBeNull();
    expect(parsePower("3M 4G")).toBeNull();
    expect(parsePower("1,,2")).toBeNull();
    expect(parsePower("1,2G")).toBeNull();
  });
});

describe("postedPower", () => {
  it("reads the most precise figure a post gives, an exact breakdown over its headline", () => {
    expect(postedPower("4.00G (4G 3M 599K)")).toBe(4_003_599_000);
    expect(postedPower("1.17G (1,169.78M)")).toBe(1_169_780_000);
    expect(postedPower("971.8M (971M 839K)")).toBe(971_839_000);
    expect(postedPower("4.06G (4G 63M)")).toBe(4_063_000_000);
  });

  it("reads a figure inside wording, and a breakdown posted on its own", () => {
    expect(postedPower("about 4.03G ('딱투')")).toBe(4_030_000_000);
    expect(postedPower("just over 3G")).toBe(3_000_000_000);
    expect(postedPower("4G 3M 599K")).toBe(4_003_599_000);
  });

  it("finds nothing in text without a figure and a unit", () => {
    expect(postedPower("no figure")).toBeNull();
    expect(postedPower("12 cookies")).toBeNull();
  });
});

describe("postedPowerG", () => {
  it("gives the posted power in billions", () => {
    expect(postedPowerG("4.00G (4G 3M 599K)")).toBe(4.003599);
    expect(postedPowerG("971.8M (971M 839K)")).toBe(0.971839);
    expect(postedPowerG("no figure")).toBeNull();
  });
});

describe("entryPower", () => {
  it("rounds an entry power up to the next whole power", () => {
    expect(entryPower(10258, 40)).toBe(4104);
    expect(entryPower(1600, 20)).toBe(320);
  });
});
