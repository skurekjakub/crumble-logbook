import type { Auto } from "../lib/daily-dungeon";
import { AUTO_BADGE } from "../lib/daily-dungeon";
import { compactPower } from "../lib/stage";

/** A daily dungeon deck's run facts as the chips read them; the API's `dailyDungeon` fits as it is. */
export interface DailyRun {
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

/**
 * A daily dungeon deck's run facts as chips: its auto badge, the stage it
 * reached, its power against the recommended power, and its gear preset.
 *
 * @param props - the run facts
 * @returns the chips
 */
export function RunChips({ run }: { run: DailyRun }) {
  return (
    <span className="chips dd-run">
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
