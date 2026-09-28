import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { gearRecsQuery } from "../api/queries";
import type { ModeSection } from "../app/modes";
import { EmptyState } from "../components/EmptyState";
import { GearBoard, generalGear } from "../components/GearBoard";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { ModeViewHeader } from "./ModeViewHeader";

/**
 * A mode's gear substats laid out like the equipment screen, each with its
 * context, when any row sits on the board, plus a card of the general
 * (off-board) notes, each with its context, when there are any. With no
 * gear at all it says so instead.
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
          const general = generalGear(rows);
          return (
            <>
              {general.length < rows.length ? <GearBoard gear={rows} sources={sources} /> : null}
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
            </>
          );
        }}
      </QueryResult>
    </>
  );
}
