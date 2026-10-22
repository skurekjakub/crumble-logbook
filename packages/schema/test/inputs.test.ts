import { describe, expect, it } from "vitest";
import type { z } from "zod";
import * as inputs from "../src/inputs";

describe("sourceIds", () => {
  it("rejects an empty array", () => {
    const result = inputs.sourceIds.safeParse([]);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("cite at least one source");
  });
});

describe("cited inputs and patches", () => {
  const cited = [
    "mechanic",
    "rngFactor",
    "timelineEvent",
    "takeaway",
    "gearRec",
    "recommendation",
    "score",
    "fightEvent",
    "buffValue",
    "counter",
    "usageStat",
    "gearBuild",
  ] as const;
  const schema = (name: string) => (inputs as unknown as Record<string, z.ZodObject>)[name]!;

  it.each(cited)("%sInput takes no id and needs a source", (name) => {
    const input = schema(`${name}Input`);
    expect(input.shape).not.toHaveProperty("id");
    expect(input.shape).toHaveProperty("sources");
    expect(input.safeParse({ sources: [] }).success).toBe(false);
  });

  it.each(cited)("%sPatch parses {} to {} and rejects empty sources", (name) => {
    const patch = schema(`${name}Patch`);
    expect(patch.shape).not.toHaveProperty("id");
    expect(patch.parse({})).toEqual({});
    expect(patch.safeParse({ sources: [] }).success).toBe(false);
  });
});

