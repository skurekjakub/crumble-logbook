/**
 * The stage-pushing mode's curated collections: each file's schema, its
 * checks and its mapping onto the stage tables. The power brackets, stage
 * chapters and Rift levels (with their seasons) load as ownerless game
 * facts; zone slots, clears and Rift bosses as rows the record owns.
 *
 * @module
 */
import {
  CLEAR_EVIDENCE,
  CLEAR_PLAY,
  CLEAR_RESULT,
  CLEAR_STANDING,
  STAGE_ERA,
  deckSlug,
  entryPower,
  isoDate,
  postedPowerG,
} from "@crumble/schema";
import { z } from "zod";
import { ImportError } from "../errors";
import type { ValuesOf } from "../registry";
import type { RowRefs } from "./collection-kit";
import { checkCurrentDecks, checkDeckModes, collection } from "./collection-kit";
import { parseFile } from "./files";
import { insertGameFacts } from "./shared-facts";
import type { CitedValues, WriteStep } from "./steps";
import { insertCited } from "./steps";

/** The source ids a curated row or file cites: at least one. */
const cited = z.array(z.string()).min(1);

/** A positive whole number: a chapter, a level, a team power. */
const positiveInt = z.number().int().positive();

/** What every stage file says about itself; accepted but not imported. */
const header = { about: z.string().min(1), measured: isoDate };

/** `power-brackets.json`: the power gate's steps, each with its own sources. */
export const seedPowerBrackets = z.strictObject({
  ...header,
  brackets: z
    .array(
      z.strictObject({
        min_ratio_pct: z.number().int().nonnegative(),
        damage_pct: z.number().int().positive(),
        label: z.string().min(1),
        sources: cited,
      }),
    )
    .min(1),
});
/** Output of {@link seedPowerBrackets}. */
export type SeedPowerBrackets = z.output<typeof seedPowerBrackets>;

/**
 * `stage-chapters.json`: one row per chapter, by its last stage, citing the
 * file's `sources`. `power_for_N` is the least team power in the bracket
 * that keeps N% of damage, and is checked, not stored: the app derives it
 * from `recommended_power` and the power brackets. The check reads the
 * stored brackets, so a record without `power-brackets.json` is checked
 * against the ones another record loaded.
 */
export const seedStageChapters = z.strictObject({
  ...header,
  sources: cited,
  chapters: z
    .array(
      z.strictObject({
        chapter: positiveInt,
        zone_index: z.number().int().min(1).max(8),
        zone: z.string().min(1),
        last_stage: z.string().regex(/^\d+-\d+$/, "expected <chapter>-<stage>"),
        boss_kr: z.string().min(1),
        boss_en: z.string().min(1).nullable(),
        recommended_power: positiveInt,
        accuracy_req: z.number().positive(),
        focus_req: z.number().positive(),
        power_for_55: positiveInt,
        power_for_35: positiveInt,
        power_for_15: positiveInt,
      }),
    )
    .min(1),
});
/** Output of {@link seedStageChapters}. */
export type SeedStageChapters = z.output<typeof seedStageChapters>;

/**
 * `rift-levels.json`: the Rift's level groups, the seasons that run them,
 * and each level's recommended power, citing the file's `sources`, and
 * the main stage whose clear opens the Rift (`unlock`), with its own
 * sources. `power_for_N` is checked, not stored, as in `stage-chapters.json`.
 */
export const seedRiftLevels = z.strictObject({
  ...header,
  sources: cited,
  unlock: z
    .strictObject({
      stage: z.string().regex(/^\d+-\d+$/, "expected <chapter>-<stage>"),
      sources: cited,
    })
    .optional(),
  groups: z
    .array(
      z.strictObject({ id: z.number().int(), firstStage: positiveInt, lastStage: positiveInt }),
    )
    .min(1),
  seasons: z.array(
    z.strictObject({
      order: positiveInt,
      groupId: z.number().int(),
      startsAt: z.iso.datetime(),
      endsAt: z.iso.datetime(),
    }),
  ),
  levels: z
    .array(
      z.strictObject({
        level: positiveInt,
        recommended_power: positiveInt,
        power_for_35: positiveInt,
        power_for_15: positiveInt,
      }),
    )
    .min(1),
});
/** Output of {@link seedRiftLevels}. */
export type SeedRiftLevels = z.output<typeof seedRiftLevels>;

