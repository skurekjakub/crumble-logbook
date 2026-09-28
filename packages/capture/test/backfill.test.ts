import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  backfill,
  backfillLines,
  DC_TOOL,
  embeddedImages,
  gitCommitTimes,
  NV_TOOL,
  readHeader,
  siblingUrl,
} from "../src/backfill";
import { hasLedger, readLedger, verifyLedger } from "../src/ledger";
import { gitRecord } from "./helpers";

const DC_POST = `# [일반] 제목

- url: https://m.dcinside.com/board/projectcc/100
- author/date: ㅇㅇ 2026.09.23 16:20
- captured: 2026-09-27T16:41:31+0200

## Body

![[100-1.jpg]]
본문

## Comments (0)

`;

const NV_POST = `# 제목

- url: https://cafe.naver.com/ccrumble/5
- author: 누구
- written: 2026-09-25 13:18
- captured: 2026-09-27T10:42:32+0200

## Body

![[nv-5-1.png]]

## Comments (0)

`;

/**
 * Writes a file under a folder, creating its parents.
 *
 * @param dir - the folder
 * @param path - the relative path
 * @param content - the content
 */
function put(dir: string, path: string, content: string | Uint8Array): void {
  mkdirSync(dirname(join(dir, path)), { recursive: true });
  writeFileSync(join(dir, path), content);
}

/**
 * Builds a record whose evidence covers every backfill rule, and a second
 * copy holding a frame the first lacks.
 *
 * @returns the record folder and the other copy
 */
function fixtureRecord(): { dir: string; from: string } {
  const dir = mkdtempSync(join(tmpdir(), "crumble-backfill-"));
  put(dir, "evidence/dc/100.md", DC_POST);
  put(dir, "evidence/dc/img/100-1.jpg", new Uint8Array([1]));
  put(dir, "evidence/nv/nv-5.md", NV_POST);
  put(dir, "evidence/sites/SOURCES.md", "| `x.json` | https://example.test/x?a=1 | 2026-09-27 |\n");
  put(dir, "evidence/sites/x.json", "{}");
  put(dir, "evidence/yt/yt-a.txt", "# t\n- url: https://www.youtube.com/watch?v=a\n- channel: c\n");
  put(dir, "evidence/notes.md", "# Notes\n\nno header here\n");
  put(dir, "evidence/__pycache__/x.pyc", "junk");
  const from = mkdtempSync(join(tmpdir(), "crumble-backfill-from-"));
  put(from, "evidence/frames/f-00m01.0s.jpg", new Uint8Array([2]));
  put(from, "evidence/nv/img/nv-5-1.png", new Uint8Array([3]));
  put(from, "evidence/extra.md", "only in the other copy");
  return { dir, from };
}

const GIT_TIME = "2026-09-27T18:00:00+02:00";

/**
 * A commit-time lookup that dates every path.
 *
 * @returns every path mapped to {@link GIT_TIME}
 */
const allCommitted = () =>
  new Map(
    [
      "evidence/sites/SOURCES.md",
      "evidence/sites/x.json",
      "evidence/yt/yt-a.txt",
      "evidence/notes.md",
      "evidence/frames/f-00m01.0s.jpg",
    ].map((p) => [p, GIT_TIME]),
  );

