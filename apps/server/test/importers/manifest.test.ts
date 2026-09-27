import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ImportError } from "../../src/errors";
import type { RankingSpec } from "../../src/importers/manifest";
import { importManifest, mapRankingRow, readManifest } from "../../src/importers/manifest";
import { parseTsv } from "../../src/importers/tsv";

const valid = {
  record: {
    slug: "001-test",
    question: "Is there a documented set of teams?",
    status: "active",
    startedAt: "2026-09-27",
  },
  curated: "curated",
  extractions: "evidence/08-extract",
  captures: [{ site: "dc", dir: "evidence/03-dc-posts", file: "{id}.md" }],
  rankings: [
    {
      file: "evidence/15-crumbgg/11-players.tsv",
      board: "players",
      capturedAt: "2026-09-27",
      source: "web:crumbgg:rankings-s{season}",
      columns: {
        season: "season",
        rank: "rank",
        name: "player",
        guild: "guild",
        value: "score_G",
        power: "power_G",
        ref: "crumb_player_id",
      },
    },
  ],
};

const playersSpec: RankingSpec = importManifest.parse(valid).rankings[0]!;
const players = parseTsv(
  readFileSync(join(import.meta.dirname, "fixtures", "players.tsv"), "utf-8"),
);

describe("importManifest", () => {
  it("accepts the documented shape", () => {
    expect(importManifest.safeParse(valid).success).toBe(true);
  });

  it("makes season, guild, power and ref columns optional", () => {
    const spec = {
      ...valid.rankings[0],
      board: "power",
      source: "web:crumbgg:power-leaderboard",
      columns: { rank: "rank", name: "player", value: "combat_power_G" },
    };
    expect(importManifest.safeParse({ ...valid, rankings: [spec] }).success).toBe(true);
  });

  it("rejects an unknown board, capture site or record status", () => {
    const badBoard = { ...valid, rankings: [{ ...valid.rankings[0], board: "arena" }] };
    const badSite = { ...valid, captures: [{ site: "web", dir: "d", file: "{id}.md" }] };
    const badStatus = { ...valid, record: { ...valid.record, status: "paused" } };
    expect(importManifest.safeParse(badBoard).success).toBe(false);
    expect(importManifest.safeParse(badSite).success).toBe(false);
    expect(importManifest.safeParse(badStatus).success).toBe(false);
  });

  it("accepts optional fight event and buff value inputs, defaulting their maps to {}", () => {
    const parsed = importManifest.parse({
      ...valid,
      fightEvents: {
        file: "evidence/08-extract/kr-encounter.json",
        boss: "pinata",
        fightSeconds: 60,
      },
      buffValues: {
        file: "evidence/19-sugarpocket/skills-runes-1.4.002.json",
        catalog: "evidence/12-glossary-src/catalog.json",
        source: "web:sugarpocket-bundle-1.4.002",
        cookies: ["실론나이트 쿠키"],
      },
    });
    expect(parsed.fightEvents).toMatchObject({ countdown: {}, sourceAliases: {} });
    expect(parsed.buffValues?.debuffEffects).toEqual({});
    expect(importManifest.parse(valid).fightEvents).toBeUndefined();
  });

  it("rejects a buff value source or a fight event alias target that isn't a source id", () => {
    const buffValues = {
      file: "f.json",
      catalog: "c.json",
      source: "sugarpocket",
      cookies: ["실론나이트 쿠키"],
    };
    const fightEvents = {
      file: "f.json",
      boss: "pinata",
      fightSeconds: 60,
      sourceAliases: { "top-players:1": "1" },
    };
    expect(importManifest.safeParse({ ...valid, buffValues }).success).toBe(false);
    expect(importManifest.safeParse({ ...valid, fightEvents }).success).toBe(false);
  });

  it("requires a capture file pattern with an {id} placeholder", () => {
    const noId = { ...valid, captures: [{ site: "dc", dir: "d", file: "post.md" }] };
    expect(importManifest.safeParse(noId).success).toBe(false);
  });
});

describe("readManifest", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "crumble-manifest-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("reads and validates import.json from the record directory", () => {
    writeFileSync(join(dir, "import.json"), JSON.stringify(valid));
    expect(readManifest(dir).record.slug).toBe("001-test");
  });

  it("throws an ImportError naming import.json when it is missing", () => {
    expect(() => readManifest(dir)).toThrow(ImportError);
    expect(() => readManifest(dir)).toThrow(/import\.json/);
  });

  it("throws an ImportError naming the path of an invalid field", () => {
    writeFileSync(
      join(dir, "import.json"),
      JSON.stringify({ ...valid, record: { ...valid.record, startedAt: "soon" } }),
    );
    expect(() => readManifest(dir)).toThrow(/import\.json.*record\.startedAt/);
  });
});

describe("mapRankingRow", () => {
  it("maps a players row, substituting the season into the source id", () => {
    expect(mapRankingRow(players[1]!, playersSpec)).toEqual({
      season: 1,
      board: "players",
      rank: 2,
      name: "Arsen",
      guild: "Eden",
      valueG: 212.757,
      powerG: 26.545,
      ref: "pa178af0b469e59",
      capturedAt: "2026-09-27",
      sourceId: "web:crumbgg:rankings-s1",
    });
  });

  it("maps empty cells to null", () => {
    const row = mapRankingRow(players[0]!, playersSpec);
    expect(row.powerG).toBeNull();
    expect(mapRankingRow({ ...players[0]!, guild: "" }, playersSpec).guild).toBeNull();
  });

  it("maps absent optional columns to null", () => {
    const spec: RankingSpec = {
      ...playersSpec,
      board: "power",
      source: "web:crumbgg:power-leaderboard",
      columns: { rank: "rank", name: "player", value: "combat_power_G" },
    };
    const row = mapRankingRow(
      { rank: "1", player: "newbiee", guild: "카페", combat_power_G: "30.000" },
      spec,
    );
    expect(row).toEqual({
      season: null,
      board: "power",
      rank: 1,
      name: "newbiee",
      guild: null,
      valueG: 30,
      powerG: null,
      ref: null,
      capturedAt: "2026-09-27",
      sourceId: "web:crumbgg:power-leaderboard",
    });
  });

  it("throws when a number cell does not parse", () => {
    expect(() => mapRankingRow({ ...players[0]!, score_G: "lots" }, playersSpec)).toThrow(
      /score_G/,
    );
    expect(() => mapRankingRow({ ...players[0]!, rank: "" }, playersSpec)).toThrow(/rank/);
  });

  it("throws when the source template needs a season the row does not have", () => {
    expect(() => mapRankingRow({ ...players[0]!, season: "" }, playersSpec)).toThrow(/season/);
  });

  it("throws when a named column is missing from the row", () => {
    const { crumb_player_id: _dropped, ...rest } = players[0]!;
    expect(() => mapRankingRow(rest, playersSpec)).toThrow(/crumb_player_id/);
  });
});
