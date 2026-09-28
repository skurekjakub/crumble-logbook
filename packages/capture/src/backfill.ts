/**
 * Writes the capture ledger of a record whose evidence predates the ledger,
 * once, from what the files themselves say:
 * - a Markdown capture's `- url:` and `- captured:` header lines give its
 *   URL and time (`approx: "header"`), and its tool is the Python scraper
 *   whose format and site it has, else `unknown`;
 * - an image a post embeds (`![[name]]`, saved under the post's `img/`)
 *   takes the post's URL, time and tool (`approx: "post"`);
 * - anything else takes its first commit's author time (`approx: "git"`),
 *   and a URL from its own `- url:` header or from a row of a sibling
 *   `README.md` or `SOURCES.md` that names it, else `null`.
 *
 * @module
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, posix } from "node:path";
import type { CaptureLine } from "@crumble/schema";
import type { CaptureMeta } from "./ledger";
import {
  hasLedger,
  isMedia,
  LEDGER_FILE,
  LedgerError,
  listEvidence,
  sha256File,
  toLine,
} from "./ledger";
import { isoFromHeader } from "./time";

/** The retired Python scrapers' tools, as backfilled lines name them. */
export const DC_TOOL = "python:dc_scrape";
export const NV_TOOL = "python:nv_scrape";

/** What a capture's header lines say. */
export interface CaptureHeader {
  url: string | null;
  /** The `- captured:` time, as a ledger `captured_at`; `null` when absent or unreadable. */
  capturedAt: string | null;
  /** The Python scraper whose output this is, when the header has its shape. */
  tool: string | null;
}

/**
 * Reads the header lines at the top of a text capture.
 *
 * @param text - the capture's text
 * @returns its URL, capture time and scraper, each `null` when the header doesn't say
 */
export function readHeader(text: string): CaptureHeader {
  const head = text.slice(0, 2000);
  const url = /^- url: (\S+)/m.exec(head)?.[1] ?? null;
  const stamp = /^- captured: (\S+)/m.exec(head)?.[1];
  let tool: string | null = null;
  if (url?.startsWith("https://m.dcinside.com/board/") && /^- author\/date: /m.test(head)) {
    tool = DC_TOOL;
  } else if (url?.startsWith("https://cafe.naver.com/") && /^- written: /m.test(head)) {
    tool = NV_TOOL;
  }
  return { url, capturedAt: stamp ? isoFromHeader(stamp) : null, tool };
}

/**
 * Lists the images a post capture embeds.
 *
 * @param text - the capture's Markdown
 * @returns each `![[name]]` name, in order
 */
export function embeddedImages(text: string): string[] {
  return [...text.matchAll(/!\[\[([^\]]+)\]\]/g)].map((m) => m[1]!);
}

/**
 * Finds a URL for a file in a sibling `README.md` or `SOURCES.md`: the
 * first URL on a line that names the file in backticks.
 *
 * @param recordDir - absolute path of the record folder
 * @param path - the file's record-relative path
 * @returns the URL, or `null` when no sibling names it
 */