describe("deckCookieInput", () => {
  it("rejects a cookie with neither level nor levelRule", () => {
    const result = inputs.deckCookieInput.safeParse({ cookieKr: "우유", why: "x" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["level"]);
  });

  it("accepts a cookie with only a levelRule", () => {
    const result = inputs.deckCookieInput.safeParse({
      cookieKr: "브시커",
      levelRule: "as high as possible while ATK < Milk",
      why: "x",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a levelRule that is only an unknown marker", () => {
    const result = inputs.deckCookieInput.safeParse({
      cookieKr: "브시커",
      levelRule: "Lv ?",
      why: "x",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty why", () => {
    const result = inputs.deckCookieInput.safeParse({
      cookieKr: "브시커",
      levelRule: "max",
      why: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("deckPatch", () => {
  it("parses {} to {} with no injected defaults", () => {
    expect(inputs.deckPatch.parse({})).toEqual({});
  });
});

const minimalDeck = {
  id: "test-deck",
  nameEn: "Test Deck",
  status: "meta",
  cookies: [{ cookieKr: "브시커", level: "60", why: "primary" }],
  sources: ["dc:1"],
};

describe("deckInput", () => {
  it("defaults pets and notes to []", () => {
    const parsed = inputs.deckInput.parse(minimalDeck);
    expect(parsed.pets).toEqual([]);
    expect(parsed.notes).toEqual([]);
  });

  it("rejects an id that isn't a lowercase slug", () => {
    const result = inputs.deckInput.safeParse({ ...minimalDeck, id: "Cherry Deck" });
    expect(result.success).toBe(false);
  });
});

describe("mechanicPatch", () => {
  it("omits sources when not provided", () => {
    const parsed = inputs.mechanicPatch.parse({ title: "t" });
    expect(parsed).not.toHaveProperty("sources");
  });

  it("rejects an empty sources array", () => {
    const result = inputs.mechanicPatch.safeParse({ sources: [] });
    expect(result.success).toBe(false);
  });
});

describe("scoreInput", () => {
  it("rejects a non-positive damageG", () => {
    const result = inputs.scoreInput.safeParse({ damageG: 0, sources: ["dc:1"] });
    expect(result.success).toBe(false);
  });

  it("accepts a null powerG", () => {
    const result = inputs.scoreInput.safeParse({ damageG: 100, powerG: null, sources: ["dc:1"] });
    expect(result.success).toBe(true);
  });
});

describe("timelineEventInput", () => {
  it("rejects a non-ISO date", () => {
    const result = inputs.timelineEventInput.safeParse({
      date: "9/10",
      event: "x",
      sources: ["dc:1"],
    });
    expect(result.success).toBe(false);
  });
});

describe("fightEventInput", () => {
  const event = {
    boss: "pinata",
    tElapsed: 30,
    event: "slam_pattern",
    detail: "The 30 s slam.",
    confidence: "high",
    sources: ["dc:1"],
  };

  it("accepts a null tElapsed", () => {
    expect(inputs.fightEventInput.safeParse({ ...event, tElapsed: null }).success).toBe(true);
  });

  it("rejects a negative tElapsed and an unknown confidence", () => {
    expect(inputs.fightEventInput.safeParse({ ...event, tElapsed: -1 }).success).toBe(false);
    expect(inputs.fightEventInput.safeParse({ ...event, confidence: "certain" }).success).toBe(
      false,
    );
  });

  it("requires sources", () => {
    const { sources: _dropped, ...rest } = event;
    expect(inputs.fightEventInput.safeParse(rest).success).toBe(false);
  });
});

describe("fightEventPatch", () => {
  it("parses {} to {}", () => {
    expect(inputs.fightEventPatch.parse({})).toEqual({});
  });
});

describe("buffValueInput", () => {
  const buff = {
    cookieKr: "실론나이트 쿠키",
    effectType: "BossDamageRateAddition",
    skillGrade: 9,
    fromStar: 9,
    valuePct: 70,
    maxStack: 1,
    base: "Fixed",
    scalesWithCasterAmp: true,
    sources: ["web:sugarpocket-bundle-1.4.002"],
  };

  it("accepts a buff and a null maxStack", () => {
    expect(inputs.buffValueInput.safeParse(buff).success).toBe(true);
    expect(inputs.buffValueInput.safeParse({ ...buff, maxStack: null }).success).toBe(true);
  });

  it("rejects a fractional grade or star and a star above 10", () => {
    expect(inputs.buffValueInput.safeParse({ ...buff, skillGrade: 1.5 }).success).toBe(false);
    expect(inputs.buffValueInput.safeParse({ ...buff, fromStar: 11 }).success).toBe(false);
  });
});

describe("buffValuePatch", () => {
  it("parses {} to {}", () => {
    expect(inputs.buffValuePatch.parse({})).toEqual({});
  });
});

describe("sourceInput", () => {
  it("has no site key in its shape", () => {
    expect(inputs.sourceInput.shape).not.toHaveProperty("site");
  });
});

describe("runeBuildInput", () => {
  it("defaults decks to []", () => {
    const parsed = inputs.runeBuildInput.parse({
      cookieKr: "쿠키",
      lines: "ATK/ATK/CRIT DMG",
      why: "burst",
      sources: ["dc:1"],
    });
    expect(parsed.decks).toEqual([]);
  });
});

describe("runeBuildPatch", () => {
  it("parses {} to {}", () => {
    expect(inputs.runeBuildPatch.parse({})).toEqual({});
  });
});

describe("gearBuildInput", () => {
  const build = {
    slug: "rift-default",
    mode: "stage",
    variant: null,
    deckId: null,
    position: 0,
    confidence: "medium",
    hasteLines: { min: 1, max: 4, note: null },
    accuracy: 1000,
    focus: null,
    slots: {
      top_left: ["Skill AMP", "Skill AMP"],
      top_right: ["Skill AMP", "Skill Haste"],
      bottom_left: ["Damage reduction"],
      bottom_right: [],
    },
    avoid: ["Crit damage over Skill AMP"],
    why: "Keeps the buffer's skill up.",
    sources: ["dc:1"],
  };
  const haste = (hasteLines: Record<string, unknown>) =>
    inputs.gearBuildInput.safeParse({
      ...build,
      hasteLines: { ...build.hasteLines, ...hasteLines },
    }).success;

  it("accepts a build with a range of haste lines, targets and a slot left empty", () => {
    expect(inputs.gearBuildInput.parse(build)).toMatchObject({
      hasteLines: { min: 1, max: 4 },
      slots: { bottom_right: [] },
    });
  });

  it("accepts a fixed number of haste lines, from none up to the board's twelve", () => {
    expect(haste({ min: 0, max: 0 })).toBe(true);
    expect(haste({ min: 12, max: 12 })).toBe(true);
  });

  it("rejects more haste lines at the least than at the most", () => {
    const result = inputs.gearBuildInput.safeParse({
      ...build,
      hasteLines: { min: 5, max: 2, note: null },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["hasteLines", "max"]);
  });

  it("rejects haste lines past the board's twelve items, below none, or fractional", () => {
    expect(haste({ max: 13 })).toBe(false);
    expect(haste({ min: -1 })).toBe(false);
    expect(haste({ max: 2.5 })).toBe(false);
  });

  it("rejects a board slot left out, and a slot the board doesn't have", () => {
    const { bottom_right: _dropped, ...three } = build.slots;
    expect(inputs.gearBuildInput.safeParse({ ...build, slots: three }).success).toBe(false);
    expect(
      inputs.gearBuildInput.safeParse({ ...build, slots: { ...build.slots, general: ["HP"] } })
        .success,
    ).toBe(false);
  });

  it("rejects a negative or fractional accuracy or focus target", () => {
    expect(inputs.gearBuildInput.safeParse({ ...build, accuracy: -1 }).success).toBe(false);
    expect(inputs.gearBuildInput.safeParse({ ...build, focus: 10.5 }).success).toBe(false);
  });

  it("rejects an empty why, and one that runs past a line", () => {
    expect(inputs.gearBuildInput.safeParse({ ...build, why: "" }).success).toBe(false);
    expect(inputs.gearBuildInput.safeParse({ ...build, why: "One.\nTwo." }).success).toBe(false);
  });

  it("checks the haste range in a patch too", () => {
    expect(
      inputs.gearBuildPatch.safeParse({ hasteLines: { min: 3, max: 1, note: null } }).success,
    ).toBe(false);
  });
});
