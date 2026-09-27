import type { CSSProperties } from "react";
import { formationGrid } from "../lib/formation";
import type { LineupCookie } from "./Lineup";
import { Lineup, LineupSlot } from "./Lineup";

/** One cookie of a {@link Formation}: a lineup slot plus its formation position. */
export interface FormationCookie extends LineupCookie {
  /** The position, `row<R>-<C>`; null or other text when unknown. */
  slot: string | null;
}

/** Props for {@link Formation}. */
export interface FormationProps {
  /** The team's cookies, in any order. */
  cookies: readonly FormationCookie[];
}

/**
 * Whether any cookie has a readable formation slot, i.e. whether a
 * {@link Formation} has anything to lay out.
 *
 * @param cookies - a team's cookies
 */
export function hasFormation(cookies: readonly FormationCookie[]): boolean {
  return formationGrid(cookies, (c) => c.slot).rows.length > 0;
}

/**
 * The team laid out as the formation screen: rows top to bottom, columns
 * from the back line (left) to the front (right), empty cells dashed. On a
 * phone the grid turns a quarter: each row becomes a column, back line on
 * top. Cookies
 * without a readable slot follow as a plain lineup. Renders nothing when no
 * cookie has a slot.
 */
export function Formation({ cookies }: FormationProps) {
  const { rows, unplaced } = formationGrid(cookies, (c) => c.slot);
  if (!rows.length) return null;
  return (
    <>
      <div className="formation">
        <div
          className="formation-grid"
          style={{ "--formation-cols": rows[0]!.length } as CSSProperties}
        >
          {rows.map((row, r) => (
            <div className="formation-row" key={r}>
              {row.map((c, col) =>
                c ? (
                  <LineupSlot key={col} cookie={c} slotId={c.slot ?? undefined} />
                ) : (
                  <div key={col} className="slot open" aria-hidden="true" />
                ),
              )}
            </div>
          ))}
        </div>
        <div className="formation-axis label" aria-hidden="true">
          <span className="back">Back</span>
          <span className="front">Front</span>
        </div>
      </div>
      {unplaced.length ? (
        <>
          <div className="label">No slot recorded</div>
          <Lineup cookies={unplaced} />
        </>
      ) : null}
    </>
  );
}