export function siblingUrl(recordDir: string, path: string): string | null {
  const name = basename(path);
  for (const doc of ["README.md", "SOURCES.md"]) {
    const file = join(recordDir, dirname(path), doc);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf-8").split("\n")) {
      if (!line.includes(`\`${name}\``)) continue;
      const url = /https?:\/\/[^\s|)`>]+/.exec(line)?.[0];
      if (url) return url;
    }
  }
  return null;
}

/**
 * Looks up each file's first commit time.
 *
 * @param recordDir - absolute path of the record folder
 * @returns record-relative path → the author time of the commit that first
 *   added it, ISO 8601 with offset
 */
export type CommitTimes = (recordDir: string) => Map<string, string>;

/**
 * Reads every evidence file's first-add time from git, in one `git log`.
 *
 * @param recordDir - absolute path of the record folder, inside a git work tree
 * @returns record-relative path → first add's author time
 * @throws if git fails
 */
export const gitCommitTimes: CommitTimes = (recordDir) => {
  /**
   * Runs git in the record folder.
   *
   * @param args - git's arguments
   * @returns its stdout
   * @throws with git's stderr if it exits non-zero
   */
  const git = (args: string[]) => {
    const result = spawnSync("git", ["-C", recordDir, ...args], {
      encoding: "utf-8",
      maxBuffer: 256 * 1024 * 1024,
    });
    if (result.status !== 0) throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
    return result.stdout;
  };
  const prefix = git(["rev-parse", "--show-prefix"]).trim();
  const out = git([
    "log",
    "--diff-filter=A",
    "--format=%x01%aI",
    "--name-only",
    "-z",
    "--",
    "evidence",
  ]);
  const times = new Map<string, string>();
  // Newest first: a later (older) add of the same path overwrites, leaving the first add.
  for (const block of out.split("\x01").slice(1)) {
    const [head, ...names] = block.split("\0");
    const [time, first] = head!.split("\n");
    for (const name of [first, ...names]) {
      const trimmed = name?.replace(/^\n+/, "");
      if (!trimmed?.startsWith(prefix)) continue;
      times.set(trimmed.slice(prefix.length), time!.trim());
    }
  }
  return times;
};

/** Options for {@link backfillLines}. */
export interface BackfillOptions {
  /**
   * Another copy of the record (such as the main checkout's) to read the
   * files missing from this one from: gitignored media another checkout
   * holds. Its other files are ignored.
   */
  from?: string;
  /** Looks up first-commit times; defaults to {@link gitCommitTimes}. */
  commitTimes?: CommitTimes;
}

/**
 * Builds a ledger line for every evidence file of a record, without writing
 * anything.
 *
 * @param recordDir - absolute path of the record folder
 * @param options - another copy to read missing media from, and the commit-time lookup
 * @returns the lines, sorted by path
 * @throws {LedgerError} if a file has neither a header time nor a commit
 *   time, or a line fails the line schema
 */
export function backfillLines(recordDir: string, options: BackfillOptions = {}): CaptureLine[] {
  const here = new Set(listEvidence(recordDir));
  const elsewhere = options.from
    ? listEvidence(options.from).filter((path) => !here.has(path) && isMedia(path))
    : [];
  /**
   * Resolves a record-relative path to the copy that holds it.
   *
   * @param path - the path
   * @returns its absolute path
   */
  const locate = (path: string) => join(here.has(path) ? recordDir : options.from!, path);
  const paths = [...here, ...elsewhere].sort();
  const commitTimes = (options.commitTimes ?? gitCommitTimes)(recordDir);

  const inherited = new Map<string, CaptureMeta>();
  const metas = new Map<string, CaptureMeta>();
  for (const path of paths) {
    if (!path.endsWith(".md")) continue;
    const text = readFileSync(locate(path), "utf-8");
    const header = readHeader(text);
    if (!header.capturedAt) continue;
    const meta: CaptureMeta = {
      url: header.url,
      capturedAt: header.capturedAt,
      tool: header.tool ?? "unknown",
      approx: "header",
    };
    metas.set(path, meta);
    for (const name of embeddedImages(text)) {
      inherited.set(posix.join(posix.dirname(path), "img", name), { ...meta, approx: "post" });
    }
  }

  return paths.map((path) => {
    const meta = metas.get(path) ?? inherited.get(path) ?? fallback(recordDir, path, locate(path));
    return toLine(path, sha256File(locate(path)), meta);
  });

  /**
   * Builds the git-time line meta of a file nothing else dates.
   *
   * @param dir - the record folder
   * @param path - the file's record-relative path
   * @param full - its absolute path
   * @returns its meta
   * @throws {LedgerError} if git never added the file
   */
  function fallback(dir: string, path: string, full: string): CaptureMeta {
    const capturedAt = commitTimes.get(path);
    if (!capturedAt) throw new LedgerError(LEDGER_FILE, null, `${path}: no commit adds it`);
    const url =
      (isMedia(path) ? null : readHeader(readFileSync(full, "utf-8")).url) ?? siblingUrl(dir, path);
    return { url, capturedAt, tool: "unknown", approx: "git" };
  }
}

/**
 * Writes a record's ledger from {@link backfillLines}, once.
 *
 * @param recordDir - absolute path of the record folder
 * @param options - another copy to read missing media from, and the commit-time lookup
 * @returns the lines written
 * @throws {LedgerError} if the record already has a ledger, or a line can't be built
 */
export function backfill(recordDir: string, options: BackfillOptions = {}): CaptureLine[] {
  if (hasLedger(recordDir)) {
    throw new LedgerError(LEDGER_FILE, null, "the record already has a ledger; backfill runs once");
  }
  const lines = backfillLines(recordDir, options);
  writeFileSync(join(recordDir, LEDGER_FILE), lines.map((l) => `${JSON.stringify(l)}\n`).join(""));
  return lines;
}
