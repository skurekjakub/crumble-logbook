import { shortName } from "../lib/cookie-icons";
import { CookieIcon } from "./CookieIcon";

/** One cookie slot of a {@link Lineup}; a deck's `cookies[]` entries fit as they are. */
export interface LineupCookie {
  cookieKr: string;
  en: string | null;
  level: string | null;
  stars: string | null;
  /** A short note shown under the name and as the slot's tooltip. */
  note?: string | null;
  /** Whether the cookie captains the team: its portrait then wears a crown. */
  captain?: boolean;
}

/** Props for {@link Lineup}. */
export interface LineupProps {
  /** Slots in formation order. An empty list renders nothing. */
  cookies: readonly LineupCookie[];
}

/**
 * Classifies a slot by level: "max" for Lv.100, "filler" for a deliberate Lv.1.
 *
 * @param level - the slot's level as stored, or null
 * @returns the CSS modifier for the slot, or "" for any other level
 */
export function slotKind(level: string | null | undefined): "" | "max" | "filler" {
  if (level === "1") return "filler";
  if (level === "100") return "max";
  return "";
}

/**
 * One cookie's slot: the portrait with the level and star count on it (and
 * a crown when it captains the team), the short English name (the full one
 * in the tooltip), and the Korean name and note beneath. Stars show only
 * when they're a plain number; free text ("?", "~7 (inferred …)") is left
 * to the levels table.
 *
 * @param props - the cookie, and the slot element's id when it needs one
 * @returns the slot
 */
export function LineupSlot({ cookie: c, slotId }: { cookie: LineupCookie; slotId?: string }) {
  const kind = slotKind(c.level);
  const lv = c.level != null && c.level !== "" ? `Lv.${c.level}` : "";
  const stars = c.stars && /^\d+$/.test(c.stars) ? ` · ${c.stars}★` : "";
  const sub = [c.en ? c.cookieKr : "", c.note ?? ""].filter(Boolean).join(" · ");
  const tip = [c.en, c.captain ? "captain" : null, c.note].filter(Boolean).join(" — ");
  const classes = ["slot", kind, c.captain ? "captain" : ""].filter(Boolean).join(" ");
  return (
    <div className={classes} title={tip} data-slot={slotId}>
      <span className="pic">
        <CookieIcon kr={c.cookieKr} en={c.en} size={40} />
        {c.captain ? (
          <span className="crown" role="img" aria-label="Captain">
            ♛
          </span>
        ) : null}
      </span>
      <span className="lv">
        {lv}
        {stars}
      </span>
      <span className="nm">{c.en ? shortName(c.en) : c.cookieKr}</span>
      <span className="sub">{sub}</span>
    </div>
  );
}

/**
 * The team grid, laid out like the in-game formation screen (6 per row, 3 on phones).
 *
 * @param props - the slots, in formation order
 * @returns the grid, or null for an empty team
 */
export function Lineup({ cookies }: LineupProps) {
  if (!cookies.length) return null;
  return (
    <div className="lineup">
      {cookies.map((c, i) => (
        <LineupSlot key={`${i}-${c.cookieKr}`} cookie={c} />
      ))}
    </div>
  );
}

/**
 * The legend for the {@link Lineup} slot styles: Lv.100 carry or buffer, Lv.1 filler.
 *
 * @returns the legend row
 */
export function LineupLegend() {
  return (
    <div className="legend-row">
      <span>
        <i
          className="sw"
          style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)" }}
        />
        Lv.100 carry or buffer
      </span>
      <span>
        <i
          className="sw"
          style={{
            background:
              "repeating-linear-gradient(135deg,var(--surface-2) 0 3px,var(--surface) 3px 6px)",
            border: "1px dashed var(--ink-3)",
          }}
        />
        Lv.1 filler
      </span>
    </div>
  );
}
