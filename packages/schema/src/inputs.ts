import { z } from "zod";
import { dailyDeckProblem, withPowerG } from "./daily-dungeon";
import { claimRefProblem } from "./damage-formula";
import { lineupProblem, runStanding } from "./dungeon";
import { postedPowerG } from "./power";
import { growthCurveProblem, spendingStepProblem } from "./team-power";
import {
  growthCurveInsert,
  packageInsert,
  plannerStepInsert,
  powerDataPointInsert,
  powerSourceInsert,
  priceTierInsert,
  spendingOrderInsert,
  spendingStepInsert,
  buffValueInsert,
  counterInsert,
  dailyDungeonClearInsert,
  dailyDungeonInsert,
  deckDailyDungeonInsert,
  deckCookieInsert,
  deckInsert,
  deckNoteInsert,
  deckSlug,
  dungeonExclusionInsert,
  dungeonLineupInsert,
  dungeonRunInsert,
  fightEventInsert,
  formulaClaimInsert,
  formulaConstantInsert,
  formulaStepInsert,
  gearRecInsert,
  glossaryInsert,
  mechanicInsert,
  nameList,
  powerBracketInsert,
  recommendationInsert,
  riftBossInsert,
  riftClearInsert,
  riftLevelInsert,
  riftSeasonInsert,
  riftUnlockInsert,
  rngFactorInsert,
  runeBuildInsert,
  scoreInsert,
  sourceId,
  sourceInsert,
  stageChapterInsert,
  stageClearInsert,
  stageZoneSlotInsert,
  takeawayInsert,
  timelineEventInsert,
  usageStatInsert,
} from "./zod";

/** A non-empty list of source ids a submitted entity must cite. */
export const sourceIds = z.array(sourceId).min(1, "cite at least one source");

/**
 * The obsolete lifecycle's columns, which only a record's import writes:
 * the API's inputs leave them out, so a reason is never stored without the
 * citations the import gives it.
 */
const LIFECYCLE = { obsoleteSince: true, obsoleteReason: true } as const;

/**
 * The create input and the patch of a cited content type, from its table's
 * insert schema. The input drops the server-assigned `id` and requires the
 * `sources` the row cites; the patch makes every field optional, `sources`
 * included, and still rejects an empty `sources`.
 *
 * @typeParam Shape - the insert schema's fields, `id` among them
 * @typeParam Config - the insert schema's object config
 * @param insert - the table's insert schema
 * @returns `input` and `patch`
 */
function citedInputs<
  Shape extends z.core.$ZodShape & { id: z.core.$ZodType },
  Config extends z.core.$ZodObjectConfig,
>(insert: z.ZodObject<Shape, Config>) {
  // zod's `omit` checks the mask against the shape's keys, which a generic shape can't resolve.
  const idOnly = { id: true } as { id: true } & Record<Exclude<"id", keyof Shape>, never>;
  const fields = insert.omit(idOnly);
  return {
    input: fields.extend({ sources: sourceIds }),
    patch: fields.partial().extend({ sources: sourceIds.optional() }),
  };
}

/**
 * Input for creating a source. `site` is derived server-side from the id
 * prefix (`dc:`/`nv:`/`web:`), so it isn't accepted from the client.
 */
export const sourceInput = sourceInsert.omit({ site: true });
/** Output of {@link sourceInput}. */
export type SourceInput = z.output<typeof sourceInput>;

/** Patch for updating a source. `id` is immutable; every other field is optional. */
export const sourcePatch = sourceInput.omit({ id: true }).partial();
/** Output of {@link sourcePatch}. */
export type SourcePatch = z.output<typeof sourcePatch>;

/** Input for creating or replacing a glossary entry, keyed by `kr`. */
export const glossaryInput = glossaryInsert;
/** Output of {@link glossaryInput}. */
export type GlossaryInput = z.output<typeof glossaryInput>;

