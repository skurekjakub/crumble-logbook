import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
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
    expect(result.counts).toEqual({ snapshots: 1, lineups: 4, cookies: 7, roadmaps: 1, items: 2 });
    const [def, atk, rift, dungeon] = store.repos.account.lineups("2026-10-07");
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
      runes: ["atkAmp 7", "skillHaste 8.5 ×2"],
    });
    expect(def!.cookies.map((c) => c.name)).toEqual(["체리맛 쿠키", "감초맛 쿠키", "미확인 쿠키"]);
    expect(atk!.cookies.map((c) => c.name)).toEqual(def!.cookies.map((c) => c.name));
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
      { name: "combatPower", value: "47810542000" },
    ]);
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
    expect(JSON.stringify(exportSnapshot(store).tables)).not.toContain(".jpg");
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
    expect(items[0]!.extra).toEqual({ rank: 1 });
    expect(items[0]!.refs).toEqual([
      { record: "002-pvp-meta", entity: null, id: "arena-bari-oven-cola", label: null },
      { record: "002-pvp-meta", entity: "file", id: "curated/runes.json", label: "runes" },
      { record: "002-pvp-meta", entity: "mechanic", id: "7", label: null },
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

  it("refuses a loaded snapshot without --replace, writing nothing, and replaces it with", () => {
    const store = testStore();
    importAccount(store, FIXTURE);
    const before = exportSnapshot(store);
    expect(() => importAccount(store, FIXTURE)).toThrow(/already loaded; pass --replace/);
    expect(exportSnapshot(store)).toEqual(before);
    importAccount(store, FIXTURE, { replace: true });
    expect(exportSnapshot(store)).toEqual(before);
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
    expect(refs[2]).toMatchObject({ entity: "mechanic", mode: "arena", found: true });
    expect(body.roadmap!.parked[0]!.refs[0]).toMatchObject({ found: true, mode: "arena" });
  });

  it("shows an older snapshot by id, and answers 404 for one that isn't loaded", async () => {
    const store = testStore();
    importAccount(store, FIXTURE, { all: true });
    expect((await overview(store, "?snapshot=2026-10-01")).body.snapshot!.id).toBe("2026-10-01");
    expect((await overview(store, "?snapshot=2020-01-01")).status).toBe(404);
  });
});
