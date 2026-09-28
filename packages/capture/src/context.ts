/**
 * What a scraper run writes through: the record folder, the HTTP client,
 * the clock, and the ledger. Every file a scraper writes lands under the
 * record's `evidence/` folder and gets its ledger line in the same step.
 *
 * @module
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { HttpClient } from "./http";
import { appendCapture } from "./ledger";
import type { OffsetAt } from "./time";
import { isoLocal } from "./time";
import { toLf } from "./text";

/** A scraper run's surroundings. */
export interface CaptureContext {
  /** Absolute path of the research record folder. */
  recordDir: string;
  /** The HTTP client the run sends through. */
  http: HttpClient;
  /** The ledger `tool` of every line the run writes, e.g. `capture:dc`. */
  tool: string;
  /**
   * Reads the clock.
   *
   * @returns the current instant
   */
  now: () => Date;
  /** The UTC offset local times are written at. */
  offsetAt: OffsetAt;
  /**
   * Reports progress or a skipped item, for the terminal.
   *
   * @param message - the report
   */
  log: (message: string) => void;
}

/**
 * Reports whether a record-relative file already exists.
 *
 * @param context - the run
 * @param path - the file's record-relative path
 * @returns `true` if it's on disk
 */
export function exists(context: CaptureContext, path: string): boolean {
  return existsSync(join(context.recordDir, path));
}

/**
 * Writes a text capture with LF line endings, creating its folder.
 *
 * @param context - the run
 * @param path - the file's record-relative path
 * @param text - the content
 * @throws if the file can't be written
 */
export function writeText(context: CaptureContext, path: string, text: string): void {
  writeBytes(context, path, new TextEncoder().encode(toLf(text)));
}

/**
 * Writes a binary capture as received, creating its folder.
 *
 * @param context - the run
 * @param path - the file's record-relative path
 * @param bytes - the content
 * @throws if the file can't be written
 */
export function writeBytes(context: CaptureContext, path: string, bytes: Uint8Array): void {
  const full = join(context.recordDir, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, bytes);
}

/**
 * Appends a written file's ledger line, stamped with the run's tool.
 *
 * @param context - the run
 * @param path - the file's record-relative path
 * @param url - where its bytes came from, or `null` for a derived file
 * @param at - when they were captured
 * @throws {LedgerError} if the path already has a line or the line is invalid
 */
export function logCapture(
  context: CaptureContext,
  path: string,
  url: string | null,
  at: Date,
): void {
  appendCapture(context.recordDir, path, {
    url,
    capturedAt: isoLocal(at, context.offsetAt),
    tool: context.tool,
  });
}
