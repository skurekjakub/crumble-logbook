import type { Auto } from "../lib/daily-dungeon";
import { AUTO_BADGE, dungeonChipName, elementKey } from "../lib/daily-dungeon";
import { compactPower } from "../lib/stage";

/** A daily dungeon deck's run facts as the chips read them; the API's `dailyDungeon` fits as it is. */
export interface DailyRun {
  dungeon: string;
  auto: Auto;
  stage: number | null;
  power: string | null;
  powerG: number | null;
  recommendedPower: string | null;
  recommendedPowerG: number | null;
  gearPreset: string | null;
}

/** Props for {@link AutoBadge}. */
export interface AutoBadgeProps {
  /** How far the run plays itself; null or undefined renders nothing. */
  auto: Auto | null | undefined;
}

/**
 * How far a daily dungeon run plays itself, as a badge: AUTO (good),
 * SEMI-AUTO (caution) or MANUAL (quiet).
 *
 * @param props - the run's auto
 * @returns the badge, or null without one
 */
export function AutoBadge({ auto }: AutoBadgeProps) {
  if (!auto) return null;
  const { label, tone } = AUTO_BADGE[auto];
  return (
    <span className={`dd-auto t-${tone}`} title={`Auto: ${auto}`}>
      {label}
    </span>
  );
}

/**
 * A run's power against the stage's recommended power, as chips: the team
 * power the short way, then the recommended one, marked "rec"; each only
 * when posted.
 *
 * @param props - the run facts' powers
 * @returns the chips, or null when neither is posted
 */
export function PowerChips({
  run,
}: {
  run: Pick<DailyRun, "power" | "powerG" | "recommendedPower" | "recommendedPowerG">;
}) {
  if (run.power === null && run.recommendedPower === null) return null;
  return (
    <>
      {run.power !== null ? (
        <span className="chip dd-power" title={`Team power ${run.power}`}>
          {compactPower(run.power, run.powerG)}
        </span>
      ) : null}
      {run.recommendedPower !== null ? (
        <span className="chip dd-power rec" title={`Recommended power ${run.recommendedPower}`}>
          rec {compactPower(run.recommendedPower, run.recommendedPowerG)}
        </span>
      ) : null}
    </>
  );
}

/** The daily dungeon a deck runs, as its run chips name it. */
export interface RunDungeon {
  /** The dungeon's English name, e.g. `EXP Dungeon`. */
  nameEn: string;
  /** Its boss's element as the record names it, or `null` when unknown. */
  bossElement: string | null;
}

/** Props for {@link RunChips}. */
export interface RunChipsProps {
  /** The run facts. */
  run: DailyRun;
  /** The dungeon `run.dungeon` names, or undefined when it isn't loaded: the chip then shows the slug. */
  dungeon?: RunDungeon | undefined;
}

/**
 * A daily dungeon deck's run facts as chips: the dungeon it runs first,
 * its dot the boss's element, then its auto badge, the stage it reached,
 * its power against the recommended power, and its gear preset.
 *
 * @param props - the run facts and the dungeon they name
 * @returns the chips
 */
export function RunChips({ run, dungeon }: RunChipsProps) {
  const element = elementKey(dungeon?.bossElement) ?? "none";
  return (
    <span className="chips dd-run">
      <span
        className={`chip dd-dungeon el-${element}`}
        title={`Daily dungeon: ${dungeon?.nameEn ?? run.dungeon}`}
      >
        {dungeon ? dungeonChipName(dungeon.nameEn) : run.dungeon}
      </span>
      <AutoBadge auto={run.auto} />
      {run.stage !== null ? (
        <span className="chip dd-stage" title="Stage reached">
          Stage {run.stage}
        </span>
      ) : null}
      <PowerChips run={run} />
      {run.gearPreset !== null ? (
        <span className="chip dd-gear" title={`Gear preset: ${run.gearPreset}`}>
          {run.gearPreset}
        </span>
      ) : null}
    </span>
  );
}
