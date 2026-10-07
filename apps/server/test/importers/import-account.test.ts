import { cpSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { ImportError } from "../../src/errors";
import { importAccount, listAccountFiles } from "../../src/importers/account";
import type { Store } from "../../src/repos";
import { createServices } from "../../src/services";
import type { AccountOverview } from "../../src/services/account";
import { exportSnapshot, restoreSnapshot } from "../../src/services/export";
import { addSource, readJson, testStore } from "../helpers";

const FIXTURE = join(import.meta.dirname, "fixtures", "account");

/**
 * Seeds the glossary entries, the record and the deck the fixture names.
 *
 * @param store - the store to seed
 */
function seed(store: Store): void {
  store.repos.glossary.upsert({
    kr: "체리 쿠키",
    en: "Cherry Cookie",
    kind: "cookie",
    extra: { resource_key: "cookie0024" },
  });
  store.repos.glossary.upsert({
    kr: "감초맛 쿠키",
    en: "Licorice Cookie",
    kind: "cookie",
    extra: { resource_key: "cookie0503" },
  });
  store.repos.glossary.upsert({
    kr: "갓난갓방울",
    en: "Holy Baby Drop",
    kind: "pet",
    extra: { resource_key: "pet4001" },
  });
  store.repos.records.upsert({
    slug: "002-pvp-meta",
    question: "q",
    status: "active",
    startedAt: "2026-09-27",
    updatedAt: "2026-10-07",
    mode: "arena",
  });
  addSource(store, "dc:1");
  store.repos.mechanics.insert({
    title: "Beam order",
    body: "b",
    confidence: "high",
    mode: "arena",
    recordSlug: "002-pvp-meta",
  });
  createServices(store).decks.create({
    id: "arena-bari-oven-cola",
    nameEn: "Bari dive",
    status: "meta",
    mode: "arena",
    cookies: [{ cookieKr: "체리 쿠키", level: "1", levelRule: null, stars: null, why: "x" }],
    pets: [],
    notes: [],
    sources: ["dc:1"],
  });
  store.repos.decks.update("arena-bari-oven-cola", { recordSlug: "002-pvp-meta" });
}

/**
 * Reads the account view through the API.
 *
 * @param store - the store the app serves
 * @param query - the query string, e.g. `?snapshot=2026-10-01`
 * @returns the response's status and body
 */
async function overview(store: Store, query = "") {
  const res = await createApp(createServices(store)).request(`/api/account${query}`);
  return { status: res.status, body: await readJson<AccountOverview>(res) };
}

describe("listAccountFiles", () => {
  it("finds the dated snapshots and roadmaps, oldest first, and skips other files", () => {
    const files = listAccountFiles(FIXTURE);
    expect(files.snapshots.map((f) => f.id)).toEqual(["2026-10-01", "2026-10-07"]);
    expect(files.roadmaps).toEqual([
      { id: "2026-10-07", date: "2026-10-07", file: "roadmap-2026-10-07.json" },
    ]);
  });
});

describe("importAccount", () => {
  it("loads the latest snapshot and roadmap, normalising what the files write loosely", () => {
    const store = testStore();
    seed(store);
    const result = importAccount(store, FIXTURE);
    expect(result.snapshots).toEqual(["2026-10-07"]);
    expect(result.roadmaps).toEqual(["2026-10-07"]);
    expect(result.skipped).toEqual([]);
    expect(result.counts).toEqual({ snapshots: 1, lineups: 6, cookies: 10, roadmaps: 1, items: 2 });
    const [def, atk, rift, dungeon, rumbleAtk, rumbleDef] =
      store.repos.account.lineups("2026-10-07");
    expect(def).toMatchObject({
      lineup: "arena_def",
      gameMode: "arena",
      power: "24270000",
      captain: "cookie0024",
      pets: ["Holy Baby Drop"],
      gearPreset: "PvP",
      deck: { record: "002-pvp-meta", entity: "deck", id: "arena-bari-oven-cola", label: null },
      note: null,
    });
    expect(def!.extra).toEqual({ capturedAt: "2026-10-07T13:25:00+02:00", side: "defense" });
    expect(def!.cookies[0]).toMatchObject({
      name: "체리맛 쿠키",
      resourceKey: "cookie0024",
      level: "100",
      stars: "9",
      skillLevel: "V",
      power: "4510000000",
      promotion: "max",
      runes: ["ATK AMP 7", "Skill Haste 8.5 ×2 +1?", "CRIT RES ?"],
    });
    expect(def!.cookies.map((c) => c.name)).toEqual(["체리맛 쿠키", "감초맛 쿠키", "미확인 쿠키"]);
    expect(atk!.cookies.map((c) => c.name)).toEqual(def!.cookies.map((c) => c.name));
    expect(atk!.note).toBeNull();
    expect(rumbleAtk!.cookies.map((c) => c.name)).toEqual(def!.cookies.map((c) => c.name));
    expect(rumbleDef).toMatchObject({
      cookies: [],
      note: "Swap pending · same as rumble_old",
    });
    expect(rift).toMatchObject({ gameMode: "stage", note: "Order from the battle bar" });
    expect(dungeon).toMatchObject({
      gameMode: "crumble_dungeon",
      captain: null,
      note: "all owned cookies (top 40 by power deploy)",
      cookies: [],
    });
    const snapshot = store.repos.account.snapshot("2026-10-07")!;
    expect(snapshot.profile).toEqual([
      { name: "level", value: "192" },
      { name: "combatPower", value: "47813382000", at: "2026-10-07T17:13:00+02:00" },
    ]);
    expect(Object.keys(snapshot.extra)).toEqual(["schema"]);
    expect(snapshot.resources).toEqual([
      { name: "gems", value: "216560" },
      { name: "coins", value: "1120000000000 → 132360000000" },
      { name: "petTickets", value: "715 · 7922" },
      { name: "crumbleDungeonEntries", value: "4/5" },
    ]);
    expect(snapshot.pets).toEqual([
      {
        name: "Holy Baby Drop",
        key: null,
        chips: ["SSR", "20★", "promo max"],
        detail: "Ally ATK +20% · Support CRIT% 4.00%",
      },
    ]);
    expect(snapshot.unread).toEqual([
      "Mercenary perks per lineup",
      "Cookie EXP stock, Chocosteel, Syrup",
    ]);
    const exported = JSON.stringify(exportSnapshot(store).tables);
    for (const image of [".jpg", ".png", ".webp"]) expect(exported).not.toContain(image);
    const roadmap = store.repos.account.roadmap("2026-10-07")!;
    expect(roadmap).toMatchObject({
      snapshotId: "2026-10-07",
      verdict: "A top-3 account. The gaps are setup, not power.",
      parked: [
        {
          avenue: "Stage pushing",
          why: "328-30 is the last stage.",
          refs: [{ record: "002-pvp-meta", entity: null, id: "nowhere", label: null }],
        },
      ],
    });
    const items = store.repos.account.items("2026-10-07");
    expect(items[0]).toMatchObject({ priority: "now", cost: "Free; lineup slots 3–5 are spare." });
    expect(items[0]!.extra).toEqual({ rank: 1, size: "big" });
    expect(items[0]!.refs).toEqual([
      { record: "002-pvp-meta", entity: null, id: "arena-bari-oven-cola", label: null },
      { record: "002-pvp-meta", entity: "file", id: "curated/runes.json", label: "runes" },
      { record: "002-pvp-meta", entity: "mechanic", id: "1", label: null },
    ]);
    expect(items[1]).toMatchObject({ area: null, payoff: "power: +3%", cost: "rune stones · 400" });
  });

  it("warns about unknown cookie names and an action longer than a dozen words", () => {
    const store = testStore();
    seed(store);
    const { warnings } = importAccount(store, FIXTURE);
    expect(warnings).toContainEqual(
      expect.stringContaining("cookie 미확인 쿠키 isn't in the glossary"),
    );
    expect(warnings).toContainEqual(expect.stringContaining("[items.1]: action is longer"));
    expect(warnings.some((w) => w.includes("체리맛 쿠키"))).toBe(false);
  });

  it("warns about refs that name nothing loaded, and a same-as note that names no lineup", () => {
    const store = testStore();
    seed(store);
    const { warnings } = importAccount(store, FIXTURE);
    expect(warnings.filter((w) => w.includes("names nothing loaded"))).toEqual([
      "snapshots/2026-10-07.json [lineups.rift]: 002-pvp-meta#deck:no-such-deck names nothing loaded",
      "roadmap-2026-10-07.json [items.1]: 001-other-record#arena-bari-oven-cola names nothing loaded",
      "roadmap-2026-10-07.json [parked.0]: 002-pvp-meta#nowhere names nothing loaded",
    ]);
    expect(warnings).toContainEqual(
      'snapshots/2026-10-07.json: lineups.rumble_def: "same as rumble_old" names no lineup rumble_old; kept as its note',
    );
  });

  it("keeps older snapshots: --all loads every one, and an id loads that one", () => {
    const store = testStore();
    importAccount(store, FIXTURE, { ids: ["2026-10-01"] });
    expect(store.repos.account.snapshots().map((s) => s.id)).toEqual(["2026-10-01"]);
    expect(store.repos.account.lineups("2026-10-01")[0]).toMatchObject({
      lineup: "conquest",
      label: "Raid",
      gameMode: "guild_conquest",
    });
    importAccount(store, FIXTURE, { all: true, replace: true });
    expect(store.repos.account.snapshots().map((s) => s.id)).toEqual(["2026-10-07", "2026-10-01"]);
  });

  it("refuses a loaded snapshot named by id without --replace, writing nothing, and replaces it with", () => {
    const store = testStore();
    importAccount(store, FIXTURE);
    const before = exportSnapshot(store);
    expect(() => importAccount(store, FIXTURE, { ids: ["2026-10-07"] })).toThrow(
      /already loaded; pass --replace/,
    );
    expect(exportSnapshot(store)).toEqual(before);
    importAccount(store, FIXTURE, { replace: true });
    expect(exportSnapshot(store)).toEqual(before);
  });

  it("skips the latest files already loaded, so a new snapshot loads under the same roadmap", () => {
    const dir = mkdtempSync(join(tmpdir(), "account-"));
    cpSync(FIXTURE, dir, { recursive: true });
    rmSync(join(dir, "snapshots", "2026-10-01.json"));
    const store = testStore();
    importAccount(store, dir);
    const again = importAccount(store, dir);
    expect(again).toMatchObject({ snapshots: [], roadmaps: [], warnings: [] });
    expect(again.skipped).toEqual(["snapshots/2026-10-07.json", "roadmap-2026-10-07.json"]);
    writeFileSync(
      join(dir, "snapshots", "2026-10-08.json"),
      JSON.stringify({ lineups: { conquest: [{ name: "체리 쿠키" }] } }),
    );
    const next = importAccount(store, dir);
    expect(next).toMatchObject({ snapshots: ["2026-10-08"], roadmaps: [] });
    expect(next.skipped).toEqual(["roadmap-2026-10-07.json"]);
    expect(next.counts).toEqual({ snapshots: 1, lineups: 1, cookies: 1, roadmaps: 0, items: 0 });
    expect(store.repos.account.snapshots().map((s) => s.id)).toEqual(["2026-10-08", "2026-10-07"]);
    expect(store.repos.account.roadmaps().map((r) => r.id)).toEqual(["2026-10-07"]);
  });

  it("names the file and the path of a row that fails its schema", () => {
    const dir = mkdtempSync(join(tmpdir(), "account-"));
    writeFileSync(
      join(dir, "roadmap-2026-10-08.json"),
      JSON.stringify([{ priority: "soon", action: "x" }]),
    );
    expect(() => importAccount(testStore(), dir)).toThrow(ImportError);
    expect(() => importAccount(testStore(), dir)).toThrow(/roadmap-2026-10-08\.json/);
    mkdirSync(join(dir, "snapshots"));
    writeFileSync(
      join(dir, "snapshots", "2026-10-08.json"),
      JSON.stringify({ lineups: { a: [{}] } }),
    );
    expect(() => importAccount(testStore(), dir, { ids: ["2026-10-08"] })).toThrow(/needs a name/);
  });

  it("fails on a folder with nothing to import, and on an id no file has", () => {
    expect(() => importAccount(testStore(), mkdtempSync(join(tmpdir(), "account-")))).toThrow(
      /no snapshots/,
    );
    expect(() => importAccount(testStore(), FIXTURE, { ids: ["2020-01-01"] })).toThrow(
      /no snapshot or roadmap file has the id 2020-01-01/,
    );
  });

  it("goes into the snapshot export and comes back from a restore", () => {
    const store = testStore();
    importAccount(store, FIXTURE, { all: true });
    const snapshot = exportSnapshot(store);
    expect(snapshot.tables.accountSnapshots).toHaveLength(2);
    expect(snapshot.tables.accountRoadmapItems).toHaveLength(2);
    const restored = testStore();
    restoreSnapshot(restored, JSON.parse(JSON.stringify(snapshot)) as typeof snapshot);
    expect(exportSnapshot(restored)).toEqual(snapshot);
  });
});

describe("GET /api/account", () => {
  it("answers an empty view when no account is loaded", async () => {
    const { status, body } = await overview(testStore());
    expect(status).toBe(200);
    expect(body).toEqual({ snapshot: null, roadmap: null, snapshots: [], roadmaps: [] });
  });

  it("shows the latest snapshot with names glossed, and the roadmap with refs resolved", async () => {
    const store = testStore();
    seed(store);
    importAccount(store, FIXTURE, { all: true });
    const { body } = await overview(store);
    expect(body.snapshots.map((s) => s.id)).toEqual(["2026-10-07", "2026-10-01"]);
    const lineup = body.snapshot!.lineups[0]!;
    expect(lineup.cookies.map((c) => [c.kr, c.en, c.resourceKey])).toEqual([
      ["체리 쿠키", "Cherry Cookie", "cookie0024"],
      ["감초맛 쿠키", "Licorice Cookie", "cookie0503"],
      ["미확인 쿠키", "Unknown Cookie", null],
    ]);
    expect(lineup.captain).toEqual({
      kr: "체리 쿠키",
      en: "Cherry Cookie",
      resourceKey: "cookie0024",
    });
    expect(lineup.pets).toEqual([
      { kr: "갓난갓방울", en: "Holy Baby Drop", resourceKey: "pet4001" },
    ]);
    expect(lineup.deck).toMatchObject({ label: "Bari dive", mode: "arena", found: true });
    expect(body.snapshot!.pets[0]).toMatchObject({
      kr: "갓난갓방울",
      en: "Holy Baby Drop",
      resourceKey: "pet4001",
    });
    const refs = body.roadmap!.items[0]!.refs;
    expect(refs[0]).toMatchObject({
      entity: "deck",
      label: "Bari dive",
      mode: "arena",
      found: true,
    });
    expect(refs[1]).toMatchObject({ entity: "file", label: "runes", mode: "arena", found: true });
    expect(refs[2]).toMatchObject({
      entity: "mechanic",
      label: "Beam order",
      mode: "arena",
      found: true,
    });
    expect(body.roadmap!.items[0]!.size).toBe("big");
    expect(body.roadmap!.items[1]!.size).toBeNull();
    expect(body.roadmap!.items[1]!.refs[0]).toMatchObject({ found: false, obsolete: false });
    expect(body.roadmap!.parked[0]!.refs[0]).toMatchObject({ found: false, mode: "arena" });
    expect(body.snapshot!.lineups[2]!.deck).toMatchObject({ id: "no-such-deck", found: false });
  });

  it("shows an older snapshot by id, and answers 404 for one that isn't loaded", async () => {
    const store = testStore();
    importAccount(store, FIXTURE, { all: true });
    expect((await overview(store, "?snapshot=2026-10-01")).body.snapshot!.id).toBe("2026-10-01");
    expect((await overview(store, "?snapshot=2020-01-01")).status).toBe(404);
  });
});