const mechanic = citedInputs(mechanicInsert);
/** Input for creating a mechanic writeup, with the sources that support it. */
export const mechanicInput = mechanic.input;
/** Output of {@link mechanicInput}. */
export type MechanicInput = z.output<typeof mechanicInput>;
/** Patch for updating a mechanic writeup. `sources`, if given, must be non-empty. */
export const mechanicPatch = mechanic.patch;
/** Output of {@link mechanicPatch}. */
export type MechanicPatch = z.output<typeof mechanicPatch>;

const rngFactor = citedInputs(rngFactorInsert);
/** Input for creating an RNG factor writeup, with the sources that support it. */
export const rngFactorInput = rngFactor.input;
/** Output of {@link rngFactorInput}. */
export type RngFactorInput = z.output<typeof rngFactorInput>;
/** Patch for updating an RNG factor writeup. `sources`, if given, must be non-empty. */
export const rngFactorPatch = rngFactor.patch;
/** Output of {@link rngFactorPatch}. */
export type RngFactorPatch = z.output<typeof rngFactorPatch>;

const timelineEvent = citedInputs(timelineEventInsert);
/** Input for creating a timeline event, with the sources that support it. */
export const timelineEventInput = timelineEvent.input;
/** Output of {@link timelineEventInput}. */
export type TimelineEventInput = z.output<typeof timelineEventInput>;
/** Patch for updating a timeline event. `sources`, if given, must be non-empty. */
export const timelineEventPatch = timelineEvent.patch;
/** Output of {@link timelineEventPatch}. */
export type TimelineEventPatch = z.output<typeof timelineEventPatch>;

const takeaway = citedInputs(takeawayInsert);
/** Input for creating a takeaway, with the sources that support it. */
export const takeawayInput = takeaway.input;
/** Output of {@link takeawayInput}. */
export type TakeawayInput = z.output<typeof takeawayInput>;
/** Patch for updating a takeaway. `sources`, if given, must be non-empty. */
export const takeawayPatch = takeaway.patch;
/** Output of {@link takeawayPatch}. */
export type TakeawayPatch = z.output<typeof takeawayPatch>;

const gearRec = citedInputs(gearRecInsert.omit(LIFECYCLE));
/**
 * Input for creating a gear recommendation, with the sources that support
 * it. The obsolete lifecycle isn't accepted: a record's import sets it.
 */
export const gearRecInput = gearRec.input;
/** Output of {@link gearRecInput}. */
export type GearRecInput = z.output<typeof gearRecInput>;
/**
 * Patch for updating a gear recommendation. `sources`, if given, must be
 * non-empty. The obsolete lifecycle isn't accepted: a record's import sets it.
 */
export const gearRecPatch = gearRec.patch;
/** Output of {@link gearRecPatch}. */
export type GearRecPatch = z.output<typeof gearRecPatch>;

const recommendation = citedInputs(recommendationInsert);
/** Input for creating a recommendation, with the sources that support it. */
export const recommendationInput = recommendation.input;
/** Output of {@link recommendationInput}. */
export type RecommendationInput = z.output<typeof recommendationInput>;
/** Patch for updating a recommendation. `sources`, if given, must be non-empty. */
export const recommendationPatch = recommendation.patch;
/** Output of {@link recommendationPatch}. */
export type RecommendationPatch = z.output<typeof recommendationPatch>;

const score = citedInputs(scoreInsert);
/** Input for creating a score, with the sources that support it. */
export const scoreInput = score.input;
/** Output of {@link scoreInput}. */
export type ScoreInput = z.output<typeof scoreInput>;
/** Patch for updating a score. `sources`, if given, must be non-empty. */
export const scorePatch = score.patch;
/** Output of {@link scorePatch}. */
export type ScorePatch = z.output<typeof scorePatch>;

const fightEvent = citedInputs(fightEventInsert);
/** Input for creating a fight event, with the sources that support it. */
export const fightEventInput = fightEvent.input;
/** Output of {@link fightEventInput}. */
export type FightEventInput = z.output<typeof fightEventInput>;
/** Patch for updating a fight event. `sources`, if given, must be non-empty. */
export const fightEventPatch = fightEvent.patch;
/** Output of {@link fightEventPatch}. */
export type FightEventPatch = z.output<typeof fightEventPatch>;

