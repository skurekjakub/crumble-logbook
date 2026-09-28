import type { DataPointKind, StepBasis } from "@crumble/schema";
import { BASIS_LABELS, KIND_LABELS } from "../lib/team-power";

/** Props for {@link BasisMark}. */
export interface BasisMarkProps {
  /** What a ranked step's place rests on, or how a data point is known. */
  basis: StepBasis | DataPointKind;
  /** The record's own wording of the basis, shown after the mark when it says more. */
  note?: string | null;
}

/**
 * How a figure or a step's place is known, as a mark whose fill says it: solid
 * for posted, hatched for claimed, dashed for unmeasured or inferred, an
 * outline for the community's order. Only a solid mark stands for a
 * player's own measurement.
 *
 * @param props - the basis and the record's note on it
 * @returns the mark, with the note after it when there is one
 */
export function BasisMark({ basis, note }: BasisMarkProps) {
  const label = basis === "inferred" ? KIND_LABELS.inferred : BASIS_LABELS[basis];
  return (
    <span className="basis">
      <span className={`mark ${basis}`}>{label}</span>
      {note && note.toLowerCase() !== label.toLowerCase() ? (
        <span className="basis-note">{note}</span>
      ) : null}
    </span>
  );
}

/**
 * The key to the basis marks, for a page that ranks steps.
 *
 * @returns the legend
 */
export function BasisLegend() {
  return (
    <div className="legend-row" aria-label="How each step is known">
      <span>
        <span className="mark posted">{BASIS_LABELS.posted}</span> a player's own before-and-after
        figure
      </span>
      <span>
        <span className="mark claimed">{BASIS_LABELS.claimed}</span> stated, not measured
      </span>
      <span>
        <span className="mark unmeasured">{BASIS_LABELS.unmeasured}</span> nobody measured it
      </span>
      <span>
        <span className="mark community">{BASIS_LABELS.community}</span> the community's stated
        order
      </span>
    </div>
  );
}
