import type { SourceIndex } from "../lib/sources";
import { Clamp } from "./Clamp";
import { Pill } from "./Pill";
import { StancePill } from "./RuneBuilds";
import { SourceChips } from "./SourceChips";

/** The board's slot ids, in the order the in-game equipment screen shows them (2×2). */
export const GEAR_SLOTS = ["top_left", "top_right", "bottom_left", "bottom_right"] as const;

/** A slot on the board. */
export type BoardSlot = (typeof GEAR_SLOTS)[number];

/** Default display name per slot. */
export const GEAR_SLOT_NAMES: Readonly<Record<BoardSlot, string>> = {
  top_left: "Top-left · weapons (sword, bow, staff)",
  top_right: "Top-right · accessories (necklace, ring, brooch)",
  bottom_left: "Bottom-left · armour (helmet, armour, shield)",
  bottom_right: "Bottom-right · special (magic item, book, food)",
};

/** One gear recommendation; `/api/gear-recs` rows fit as they are. */
export interface GearEntry {
  id: number;
  /** A {@link BoardSlot}, or any other value (e.g. "general") for notes off the board. */
  slot: string;
  substats: string;
  why?: string | null;
  /** Game mode the recommendation is for, shown as a chip (e.g. "raid"). */
  context?: string | null;
  sources?: readonly string[] | null;
}

/** Props for {@link GearBoard}. */
export interface GearBoardProps {
  /** Recommendations; entries whose slot isn't on the board are ignored (see {@link generalGear}). */
  gear: readonly GearEntry[];
  /** Id → URL/title for the source chips. */
  sources: SourceIndex;
  /** Display names per slot; defaults to {@link GEAR_SLOT_NAMES}. */
  slotNames?: Partial<Record<BoardSlot, string>>;
  /** The page's own gear preset (e.g. "raid"); recommendations for another are greyed. */
  primary?: string | null;
}

/**
 * The entries that don't belong to one of the board's slots (general notes).
 *
 * @param gear - recommendations
 * @returns the entries whose slot isn't in {@link GEAR_SLOTS}, in input order
 */
export function generalGear<G extends GearEntry>(gear: readonly G[]): G[] {
  return gear.filter((g) => !(GEAR_SLOTS as readonly string[]).includes(g.slot));
}

/**
 * One gear recommendation as a row, verdict first: the recommended or avoid
 * pill, the substats and the preset (context) chip, then the reason cut to
 * one line, then the sources at the end. A recommendation for another
 * preset than the page's `primary` one is marked "<context> only" instead
 * of the verdict and greyed.
 *
 * @param props - the recommendation, the source index, and the page's own gear preset, if it has one
 * @returns the row
 */
export function GearRow({
  g,
  sources,
  primary,
}: {
  g: GearEntry;
  sources: SourceIndex;
  primary?: string | null;
}) {
  const other = primary != null && g.context != null && g.context !== primary;
  return (
    <div className={other ? "gear-rec other" : "gear-rec"}>
      <div className="gear-top">
        {other ? <Pill kind="legacy">{g.context} only</Pill> : <StancePill text={g.substats} />}
        <span className="stat">{g.substats}</span>
        {g.context && !other ? <span className="chip ctx">{g.context}</span> : null}
      </div>
      {g.why ? (
        <div className="gear-why muted">
          <Clamp lines={1}>{g.why}</Clamp>
        </div>
      ) : null}
      <SourceChips ids={g.sources} sources={sources} max={2} />
    </div>
  );
}

/**
 * The 2×2 gear board with each slot's substat recommendations as
 * {@link GearRow}s; empty slots say "No data yet."
 *
 * @param props - the gear recommendations, the source index, optional slot names and the page's own preset
 * @returns the board
 */
export function GearBoard({ gear, sources, slotNames, primary }: GearBoardProps) {
  return (
    <div className="gearboard">
      {GEAR_SLOTS.map((slot) => {
        const rows = gear.filter((g) => g.slot === slot);
        return (
          <div className="gslot" key={slot}>
            <div className="label">{slotNames?.[slot] ?? GEAR_SLOT_NAMES[slot]}</div>
            {rows.length ? (
              rows.map((g) => <GearRow key={g.id} g={g} sources={sources} primary={primary} />)
            ) : (
              <div className="muted">No data yet.</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
