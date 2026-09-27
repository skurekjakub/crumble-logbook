import { describe, expect, it } from "vitest";
import { decksQuery, scoresQuery } from "../src/api/queries";
import { activeTab, ARENA, CONQUEST, MODES, sectionForPath } from "../src/app/modes";

describe("sectionForPath", () => {
  it("maps /conquest and its sub-paths to Guild Conquest", () => {
    expect(sectionForPath("/conquest")?.id).toBe("conquest");
    expect(sectionForPath("/conquest/decks")?.id).toBe("conquest");
  });

  it("maps the PvP modes and the shared sections", () => {
    expect(sectionForPath("/arena")?.id).toBe("arena");
    expect(sectionForPath("/rumble/")?.id).toBe("rumble");
    expect(sectionForPath("/sources")?.id).toBe("sources");
    expect(sectionForPath("/glossary")?.id).toBe("glossary");
  });

  it("does not match a path that only shares a prefix", () => {
    expect(sectionForPath("/conquestx")).toBeUndefined();
    expect(sectionForPath("/")).toBeUndefined();
  });
});

describe("activeTab", () => {
  const tabs = MODES.find((m) => m.id === "conquest")!.tabs;

  it("picks the overview only on the mode root", () => {
    expect(activeTab(tabs, "/conquest")?.to).toBe("/conquest");
    expect(activeTab(tabs, "/conquest/")?.to).toBe("/conquest");
  });

  it("picks the longest matching tab", () => {
    expect(activeTab(tabs, "/conquest/decks")?.to).toBe("/conquest/decks");
    expect(activeTab(tabs, "/conquest/scores/")?.to).toBe("/conquest/scores");
  });
});

describe("MODES", () => {
  it("names the Guild Conquest research record", () => {
    expect(MODES.find((m) => m.id === "conquest")?.recordSlug).toBe("001-guild-conquest-meta");
  });

  it("gives every mode its own API scope", () => {
    const modes = MODES.map((m) => m.scope.mode);
    expect(new Set(modes).size).toBe(MODES.length);
  });

  it("gives a mode with no sub-tabs a placeholder, and one with sub-tabs none", () => {
    for (const mode of MODES) {
      expect(mode.placeholder === null, mode.id).toBe(mode.tabs.length > 0);
    }
  });
});

describe("mode-scoped queries", () => {
  it("key each mode's lists apart, and the unscoped list apart from both", () => {
    expect(decksQuery(CONQUEST.scope).queryKey).toEqual(["decks", { mode: "guild_conquest" }]);
    expect(decksQuery(ARENA.scope).queryKey).toEqual(["decks", { mode: "arena" }]);
    expect(decksQuery().queryKey).toEqual(["decks", { mode: null }]);
    expect(scoresQuery(CONQUEST.scope, "cherry").queryKey).toEqual([
      "scores",
      { mode: "guild_conquest", deck: "cherry" },
    ]);
  });
});