const buffValue = citedInputs(buffValueInsert);
/** Input for creating a buff value, with the sources that support it. */
export const buffValueInput = buffValue.input;
/** Output of {@link buffValueInput}. */
export type BuffValueInput = z.output<typeof buffValueInput>;
/** Patch for updating a buff value. `sources`, if given, must be non-empty. */
export const buffValuePatch = buffValue.patch;
/** Output of {@link buffValuePatch}. */
export type BuffValuePatch = z.output<typeof buffValuePatch>;

const counter = citedInputs(counterInsert.omit(LIFECYCLE));
/**
 * Input for creating a counter edge, with the sources that support it. A
 * deck can't counter itself: `teamDeckId` and `beatenByDeckId` must differ.
 * `citedInputs` omits before this refine: zod 4 rejects `.omit()` on a
 * refined object. The obsolete lifecycle isn't accepted: a record's import
 * sets it.
 */
export const counterInput = counter.input.refine((c) => c.teamDeckId !== c.beatenByDeckId, {
  message: "a deck can't be its own counter",
  path: ["beatenByDeckId"],
});
/** Output of {@link counterInput}. */
export type CounterInput = z.output<typeof counterInput>;
/**
 * Patch for updating a counter edge. `sources`, if given, must be
 * non-empty. The obsolete lifecycle isn't accepted: a record's import sets it.
 */
export const counterPatch = counter.patch;
/** Output of {@link counterPatch}. */
export type CounterPatch = z.output<typeof counterPatch>;

const usageStat = citedInputs(usageStatInsert);
/** Input for creating a usage figure, with the sources that support it. */
export const usageStatInput = usageStat.input;
/** Output of {@link usageStatInput}. */
export type UsageStatInput = z.output<typeof usageStatInput>;
/** Patch for updating a usage figure. `sources`, if given, must be non-empty. */
export const usageStatPatch = usageStat.patch;
/** Output of {@link usageStatPatch}. */
export type UsageStatPatch = z.output<typeof usageStatPatch>;

const powerBracket = citedInputs(powerBracketInsert);
/** Input for creating a power-gate bracket, with the sources that state it. */
export const powerBracketInput = powerBracket.input;
/** Output of {@link powerBracketInput}. */
export type PowerBracketInput = z.output<typeof powerBracketInput>;
/** Patch for updating a power-gate bracket. `sources`, if given, must be non-empty. */
export const powerBracketPatch = powerBracket.patch;
/** Output of {@link powerBracketPatch}. */
export type PowerBracketPatch = z.output<typeof powerBracketPatch>;

const stageChapter = citedInputs(stageChapterInsert);
/** Input for creating a stage chapter, with the sources that state it. */
export const stageChapterInput = stageChapter.input;
/** Output of {@link stageChapterInput}. */
export type StageChapterInput = z.output<typeof stageChapterInput>;
/** Patch for updating a stage chapter. `sources`, if given, must be non-empty. */
export const stageChapterPatch = stageChapter.patch;
/** Output of {@link stageChapterPatch}. */
export type StageChapterPatch = z.output<typeof stageChapterPatch>;

const riftLevel = citedInputs(riftLevelInsert);
/** Input for creating a Rift level, with the sources that state it. */
export const riftLevelInput = riftLevel.input;
/** Output of {@link riftLevelInput}. */
export type RiftLevelInput = z.output<typeof riftLevelInput>;
/** Patch for updating a Rift level. `sources`, if given, must be non-empty. */
export const riftLevelPatch = riftLevel.patch;
/** Output of {@link riftLevelPatch}. */
export type RiftLevelPatch = z.output<typeof riftLevelPatch>;

const riftSeason = citedInputs(riftSeasonInsert);
/** Input for creating a Rift season, with the sources that state it. */
export const riftSeasonInput = riftSeason.input;
/** Output of {@link riftSeasonInput}. */
export type RiftSeasonInput = z.output<typeof riftSeasonInput>;
/** Patch for updating a Rift season. `sources`, if given, must be non-empty. */
export const riftSeasonPatch = riftSeason.patch;
/** Output of {@link riftSeasonPatch}. */
export type RiftSeasonPatch = z.output<typeof riftSeasonPatch>;

