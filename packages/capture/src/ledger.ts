/**
 * A research record's capture ledger, `evidence/captures.jsonl`: one
 * {@link CaptureLine} per evidence file, giving where and when its bytes
 * were captured, by what tool, and their hash. The ledger is the one file
 * under `evidence/` that grows after it's created; every other file is
 * immutable, and the hashes hold it to that.
 *
 * Captured media is gitignored under `research/` and stays on the machine
 * that captured it. It still gets a line; a line whose media file is
 * absent passes verification, and a present media file's hash is checked
 * like any other.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import type { CaptureApprox, CaptureLine } from "@crumble/schema";
import { captureLine } from "@crumble/schema";

/** The ledger's path, relative to the record folder. */
export const LEDGER_FILE = "evidence/captures.jsonl";

/**
 * Extensions of captured media: images, video frames and video. These files
 * are gitignored under `research/`; keep this list in step with `.gitignore`.
 */
export const MEDIA_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".bmp",
  ".mp4",
  ".webm",
  ".mkv",
  ".mov",
] as const;

/**
 * Local by-products the ledger never lists, matched by a path segment:
 * Python bytecode and OS folder metadata. `.gitignore` excludes them too.
 */
export const IGNORED_SEGMENTS: readonly RegExp[] = [
  /^__pycache__$/,
  /\.pyc$/,
  /^\.DS_Store$/,
  /^Thumbs\.db$/,
  /^desktop\.ini$/,
];

/** A ledger that can't be read, a refused append, or a failed verification. */
export class LedgerError extends Error {
  /**
   * Builds the error, with message `<file> [line <n>]: <message>` (no line part when `line` is `null`).
   *
   * @param file - the ledger's path, as the message names it
   * @param line - the 1-based ledger line at fault, or `null`
   * @param message - what went wrong
   */
  constructor(
    readonly file: string,
    readonly line: number | null,
    message: string,
  ) {
    super(`${file}${line == null ? "" : ` [line ${line}]`}: ${message}`);
    this.name = "LedgerError";
  }
}

/** What a capture's ledger line says besides its path and hash. */
export interface CaptureMeta {
  /** The page or endpoint the bytes came from; `null` for a derived file. */
  url: string | null;
  /** When the bytes were captured, ISO 8601 with an offset. */
  capturedAt: string;
  /** What took the capture (see `captureTool`). */
  tool: string;
  /** How a backfilled line knows its time; omitted on a line written at capture time. */
  approx?: CaptureApprox;
}

/** A ledger line as read, with its 1-based line number in the file. */
export interface LedgerEntry {
  /** The validated line. */
  line: CaptureLine;
  /** Its 1-based line number. */
  lineNo: number;
}

/** One way a record's evidence and its ledger disagree. */
export interface LedgerProblem {
  /**
   * `missing-line`: a file on disk has no line; `missing-file`: a line
   * names a non-media file that isn't there; `hash-mismatch`: a present
   * file's bytes differ from its line; `duplicate`: a path has more than
   * one line.
   */
  kind: "missing-line" | "missing-file" | "hash-mismatch" | "duplicate";
  /** The record-relative path concerned. */
  path: string;
  /** The ledger line concerned, when there is one. */
  lineNo: number | null;
}

/**
 * Reports whether a path names captured media, by its extension.
 *
 * @param path - a file path
 * @returns `true` for an image, video frame or video
 */
export function isMedia(path: string): boolean {
  return (MEDIA_EXTENSIONS as readonly string[]).includes(extname(path).toLowerCase());
}

/**
 * Reports whether a record-relative path is a local by-product the ledger skips.
 *
 * @param path - a `/`-separated path
 * @returns `true` if any of its segments matches {@link IGNORED_SEGMENTS}
 */
export function isIgnored(path: string): boolean {
  return path.split("/").some((segment) => IGNORED_SEGMENTS.some((re) => re.test(segment)));
}

/**
 * Hashes a file's bytes.
 *
 * @param file - absolute path of the file
 * @returns its lowercase hex SHA-256
 * @throws if the file can't be read
 */
