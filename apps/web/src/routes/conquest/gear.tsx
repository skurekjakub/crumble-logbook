import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useSourceIndex } from "../../api/hooks";
import { gearRecsQuery } from "../../api/queries";
import { GearBoard, generalGear } from "../../components/GearBoard";
import { QueryResult } from "../../components/QueryResult";
import { SourceChips } from "../../components/SourceChips";

export const Route = createFileRoute("/conquest/gear")({
  component: GearView,
});

/**
 * Gear substats laid out like the equipment screen, each with its raid or
 * arena context, plus a card of the general (off-board) notes when there
 * are any. With no data every slot says "No data yet."
 */
function GearView() {
  const sources = useSourceIndex();
  const gear = useQuery(gearRecsQuery());
  return (
    <>
      <div>
        <h2>Gear substats</h2>
        <p className="lede">
          Laid out like the equipment screen. Since the 9/23 patch raid gear has its own preset, so
          it doesn't have to double as arena gear.
        </p>
      </div>
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