const riftUnlock = citedInputs(riftUnlockInsert);
/** Input for creating the Rift's unlock, with the sources that state it. */
export const riftUnlockInput = riftUnlock.input;
/** Output of {@link riftUnlockInput}. */
export type RiftUnlockInput = z.output<typeof riftUnlockInput>;
/** Patch for updating the Rift's unlock. `sources`, if given, must be non-empty. */
export const riftUnlockPatch = riftUnlock.patch;
/** Output of {@link riftUnlockPatch}. */
export type RiftUnlockPatch = z.output<typeof riftUnlockPatch>;

const stageZoneSlot = citedInputs(stageZoneSlotInsert);
/** Input for creating a zone's boss-slot plan, with the sources that support it. */
export const stageZoneSlotInput = stageZoneSlot.input;
/** Output of {@link stageZoneSlotInput}. */
export type StageZoneSlotInput = z.output<typeof stageZoneSlotInput>;
/** Patch for updating a zone's boss-slot plan. `sources`, if given, must be non-empty. */
export const stageZoneSlotPatch = stageZoneSlot.patch;
/** Output of {@link stageZoneSlotPatch}. */
export type StageZoneSlotPatch = z.output<typeof stageZoneSlotPatch>;

const stageClear = citedInputs(stageClearInsert.omit({ powerG: true }));
/**
 * Input for creating a documented stage attempt, with the sources that
 * show it. `powerG` isn't accepted: it is read from `teamPower` (see
 * `postedPowerG`).
 */
export const stageClearInput = stageClear.input.transform((clear) => ({
  ...clear,
  powerG: postedPowerG(clear.teamPower),
}));
/** Output of {@link stageClearInput}. */
export type StageClearInput = z.output<typeof stageClearInput>;
/**
 * Patch for updating a documented stage attempt. `sources`, if given, must
 * be non-empty. `powerG` isn't accepted: a patch that sets `teamPower`
 * sets it too, read from the new text.
 */
export const stageClearPatch = stageClear.patch.transform((patch) =>
  patch.teamPower === undefined ? patch : { ...patch, powerG: postedPowerG(patch.teamPower) },
);
/** Output of {@link stageClearPatch}. */
export type StageClearPatch = z.output<typeof stageClearPatch>;

const riftClear = citedInputs(riftClearInsert.omit({ powerG: true }));
/**
 * Input for creating a documented Dimensional Rift attempt, with the
 * sources that show it. `powerG` isn't accepted: it is read from
 * `teamPower` (see `postedPowerG`).
 */
export const riftClearInput = riftClear.input.transform((clear) => ({
  ...clear,
  powerG: postedPowerG(clear.teamPower),
}));
/** Output of {@link riftClearInput}. */
export type RiftClearInput = z.output<typeof riftClearInput>;
/**
 * Patch for updating a documented Dimensional Rift attempt. `sources`, if
 * given, must be non-empty. `powerG` isn't accepted: a patch that sets
 * `teamPower` sets it too, read from the new text.
 */
export const riftClearPatch = riftClear.patch.transform((patch) =>
  patch.teamPower === undefined ? patch : { ...patch, powerG: postedPowerG(patch.teamPower) },
);
/** Output of {@link riftClearPatch}. */
export type RiftClearPatch = z.output<typeof riftClearPatch>;

const riftBoss = citedInputs(riftBossInsert);
/** Input for creating a reported Rift boss, with the sources that report it. */
export const riftBossInput = riftBoss.input;
/** Output of {@link riftBossInput}. */
export type RiftBossInput = z.output<typeof riftBossInput>;
/** Patch for updating a reported Rift boss. `sources`, if given, must be non-empty. */
export const riftBossPatch = riftBoss.patch;
/** Output of {@link riftBossPatch}. */
export type RiftBossPatch = z.output<typeof riftBossPatch>;

