/**
 * `node tools/hud/src/cli.ts <command> …`, run by the macros under `tools/`:
 * - `read <capture>`: prints the Guild Conquest numbers, `score <n>`, `timer <seconds>` and
 *   `final <n>`, each as `score ? <reason>` when it can't be read.
 * - `stage <capture>`: prints the stage's number, `stage <chapter>-<stage>`, or
 *   `stage ? <reason>`.
 * - `rift <capture>`: prints the rift stage's number, `rift <stage>`, or `rift ? <reason>`.
 * - `serve`: answers `read`, `stage` and `rift` requests, a line each on stdin, until stdin
 *   closes (`serve.ts`).
 * - `learn <capture> score|timer|final|stage|rift <shown>`: folds the capture's digits into
 *   `templates.json`; a stage number goes to the font of the place that shows it.
 *
 * A capture is the raw dump of `adb exec-out screencap` or the PNG of `screencap -p`.
 *
 * @module
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CONQUEST_FIELDS, learnField } from "./conquest.ts";
import type { DigitTemplate } from "./digits.ts";
import type { HudTemplates } from "./hud.ts";
import { emptyTemplates, FONT_NAMES } from "./hud.ts";
import { isRead, READS } from "./reads.ts";
import { decodeScreen } from "./screen.ts";
import { learnRift } from "./rift.ts";
import { serve } from "./serve.ts";
import { learnStage } from "./stage.ts";

const TEMPLATES = join(import.meta.dirname, "..", "templates.json");
const USAGE =
  "usage: cli.ts read|stage|rift <capture> | cli.ts serve | cli.ts learn <capture> score|timer|final|stage|rift <shown>";
/** How each non-Conquest field learns its digits from a capture. */
const LEARNS = { stage: learnStage, rift: learnRift } as const;
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
 * Runs a command and prints its result.
 *
 * @param args - the command line after the script.
 * @returns the exit code: 0 on success, 2 on bad usage.
 * @throws ScreenError when a capture can't be decoded; Error when a learn doesn't fit the capture.
 */
async function main(args: string[]): Promise<number> {
  const [command, path, field, shown] = args;
  if (isRead(command) && path && args.length === 2) {
    const templates = loadTemplates();
    process.stdout.write(READS[command](decodeScreen(readFileSync(path)), templates));
    return 0;
  }
  if (command === "serve" && args.length === 1) {
    await serve(process.stdin, process.stdout, loadTemplates);
    return 0;
  }
  const conquestField = CONQUEST_FONTS.find((n) => n === field);
  const otherField = field === "stage" || field === "rift" ? field : undefined;
  if (command === "learn" && path && (conquestField || otherField) && shown) {
    const screen = decodeScreen(readFileSync(path));
    const templates = loadTemplates();
    const learned = conquestField
      ? learnField(screen, conquestField, shown, templates)
      : LEARNS[otherField!](screen, shown, templates);
    const out = Object.fromEntries(FONT_NAMES.map((n) => [n, rounded(learned[n])]));
    writeFileSync(TEMPLATES, JSON.stringify(out) + "\n");
    process.stdout.write(`learned ${field} ${shown}\n`);
    return 0;
  }
  process.stderr.write(USAGE + "\n");
  return 2;
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (err) {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
}
