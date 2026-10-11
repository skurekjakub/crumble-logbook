/**
 * `node tools/conquest-hud/src/cli.ts <command> …`, run by the Guild Conquest macro:
 * - `read <capture>`: prints `score <n>`, `timer <seconds>` and `final <n>`, each as
 *   `score ? <reason>` when it can't be read.
 * - `learn <capture> score|timer|final <shown>`: folds the capture's digits into `templates.json`.
 *
 * A capture is the raw dump of `adb exec-out screencap` or the PNG of `screencap -p`.
 *
 * @module
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DigitTemplate } from "./digits.ts";
import type { HudTemplates, Reading } from "./hud.ts";
import { learnField, readFinal, readScore, readTimer } from "./hud.ts";
import { decodeScreen } from "./screen.ts";

const TEMPLATES = join(import.meta.dirname, "..", "templates.json");
const USAGE = "usage: cli.ts read <capture> | cli.ts learn <capture> score|timer|final <shown>";
const FIELD_NAMES = ["score", "timer", "final"] as const;

/**
 * Loads the learned digit templates.
 *
 * @returns the templates; empty lists for the fields with none learned yet.
 * @throws Error when templates.json exists but isn't valid JSON.
 */
function loadTemplates(): HudTemplates {
  const empty: HudTemplates = { score: [], timer: [], final: [] };
  try {
    return { ...empty, ...(JSON.parse(readFileSync(TEMPLATES, "utf8")) as Partial<HudTemplates>) };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return empty;
    throw err;
  }
}

/**
 * Rounds a field's templates so templates.json stays small and diffs stay readable.
 *
 * @param templates - the field's templates.
 * @returns the rounded templates.
 */
function rounded(templates: DigitTemplate[]): DigitTemplate[] {
  return templates.map((t) => ({
    ...t,
    aspect: Number(t.aspect.toFixed(4)),
    cells: t.cells.map((c) => Number(c.toFixed(3))),
  }));
}

/**
 * Reads a field and formats the reading as one output line. A field that can't be read at all,
 * such as one with no templates learned, gets a line too, so the other fields still print.
 *
 * @param name - the field's name.
 * @param read - reads the field.
 * @returns e.g. "score 1776472632591" or "timer ? not on screen".
 */
function line(name: string, read: () => Reading): string {
  let reading: Reading;
  try {
    reading = read();
  } catch (err) {
    reading = { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
  return reading.ok ? `${name} ${reading.value}\n` : `${name} ? ${reading.reason}\n`;
}

/**
 * Runs a command and prints its result.
 *
 * @param args - the command line after the script.
 * @returns the exit code: 0 on success, 2 on bad usage.
 * @throws ScreenError when a capture can't be decoded; Error when a learn doesn't fit the capture.
 */
function main(args: string[]): number {
  const [command, path, field, shown] = args;
  if (command === "read" && path && args.length === 2) {
    const templates = loadTemplates();
    const screen = decodeScreen(readFileSync(path));
    process.stdout.write(
      line("score", () => readScore(screen, templates)) +
        line("timer", () => readTimer(screen, templates)) +
        line("final", () => readFinal(screen, templates)),
    );
    return 0;
  }
  const name = FIELD_NAMES.find((n) => n === field);
  if (command === "learn" && path && name && shown) {
    const learned = learnField(decodeScreen(readFileSync(path)), name, shown, loadTemplates());
    const out = {
      score: rounded(learned.score),
      timer: rounded(learned.timer),
      final: rounded(learned.final),
    };
    writeFileSync(TEMPLATES, JSON.stringify(out) + "\n");
    process.stdout.write(`learned ${field} ${shown}\n`);
    return 0;
  }
  process.stderr.write(USAGE + "\n");
  return 2;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (err) {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
}
