import type { InferRequestType } from "hono/client";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { api } from "../src/api/client";
import type { GameMode } from "../src/api/queries";
import {
  countersQuery,
  decksQuery,
  mechanicsQuery,
  recommendationsQuery,
  rulesQuery,
  scoresQuery,
  sourcesQuery,
  usageQuery,
} from "../src/api/queries";
import type { ModeRoutePath } from "../src/app/modes";
import {
  activeTab,
  ARENA,
  CONQUEST,
  DUNGEON,
  MODES,
  modeById,
  modePath,
  RUMBLE,
  SHARED_SECTIONS,
  sectionForPath,
  STAGE,
  tabAt,
} from "../src/app/modes";
import { requestPath, stubApi } from "./helpers";

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

describe("modeById and tabAt", () => {
  it("find a mode by its path segment, and nothing for another segment", () => {
    expect(modeById("arena")).toBe(ARENA);
    expect(modeById("research")).toBeUndefined();
  });

  it("find a tab at exactly a path, ignoring a trailing slash", () => {
    expect(tabAt(ARENA, "/arena/teams/")?.id).toBe("teams");
    expect(tabAt(ARENA, "/arena")?.id).toBe("overview");
    expect(tabAt(ARENA, "/arena/scores")).toBeUndefined();
    expect(tabAt(ARENA, "/Arena/Teams")?.id).toBe("teams");
    expect(tabAt(CONQUEST, "/conquest/scores")?.id).toBe("scores");
  });

  it("link every tab to its route with the mode's id, at the tab's own path", () => {
    for (const mode of MODES) {
      expect(mode.link, mode.id).toEqual({ to: "/$mode", params: { mode: mode.id } });
      for (const tab of mode.tabs) {
        expect(tab.link.params, tab.to).toEqual({ mode: mode.id });
        expect(modePath(mode.id, tab.link.to as ModeRoutePath), tab.to).toBe(tab.to);
      }
    }
  });
});

