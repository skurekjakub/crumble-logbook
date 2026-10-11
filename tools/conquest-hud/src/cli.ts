/**
 * `node tools/conquest-hud/src/cli.ts <command> …`, run by the Guild Conquest macro:
 * - `read <capture>`: prints `score <n>` and `timer <seconds>`, each as `score ? <reason>` when
 *   it can't be read.
 * - `learn <capture> score|timer <shown>`: folds the capture's digits into `templates.json`.
 *
 * A capture is the raw dump of `adb exec-out screencap` or the PNG of `screencap -p`.
 *
 * @module
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DigitTemplate } from "./digits.ts";
import type { HudTemplates, Reading } from "./hud.ts";
import { learnField, readScore, readTimer } from "./hud.ts";
import { decodeScreen } from "./screen.ts";

const TEMPLATES = join(import.meta.dirname, "..", "templates.json");
const USAGE = "usage: cli.ts read <capture> | cli.ts learn <capture> score|timer <shown>";

/**
 * Loads the learned digit templates.
 *
 * @returns the templates; empty lists when none are learned yet.
 * @throws Error when templates.json exists but isn't valid JSON.
 */
function loadTemplates(): HudTemplates {
  try {
    return JSON.parse(readFileSync(TEMPLATES, "utf8")) as HudTemplates;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { score: [], timer: [] };
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
 * Formats a reading as one output line.
 *
 * @param name - the field's name.
 * @param reading - what was read.
 * @returns e.g. "score 1776472632591" or "timer ? not on screen".
 */
function line(name: string, reading: Reading): string {
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
      line("score", readScore(screen, templates)) + line("timer", readTimer(screen, templates)),
    );
    return 0;
  }
  if (command === "learn" && path && (field === "score" || field === "timer") && shown) {
    const learned = learnField(decodeScreen(readFileSync(path)), field, shown, loadTemplates());
    const out = { score: rounded(learned.score), timer: rounded(learned.timer) };
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
