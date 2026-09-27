import { useQuery } from "@tanstack/react-query";
import { useSourceIndex } from "../api/hooks";
import { gearRecsQuery } from "../api/queries";
import type { ModeSection } from "../app/modes";
import { GearBoard, generalGear } from "../components/GearBoard";
import { QueryResult } from "../components/QueryResult";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";

/**
 * A mode's gear substats laid out like the equipment screen, each with its
 * context, plus a card of the general (off-board) notes when there are any.
 * With no data every slot says "No data yet."
 *
 * @param mode - the mode whose gear and copy the view shows
 */
export function GearView({ mode }: { mode: ModeSection }) {
  const sources = useSourceIndex();
  const gear = useQuery(gearRecsQuery(mode.scope));
  return (
    <>
      <ViewHeader title={mode.copy.gear?.title ?? "Gear"} lede={mode.copy.gear?.lede} />
      <QueryResult query={gear} resource="gear recommendations">
        {(rows) => {
          const general = generalGear(rows);
          return (
            <>
              <GearBoard gear={rows} sources={sources} />
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
