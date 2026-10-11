/**
 * The commands that read a capture, each printing a `<field> <value>` or `<field> ? <reason>`
 * line per field, the shape the macros parse.
 *
 * @module
 */
import { readFinal, readScore, readTimer } from "./conquest.ts";
import type { HudTemplates, Reading } from "./hud.ts";
import type { Screen } from "./screen.ts";
import { readStage } from "./stage.ts";

/**
 * Reads a field and formats the reading as one output line. A field that can't be read at all,
 * such as one with no templates learned, gets a line too, so the other fields still print.
 *
 * @param name - the field's name.
 * @param read - reads the field.
 * @param format - prints the value; numbers print as they are.
 * @returns e.g. "score 1776472632591", "stage 358-20" or "timer ? not on screen".
 */
function line<T>(
  name: string,
  read: () => Reading<T>,
  format: (value: T) => string = String,
): string {
  let reading: Reading<T>;
  try {
    reading = read();
  } catch (err) {
    reading = { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
  return reading.ok ? `${name} ${format(reading.value)}\n` : `${name} ? ${reading.reason}\n`;
}

/**
 * The reads by command: `read` prints the Guild Conquest `score`, `timer` and `final`, `stage`
 * prints the stage's number as `<chapter>-<stage>`.
 */
export const READS = {
  read: (screen: Screen, templates: HudTemplates): string =>
    line("score", () => readScore(screen, templates)) +
    line("timer", () => readTimer(screen, templates)) +
    line("final", () => readFinal(screen, templates)),
  stage: (screen: Screen, templates: HudTemplates): string =>
    line(
      "stage",
      () => readStage(screen, templates),
      (s) => `${s.chapter}-${s.stage}`,
    ),
};

/**
 * Tells whether a command is one of the reads.
 *
 * @param command - the command, e.g. "stage".
 * @returns true when READS has it.
 */
export function isRead(command: string | undefined): command is keyof typeof READS {
  return command !== undefined && Object.hasOwn(READS, command);
}
