import type { GameMode, SourceSite } from "@crumble/schema";
import { CITED_ENTITY } from "@crumble/schema";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import type { hc } from "hono/client";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { AppType } from "../src/app";
import { createApp } from "../src/app";
import type { Registry, TableKey } from "../src/registry";
import { CONTENT_KEYS, REGISTRY, TABLE_KEYS, specOf } from "../src/registry";
import type { Store } from "../src/repos";
import type { Services } from "../src/services";
import { createServices } from "../src/services";
import { addSource, testStore } from "./helpers";

/** The typed client's routes under `/api`, by first path segment. */
type ClientRoutes = ReturnType<typeof hc<AppType>>["api"];

/** Every registered route path, without its leading slash. */
type RegisteredPath = {
  [K in TableKey]: Registry[K] extends { path: `/${infer P}` } ? P : never;
}[TableKey];

/** A registered table the filter test knows how to seed. */
type SeededKey =
  | "sources"
  | "decks"
  | "runeBuilds"
  | "gearRecs"
  | "scores"
  | "mechanics"
  | "rngFactors"
  | "timeline"
  | "takeaways"
  | "recommendations"
  | "fightEvents"
  | "buffValues"
  | "researchRecords"
  | "counters"
  | "usageStats"
  | "captures"
  | "stageZoneSlots"
  | "stageClears"
  | "dungeonRuns"
  | "dungeonLineups"
  | "dungeonExclusions";

/**
 * Creates one valid row of a type, with `over` applied on top.
 *
 * @returns the view field that identifies the row, and its value
 */
type Seed = (store: Store, services: Services, over: Record<string, unknown>) => [string, unknown];

/** Two rows that differ on one filter, and the query value that selects the first. */
interface FilterCase {
  match: Record<string, unknown>;
  other: Record<string, unknown>;
  value: string;
}

/** The case every derived `?mode=` filter runs. */
const MODE_CASE: FilterCase = { match: { mode: "arena" }, other: {}, value: "arena" };

/** The case of every declared filter other than `mode`, by table and filter name. */
const FILTER_CASES: Partial<Record<TableKey, Record<string, FilterCase>>> = {
  sources: {
    site: { match: { site: "nv" }, other: {}, value: "nv" },
    record: { match: { recordSlug: "r1" }, other: { recordSlug: "r2" }, value: "r1" },
  },
  runeBuilds: { deck: { match: { decks: ["d1"] }, other: { decks: ["d2"] }, value: "d1" } },
  scores: { deck: { match: { deckId: "d1" }, other: { deckId: "d2" }, value: "d1" } },
  mechanics: { topic: { match: { topic: "rules" }, other: {}, value: "rules" } },
  recommendations: {
    record: { match: { recordSlug: "r1" }, other: { recordSlug: "r2" }, value: "r1" },
  },
  fightEvents: { boss: { match: { boss: "pinata" }, other: { boss: "golem" }, value: "pinata" } },
  buffValues: { cookie: { match: { cookieKr: "a" }, other: { cookieKr: "b" }, value: "a" } },
  counters: {
    deck: {
      match: { teamDeckId: "d3", beatenByDeckId: "d1" },
      other: { teamDeckId: "d2", beatenByDeckId: "d3" },
      value: "d1",
    },
  },
  usageStats: { kind: { match: { kind: "core" }, other: { kind: "pet" }, value: "core" } },
  stageZoneSlots: { deck: { match: { deckId: "s1" }, other: { deckId: "s2" }, value: "s1" } },
  stageClears: {
    result: { match: { result: "fail" }, other: {}, value: "fail" },
    deck: { match: { deckId: "s1" }, other: { deckId: "s2" }, value: "s1" },
  },
  dungeonRuns: {
    board: { match: { board: "weekly-best" }, other: {}, value: "weekly-best" },
    evidence: { match: { evidence: "video" }, other: {}, value: "video" },
    deck: { match: { deckId: "g1" }, other: { deckId: "g2" }, value: "g1" },
  },
  dungeonLineups: { deck: { match: { deckId: "g1" }, other: { deckId: "g2" }, value: "g1" } },
  dungeonExclusions: {
    kind: { match: { kind: "summoner" }, other: {}, value: "summoner" },
    status: { match: { status: "patched" }, other: {}, value: "patched" },
  },
  captures: {
    record: { match: { recordSlug: "r1" }, other: { recordSlug: "r2" }, value: "r1" },
    path: {
      match: { path: "evidence/a.md" },
      other: { path: "evidence/b.md" },
      value: "evidence/a.md",
    },
  },
};

