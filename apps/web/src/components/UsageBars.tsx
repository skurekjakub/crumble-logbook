import type { ReactNode } from "react";

/** One bar of a {@link UsageBars} list. */
export interface UsageBar {
  /** A stable React key. */
  key: string | number;
  /** The subject's name. */
  label: ReactNode;
  /** A line under the name, e.g. a core's members. */
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

/**
 * A list of horizontal bars, one per subject, each with its share as text.
 * A confirmed share draws as a solid segment inside the bar, and is stated
 * in words beside the share.
 *
 * @param props - the bars, in display order
 * @returns the list
 */
export function UsageBars({ bars }: UsageBarsProps) {
  return (
    <ol className="bars">
      {bars.map((b) => {
        const confirmed = b.confirmedPct == null ? "" : `, ${formatPct(b.confirmedPct)} confirmed`;
        return (
          <li key={b.key} title={`${formatPct(b.pct)}${confirmed}`}>
            <div className="bar-head">
              <span className="nm">{b.label}</span>
              <span className="bar-val">
                <b>{formatPct(b.pct)}</b>
                {b.confirmedPct == null ? null : (
                  <span className="muted"> · {formatPct(b.confirmedPct)} confirmed</span>
                )}
              </span>
            </div>
            {b.detail ? <div className="bar-detail">{b.detail}</div> : null}
            <div className="bar-track" aria-hidden="true">
              <div
                className="bar-fill"
                style={{ width: `${Math.min(100, Math.max(0, b.pct))}%` }}
              />
              {b.confirmedPct == null ? null : (
                <div
                  className="bar-confirmed"
                  style={{ width: `${Math.min(100, Math.max(0, b.confirmedPct))}%` }}
                />
              )}
            </div>
            {b.note || b.extra ? (
              <div className="bar-note">
                {b.note ? <span className="muted">{b.note}</span> : null} {b.extra}
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
