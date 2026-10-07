import { describe, expect, it } from "vitest";
import { leadSentence, stance } from "../src/lib/verdict";

describe("leadSentence", () => {
  it("splits a text at its first sentence", () => {
    expect(
      leadSentence("The documented meta is the Cherry deck. Among teams running it, levels win."),
    ).toEqual({
      lead: "The documented meta is the Cherry deck.",
      rest: "Among teams running it, levels win.",
    });
  });

  it("keeps a one-sentence text whole", () => {
    expect(leadSentence("  Expect hours of retries.  ")).toEqual({
      lead: "Expect hours of retries.",
      rest: "",
    });
  });

  it("doesn't split at a level, a decimal or an abbreviation", () => {
    const text = "Fillers sit at Lv. 1, e.g. Cherry, and 1.8G teams vs. 3G ones. Then the rest.";
    expect(leadSentence(text).lead).toBe(
      "Fillers sit at Lv. 1, e.g. Cherry, and 1.8G teams vs. 3G ones.",
    );
  });

  it("doesn't split before a lower-case word, and splits before Korean or a figure", () => {
    expect(leadSentence("Score is damage. dealt before the timer.").rest).toBe("");
    expect(leadSentence("Runes first. 6 lines of haste.").rest).toBe("6 lines of haste.");
    expect(leadSentence("Milk leads. 우유 is ATK #1.").rest).toBe("우유 is ATK #1.");
  });

  it("returns an empty lead for an empty text", () => {
    expect(leadSentence("")).toEqual({ lead: "", rest: "" });
  });
});

describe("stance", () => {
  it("reads a negated recommendation as avoid", () => {
    expect(stance("No move speed, accuracy or focus")).toBe("avoid");
    expect(stance("Avoid crit resistance")).toBe("avoid");
    expect(stance("don't roll ATK%")).toBe("avoid");
    expect(stance("Never move speed")).toBe("avoid");
  });

  it("reads anything else as recommended, a word merely starting with a negation included", () => {
    expect(stance("Skill amp + crit dmg")).toBe("recommended");
    expect(stance("All ATK% (8 × 공증)")).toBe("recommended");
    expect(stance("Nothing but haste")).toBe("recommended");
    expect(stance("Notable: skill amp")).toBe("recommended");
  });
});