let serial = 0;

/**
 * Creates the decks `d1`–`d3` that seeds reference, once per store.
 *
 * @param store - the store to check for existing decks
 * @param services - the services to create the decks through
 */
function ensureDecks(store: Store, services: Services): void {
  cite(store);
  for (const id of ["d1", "d2", "d3"]) {
    if (store.repos.decks.exists(id)) continue;
    services.decks.create({ ...deckBase, id, nameEn: id });
  }
}

/**
 * Creates the stage decks `s1` and `s2` that stage seeds reference, once per store.
 *
 * @param store - the store to check for existing decks
 * @param services - the services to create the decks through
 */
function ensureStageDecks(store: Store, services: Services): void {
  cite(store);
  for (const id of ["s1", "s2"]) {
    if (store.repos.decks.exists(id)) continue;
    services.decks.create({ ...deckBase, id, nameEn: id, mode: "stage" });
  }
}

/**
 * Creates the Crumble Dungeon decks `g1` and `g2` that dungeon seeds reference, once per store.
 *
 * @param store - the store to check for existing decks
 * @param services - the services to create the decks through
 */
function ensureDungeonDecks(store: Store, services: Services): void {
  cite(store);
  for (const id of ["g1", "g2"]) {
    if (store.repos.decks.exists(id)) continue;
    services.decks.create({ ...deckBase, id, nameEn: id, mode: "crumble_dungeon" });
  }
}

/**
 * Creates two decks of `mode`, for a row that must name decks of its own
 * mode (a counter edge).
 *
 * @param services - the services to create the decks through
 * @param mode - the decks' game mode
 * @returns the two decks' ids
 */
function modeDecks(services: Services, mode: GameMode): [string, string] {
  const ids: [string, string] = [`${mode.replace("_", "-")}-1`, `${mode.replace("_", "-")}-2`];
  for (const id of ids) services.decks.create({ ...deckBase, id, nameEn: id, mode });
  return ids;
}

/**
 * Adds the source every seeded row cites, once per store.
 *
 * @param store - the store to add it to
 * @returns the source ids to cite
 */
function cite(store: Store): string[] {
  if (store.repos.sources.missing(["dc:1"]).length > 0) addSource(store, "dc:1");
  return ["dc:1"];
}

const deckBase = {
  nameEn: "deck",
  status: "meta" as const,
  cookies: [{ cookieKr: "체리 쿠키", level: "1", levelRule: null, stars: null, why: "x" }],
  pets: [],
  notes: [],
  sources: ["dc:1"],
};