export function sha256File(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

/**
 * Reports whether a file's bytes match a ledger hash. A text file (not
 * media, no NUL byte) also matches with its CRLF line endings read as LF:
 * a working tree written on Windows before `.gitattributes` normalised it
 * holds CRLF where every checkout, and the ledger, has LF.
 *
 * @param file - absolute path of the file
 * @param sha256 - the ledger's hash
 * @returns `true` if the bytes, or their LF form, hash to `sha256`
 * @throws if the file can't be read
 */
export function matchesHash(file: string, sha256: string): boolean {
  const bytes = readFileSync(file);
  if (createHash("sha256").update(bytes).digest("hex") === sha256) return true;
  if (isMedia(file) || bytes.includes(0)) return false;
  const text = bytes.toString("latin1");
  if (!text.includes("\r\n")) return false;
  const lf = Buffer.from(text.replaceAll("\r\n", "\n"), "latin1");
  return createHash("sha256").update(lf).digest("hex") === sha256;
}

/**
 * Lists every file under a record's `evidence/` folder that the ledger
 * should cover: everything but the ledger itself and local by-products.
 *
 * @param recordDir - absolute path of the record folder
 * @returns record-relative, `/`-separated paths, sorted; `[]` without an
 *   `evidence/` folder
 */
export function listEvidence(recordDir: string): string[] {
  const evidence = join(recordDir, "evidence");
  if (!existsSync(evidence)) return [];
  return readdirSync(evidence, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(recordDir, join(entry.parentPath, entry.name)).split(sep).join("/"))
    .filter((path) => path !== LEDGER_FILE && !isIgnored(path))
    .sort();
}

/**
 * Reports whether a record has a ledger file.
 *
 * @param recordDir - absolute path of the record folder
 * @returns `true` if `evidence/captures.jsonl` exists
 */
export function hasLedger(recordDir: string): boolean {
  return existsSync(join(recordDir, LEDGER_FILE));
}

/**
 * Reads and validates a record's ledger. Blank lines are skipped; a CRLF
 * line ending reads like LF.
 *
 * @param recordDir - absolute path of the record folder
 * @returns every line in file order, with its line number; `[]` when the
 *   record has no ledger
 * @throws {LedgerError} naming the line of the first one that isn't JSON or
 *   fails the line schema
 */
export function readLedger(recordDir: string): LedgerEntry[] {
  const file = join(recordDir, LEDGER_FILE);
  if (!existsSync(file)) return [];
  const entries: LedgerEntry[] = [];
  readFileSync(file, "utf-8")
    .split("\n")
    .forEach((text, index) => {
      const lineNo = index + 1;
      if (text.trim() === "") return;
      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch (err) {
        throw new LedgerError(LEDGER_FILE, lineNo, (err as Error).message);
      }
      const result = captureLine.safeParse(raw);
      if (!result.success) {
        const issues = result.error.issues
          .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
          .join("; ");
        throw new LedgerError(LEDGER_FILE, lineNo, issues);
      }
      entries.push({ line: result.data, lineNo });
    });
  return entries;
}

/**
 * Hashes a captured file and appends its line to the record's ledger,
 * creating the ledger when it's the first.
 *
 * @param recordDir - absolute path of the record folder
 * @param path - the file's record-relative path, under `evidence/`
 * @param meta - its URL, capture time, tool and, for a backfill, `approx`
 * @returns the line appended
 * @throws {LedgerError} if the path already has a line, the file doesn't
 *   exist, or the line fails the line schema
 */
export function appendCapture(recordDir: string, path: string, meta: CaptureMeta): CaptureLine {
  const full = join(recordDir, path);
  if (!existsSync(full)) throw new LedgerError(LEDGER_FILE, null, `${path}: file not found`);
  const listed = readLedger(recordDir).find((entry) => entry.line.path === path);
  if (listed) {
    throw new LedgerError(LEDGER_FILE, listed.lineNo, `${path} already has a ledger line`);
  }
  const line = toLine(path, sha256File(full), meta);
  appendFileSync(join(recordDir, LEDGER_FILE), `${JSON.stringify(line)}\n`);
  return line;
}

/**
 * Builds and validates a ledger line, in the ledger's key order.
 *
 * @param path - the file's record-relative path
 * @param sha256 - its bytes' hash
 * @param meta - its URL, capture time, tool and optional `approx`
 * @returns the validated line
 * @throws {LedgerError} if the line fails the line schema
 */
export function toLine(path: string, sha256: string, meta: CaptureMeta): CaptureLine {
  const result = captureLine.safeParse({
    path,
    url: meta.url,
    captured_at: meta.capturedAt,
    tool: meta.tool,
    sha256,
    ...(meta.approx ? { approx: meta.approx } : {}),
  });
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new LedgerError(LEDGER_FILE, null, `${path}: ${issues}`);
  }
  return result.data;
}

/**
 * Checks a record's evidence against its ledger: every evidence file on
 * disk has exactly one line, every line's file exists (a missing media
 * file is allowed: media stays on the machine that captured it), and every
 * present file's bytes match its line's hash (see {@link matchesHash}). A
 * path with several lines is hashed against its last.
 *
 * @param recordDir - absolute path of the record folder
 * @returns every problem found, in path order; `[]` when the ledger holds
 * @throws {LedgerError} if the ledger can't be read (see {@link readLedger})
 */
export function verifyLedger(recordDir: string): LedgerProblem[] {
  const entries = readLedger(recordDir);
  const problems: LedgerProblem[] = [];
  const last = new Map<string, LedgerEntry>();
  for (const entry of entries) {
    const earlier = last.get(entry.line.path);
    if (earlier) problems.push({ kind: "duplicate", path: entry.line.path, lineNo: entry.lineNo });
    last.set(entry.line.path, entry);
  }
  for (const path of listEvidence(recordDir)) {
    if (!last.has(path)) problems.push({ kind: "missing-line", path, lineNo: null });
  }
  for (const [path, { line, lineNo }] of last) {
    const full = join(recordDir, path);
    if (!existsSync(full)) {
      if (!isMedia(path)) problems.push({ kind: "missing-file", path, lineNo });
      continue;
    }
    if (!matchesHash(full, line.sha256)) problems.push({ kind: "hash-mismatch", path, lineNo });
  }
  return problems.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/**
 * Describes a verification problem for a human.
 *
 * @param problem - the problem
 * @returns one line naming the path, the ledger line when there is one, and what's wrong
 */
export function describeProblem(problem: LedgerProblem): string {
  const where = problem.lineNo == null ? "" : ` (line ${problem.lineNo})`;
  const what = {
    "missing-line": "has no ledger line",
    "missing-file": "is in the ledger but not on disk",
    "hash-mismatch": "differs from its ledger hash",
    duplicate: "has more than one ledger line",
  }[problem.kind];
  return `${problem.path}${where} ${what}`;
}
