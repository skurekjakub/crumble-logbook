import type { ReactNode } from "react";
import { shareRanks } from "../lib/usage";

/** One bar of a {@link UsageBars} list. */
export interface UsageBar {
  /** A stable React key. */
  key: string | number;
  /** The subject's name, e.g. a portrait and name; drawn over its bar. */
  label: ReactNode;
  /** A line under the bar, e.g. a core's members. */
  detail?: ReactNode;
  /** The share, 0–100. */
  pct: number;
  /** The share whose every member was seen, 0–100, drawn inside the bar; null when not counted. */
  confirmedPct: number | null;
  /** A caveat under the bar, e.g. that the figure is a bound. */
  note?: ReactNode;
  /** Trailing content, e.g. source chips. */
  extra?: ReactNode;
}

/** Props for {@link UsageBars}. */
export interface UsageBarsProps {
  bars: readonly UsageBar[];
}

/**
 * Formats a share for display: "97%", "64.5%".
 *
 * @param pct - a share, 0–100
 * @returns the share rounded to one decimal, with a `%` sign
 */
export function formatPct(pct: number): string {
  return `${Math.round(pct * 10) / 10}%`;
}

/** The most bars that may share first place and still be set apart as the top. */
const TOP_TIE = 3;

/**
 * Clamps a share to a bar width.
 *
 * @param pct - a share
 * @returns the share as a CSS width between 0% and 100%
 */
const width = (pct: number) => `${Math.min(100, Math.max(0, pct))}%`;

/**
 * A ranked list of usage bars: each row is its rank, then the subject's
 * name drawn over a bar filled to its share, then the share in large type.
 * The top rank stands out, unless a crowd shares it. A confirmed share draws as a solid strip along
 * the bar's foot and is stated in words under the share. Notes and extras
 * follow the bar on a quiet line.
 *
 * @param props - the bars, in display order
 * @returns the list
 */
export function UsageBars({ bars }: UsageBarsProps) {
  const ranks = shareRanks(bars.map((b) => b.pct));
  // A first place shared by a crowd marks nothing out, so only a narrow lead is set apart.
  const leaders = ranks.filter((r) => r === 1).length;
  const marked = leaders <= TOP_TIE && leaders < bars.length;
  return (
    <ol className="bars">
      {bars.map((b, i) => {
        const rank = ranks[i]!;
        const confirmed = b.confirmedPct == null ? "" : `, ${formatPct(b.confirmedPct)} confirmed`;
        return (
          <li
            key={b.key}
            className={marked && rank === 1 ? "bar-row top" : "bar-row"}
            title={`#${rank}: ${formatPct(b.pct)}${confirmed}`}
          >
            <span className="bar-rank" aria-label={`rank ${rank}`}>
              {rank}
            </span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: width(b.pct) }} aria-hidden="true" />
              {b.confirmedPct == null ? null : (
                <div
                  className="bar-confirmed"
                  style={{ width: width(b.confirmedPct) }}
                  aria-hidden="true"
                />
              )}
              <span className="nm">{b.label}</span>
            </div>
            <span className="bar-val">
              <b>{formatPct(b.pct)}</b>
              {b.confirmedPct == null ? null : (
                <span className="bar-conf">{formatPct(b.confirmedPct)} confirmed</span>
              )}
            </span>
            {b.detail ? <div className="bar-detail">{b.detail}</div> : null}
            {b.note || b.extra ? (
              <div className="bar-note">
                {b.note ? <span className="muted">{b.note}</span> : null}
                {b.extra}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The key to a {@link UsageBars} list's fills.
 *
 * @returns the legend row
 */
export function UsageLegend() {
  return (
    <div className="legend-row">
      <span>
        <i className="sw bar-sw" />
        Share of the sample
      </span>
      <span>
        <i className="sw bar-sw confirmed" />
        Confirmed: every member revealed
      </span>
    </div>
  );
}
