import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { gearRecsQuery } from "../api/queries";
import type { ModeSection } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { GEAR_SLOT_NAMES, GearBoard, GearRow, generalGear } from "../components/GearBoard";
import { ObsoleteNotice } from "../components/ObsoleteNotice";
import { ObsoleteSection } from "../components/ObsoleteSection";
import { QueryResult } from "../components/QueryResult";
import { splitObsolete } from "../lib/obsolete";
import { ModeViewHeader } from "./ModeViewHeader";

/**
 * A mode's gear substats laid out like the equipment screen, each with its
 * context, when any current row sits on the board, plus a card of the
 * general (off-board) notes, each with its context, when there are any.
 * Obsolete recommendations stay off the board; they end the page in the
 * collapsed Obsolete section, each under its notice. With no gear at all
 * it says so instead, and with only obsolete gear it says there is no
 * current gear above the section. Each recommendation leads with its
 * verdict pill; on a mode with a boss, one for another gear preset than the
 * boss's is greyed as "<preset> only".
 *
 * @param mode - the mode whose gear and copy the view shows
 * @returns the gear view
 */
export function GearView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const gear = useQuery(gearRecsQuery(mode.scope));
  const primary = mode.boss?.gearContext ?? null;
  return (
    <>
      <ModeViewHeader mode={mode} view="gear" fallbackTitle="Gear" />
      <QueryResult query={gear} resource="gear recommendations">
        {(rows) => {
          if (!rows.length) return <EmptyState>No gear recorded yet.</EmptyState>;
          const { current, obsolete } = splitObsolete(rows);
          const general = generalGear(current);
          return (
            <>
              {general.length < current.length ? (
                <GearBoard gear={current} sources={sources} primary={primary} />
              ) : null}
              {general.length ? (
                <div className="card gear-notes">
                  <h3>General gear notes</h3>
                  {general.map((g) => (
                    <GearRow key={g.id} g={g} sources={sources} primary={primary} />
                  ))}
                </div>
              ) : null}
              {current.length ? null : <EmptyState>No current gear.</EmptyState>}
              <ObsoleteSection id="gear-obsolete" latest={obsolete[0]?.obsoleteSince ?? null}>
                {obsolete.map((g) => (
                  <div key={g.id} className="card obsolete-item">
                    <ObsoleteNotice
                      since={g.obsoleteSince!}
                      reason={g.obsoleteReason}
                      sources={g.obsoleteSources}
                      sourceIndex={sources}
                    />
                    <div className="label">
                      {(GEAR_SLOT_NAMES as Readonly<Record<string, string>>)[g.slot] ?? "General"}
                    </div>
                    <GearRow g={g} sources={sources} />
                  </div>
                ))}
              </ObsoleteSection>
            </>
          );
        }}
      </QueryResult>
    </>
  );
}