/** How the filter test seeds a row of each filtered type. */
const SEEDS: Record<SeededKey, Seed> = {
  sources: (store, _services, over) => {
    const site = (over.site as SourceSite | undefined) ?? "dc";
    const id = `${site}:${++serial}`;
    store.repos.sources.insert({ id, site, url: `https://example.test/${id}`, ...over });
    return ["id", id];
  },
  decks: (store, services, over) => {
    cite(store);
    const id = `deck-${++serial}`;
    services.decks.create({ ...deckBase, id, ...over });
    return ["id", id];
  },
  runeBuilds: (store, services, over) => {
    cite(store);
    ensureDecks(store, services);
    const row = services.runeBuilds.create({
      cookieKr: "체리 쿠키",
      lines: "ATK",
      why: "x",
      disputed: null,
      decks: [],
      sources: ["dc:1"],
      ...over,
    });
    return ["id", row.id];
  },
  gearRecs: (store, services, over) => {
    const row = services.gearRecs.create(
      { slot: "top_left", substats: "ATK", context: "raid", why: "x", ...over },
      cite(store),
    );
    return ["id", row.id];
  },
  scores: (store, services, over) => {
    ensureDecks(store, services);
    const row = services.scores.create({ damageG: 1, verified: false, ...over }, cite(store));
    return ["id", row.id];
  },
  mechanics: (store, services, over) => {
    const row = services.mechanics.create(
      { title: "t", body: "b", confidence: "high", ...over },
      cite(store),
    );
    return ["id", row.id];
  },
  rngFactors: (store, services, over) => {
    const row = services.rngFactors.create(
      { factor: "f", effect: "e", mitigation: null, ...over },
      cite(store),
    );
    return ["id", row.id];
  },
  timeline: (store, services, over) => {
    const row = services.timeline.create({ date: "2026-01-01", event: "e", ...over }, cite(store));
    return ["id", row.id];
  },
  takeaways: (store, services, over) => {
    const row = services.takeaways.create({ position: 0, text: "t", ...over }, cite(store));
    return ["id", row.id];
  },
  recommendations: (store, services, over) => {
    const row = services.recommendations.create(
      { summary: "s", changes: ["c"], ...over },
      cite(store),
    );
    return ["id", row.id];
  },
  fightEvents: (store, services, over) => {
    const row = services.fightEvents.create(
      { boss: "pinata", tElapsed: 1, event: "e", detail: "d", confidence: "high", ...over },
      cite(store),
    );
    return ["id", row.id];
  },
  buffValues: (store, services, over) => {
    const row = services.buffValues.create(
      {
        cookieKr: "c",
        effectType: `Effect${++serial}`,
        skillGrade: 0,
        fromStar: 0,
        valuePct: 1,
        base: "Fixed",
        scalesWithCasterAmp: true,
        ...over,
      },
      cite(store),
    );
    return ["id", row.id];
  },
  researchRecords: (store, _services, over) => {
    const slug = `record-${++serial}`;
    store.repos.records.upsert({
      slug,
      question: "q",
      status: "active",
      startedAt: "2026-01-01",
      updatedAt: "2026-01-01",
      ...over,
    });
    return ["slug", slug];
  },
  counters: (store, services, over) => {
    ensureDecks(store, services);
    const mode = over.mode as GameMode | undefined;
    const [teamDeckId, beatenByDeckId] = mode ? modeDecks(services, mode) : ["d1", "d2"];
    const row = services.counters.create(
      {
        slug: `edge-${++serial}`,
        teamDeckId,
        beatenByDeckId,
        why: "w",
        confidence: "low",
        ...over,
      },
      cite(store),
    );
    return ["id", row.id];
  },
  captures: (store, _services, over) => {
    const path = `evidence/${++serial}.md`;
    store.repos.captures.insertMany([
      {
        recordSlug: "r0",
        path,
        url: null,
        capturedAt: "2026-01-01T00:00:00+00:00",
        tool: "manual",
        sha256: "0".repeat(64),
        ...over,
      },
    ]);
    const row = store.repos.captures.list().find((c) => c.path === (over.path ?? path))!;
    return ["id", row.id];
  },
  stageZoneSlots: (store, services, over) => {
    ensureStageDecks(store, services);
    const row = services.stageZoneSlots.create(
      {
        zoneIndex: 1,
        zoneKr: "초원",
        zoneEn: "Grassland",
        position: ++serial,
        stage: "-10",
        bossKr: "b",
        plan: "p",
        ...over,
      },
      cite(store),
    );
    return ["id", row.id];
  },
  stageClears: (store, services, over) => {
    ensureStageDecks(store, services);
    const row = services.stageClears.create(
      {
        chapter: 1,
        stageNo: ++serial,
        bossKr: "b",
        era: "post-easing",
        teamPower: "1G",
        powerG: 1,
        bracket: 35,
        result: "clear",
        evidence: "text",
        ...over,
      },
      cite(store),
    );
    return ["id", row.id];
  },
  dungeonRuns: (store, services, over) => {
    ensureDungeonDecks(store, services);
    const row = services.dungeonRuns.create(
      {
        slug: `run-${++serial}`,
        date: "2026-09-28",
        scoreG: serial,
        board: "run",
        evidence: "screenshot",
        standing: "verified",
        ...over,
      },
      cite(store),
    );
    return ["id", row.id];
  },
  dungeonLineups: (store, services, over) => {
    ensureDungeonDecks(store, services);
    const row = services.dungeonLineups.create(
      {
        slug: `lineup-${++serial}`,
        author: "a",
        date: "2026-09-28",
        complete: true,
        first40: ["c"],
        excluded: [],
        atkOrder: [],
        levelRule: "r",
        ...over,
      },
      cite(store),
    );
    return ["id", row.id];
  },
  dungeonExclusions: (store, services, over) => {
    const row = services.dungeonExclusions.create(
      { cookieKr: `c${++serial}`, kind: "charger", why: "w", status: "excluded", ...over },
      cite(store),
    );
    return ["id", row.id];
  },
  usageStats: (store, services, over) => {
    const row = services.usageStats.create(
      {
        kind: "cookie",
        subject: "s",
        usagePct: 1,
        sample: "top 100",
        capturedAt: "2026-01-01",
        ...over,
      },
      cite(store),
    );
    return ["id", row.id];
  },
};

/**
 * Lists the routes the app serves.
 *
 * @returns each route as `METHOD /path`
 */