const dungeonRun = citedInputs(dungeonRunInsert.omit({ standing: true }));
/**
 * Input for creating a documented Crumble Dungeon score, with the sources
 * that show it. `standing` isn't accepted: it is read from `evidence` and
 * `board` (see {@link runStanding}).
 */
export const dungeonRunInput = dungeonRun.input.transform((run) => ({
  ...run,
  standing: runStanding(run),
}));
/** Output of {@link dungeonRunInput}. */
export type DungeonRunInput = z.output<typeof dungeonRunInput>;
/**
 * Patch for updating a documented Crumble Dungeon score. `sources`, if
 * given, must be non-empty. `standing` isn't accepted: the server reads it
 * again from the updated row's `evidence` and `board`.
 */
export const dungeonRunPatch = dungeonRun.patch;
/** Output of {@link dungeonRunPatch}. */
export type DungeonRunPatch = z.output<typeof dungeonRunPatch>;

const dungeonLineup = citedInputs(dungeonLineupInsert);
/**
 * Input for creating a published Crumble Dungeon lineup, with the sources
 * that publish it. Its lists must agree (see {@link lineupProblem}).
 * `citedInputs` omits before this refine: zod 4 rejects `.omit()` on a
 * refined object.
 */
export const dungeonLineupInput = dungeonLineup.input.superRefine((lineup, ctx) => {
  const problem = lineupProblem(lineup);
  if (problem) ctx.addIssue({ code: "custom", message: problem });
});
/** Output of {@link dungeonLineupInput}. */
export type DungeonLineupInput = z.output<typeof dungeonLineupInput>;
/** Patch for updating a published Crumble Dungeon lineup. `sources`, if given, must be non-empty. */
export const dungeonLineupPatch = dungeonLineup.patch;
/** Output of {@link dungeonLineupPatch}. */
export type DungeonLineupPatch = z.output<typeof dungeonLineupPatch>;

const dungeonExclusion = citedInputs(dungeonExclusionInsert);
/** Input for creating a Crumble Dungeon exclusion, with the sources that give its reason. */
export const dungeonExclusionInput = dungeonExclusion.input;
/** Output of {@link dungeonExclusionInput}. */
export type DungeonExclusionInput = z.output<typeof dungeonExclusionInput>;
/** Patch for updating a Crumble Dungeon exclusion. `sources`, if given, must be non-empty. */
export const dungeonExclusionPatch = dungeonExclusion.patch;
/** Output of {@link dungeonExclusionPatch}. */
export type DungeonExclusionPatch = z.output<typeof dungeonExclusionPatch>;

const dailyDungeon = citedInputs(dailyDungeonInsert);
/**
 * Input for creating a daily dungeon, with the sources that describe it.
 * A `topStageSource` must exist too, and the row is cited to it.
 */
export const dailyDungeonInput = dailyDungeon.input;
/** Output of {@link dailyDungeonInput}. */
export type DailyDungeonInput = z.output<typeof dailyDungeonInput>;
/** Patch for updating a daily dungeon. `sources`, if given, must be non-empty. */
export const dailyDungeonPatch = dailyDungeon.patch;
/** Output of {@link dailyDungeonPatch}. */
export type DailyDungeonPatch = z.output<typeof dailyDungeonPatch>;

const dailyDungeonClear = citedInputs(dailyDungeonClearInsert.omit({ powerG: true }));
/**
 * Input for creating a documented daily dungeon clear, with the sources
 * that show it. `powerG` isn't accepted: it is read from `power` (see
 * `postedPowerG`).
 */
export const dailyDungeonClearInput = dailyDungeonClear.input.transform((clear) =>
  withPowerG(clear),
);
/** Output of {@link dailyDungeonClearInput}. */
export type DailyDungeonClearInput = z.output<typeof dailyDungeonClearInput>;
/**
 * Patch for updating a documented daily dungeon clear. `sources`, if given,
 * must be non-empty. `powerG` isn't accepted: a patch that sets `power`
 * sets it too, read from the new text.
 */
export const dailyDungeonClearPatch = dailyDungeonClear.patch.transform((patch) =>
  patch.power === undefined ? patch : withPowerG(patch),
);
/** Output of {@link dailyDungeonClearPatch}. */
export type DailyDungeonClearPatch = z.output<typeof dailyDungeonClearPatch>;

