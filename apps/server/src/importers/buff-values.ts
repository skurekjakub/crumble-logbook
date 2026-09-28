/**
 * The `buffValues` block of a record's `import.json`: every buff and debuff
 * of the listed cookies, at every skill grade, read from a Sugar Pocket
 * capture onto `buff_values` rows, loaded as shared game facts.
 *
 * @module
 */
import type { BuffValueInput, Values } from "@crumble/schema";
import { BUFF_BASE, sourceId } from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import { formatIssues, parseFile, readJson } from "./files";
import { insertSharedFacts } from "./shared-facts";
import type { CitedValues, WriteStep } from "./steps";

/**
 * The buff capture to load into `buff_values`: every buff and debuff, at
 * every skill grade, of each cookie in `cookies` (each a glossary `kr`),
 * found by name in the Sugar Pocket `catalog` and cited to `source`. A
 * debuff's effect type comes from `debuffEffects`, keyed by the debuff's
 * Korean `effect` text, since the capture only calls it a generic
 * `StatModifier`. `selfBuffs` lists, per cookie, the effect types that
 * land on the caster alone (`target: self`); every other row is `team`.
 */
export const buffValuesSpec = z.strictObject({
  file: z.string().min(1),
  catalog: z.string().min(1),
  source: sourceId,
  cookies: z.array(z.string().min(1)).min(1),
  debuffEffects: z.record(z.string().min(1), z.string().min(1)).default({}),
  selfBuffs: z.record(z.string().min(1), z.array(z.string().min(1)).min(1)).default({}),
});
/** The `buffValues` block of an `import.json`. */
export type BuffValuesSpec = z.output<typeof buffValuesSpec>;

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
  sourceIds: ReadonlySet<string>,
  glossaryKrs: ReadonlySet<string>,
): Array<CitedValues<Values<BuffValueInput>>> {
  if (!sourceIds.has(spec.source)) {
    throw new ImportError("import.json", "buffValues.source", `unknown source ids: ${spec.source}`);
  }
  const { recommendations } = parseFile(spec.file, readJson(recordDir, spec.file), captureFile);
  const { cookies } = parseFile(spec.catalog, readJson(recordDir, spec.catalog), catalogFile);
  /**
   * Reports whether a cookie's effect is listed as a self-buff in `spec.selfBuffs`.
   *
   * @param kr - the cookie's Korean name
   * @param effectType - the effect's type
   * @returns `true` if the effect targets the cookie itself
   */
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

/**
 * A step writing buff values as shared game facts (see
 * {@link insertSharedFacts}): a buff value is identified by its cookie,
 * effect type and skill grade.
 *
 * @param file - the buff capture's record-relative path, as errors name it
 * @param rows - the rows, as {@link readBuffValues} returns them
 * @returns the step
 * @throws {ImportError} (from the step) naming `file`, the cookie and the
 *   grade, if a row differs from the one another record loaded; the import
 *   then writes nothing
 */
export function insertBuffValues(
  file: string,
  rows: ReadonlyArray<CitedValues<Values<BuffValueInput>>>,
): WriteStep {
  return insertSharedFacts(
    {
      key: "buffValues",
      file,
      identity: ["cookieKr", "effectType", "skillGrade"],
      facts: ["fromStar", "valuePct", "maxStack", "base", "scalesWithCasterAmp", "target"],
      defaults: { target: "team" },
      describe: (values) => ({
        row: `${values.cookieKr} grade ${values.skillGrade}`,
        what: `buff value (effect type ${values.effectType})`,
      }),
    },
    rows,
  );
}
