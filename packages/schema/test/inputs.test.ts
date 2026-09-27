import { describe, expect, it } from "vitest";
import * as inputs from "../src/inputs";

describe("sourceIds", () => {
  it("rejects an empty array", () => {
    const result = inputs.sourceIds.safeParse([]);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("cite at least one source");
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