const powerSource = citedInputs(powerSourceInsert);
/** Input for creating a power source, with the sources that describe it. */
export const powerSourceInput = powerSource.input;
/** Output of {@link powerSourceInput}. */
export type PowerSourceInput = z.output<typeof powerSourceInput>;
/** Patch for updating a power source. `sources`, if given, must be non-empty. */
export const powerSourcePatch = powerSource.patch;
/** Output of {@link powerSourcePatch}. */
export type PowerSourcePatch = z.output<typeof powerSourcePatch>;

const powerDataPoint = citedInputs(powerDataPointInsert);
/** Input for creating a team-power data point, with the sources that post it. */
export const powerDataPointInput = powerDataPoint.input;
/** Output of {@link powerDataPointInput}. */
export type PowerDataPointInput = z.output<typeof powerDataPointInput>;
/** Patch for updating a team-power data point. `sources`, if given, must be non-empty. */
export const powerDataPointPatch = powerDataPoint.patch;
/** Output of {@link powerDataPointPatch}. */
export type PowerDataPointPatch = z.output<typeof powerDataPointPatch>;

const shopPackage = citedInputs(packageInsert);
/** Input for creating a shop package, with the sources that price it. */
export const packageInput = shopPackage.input;
/** Output of {@link packageInput}. */
export type PackageInput = z.output<typeof packageInput>;
/** Patch for updating a shop package. `sources`, if given, must be non-empty. */
export const packagePatch = shopPackage.patch;
/** Output of {@link packagePatch}. */
export type PackagePatch = z.output<typeof packagePatch>;

const priceTier = citedInputs(priceTierInsert);
/** Input for creating a KRW-to-USD price tier, with the sources that pair it. */
export const priceTierInput = priceTier.input;
/** Output of {@link priceTierInput}. */
export type PriceTierInput = z.output<typeof priceTierInput>;
/** Patch for updating a price tier. `sources`, if given, must be non-empty. */
export const priceTierPatch = priceTier.patch;
/** Output of {@link priceTierPatch}. */
export type PriceTierPatch = z.output<typeof priceTierPatch>;

const spendingOrder = citedInputs(spendingOrderInsert);
/** Input for creating a spending order, with the sources behind it. */
export const spendingOrderInput = spendingOrder.input;
/** Output of {@link spendingOrderInput}. */
export type SpendingOrderInput = z.output<typeof spendingOrderInput>;
/** Patch for updating a spending order. `sources`, if given, must be non-empty. */
export const spendingOrderPatch = spendingOrder.patch;
/** Output of {@link spendingOrderPatch}. */
export type SpendingOrderPatch = z.output<typeof spendingOrderPatch>;

const spendingStep = citedInputs(spendingStepInsert);
/**
 * Input for creating a spending step, with the sources behind it. It names
 * a power source or a package (see {@link spendingStepProblem}).
 * `citedInputs` omits before this refine: zod 4 rejects `.omit()` on a
 * refined object.
 */
export const spendingStepInput = spendingStep.input.superRefine((step, ctx) => {
  const problem = spendingStepProblem({
    powerSource: step.powerSource ?? null,
    packageSlug: step.packageSlug ?? null,
  });
  if (problem) ctx.addIssue({ code: "custom", message: problem, path: ["powerSource"] });
});
/** Output of {@link spendingStepInput}. */
export type SpendingStepInput = z.output<typeof spendingStepInput>;
/** Patch for updating a spending step. `sources`, if given, must be non-empty. */
export const spendingStepPatch = spendingStep.patch;
/** Output of {@link spendingStepPatch}. */
export type SpendingStepPatch = z.output<typeof spendingStepPatch>;

const growthCurve = citedInputs(growthCurveInsert);
/**
 * Input for creating a growth curve, with the sources it condenses. Its
 * table must be whole (see {@link growthCurveProblem}).
 */