/** `stage-zones.json`: each zone layout and the plan per boss slot, each slot with its sources. */
export const seedStageZones = z.strictObject({
  ...header,
  zones: z
    .array(
      z.strictObject({
        zone_index: z.number().int().min(1).max(8),
        zone_kr: z.string().min(1),
        zone_en: z.string().min(1),
        slots: z
          .array(
            z.strictObject({
              stage: z.string().min(1),
              boss_kr: z.string().min(1),
              boss_en: z.string().min(1).optional(),
              plan: z.string().min(1),
              deck: deckSlug.optional(),
              bracket_note: z.string().min(1).optional(),
              sources: cited,
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});
/** Output of {@link seedStageZones}. */
export type SeedStageZones = z.output<typeof seedStageZones>;

/**
 * `stage-clears.json`: documented attempts, each at a `<chapter>-<stage>`
 * label, with the team power as posted, whether the record accepts it
 * (`standing`) and its sources. `play` is `?` when the post doesn't say;
 * `boss_en` names the boss in English where the stage tables don't.
 */
export const seedStageClears = z.strictObject({
  ...header,
  clears: z.array(
    z.strictObject({
      stage: z.string().regex(/^\d+-\d+$/, "expected <chapter>-<stage>"),
      boss_kr: z.string().min(1),
      boss_en: z.string().min(1).optional(),
      era: z.enum(STAGE_ERA),
      team_power: z.string().min(1),
      recommended_power: positiveInt.optional(),
      bracket: z.number().int().positive(),
      result: z.enum(CLEAR_RESULT),
      play: z.union([z.enum(CLEAR_PLAY), z.literal("?")]),
      evidence: z.enum(CLEAR_EVIDENCE),
      standing: z.enum(CLEAR_STANDING),
      deck: deckSlug.optional(),
      note: z.string().min(1).optional(),
      sources: cited,
    }),
  ),
});
/** Output of {@link seedStageClears}. */
export type SeedStageClears = z.output<typeof seedStageClears>;

/** `rift-bosses.json`: the boss players report per Rift level, each with its sources. */
export const seedRiftBosses = z.strictObject({
  ...header,
  levels: z.array(
    z.strictObject({
      level: positiveInt,
      boss_kr: z.string().min(1),
      boss_en: z.string().min(1).optional(),
      note: z.string().min(1).optional(),
      sources: cited,
    }),
  ),
});
/** Output of {@link seedRiftBosses}. */
export type SeedRiftBosses = z.output<typeof seedRiftBosses>;

/**
 * Splits a `<chapter>-<stage>` label.
 *
 * @param label - e.g. `328-30`
 * @returns the chapter and the stage within it
 */
function stageOf(label: string): { chapter: number; stageNo: number } {
  const [chapter, stageNo] = label.split("-").map(Number) as [number, number];
  return { chapter, stageNo };
}

/**
 * Checks that every value of `values` is new.
 *
 * @param file - the file, as errors name it
 * @param what - the field, as errors name it
 * @param values - the values, in file order
 * @throws {ImportError} naming the file, the index and the value of the first repeat
 */
function assertDistinct(file: string, what: string, values: readonly number[]): void {
  const seen = new Set<number>();
  values.forEach((value, index) => {
    if (seen.has(value)) throw new ImportError(file, index, `duplicate ${what} ${value}`);
    seen.add(value);
  });
}

/** A row's `power_for_N` fields, to check against its recommended power. */
interface EntryPowers {
  /** The row, as errors name it. */
  row: string | number;
  /** The row's recommended power. */
  recommended: number;
  /** `power_for_N` values, by N. */
  entries: Readonly<Record<number, number>>;
}

/**
 * A step checking rows' `power_for_N` fields against the power brackets
 * stored when it runs (the record's own, written before it, or those
 * another record loaded): each must be the entry power of the bracket that
 * keeps N% of damage at the row's recommended power. It writes nothing.
 *
 * @param file - the file, as errors name it
 * @param rows - the rows' entry powers
 * @returns the step
 * @throws {ImportError} (from the step) naming the file and row, if no
 *   stored bracket keeps N%, or a value isn't that bracket's entry power;
 *   the import then writes nothing
 */
function checkEntryPowers(file: string, rows: readonly EntryPowers[]): WriteStep {
  return (repos) => {
    const brackets = repos.powerBrackets.list();
    for (const { row, recommended, entries } of rows) {
      for (const [damage, value] of Object.entries(entries)) {
        const bracket = brackets.find((b) => b.damagePct === Number(damage));
        if (!bracket) {
          throw new ImportError(
            file,
            row,
            `power_for_${damage}: no power bracket keeps ${damage}%`,
          );
        }
        const expected = entryPower(recommended, bracket.minRatioPct);
        if (value !== expected) {
          throw new ImportError(
            file,
            row,
            `power_for_${damage} is ${value}; ${bracket.minRatioPct}% of ${recommended} is ${expected}`,
          );
        }
      }
    }
  };
}

/**
 * Cites every row to the same sources.
 *
 * @param rows - the rows' column values
 * @param sources - the sources every row cites
 * @returns the rows with their sources
 */
function citeAll<V>(rows: readonly V[], sources: readonly string[]): Array<CitedValues<V>> {
  return rows.map((values) => ({ values, sources }));
}

/**
 * The stage mode's collections, by their key in the curated manifest, in
 * write order; every one is optional.
 */
export const STAGE_COLLECTIONS = {
  powerBrackets: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedPowerBrackets),
    /** @inheritdoc */
    refs: ({ brackets }): RowRefs[] =>
      brackets.map((b, index) => ({ row: index, sources: b.sources })),
    /** @inheritdoc */
    check: (file, { brackets }) => {
      assertDistinct(
        file,
        "min_ratio_pct",
        brackets.map((b) => b.min_ratio_pct),
      );
    },
    /** @inheritdoc */
    prepare: ({ brackets }, { file }) => [
      insertGameFacts(
        {
          key: "powerBrackets",
          file,
          identity: ["minRatioPct"],
          facts: ["damagePct", "label"],
          describe: (v) => ({ row: `min_ratio_pct ${v.minRatioPct}`, what: "power bracket" }),
        },
        brackets.map((b) => ({
          values: { minRatioPct: b.min_ratio_pct, damagePct: b.damage_pct, label: b.label },
          sources: b.sources,
        })),
      ),
    ],
  }),
  stageChapters: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedStageChapters),
    /** @inheritdoc */
    refs: ({ sources }): RowRefs[] => [{ row: "sources", sources }],
    /** @inheritdoc */
    check: (file, { chapters }) => {
      assertDistinct(
        file,
        "chapter",
        chapters.map((c) => c.chapter),
      );
      chapters.forEach((c, index) => {
        if (c.zone_index !== ((c.chapter - 1) % 8) + 1) {
          throw new ImportError(file, index, `chapter ${c.chapter} isn't in zone ${c.zone_index}`);
        }
        if (stageOf(c.last_stage).chapter !== c.chapter) {
          throw new ImportError(file, index, `last_stage ${c.last_stage} isn't in the chapter`);
        }
      });
    },
    /** @inheritdoc */
    prepare: ({ chapters, sources }, { file }) => {
      const rows: Array<ValuesOf<"stageChapters">> = chapters.map((c) => ({
        chapter: c.chapter,
        zoneIndex: c.zone_index,
        zone: c.zone,
        lastStage: c.last_stage,
        bossKr: c.boss_kr,
        bossEn: c.boss_en,
        recommendedPower: c.recommended_power,
        accuracyReq: c.accuracy_req,
        focusReq: c.focus_req,
      }));
      return [
        checkEntryPowers(
          file,
          chapters.map((c, index) => ({
            row: index,
            recommended: c.recommended_power,
            entries: { 55: c.power_for_55, 35: c.power_for_35, 15: c.power_for_15 },
          })),
        ),
        insertGameFacts(
          {
            key: "stageChapters",
            file,
            identity: ["chapter"],
            facts: [
              "zoneIndex",
              "zone",
              "lastStage",
              "bossKr",
              "bossEn",
              "recommendedPower",
              "accuracyReq",
              "focusReq",
            ],
            describe: (v) => ({ row: `chapter ${v.chapter}`, what: "stage chapter" }),
          },
          citeAll(rows, sources),
        ),
      ];
    },
  }),
  riftLevels: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedRiftLevels),
    /** @inheritdoc */
    refs: ({ sources, unlock }): RowRefs[] => [
      { row: "sources", sources },
      ...(unlock ? [{ row: "unlock", sources: unlock.sources }] : []),
    ],
    /** @inheritdoc */
    check: (file, { groups, seasons, levels }) => {
      assertDistinct(
        file,
        "level",
        levels.map((l) => l.level),
      );
      assertDistinct(
        file,
        "season",
        seasons.map((s) => s.order),
      );
      seasons.forEach((s, index) => {
        if (!groups.some((g) => g.id === s.groupId)) {
          throw new ImportError(file, `seasons ${index}`, `unknown groupId ${s.groupId}`);
        }
      });
    },
    /** @inheritdoc */
    prepare: ({ groups, seasons, levels, sources, unlock }, { file }) => {
      const group = new Map(groups.map((g) => [g.id, g]));
      return [
        checkEntryPowers(
          file,
          levels.map((l, index) => ({
            row: `levels ${index}`,
            recommended: l.recommended_power,
            entries: { 35: l.power_for_35, 15: l.power_for_15 },
          })),
        ),
        insertGameFacts(
          {
            key: "riftLevels",
            file,
            identity: ["level"],
            facts: ["recommendedPower"],
            describe: (v) => ({ row: `level ${v.level}`, what: "Rift level" }),
          },
          citeAll(
            levels.map((l) => ({ level: l.level, recommendedPower: l.recommended_power })),
            sources,
          ),
        ),
        insertGameFacts(
          {
            key: "riftSeasons",
            file,
            identity: ["season"],
            facts: ["firstLevel", "lastLevel", "startsAt", "endsAt"],
            describe: (v) => ({ row: `season ${v.season}`, what: "Rift season" }),
          },
          citeAll(
            seasons.map((s) => ({
              season: s.order,
              firstLevel: group.get(s.groupId)!.firstStage,
              lastLevel: group.get(s.groupId)!.lastStage,
              startsAt: s.startsAt,
              endsAt: s.endsAt,
            })),
            sources,
          ),
        ),
        // One unlock at most, so every stored one is the same fact.
        insertGameFacts(
          {
            key: "riftUnlocks",
            file,
            identity: [],
            facts: ["stage"],
            describe: (v) => ({ row: "unlock", what: `Rift unlock ${v.stage}` }),
          },
          unlock ? [{ values: { stage: unlock.stage }, sources: unlock.sources }] : [],
        ),
      ];
    },
  }),
  stageZones: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedStageZones),
    /** @inheritdoc */
    refs: ({ zones }): RowRefs[] =>
      zones.flatMap((zone) =>
        zone.slots.map((slot, index) => ({
          row: `zone ${zone.zone_index} slot ${index}`,
          sources: slot.sources,
          decks: slot.deck === undefined ? [] : [slot.deck],
        })),
      ),
    /** @inheritdoc */
    check: (file, { zones }, context) => {
      assertDistinct(
        file,
        "zone_index",
        zones.map((z) => z.zone_index),
      );
      const decks = zones.flatMap((zone) =>
        zone.slots.map(
          (slot, index) => [`zone ${zone.zone_index} slot ${index}`, slot.deck] as const,
        ),
      );
      checkDeckModes(file, "stage_zone_slot", "stage", decks, context);
      checkCurrentDecks(file, "stage_zone_slot", decks, context);
    },
    /** @inheritdoc */
    prepare: ({ zones }) => [
      insertCited(
        "stageZoneSlots",
        zones.flatMap((zone) =>
          zone.slots.map((slot, position) => ({
            values: {
              zoneIndex: zone.zone_index,
              zoneKr: zone.zone_kr,
              zoneEn: zone.zone_en,
              position,
              stage: slot.stage,
              bossKr: slot.boss_kr,
              bossEn: slot.boss_en ?? null,
              plan: slot.plan,
              deckId: slot.deck ?? null,
              bracketNote: slot.bracket_note ?? null,
            },
            sources: slot.sources,
          })),
        ),
      ),
    ],
  }),
  stageClears: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedStageClears),
    /** @inheritdoc */
    refs: ({ clears }): RowRefs[] =>
      clears.map((clear, index) => ({
        row: index,
        sources: clear.sources,
        decks: clear.deck === undefined ? [] : [clear.deck],
      })),
    /** @inheritdoc */
    check: (file, { clears }, context) => {
      checkDeckModes(
        file,
        "stage_clear",
        "stage",
        clears.map((clear, index) => [index, clear.deck] as const),
        context,
      );
    },
    /** @inheritdoc */
    prepare: ({ clears }) => [
      insertCited(
        "stageClears",
        clears.map((clear) => ({
          values: {
            ...stageOf(clear.stage),
            bossKr: clear.boss_kr,
            bossEn: clear.boss_en ?? null,
            era: clear.era,
            teamPower: clear.team_power,
            powerG: postedPowerG(clear.team_power),
            recommendedPower: clear.recommended_power ?? null,
            bracket: clear.bracket,
            result: clear.result,
            play: clear.play === "?" ? null : clear.play,
            evidence: clear.evidence,
            standing: clear.standing,
            deckId: clear.deck ?? null,
            note: clear.note ?? null,
          },
          sources: clear.sources,
        })),
      ),
    ],
  }),
  riftBosses: collection({
    optional: true,
    /** @inheritdoc */
    parse: (file, raw) => parseFile(file, raw, seedRiftBosses),
    /** @inheritdoc */
    refs: ({ levels }): RowRefs[] =>
      levels.map((boss, index) => ({ row: index, sources: boss.sources })),
    /** @inheritdoc */
    prepare: ({ levels }) => [
      insertCited(
        "riftBosses",
        levels.map((boss) => ({
          values: {
            level: boss.level,
            bossKr: boss.boss_kr,
            bossEn: boss.boss_en ?? null,
            note: boss.note ?? null,
          },
          sources: boss.sources,
        })),
      ),
    ],
  }),
};
