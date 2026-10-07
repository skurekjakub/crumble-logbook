import type { BossConfig } from "../../app/modes";
import type { BuffStarRow, BuffValueLike } from "../../lib/buffs";
import { effectName, formatPct, pivotBuffs } from "../../lib/buffs";
import type { SourceIndex } from "../../lib/sources";
import { EmptyState } from "../EmptyState";
import type { RuneBuildLike } from "../RuneBuilds";
import { RuneCard } from "../RuneBuilds";
import { SourceChips } from "../SourceChips";
import type { MechanicLike } from "./notes";
import { MechanicNote } from "./notes";

/** Props for {@link WhatToRun}. */
export interface WhatToRunProps {
  /** The boss screen's config; names the haste carry and the debuffer. */
  boss: BossConfig;
  /** The rune builds of the boss's deck. */
  builds: readonly RuneBuildLike[];
  /** The haste carry's breakpoint mechanics, shown on its card. */
  haste: readonly MechanicLike[];
  /** The debuffer's buff values; its application chance is shown on its card. */
  debufferBuffs: readonly BuffValueLike[];
  /** The id of the buff table's heading, which the debuffer's card links to. */
  buffTableId: string;
  /** Id → URL/title for the source chips. */
  sources: SourceIndex;
}

/**
 * Rune guidance for the boss's deck: one card per cookie, reason first,
 * with the haste carry's breakpoint and the debuffer's base application
 * chance on their cards where the data has them.
 *
 * @param props - the boss config, the deck's rune builds, the haste mechanics, the debuffer's buff values, the buff table's heading id, and the source index
 * @returns the cards, or an empty state when the deck has no builds
 */
export function WhatToRun({
  boss,
  builds,
  haste,
  debufferBuffs,
  buffTableId,
  sources,
}: WhatToRunProps) {
  if (!builds.length) return <EmptyState>No rune builds recorded for this deck yet.</EmptyState>;
  const chance = pivotBuffs(debufferBuffs).find((r) => r.chance);
  return (
    <div className="grid g2">
      {builds.map((b) => (
        <RuneCard key={b.id} build={b} sources={sources} headingLevel={4}>
          {b.cookieKr === boss.hasteKr
            ? haste.map((m) => <MechanicNote key={m.id} m={m} sources={sources} />)
            : null}
          {b.cookieKr === boss.debufferKr && chance ? (
            <ChanceNote chance={chance} buffTableId={buffTableId} sources={sources} />
          ) : null}
        </RuneCard>
      ))}
    </div>
  );
}

/**
 * A debuff's base application chance by star, pointing to the chance formula in the buff section.
 *
 * @param props - the debuff's star row, the buff table's heading id, and the source index
 * @returns the note
 */
function ChanceNote({
  chance,
  buffTableId,
  sources,
}: {
  chance: BuffStarRow;
  buffTableId: string;
  sources: SourceIndex;
}) {
  const values = [...new Set(Object.values(chance.byStar))];
  return (
    <div className="boss-note">
      <div>
        {effectName(chance.effectType)} base chance:{" "}
        {values.length === 1 ? (
          <>
            <b>{formatPct(values[0])}</b> at every star.
          </>
        ) : (
          <>
            <b>{values.map(formatPct).join(" → ")}</b> by star.
          </>
        )}
      </div>
      <div className="muted">
        Focus and resist: <a href={`#${buffTableId}`}>Buffs by star</a>
      </div>
      <SourceChips ids={chance.sources} sources={sources} max={2} />
    </div>
  );
}