export const growthCurveInput = growthCurve.input.superRefine((curve, ctx) => {
  const problem = growthCurveProblem({ ...curve, rowSources: curve.rowSources ?? null });
  if (problem) ctx.addIssue({ code: "custom", message: problem, path: ["rows"] });
});
/** Output of {@link growthCurveInput}. */
export type GrowthCurveInput = z.output<typeof growthCurveInput>;
/** Patch for updating a growth curve. `sources`, if given, must be non-empty. */
export const growthCurvePatch = growthCurve.patch;
/** Output of {@link growthCurvePatch}. */
export type GrowthCurvePatch = z.output<typeof growthCurvePatch>;

const plannerStep = citedInputs(plannerStepInsert);
/** Input for creating a planner step, with the sources of its gain and reach. */
export const plannerStepInput = plannerStep.input;
/** Output of {@link plannerStepInput}. */
export type PlannerStepInput = z.output<typeof plannerStepInput>;
/** Patch for updating a planner step. `sources`, if given, must be non-empty. */
export const plannerStepPatch = plannerStep.patch;
/** Output of {@link plannerStepPatch}. */
export type PlannerStepPatch = z.output<typeof plannerStepPatch>;

const formulaStep = citedInputs(formulaStepInsert);
/** Input for creating a damage formula step, with the sources that read it. */
export const formulaStepInput = formulaStep.input;
/** Output of {@link formulaStepInput}. */
export type FormulaStepInput = z.output<typeof formulaStepInput>;
/** Patch for updating a damage formula step. `sources`, if given, must be non-empty. */
export const formulaStepPatch = formulaStep.patch;
/** Output of {@link formulaStepPatch}. */
export type FormulaStepPatch = z.output<typeof formulaStepPatch>;

const formulaConstant = citedInputs(formulaConstantInsert);
/**
 * Input for creating a damage formula constant, with the sources that
 * name it. Its `step` must be a stored formula step's slug.
 */
export const formulaConstantInput = formulaConstant.input;
/** Output of {@link formulaConstantInput}. */
export type FormulaConstantInput = z.output<typeof formulaConstantInput>;
/** Patch for updating a damage formula constant. `sources`, if given, must be non-empty. */
export const formulaConstantPatch = formulaConstant.patch;
/** Output of {@link formulaConstantPatch}. */
export type FormulaConstantPatch = z.output<typeof formulaConstantPatch>;

const formulaClaim = citedInputs(formulaClaimInsert);
/**
 * Input for creating a community claim held against the code, with the
 * sources that make the claim and read the code. It names its record and
 * mechanic title together or neither (see {@link claimRefProblem}).
 * `citedInputs` omits before this refine: zod 4 rejects `.omit()` on a
 * refined object.
 */
export const formulaClaimInput = formulaClaim.input.superRefine((claim, ctx) => {
  const problem = claimRefProblem(claim);
  if (problem) ctx.addIssue({ code: "custom", message: problem, path: ["refTitle"] });
});
/** Output of {@link formulaClaimInput}. */
export type FormulaClaimInput = z.output<typeof formulaClaimInput>;
/**
 * Patch for updating a community claim. `sources`, if given, must be
 * non-empty; the patched row must still keep {@link claimRefProblem}'s rule.
 */
export const formulaClaimPatch = formulaClaim.patch;
/** Output of {@link formulaClaimPatch}. */
export type FormulaClaimPatch = z.output<typeof formulaClaimPatch>;

/**
 * Input for a single deck cookie slot. `id`, `deckId` and `position` are
 * assigned by the service, not the client. Enforces the same level-or-rule
 * invariant as the `deck_cookies_level_or_rule` CHECK constraint: the omit
 * runs before the refine because zod 4 rejects `.omit()`/`.pick()` on an
 * already-refined object.
 */
export const deckCookieInput = deckCookieInsert
  .omit({ id: true, deckId: true, position: true })
  .refine((c) => c.level != null || c.levelRule != null, {
    message: "a deck cookie needs a level or a level rule",
    path: ["level"],
  });
/** Output of {@link deckCookieInput}. */
export type DeckCookieInput = z.output<typeof deckCookieInput>;