function mountedRoutes(): Set<string> {
  const app = createApp(createServices(testStore()));
  return new Set(app.routes.map((route) => `${route.method} ${route.path}`));
}

describe("the content-type registry", () => {
  it("mounts every registered path, with the full CRUD verbs where the type declares request schemas", () => {
    const routes = mountedRoutes();
    for (const key of TABLE_KEYS) {
      const { path, api } = specOf(key);
      if (!path) continue;
      const base = `/api${path}`;
      expect(routes, `${key}: GET ${base}`).toContain(`GET ${base}`);
      if (!api) continue;
      for (const route of [
        `GET ${base}/:id`,
        `POST ${base}`,
        `PATCH ${base}/:id`,
        `DELETE ${base}/:id`,
      ]) {
        expect(routes, `${key}: ${route}`).toContain(route);
      }
    }
  });

  it("types every registered path into the hono client", () => {
    expectTypeOf<Exclude<RegisteredPath, keyof ClientRoutes>>().toBeNever();
    expectTypeOf<ClientRoutes>().toHaveProperty("counters");
  });

  it("registers every cited entity exactly once, and only cited entities", () => {
    const entities = TABLE_KEYS.flatMap((key) => specOf(key).entity ?? []);
    expect([...entities].sort()).toEqual([...CITED_ENTITY].sort());
  });

  it("gives every content type a path, an entity and request schemas", () => {
    for (const key of CONTENT_KEYS) {
      const { path, entity, api } = specOf(key);
      expect(path, key).toBeDefined();
      expect(entity, key).toBeDefined();
      expect(api, key).toBeDefined();
    }
  });

  it("builds a repo and a service for every content type", () => {
    const store = testStore();
    const services = createServices(store);
    for (const key of CONTENT_KEYS) {
      expect(store.repos[key].count(), key).toBe(0);
      expect(services[key].list(), key).toEqual([]);
    }
  });

  it("gives every table with a mode column a ?mode= filter on its mode, and no other table one", () => {
    for (const key of TABLE_KEYS) {
      const { table, filters } = specOf(key);
      const hasMode = Object.values(getTableConfig(table).columns).some((c) => c.name === "mode");
      if (hasMode) expect(filters?.mode?.match, key).toEqual({ equals: "mode" });
      else expect(filters?.mode, key).toBeUndefined();
    }
    expect(REGISTRY.decks.filters.mode.schema.safeParse("arena").success).toBe(true);
    expect(REGISTRY.decks.filters.mode.schema.safeParse("raid").success).toBe(false);
  });

  it("serves every declared list filter: each one narrows GET <path> to the matching row", async () => {
    const filtered = TABLE_KEYS.filter(
      (key) => specOf(key).path && Object.keys(specOf(key).filters ?? {}).length > 0,
    );
    expect(filtered.length).toBeGreaterThan(0);
    for (const key of filtered) {
      const seed = SEEDS[key as SeededKey];
      expect(seed, `${key} needs a seed in SEEDS`).toBeDefined();
      for (const name of Object.keys(specOf(key).filters!)) {
        const probe = FILTER_CASES[key]?.[name] ?? (name === "mode" ? MODE_CASE : undefined);
        expect(probe, `${key}?${name}= needs a case in FILTER_CASES`).toBeDefined();
        const store = testStore();
        const services = createServices(store);
        const app = createApp(services);
        const [field, wanted] = seed(store, services, probe!.match);
        seed(store, services, probe!.other);
        const url = `/api${specOf(key).path!}`;
        const all = (await (await app.request(url)).json()) as Record<string, unknown>[];
        expect(all, `${key}: both rows listed unfiltered`).toHaveLength(2);
        const res = await app.request(`${url}?${name}=${encodeURIComponent(probe!.value)}`);
        expect(res.status, `${key}?${name}=`).toBe(200);
        const rows = (await res.json()) as Record<string, unknown>[];
        expect(
          rows.map((row) => row[field]),
          `${key}?${name}=${probe!.value}`,
        ).toEqual([wanted]);
      }
    }
  }, 10_000);

  it("lists tables in foreign-key-safe order: every referenced table comes first", () => {
    const position = new Map(TABLE_KEYS.map((key, index) => [REGISTRY[key].table, index] as const));
    for (const [index, key] of TABLE_KEYS.entries()) {
      for (const fk of getTableConfig(specOf(key).table).foreignKeys) {
        const referenced = position.get(fk.reference().foreignTable as never);
        expect(referenced, `${key} references a registered table`).toBeDefined();
        expect(referenced!, `${key} comes after the tables it references`).toBeLessThan(index);
      }
    }
  });
});
