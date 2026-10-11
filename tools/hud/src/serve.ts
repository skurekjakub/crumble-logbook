/**
 * `cli.ts serve`: answers reads for as long as its input stays open, so a macro starts Node once
 * rather than once per read. Each input line is a request, `<command> <capture>`, where the
 * command is one of the reads in `reads.ts`. Each answer is what that command prints when run on
 * its own, then a blank line; a request that fails is answered with its error on one line.
 *
 * @module
 */
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";
import type { HudTemplates } from "./hud.ts";
import { isRead, READS } from "./reads.ts";
import { decodeScreen } from "./screen.ts";

const USAGE = "usage: read <capture> | stage <capture>";

/**
 * Answers one request.
 *
 * @param request - `<command> <capture>`, e.g. `stage C:\Temp\hud-4120.bin`.
 * @param templates - loads the digit templates; called on every request, so templates learned
 *   by hand while the reader serves are used from the next request.
 * @returns the command's lines, or the error or the usage on one line, then a blank line.
 */
export function answer(request: string, templates: () => HudTemplates): string {
  const at = request.indexOf(" ");
  const command = request.slice(0, Math.max(at, 0));
  const path = request.slice(at + 1);
  if (at < 0 || !isRead(command) || path === "") return `${USAGE}\n\n`;
  try {
    return `${READS[command](decodeScreen(readFileSync(path)), templates())}\n`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `${message.replace(/\s*\n\s*/g, " ")}\n\n`;
  }
}

/**
 * Answers each line of the input on the output, until the input closes.
 *
 * @param input - the requests, a line each.
 * @param output - where the answers go.
 * @param templates - loads the digit templates, as for `answer`.
 * @returns a promise that settles once the input has closed.
 */
export async function serve(
  input: Readable,
  output: Writable,
  templates: () => HudTemplates,
): Promise<void> {
  for await (const request of createInterface({ input, crlfDelay: Infinity }))
    output.write(answer(request, templates));
}
