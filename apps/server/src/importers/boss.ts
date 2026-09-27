import type { BuffValueInput, FightEventInput, Values } from "@crumble/schema";
import { BUFF_BASE, CONFIDENCE } from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import { parseFile, readJson } from "./files";
import type { BuffValuesSpec, FightEventsSpec } from "./manifest";
import { formatIssues } from "./manifest";
import type { CitedValues } from "./steps";

/** One entry of an extraction's `encounter.timeline`. */
const timelineEntry = z.strictObject({
  t_seconds: z.number().nullable(),
  event: z.string().min(1),
  detail: z.string().min(1),
  sources: z.array(z.string().min(1)).min(1),
  confidence: z.enum(CONFIDENCE),
});

/** The part of an encounter extraction the fight timeline import reads. */
const encounterFile = z.object({
  encounter: z.object({ timeline: z.array(timelineEntry) }),
});

/**
 * Reads the fight timeline a manifest names and maps it onto `fight_events`
 * rows, on the elapsed clock (see the manifest's `fightEvents` block for
 * how `countdown` converts HUD-timed events).
 *
 * @param recordDir - absolute path to the record directory
 * @param spec - the manifest's `fightEvents` block
 * @param sourceIds - every curated source id
 * @returns one row per timeline entry, in file order, citing the entry's
 *   sources after `spec.sourceAliases` is applied
 * @throws {ImportError} naming `spec.file` if it's missing or malformed; if
 *   a `countdown` key names no timeline event, or more than one; or, naming
 *   the timeline row, if an elapsed time falls outside the fight or a
 *   source id isn't curated
 */
export function readFightEvents(
  recordDir: string,
  spec: FightEventsSpec,
  sourceIds: Set<string>,
): Array<CitedValues<Values<FightEventInput>>> {
  const { timeline } = parseFile(
    spec.file,
    readJson(recordDir, spec.file),
    encounterFile,
  ).encounter;

  for (const event of Object.keys(spec.countdown)) {
    const matches = timeline.filter((entry) => entry.event === event).length;
    if (matches === 0) {
      throw new ImportError(
        spec.file,
        null,
        `countdown names event "${event}", which the timeline doesn't have`,
      );
    }
    if (matches > 1) {
      throw new ImportError(
        spec.file,
        null,
        `countdown names event "${event}", which the timeline has ${matches} times`,
      );
    }
  }

  return timeline.map((entry, index) => {
    const row = `timeline ${index}`;
    const remaining = spec.countdown[entry.event];
    const tElapsed = remaining === undefined ? entry.t_seconds : spec.fightSeconds - remaining;
    if (tElapsed !== null && (tElapsed < 0 || tElapsed > spec.fightSeconds)) {
      throw new ImportError(
        spec.file,
        row,
        `elapsed time ${tElapsed} s is outside the ${spec.fightSeconds} s fight`,
      );
    }
    const sources = [...new Set(entry.sources.map((id) => spec.sourceAliases[id] ?? id))];
    const unknown = sources.filter((id) => !sourceIds.has(id));
    if (unknown.length > 0) {
      throw new ImportError(spec.file, row, `unknown source ids: ${unknown.join(", ")}`);
    }
    return {
      values: {
        boss: spec.boss,
        tElapsed,
        event: entry.event,
        detail: entry.detail,
        confidence: entry.confidence,
      },
      sources,
    };
  });
}

/** One buff of a skill grade in the Sugar Pocket capture. */
const captureBuff = z.object({
  effectType: z.string().min(1),
  rawValue: z.number(),
  base: z.enum(BUFF_BASE),
  maxStack: z.number().int().positive().nullable(),
});

/** One debuff of a skill grade in the Sugar Pocket capture. */
const captureDebuff = z.object({
  effect: z.string().min(1),
  basePercent: z.number(),
  maxStack: z.number().int().positive().nullable(),
});

/** One cookie's entry under the capture's `recommendations`, keyed by skill grade. */
const captureRecommendation = z.object({
  grades: z.record(
    z.string().regex(/^\d+$/, "expected a numeric skill grade"),
    z.object({ buffs: z.array(captureBuff), debuffs: z.array(captureDebuff) }),
  ),
});

/** The Sugar Pocket capture, with each cookie's entry validated only when it's read. */
const captureFile = z.object({ recommendations: z.record(z.string(), z.unknown()) });

/** The part of the Sugar Pocket gameplay catalog the buff import reads. */
const catalogFile = z.object({
  cookies: z.array(
    z.object({
      gameId: z.number().int(),
      name: z.object({ ko: z.string() }),
      starGrowth: z.array(z.object({ star: z.number().int(), skillStep: z.number().int() })),
    }),
  ),
});