/** Input for a single deck note: its kind and text, without positioning or foreign keys. */
export const deckNoteInput = deckNoteInsert.pick({ kind: true, text: true });
/** Output of {@link deckNoteInput}. */
export type DeckNoteInput = z.output<typeof deckNoteInput>;

/**
 * Input for a daily dungeon deck's run facts: the dungeon it runs, how far
 * it plays itself, the stage it reached, its power and the stage's
 * recommended power as posted, its gear preset and its captain. `powerG`
 * and `recommendedPowerG` aren't accepted: the server reads them from the
 * posted powers.
 */
export const deckDailyRunInput = deckDailyDungeonInsert.omit({
  deckId: true,
  powerG: true,
  recommendedPowerG: true,
});
/** Output of {@link deckDailyRunInput}. */
export type DeckDailyRunInput = z.output<typeof deckDailyRunInput>;

/**
 * The deck fields shared, unmodified, by {@link deckInput} and
 * {@link deckPatch}. Carries no `.default()`s, so `.partial()`-ing it (for
 * the patch) never injects a default value into a payload that omitted the
 * field. The obsolete lifecycle and `supersededBy` are left out.
 * `dailyDungeon` holds a daily dungeon deck's run facts, `null` for any
 * other deck.
 */
const deckFields = deckInsert
  .omit({ id: true, position: true, ...LIFECYCLE, supersededBy: true })
  .extend({
    position: z.number().int().min(0).optional(),
    cookies: z.array(deckCookieInput).min(1),
    pets: nameList,
    notes: z.array(deckNoteInput),
    dailyDungeon: deckDailyRunInput.nullable(),
    sources: sourceIds,
  });

/**
 * Input for creating a deck. `id` must be a lowercase slug; `pets` and
 * `notes` default to `[]` when omitted, and an omitted `dailyDungeon`
 * means none. The
 * deck must keep the daily dungeon rules (see `dailyDeckProblem`). The
 * obsolete lifecycle isn't accepted: a record's import sets it.
 */
export const deckInput = deckFields
  .extend({
    id: deckSlug,
    pets: nameList.default([]),
    notes: z.array(deckNoteInput).default([]),
    dailyDungeon: deckDailyRunInput.nullish(),
  })
  .superRefine((deck, ctx) => {
    const problem = dailyDeckProblem({
      mode: deck.mode ?? "guild_conquest",
      cookies: deck.cookies.map((cookie) => cookie.cookieKr),
      run: deck.dailyDungeon ?? null,
    });
    if (problem) ctx.addIssue({ code: "custom", message: problem, path: ["dailyDungeon"] });
  });
/** Output of {@link deckInput}. */
export type DeckInput = z.output<typeof deckInput>;

/**
 * Patch for updating a deck. Every field is optional; omitted fields stay
 * unset. The obsolete lifecycle isn't accepted: a record's import sets it.
 */
export const deckPatch = deckFields.partial();
/** Output of {@link deckPatch}. */
export type DeckPatch = z.output<typeof deckPatch>;

/**
 * Input for creating a rune build: the decks it applies to and the sources
 * that support it. `decks` defaults to `[]` when omitted. The obsolete
 * lifecycle isn't accepted: a record's import sets it.
 */
export const runeBuildInput = runeBuildInsert.omit({ id: true, ...LIFECYCLE }).extend({
  decks: z.array(deckSlug).default([]),
  sources: sourceIds,
});
/** Output of {@link runeBuildInput}. */
export type RuneBuildInput = z.output<typeof runeBuildInput>;

/**
 * Patch for updating a rune build. Every field, including `decks` and
 * `sources`, is optional. The obsolete lifecycle isn't accepted: a
 * record's import sets it.
 */
export const runeBuildPatch = runeBuildInsert
  .omit({ id: true, ...LIFECYCLE })
  .extend({ decks: z.array(deckSlug), sources: sourceIds })
  .partial();
/** Output of {@link runeBuildPatch}. */
export type RuneBuildPatch = z.output<typeof runeBuildPatch>;

/** The column values of an input without its citations. */
export type Values<I> = Omit<I, "sources">;