describe("backfill", () => {
  it("reads capture headers and the scraper whose format they have", () => {
    expect(readHeader(DC_POST)).toEqual({
      url: "https://m.dcinside.com/board/projectcc/100",
      capturedAt: "2026-09-27T16:41:31+02:00",
      tool: DC_TOOL,
    });
    expect(readHeader(NV_POST).tool).toBe(NV_TOOL);
    expect(
      readHeader('# 1\n\n- url: https://cafe.naver.com/ccrumble/1\n\n(refused: {"result": {}})\n'),
    ).toEqual({ url: "https://cafe.naver.com/ccrumble/1", capturedAt: null, tool: NV_TOOL });
    expect(readHeader("- url: https://x.test\n- captured: 2026-09-27T08:00:00Z\n")).toEqual({
      url: "https://x.test",
      capturedAt: "2026-09-27T08:00:00+00:00",
      tool: null,
    });
    expect(embeddedImages(DC_POST)).toEqual(["100-1.jpg"]);
  });

  it("dates posts by header, images by their post, and the rest by git, with sibling URLs", () => {
    const { dir, from } = fixtureRecord();
    const lines = backfillLines(dir, { from, commitTimes: allCommitted });
    const byPath = Object.fromEntries(lines.map((l) => [l.path, l]));
    expect(Object.keys(byPath)).toEqual([
      "evidence/dc/100.md",
      "evidence/dc/img/100-1.jpg",
      "evidence/frames/f-00m01.0s.jpg",
      "evidence/notes.md",
      "evidence/nv/img/nv-5-1.png",
      "evidence/nv/nv-5.md",
      "evidence/sites/SOURCES.md",
      "evidence/sites/x.json",
      "evidence/yt/yt-a.txt",
    ]);
    expect(byPath["evidence/dc/100.md"]).toMatchObject({
      url: "https://m.dcinside.com/board/projectcc/100",
      captured_at: "2026-09-27T16:41:31+02:00",
      tool: DC_TOOL,
      approx: "header",
    });
    expect(byPath["evidence/dc/img/100-1.jpg"]).toMatchObject({
      url: "https://m.dcinside.com/board/projectcc/100",
      captured_at: "2026-09-27T16:41:31+02:00",
      tool: DC_TOOL,
      approx: "post",
    });
    expect(byPath["evidence/nv/img/nv-5-1.png"]).toMatchObject({ tool: NV_TOOL, approx: "post" });
    expect(byPath["evidence/sites/x.json"]).toMatchObject({
      url: "https://example.test/x?a=1",
      captured_at: GIT_TIME,
      tool: "unknown",
      approx: "git",
    });
    expect(byPath["evidence/yt/yt-a.txt"]!.url).toBe("https://www.youtube.com/watch?v=a");
    expect(byPath["evidence/notes.md"]!.url).toBeNull();
    expect(byPath["evidence/frames/f-00m01.0s.jpg"]).toMatchObject({ url: null, approx: "git" });
    expect(siblingUrl(dir, "evidence/sites/other.json")).toBeNull();
  });

  it("writes the ledger once, which then verifies, with the other copy's media absent", () => {
    const { dir, from } = fixtureRecord();
    backfill(dir, { from, commitTimes: allCommitted });
    expect(hasLedger(dir)).toBe(true);
    expect(readLedger(dir).length).toBe(9);
    expect(verifyLedger(dir)).toEqual([]);
    expect(() => backfill(dir, { from, commitTimes: allCommitted })).toThrow(
      /already has a ledger/,
    );
  });

  it("hashes a CRLF text file as git stores it", () => {
    const dir = gitRecord();
    put(dir, "evidence/a.md", "one\r\ntwo\r\n");
    put(dir, "evidence/raw/b.csv", "x\r\ny\r\n");
    const lines = backfillLines(dir, {
      commitTimes: () =>
        new Map([
          ["evidence/a.md", GIT_TIME],
          ["evidence/raw/b.csv", GIT_TIME],
        ]),
    });
    expect(lines.map((l) => l.sha256)).toEqual([
      createHash("sha256").update("one\ntwo\n").digest("hex"),
      createHash("sha256").update("x\r\ny\r\n").digest("hex"),
    ]);
  });

  it("fails a file neither a header nor a commit dates", () => {
    const { dir } = fixtureRecord();
    expect(() => backfillLines(dir, { commitTimes: () => new Map() })).toThrow(
      /evidence\/notes\.md: no commit adds it/,
    );
  });

  it("reads each file's first-add time from git", () => {
    const repo = mkdtempSync(join(tmpdir(), "crumble-git-"));
    /**
     * Runs git in the temp repo with a fixed author and dates.
     *
     * @param args - git's arguments
     * @param date - the author and committer date
     */
    const git = (args: string[], date = "2026-09-27T10:00:00+02:00") => {
      const result = spawnSync(
        "git",
        [
          "-C",
          repo,
          "-c",
          "user.name=t",
          "-c",
          "user.email=t@t",
          "-c",
          "commit.gpgsign=false",
          ...args,
        ],
        {
          encoding: "utf-8",
          env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date },
        },
      );
      expect(result.status, result.stderr).toBe(0);
    };
    git(["init", "-q"]);
    put(repo, "research/r/evidence/a.md", "a");
    git(["add", "."]);
    git(["commit", "-q", "--no-verify", "-m", "a"]);
    put(repo, "research/r/evidence/sub/b 한.json", "b");
    git(["add", "."]);
    git(["commit", "-q", "--no-verify", "-m", "b"], "2026-09-28T09:30:00+02:00");
    const times = gitCommitTimes(join(repo, "research", "r"));
    expect(Object.fromEntries(times)).toEqual({
      "evidence/a.md": "2026-09-27T10:00:00+02:00",
      "evidence/sub/b 한.json": "2026-09-28T09:30:00+02:00",
    });
  });
});
