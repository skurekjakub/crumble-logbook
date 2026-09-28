import { useState } from "react";
import { formatG, formatRatio, ratio } from "../lib/format";
import { EmptyState } from "./EmptyState";

/** The chart's viewBox size and the margins around the plot box, in SVG units. */
export const PLOT = {
  width: 760,
  height: 380,
  margin: { l: 58, r: 64, t: 16, b: 42 },
} as const;

/** 배 multiples drawn as dashed reference lines, where they cross the plot box. */
export const ISO_RATIOS = [50, 100, 300, 1000, 2000] as const;

/** A score as the scatter reads it; `/api/scores` rows fit as they are. */
export interface ScatterPoint {
  damageG: number;
  powerG: number | null;
  /** Screenshot-backed (solid dot) rather than claimed in text (faded dot). */
  verified: boolean;
  /** The stored 배, used in the tooltip when it can't be computed. */
  ratio?: number | null;
}

/** Props for {@link Scatter}. */
export interface ScatterProps<P extends ScatterPoint> {
  /** Scores to plot; those without positive damage and power are skipped. */
  points: readonly P[];
  /** The point's fill, e.g. its deck's `var(--sN)` series colour. */
  color: (p: P) => string;
  /** The tooltip line under the numbers, and the end of the point's accessible name, e.g. "Cherry deck · screenshot". */
  label: (p: P) => string;
}

const lg = Math.log10;
const { width: W, height: H, margin: M } = PLOT;

/** A plottable point with its SVG coordinates. */
interface Placed<P> {
  p: P;
  cx: number;
  cy: number;
}

/**
 * Lays out the chart: log-scale axes padded around the data, ticks every
 * half decade of power and every decade of damage, and each iso line
 * clipped to the plot box.
 *
 * @param points - the plottable points; at least one
 * @returns the value-to-SVG scales `X` and `Y`, the tick values, and each
 *   iso line's ratio and end powers
 */
function layout<P extends ScatterPoint & { powerG: number }>(points: readonly P[]) {
  const xs = points.map((p) => lg(p.powerG));
  const ys = points.map((p) => lg(p.damageG));
  const x0 = Math.floor(Math.min(...xs) * 2) / 2 - 0.25;
  const x1 = Math.ceil(Math.max(...xs) * 2) / 2 + 0.25;
  const y0 = Math.floor(Math.min(...ys)) - 0.1;
  const y1 = Math.ceil(Math.max(...ys) + 0.05);
  /**
   * Maps a team power onto the plot's x axis.
   *
   * @param v - power, in billions
   * @returns the SVG x coordinate
   */
  const X = (v: number) => M.l + ((lg(v) - x0) / (x1 - x0)) * (W - M.l - M.r);
  /**
   * Maps a damage onto the plot's y axis.
   *
   * @param v - damage, in billions
   * @returns the SVG y coordinate
   */
  const Y = (v: number) => H - M.b - ((lg(v) - y0) / (y1 - y0)) * (H - M.t - M.b);

  const xTicks: number[] = [];
  const yTicks: number[] = [];
  for (let e = Math.ceil(x0 * 2) / 2; e <= x1; e += 0.5) xTicks.push(10 ** e);
  for (let e = Math.ceil(y0); e <= y1; e++) yTicks.push(10 ** e);

  // y = r·x is a straight line in log space; clip its ends to the plot box.
  const iso = ISO_RATIOS.flatMap((r) => {
    let a = x0;
    let b = x1;
    if (lg(r) + a < y0) a = y0 - lg(r);
    if (lg(r) + b > y1) b = y1 - lg(r);
    return a < b ? [{ r, pa: 10 ** a, pb: 10 ** b }] : [];
  });

  return { X, Y, xTicks, yTicks, iso };
}

/**
 * Log–log scatter of damage against team power, with dashed 배 reference
 * lines and a tooltip on hover or keyboard focus. Solid dots are
 * screenshot-backed; faded dots are claims. Each point is focusable and
 * named by its damage, power, 배 and `label`. Shows an empty state when no
 * point has both damage and power.
 *
 * @param props - the points, and each point's colour and label
 * @returns the chart and its tooltip, or the empty state
 */
export function Scatter<P extends ScatterPoint>({ points, color, label }: ScatterProps<P>) {
  const [active, setActive] = useState<number | null>(null);
  const plottable = points.filter(
    (p): p is P & { powerG: number } => p.damageG > 0 && p.powerG != null && p.powerG > 0,
  );
  if (!plottable.length) return <EmptyState>No scores with both damage and power yet.</EmptyState>;

  const { X, Y, xTicks, yTicks, iso } = layout(plottable);
  const placed: Placed<P>[] = plottable.map((p) => ({ p, cx: X(p.powerG), cy: Y(p.damageG) }));
  const midY = (M.t + H - M.b) / 2;
  const tip = active != null ? placed[active] : undefined;

  return (
    <div className="chart">
      {/* A group, not an image: an image's descendants are hidden from assistive tech, and the points are focusable. */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="group"
        aria-label="Posted raid scores: damage against team power"
      >
        <g className="grid" aria-hidden="true">
          {yTicks.map((v) => (
            <line key={v} x1={M.l} x2={W - M.r} y1={Y(v)} y2={Y(v)} />
          ))}
        </g>
        <g>
          {yTicks.map((v) => (
            <text key={`y${v}`} x={M.l - 8} y={Y(v) + 4} textAnchor="end">
              {formatG(v)}
            </text>
          ))}
          {xTicks.map((v) => (
            <text key={`x${v}`} x={X(v)} y={H - M.b + 18} textAnchor="middle">
              {formatG(v)}
            </text>
          ))}
          <text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle">
            team power
          </text>
          <text x={14} y={midY} textAnchor="middle" transform={`rotate(-90 14 ${midY})`}>
            damage
          </text>
        </g>
        <g className="iso">
          {iso.map(({ r, pa, pb }) => (
            <g key={r}>
              <line x1={X(pa)} y1={Y(r * pa)} x2={X(pb)} y2={Y(r * pb)} />
              <text x={X(pb) + 4} y={Y(r * pb) + 4}>
                {r}배
              </text>
            </g>
          ))}
        </g>
        {placed.map(({ p, cx, cy }, i) => (
          <circle
            key={`dot${i}`}
            aria-hidden="true"
            className={p.verified ? "dot" : "dot claimed"}
            cx={cx}
            cy={cy}
            r={5.5}
            style={{ fill: color(p) }}
          />
        ))}
        {placed.map(({ p, cx, cy }, i) => (
          <circle
            key={`hit${i}`}
            className="hit"
            cx={cx}
            cy={cy}
            r={13}
            tabIndex={0}
            role="img"
            aria-label={`${formatG(p.damageG)} at ${formatG(p.powerG)} power, ${formatRatio(ratio(p))}배: ${label(p)}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
          />
        ))}
      </svg>
      {/* The svg fills the chart box at the viewBox's aspect ratio, so viewBox
          coordinates convert to box percentages without measuring the DOM. */}
      <div
        className="tip"
        hidden={!tip}
        style={tip ? { left: `${(tip.cx / W) * 100}%`, top: `${(tip.cy / H) * 100}%` } : undefined}
      >
        {tip && (
          <>
            <b>{formatG(tip.p.damageG)}</b> at {formatG(tip.p.powerG)} power ·{" "}
            {formatRatio(ratio(tip.p))}배
            <br />
            {label(tip.p)}
          </>
        )}
      </div>
    </div>
  );
}
