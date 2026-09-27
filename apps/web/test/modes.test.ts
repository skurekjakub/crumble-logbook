import { describe, expect, it } from "vitest";
import { activeTab, MODES, sectionForPath } from "../src/app/modes";

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
});
