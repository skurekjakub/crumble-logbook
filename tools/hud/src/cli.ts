/**
 * `node tools/hud/src/cli.ts <command> …`, run by the macros under `tools/`:
 * - `read <capture>`: prints the Guild Conquest numbers, `score <n>`, `timer <seconds>` and
 *   `final <n>`, each as `score ? <reason>` when it can't be read.
 * - `stage <capture>`: prints the stage's number, `stage <chapter>-<stage>`, or
 *   `stage ? <reason>`.
 * - `learn <capture> score|timer|final|stage <shown>`: folds the capture's digits into
 *   `templates.json`; a stage number goes to the font of the place that shows it.
 *
 * A capture is the raw dump of `adb exec-out screencap` or the PNG of `screencap -p`.
 *
 * @module
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CONQUEST_FIELDS, learnField, readFinal, readScore, readTimer } from "./conquest.ts";
import type { DigitTemplate } from "./digits.ts";
import type { HudTemplates, Reading } from "./hud.ts";
import { emptyTemplates, FONT_NAMES } from "./hud.ts";
import { decodeScreen } from "./screen.ts";
import { learnStage, readStage } from "./stage.ts";

const TEMPLATES = join(import.meta.dirname, "..", "templates.json");
const USAGE =
  "usage: cli.ts read <capture> | cli.ts stage <capture> | cli.ts learn <capture> score|timer|final|stage <shown>";
const CONQUEST_FONTS = Object.keys(CONQUEST_FIELDS) as (keyof typeof CONQUEST_FIELDS)[];

/**
 * Loads the learned digit templates.
 *
 * @returns the templates; empty lists for the fonts with none learned yet.
 * @throws Error when templates.json exists but isn't valid JSON.
 */
function loadTemplates(): HudTemplates {
  try {
    return {
      ...emptyTemplates(),
      ...(JSON.parse(readFileSync(TEMPLATES, "utf8")) as Partial<HudTemplates>),
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return emptyTemplates();
    throw err;
  }
}

/**
 * Rounds a font's templates so templates.json stays small and diffs stay readable.
 *
 * @param templates - the font's templates.
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
  if (command === "stage" && path && args.length === 2) {
    const templates = loadTemplates();
    const screen = decodeScreen(readFileSync(path));
    process.stdout.write(
      line(
        "stage",
        () => readStage(screen, templates),
        (s) => `${s.chapter}-${s.stage}`,
      ),
    );
    return 0;
  }
  const conquestField = CONQUEST_FONTS.find((n) => n === field);
  if (command === "learn" && path && (conquestField || field === "stage") && shown) {
    const screen = decodeScreen(readFileSync(path));
    const templates = loadTemplates();
    const learned = conquestField
      ? learnField(screen, conquestField, shown, templates)
      : learnStage(screen, shown, templates);
    const out = Object.fromEntries(FONT_NAMES.map((n) => [n, rounded(learned[n])]));
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