/**
 * Reads the buff capture a manifest names and maps every buff and debuff of
 * each listed cookie, at every skill grade, onto `buff_values` rows.
 *
 * The capture's grade keys, ascending, are skill steps 0 upward; a row's
 * `fromStar` is the lowest star count the catalog's `starGrowth` gives for
 * that step. A buff's `valuePct` is its `rawValue` (basis points) ÷ 100 and
 * scales with the caster's skill amp; a debuff's is its `basePercent`
 * application chance, with base `Fixed`, and doesn't scale. A row's
 * `target` is `self` when `spec.selfBuffs` lists its cookie and effect
 * type, else `team`.
 *
 * @param recordDir - absolute path to the record directory
 * @param spec - the manifest's `buffValues` block
 * @param sourceIds - every curated source id
 * @param glossaryKrs - every curated glossary `kr`
 * @returns the rows, cookie by cookie in `spec.cookies` order, then by
 *   grade, buffs before debuffs, each citing `spec.source`
 * @throws {ImportError} naming `import.json` if `spec.source` isn't
 *   curated, a cookie isn't a glossary `kr`, or a `selfBuffs` entry matches
 *   no row; naming `spec.catalog` if a cookie isn't in it or no star
 *   reaches a grade; naming `spec.file` (and the cookie and grade) if a
 *   file is missing or malformed, a cookie has no entry, a debuff's effect
 *   has no `debuffEffects` mapping, or two rows share a cookie, effect type
 *   and grade
 */
export function readBuffValues(
  recordDir: string,
  spec: BuffValuesSpec,
  sourceIds: Set<string>,
  glossaryKrs: Set<string>,
): Array<CitedValues<Values<BuffValueInput>>> {
  if (!sourceIds.has(spec.source)) {
    throw new ImportError("import.json", "buffValues.source", `unknown source ids: ${spec.source}`);
  }
  const { recommendations } = parseFile(spec.file, readJson(recordDir, spec.file), captureFile);
  const { cookies } = parseFile(spec.catalog, readJson(recordDir, spec.catalog), catalogFile);
  const isSelf = (kr: string, effectType: string) =>
    spec.selfBuffs[kr]?.includes(effectType) ?? false;

  const rows = spec.cookies.flatMap((kr, index) => {
    if (!glossaryKrs.has(kr)) {
      throw new ImportError(
        "import.json",
        `buffValues.cookies ${index}`,
        `"${kr}" isn't a glossary kr`,
      );
    }
    const cookie = cookies.find((c) => c.name.ko === kr);
    if (!cookie) throw new ImportError(spec.catalog, null, `no cookie named "${kr}"`);
    const raw = recommendations[String(cookie.gameId)];
    if (raw === undefined) {
      throw new ImportError(spec.file, kr, `no recommendations for gameId ${cookie.gameId}`);
    }
    const parsed = captureRecommendation.safeParse(raw);
    if (!parsed.success) throw new ImportError(spec.file, kr, formatIssues(parsed.error));

    const grades = Object.keys(parsed.data.grades)
      .map(Number)
      .sort((a, b) => a - b);
    return grades.flatMap((skillGrade, step) => {
      const row = `${kr} grade ${skillGrade}`;
      const stars = cookie.starGrowth.filter((s) => s.skillStep === step).map((s) => s.star);
      if (stars.length === 0) {
        throw new ImportError(
          spec.catalog,
          kr,
          `no star reaches skill step ${step} (grade ${skillGrade})`,
        );
      }
      const fromStar = Math.min(...stars);
      const { buffs, debuffs } = parsed.data.grades[String(skillGrade)]!;
      const rows: Array<Values<BuffValueInput>> = [
        ...buffs.map((buff) => ({
          cookieKr: kr,
          effectType: buff.effectType,
          skillGrade,
          fromStar,
          valuePct: buff.rawValue / 100,
          maxStack: buff.maxStack,
          base: buff.base,
          scalesWithCasterAmp: true,
          target: isSelf(kr, buff.effectType) ? ("self" as const) : ("team" as const),
        })),
        ...debuffs.map((debuff) => {
          const effectType = spec.debuffEffects[debuff.effect];
          if (effectType === undefined) {
            throw new ImportError(
              spec.file,
              row,
              `debuff effect "${debuff.effect}" has no effect type; add it to buffValues.debuffEffects in import.json`,
            );
          }
          return {
            cookieKr: kr,
            effectType,
            skillGrade,
            fromStar,
            valuePct: debuff.basePercent,
            maxStack: debuff.maxStack,
            base: "Fixed" as const,
            scalesWithCasterAmp: false,
            target: isSelf(kr, effectType) ? ("self" as const) : ("team" as const),
          };
        }),
      ];
      return rows.map((values) => ({ values, sources: [spec.source] }));
    });
  });

  const seen = new Set<string>();
  for (const { values } of rows) {
    const key = `${values.cookieKr}|${values.effectType}|${values.skillGrade}`;
    if (seen.has(key)) {
      throw new ImportError(
        spec.file,
        `${values.cookieKr} grade ${values.skillGrade}`,
        `duplicate buff value (effect type ${values.effectType})`,
      );
    }
    seen.add(key);
  }
  for (const [kr, effectTypes] of Object.entries(spec.selfBuffs)) {
    for (const effectType of effectTypes) {
      if (!rows.some(({ values }) => values.cookieKr === kr && values.effectType === effectType)) {
        throw new ImportError(
          "import.json",
          `buffValues.selfBuffs ${kr}`,
          `no buff value of "${kr}" has effect type ${effectType}`,
        );
      }
    }
  }
  return rows;
}
