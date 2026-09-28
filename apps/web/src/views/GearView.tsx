import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { gearRecsQuery } from "../api/queries";
import type { ModeSection } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { GEAR_SLOT_NAMES, GearBoard, generalGear } from "../components/GearBoard";
import { ObsoleteNotice } from "../components/ObsoleteNotice";
import { ObsoleteSection } from "../components/ObsoleteSection";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { splitObsolete } from "../lib/obsolete";
import { ModeViewHeader } from "./ModeViewHeader";

/**
 * A mode's gear substats laid out like the equipment screen, each with its
 * context, when any current row sits on the board, plus a card of the
 * general (off-board) notes, each with its context, when there are any.
 * Obsolete recommendations stay off the board; they end the page in the
 * collapsed Obsolete section, each under its notice. With no gear at all
 * it says so instead, and with only obsolete gear it says there is no
 * current gear above the section.
 *
 * @param mode - the mode whose gear and copy the view shows
 * @returns the gear view
 */
export function GearView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const gear = useQuery(gearRecsQuery(mode.scope));
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
                <GearBoard gear={current} sources={sources} />
              ) : null}
              {general.length ? (
                <div className="card">
                  <h3>General gear notes</h3>
                  {general.map((g) => (
                    <div key={g.id}>
                      <b>{g.substats}</b>
                      {g.why ? (
                        <>
                          {" · "}
                          <span className="muted">{g.why}</span>
                        </>
                      ) : null}{" "}
                      <span className="chip">{g.context}</span>{" "}
                      <SourceChips ids={g.sources} sources={sources} />
                    </div>
                  ))}
                </div>
              ) : null}
              {current.length ? null : <EmptyState>No current gear.</EmptyState>}
              <ObsoleteSection id="gear-obsolete" latest={obsolete[0]?.obsoleteSince ?? null}>
                {obsolete.map((g) => (
                  <div key={g.id} className="obsolete-item">
                    <ObsoleteNotice
                      since={g.obsoleteSince!}
                      reason={g.obsoleteReason}
                      sources={g.obsoleteSources}
                      sourceIndex={sources}
                    />
                    <div>
                      <b>{g.substats}</b>{" "}
                      <span className="muted">
                        ·{" "}
                        {(GEAR_SLOT_NAMES as Readonly<Record<string, string>>)[g.slot] ?? "General"}
                      </span>{" "}
                      <span className="chip">{g.context}</span>
                    </div>
                    {g.why ? <div className="muted">{g.why}</div> : null}
                    <SourceChips ids={g.sources} sources={sources} />
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
