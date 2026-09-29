import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readSearches, SEARCHES_FILE, searchesFile } from "../src/searches";

const base = {
  why: "The stage-pushing board's own term.",
  added: "2026-09-28",
  lastHit: "2026-09-28",
};

const VALID = [
  { ...base, id: "dc-stage", kind: "dc", query: "subject:스테이지" },
  { ...base, id: "nv-guide", kind: "naver", menuId: 12 },
  { ...base, id: "nv-search", kind: "naver", query: "크럼블 던전" },
  { ...base, id: "crumbgg-leaderboard", kind: "crumbgg", endpoint: "leaderboard", args: [] },
  { ...base, id: "crumbgg-live", kind: "crumbgg", endpoint: "live", args: ["players"] },
  { ...base, id: "yt-dungeon", kind: "youtube", query: "크럼블 던전 고득점" },
  { ...base, id: "yt-channel", kind: "youtube", channel: "@crumblehub", lastHit: null },
  { ...base, id: "web-tier", kind: "web", url: "https://example.test/tier" },
];

let tmp: string | undefined;
afterEach(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = undefined;
});

describe("searches.json", () => {
  it("accepts every kind of saved search", () => {
    expect(searchesFile.safeParse(VALID).success).toBe(true);
  });

  it("rejects an entry that names no way to run it, or two", () => {
    expect(searchesFile.safeParse([{ ...base, id: "x", kind: "dc" }]).success).toBe(false);
    expect(
      searchesFile.safeParse([{ ...base, id: "x", kind: "youtube", query: "q", channel: "@c" }])
        .success,
    ).toBe(false);
  });

  it("rejects a crumb.gg endpoint pnpm capture doesn't know, and one given the wrong arguments", () => {
    expect(
      searchesFile.safeParse([{ ...base, id: "x", kind: "crumbgg", endpoint: "nope", args: [] }])
        .success,
    ).toBe(false);
    expect(
      searchesFile.safeParse([{ ...base, id: "x", kind: "crumbgg", endpoint: "live", args: [] }])
        .success,
    ).toBe(false);
    expect(
      searchesFile.safeParse([
        { ...base, id: "x", kind: "crumbgg", endpoint: "leaderboard", args: ["extra"] },
      ]).success,
    ).toBe(false);
  });

  it("rejects a duplicate id, a last hit before the round that added it, and an unknown key", () => {
    expect(searchesFile.safeParse([VALID[0], VALID[0]]).success).toBe(false);
    expect(searchesFile.safeParse([{ ...VALID[0], lastHit: "2026-09-01" }]).success).toBe(false);
    expect(searchesFile.safeParse([{ ...VALID[0], pages: 3 }]).success).toBe(false);
  });

  it("reads a record's file, and says so when there is none", () => {
    tmp = mkdtempSync(join(tmpdir(), "crumble-searches-"));
    expect(readSearches(tmp)).toBeNull();
    writeFileSync(join(tmp, SEARCHES_FILE), JSON.stringify(VALID));
    expect(readSearches(tmp)?.map((s) => s.id)).toEqual(VALID.map((s) => s.id));
    writeFileSync(join(tmp, SEARCHES_FILE), JSON.stringify([{ id: "x" }]));
    expect(() => readSearches(tmp!)).toThrow();
  });
});