describe("MODES", () => {
  it("names the Guild Conquest research record", () => {
    expect(MODES.find((m) => m.id === "conquest")?.recordSlug).toBe("001-guild-conquest-meta");
  });

  it("files Arena and Rumble Arena under the PvP research record, each with its own screens", () => {
    for (const mode of [ARENA, RUMBLE]) {
      expect(mode.recordSlug, mode.id).toBe("002-pvp-meta");
      expect(
        mode.tabs.map((t) => t.to),
        mode.id,
      ).toEqual(
        ["", "/teams", "/counters", "/usage", "/runes", "/gear", "/mechanics", "/timeline"].map(
          (sub) => `${mode.to}${sub}`,
        ),
      );
      expect(mode.rules, mode.id).not.toBeNull();
    }
    expect(CONQUEST.rules).toBeNull();
  });

  it("files the stage section under record 003, with the shared pages and the stage screens", () => {
    expect(STAGE.recordSlug).toBe("003-stage-pushing-meta");
    expect(STAGE.scope.mode).toBe("stage");
    expect(STAGE.tabs.map((t) => t.to)).toEqual(
      [
        "",
        "/brackets",
        "/teams",
        "/zones",
        "/clears",
        "/rift",
        "/usage",
        "/runes",
        "/gear",
        "/mechanics",
        "/timeline",
      ].map((sub) => `/stage${sub}`),
    );
    expect(STAGE.stage.reach).toContain(35);
    for (const mode of [CONQUEST, ARENA, RUMBLE, DUNGEON]) expect(mode.stage, mode.id).toBeNull();
  });

  it("files the Crumble Dungeon section under record 004, with the shared pages and the dungeon screens", () => {
    expect(DUNGEON.recordSlug).toBe("004-golden-drop-meta");
    expect(DUNGEON.scope.mode).toBe("crumble_dungeon");
    expect(DUNGEON.tabs.map((t) => t.to)).toEqual(
      [
        "",
        "/runs",
        "/teams",
        "/lineups",
        "/exclusions",
        "/usage",
        "/runes",
        "/gear",
        "/mechanics",
        "/timeline",
      ].map((sub) => `/dungeon${sub}`),
    );
    expect(DUNGEON.dungeon.firstWave).toBe(40);
    expect(DUNGEON.rules).not.toBeNull();
    for (const mode of [CONQUEST, ARENA, RUMBLE, STAGE]) expect(mode.dungeon, mode.id).toBeNull();
  });

  it("lists the research index among the shared sections, before Sources and Glossary", () => {
    expect(SHARED_SECTIONS.map((s) => s.to)).toEqual(["/research", "/sources", "/glossary"]);
    expect(sectionForPath("/research")?.id).toBe("research");
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

/** The `?mode=` param of a list request; a compile error when the endpoint has none. */
type ModeOf<R extends { query: { mode?: unknown } }> = R["query"]["mode"];

describe("mode-scoped queries", () => {
  it("every mode-scoped endpoint accepts ?mode= typed as a game mode", () => {
    type Mode = GameMode | undefined;
    expectTypeOf<ModeOf<InferRequestType<typeof api.decks.$get>>>().toEqualTypeOf<Mode>();
    expectTypeOf<
      ModeOf<InferRequestType<(typeof api)["rune-builds"]["$get"]>>
    >().toEqualTypeOf<Mode>();
    expectTypeOf<
      ModeOf<InferRequestType<(typeof api)["gear-recs"]["$get"]>>
    >().toEqualTypeOf<Mode>();
    expectTypeOf<ModeOf<InferRequestType<typeof api.mechanics.$get>>>().toEqualTypeOf<Mode>();
    expectTypeOf<
      ModeOf<InferRequestType<(typeof api)["rng-factors"]["$get"]>>
    >().toEqualTypeOf<Mode>();
    expectTypeOf<ModeOf<InferRequestType<typeof api.timeline.$get>>>().toEqualTypeOf<Mode>();
    expectTypeOf<ModeOf<InferRequestType<typeof api.takeaways.$get>>>().toEqualTypeOf<Mode>();
    expectTypeOf<ModeOf<InferRequestType<typeof api.counters.$get>>>().toEqualTypeOf<Mode>();
    expectTypeOf<ModeOf<InferRequestType<typeof api.usage.$get>>>().toEqualTypeOf<Mode>();
    expectTypeOf<ModeOf<InferRequestType<typeof api.records.$get>>>().toEqualTypeOf<Mode>();
    expectTypeOf<GameMode>().toEqualTypeOf<
      "guild_conquest" | "arena" | "rumble_arena" | "stage" | "crumble_dungeon"
    >();
  });

  it("send the mode's ?mode= on each list request, and nothing without a scope", async () => {
    const fetch = stubApi({});
    const get = async (options: { queryFn?: unknown }) => {
      await (options.queryFn as () => Promise<unknown>)().catch(() => undefined);
      return requestPath(fetch.mock.calls.at(-1)![0]);
    };
    expect(await get(decksQuery(CONQUEST.scope))).toBe("/api/decks?mode=guild_conquest");
    expect(await get(mechanicsQuery(ARENA.scope))).toBe("/api/mechanics?mode=arena");
    expect(await get(decksQuery())).toBe("/api/decks");
    expect(await get(recommendationsQuery(CONQUEST.recordSlug))).toBe(
      "/api/recommendations?record=001-guild-conquest-meta",
    );
    expect(await get(countersQuery(ARENA.scope))).toBe("/api/counters?mode=arena");
    expect(await get(usageQuery(RUMBLE.scope))).toBe("/api/usage?mode=rumble_arena");
    expect(await get(rulesQuery(RUMBLE.scope))).toBe(
      "/api/mechanics?mode=rumble_arena&topic=rules",
    );
  });

  it("scope the sources list to a record, and leave the unfiltered list for the chips", async () => {
    const fetch = stubApi({});
    const get = async (options: { queryFn?: unknown }) => {
      await (options.queryFn as () => Promise<unknown>)().catch(() => undefined);
      return requestPath(fetch.mock.calls.at(-1)![0]);
    };
    expect(await get(sourcesQuery({ record: "002-pvp-meta" }))).toBe(
      "/api/sources?record=002-pvp-meta",
    );
    expect(await get(sourcesQuery())).toBe("/api/sources");
    expect(sourcesQuery().queryKey).toEqual(["sources", { site: null, record: null }]);
    expect(sourcesQuery({ record: "r" }).queryKey).not.toEqual(sourcesQuery().queryKey);
  });

  it("keep a mode's rules apart from its other mechanics in the cache", () => {
    expect(rulesQuery(ARENA.scope).queryKey).not.toEqual(mechanicsQuery(ARENA.scope).queryKey);
  });

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
