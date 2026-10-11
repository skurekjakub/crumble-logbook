import type { Attempt, PaceRule } from "@crumble/schema";
import type { CutTest } from "../lib/attempts";
import { formatScore, histogram, isKept, niceStep } from "../lib/attempts";
import { EmptyState } from "./EmptyState";

/** The charts' viewBox size and the margins around the plot box, in SVG units. */
const W = 760;
const H = 340;
const M = { l: 64, r: 20, t: 14, b: 40 } as const;

/** The fight's length, in seconds: the curve chart's x axis runs from it down to 0. */
const FIGHT_S = 60;

/** At most this many pruned curves are drawn, the latest, so a long session stays light. */
const MAX_PRUNED_CURVES = 300;

/** A linear map from a value range onto a pixel range. */
type Scale = (v: number) => number;

/**
 * Builds a linear scale.
 *
 * @param d0 - the domain's start
 * @param d1 - the domain's end
 * @param r0 - the pixel the start maps to
 * @param r1 - the pixel the end maps to
 * @returns the scale; the midpoint of the range for an empty domain
 */
function linear(d0: number, d1: number, r0: number, r1: number): Scale {
  return (v) => (d1 === d0 ? (r0 + r1) / 2 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0));
}

/**
 * Lists round ticks covering a range: the first at or below its start, the last at or above its
 * end, so an axis drawn from the first to the last holds every value.
 *
 * @param lo - the range's start
 * @param hi - the range's end
 * @param parts - about how many ticks
 * @returns the ticks, lowest first
 */
function ticks(lo: number, hi: number, parts: number): number[] {
  const step = niceStep(hi - lo, parts);
  const out: number[] = [];
  const last = Math.ceil(hi / step) * step;
  for (let v = Math.floor(lo / step) * step; v <= last + step / 1e6; v += step) out.push(v);
  return out;
}

/**
 * Draws a chart's horizontal grid and its y-axis score labels.
 *
 * @param props - the tick values and the y scale
 * @returns the grid and labels
 */
function YAxis({ values, y }: { values: readonly number[]; y: Scale }) {
  return (
    <>
      <g className="grid" aria-hidden="true">
        {values.map((v) => (
          <line key={v} x1={M.l} x2={W - M.r} y1={y(v)} y2={y(v)} />
        ))}
      </g>
      <g aria-hidden="true">
        {values.map((v) => (
          <text key={v} x={M.l - 8} y={y(v) + 4} textAnchor="end">
            {formatScore(v)}
          </text>
        ))}
      </g>
    </>
  );
}

/**
 * Draws a dashed marker line with a label at its top.
 *
 * @param props - the line's ends, its label and its kind (`bar` for the pace bar, `cut` for a
 *   suggested cut)
 * @returns the marker
 */
function Marker({
  x1,
  y1,
  x2,
  y2,
  label,
  kind,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  kind: "bar" | "cut";
}) {
  return (
    <g className={`att-marker ${kind}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <text x={Math.max(x1, x2) - 4} y={Math.min(y1, y2) + 12} textAnchor="end">
        {label}
      </text>
    </g>
  );
}

/** Props for {@link CurveChart}. */
export interface CurveChartProps {
  attempts: readonly Attempt[];
  rule: PaceRule;
  /** The tested cut, drawn at its checkpoint. */
  test: CutTest;
}

/**
 * Every run's score against the seconds left, the full fight across: pruned runs faint, kept
 * runs green and the best final score bold, with the pace bar and the tested cut marked.
 *
 * @param props - the runs, the pace rule and the tested cut
 * @returns the chart, or an empty state before any curve is recorded
 */
export function CurveChart({ attempts, rule, test }: CurveChartProps) {
  const withCurve = attempts.filter((a) => a.curve.length > 1);
  if (!withCurve.length)
    return <EmptyState>No score curves yet: the macro records them from the next run.</EmptyState>;
  const kept = withCurve.filter((a) => isKept(a.end));
  const pruned = withCurve.filter((a) => !isKept(a.end)).slice(-MAX_PRUNED_CURVES);
  const best = withCurve.reduce((b, a) => ((a.finalScore ?? 0) > (b.finalScore ?? 0) ? a : b));
  const top = Math.max(...withCurve.flatMap((a) => a.curve.map(([, s]) => s)), rule.minScore ?? 0);
  const yTicks = ticks(0, top, 5);
  const x = linear(FIGHT_S, 0, M.l, W - M.r);
  const y = linear(0, yTicks.at(-1) ?? top, H - M.b, M.t);
  /**
   * Draws one run's curve.
   *
   * @param a - the run
   * @param className - its line's class
   * @returns the polyline
   */
  const line = (a: Attempt, className: string) => (
    <polyline
      key={a.time}
      className={className}
      points={a.curve.map(([t, s]) => `${x(t).toFixed(1)},${y(s).toFixed(1)}`).join(" ")}
    />
  );
  return (
    <div className="chart att-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Score curves of ${withCurve.length} runs, ${kept.length} played in full`}
      >
        <YAxis values={yTicks} y={y} />
        <g aria-hidden="true">
          {ticks(0, FIGHT_S, 6).map((t) => (
            <text key={t} x={x(t)} y={H - M.b + 18} textAnchor="middle">
              {t} s
            </text>
          ))}
          <text x={(M.l + W - M.r) / 2} y={H - 4} textAnchor="middle">
            seconds left
          </text>
        </g>
        <g className="att-curves">
          {pruned.map((a) => line(a, "pruned"))}
          {kept.map((a) => line(a, "kept"))}
          {line(best, "best")}
        </g>
        {rule.minScore && rule.checkAtS !== null ? (
          <Marker
            x1={x(rule.checkAtS)}
            x2={x(rule.checkAtS)}
            y1={y(rule.minScore)}
            y2={H - M.b}
            label={`bar ${formatScore(rule.minScore)}`}
            kind="bar"
          />
        ) : null}
        {test.cut !== null ? (
          <Marker
            x1={x(test.checkpoint)}
            x2={x(test.checkpoint)}
            y1={y(test.cut)}
            y2={H - M.b}
            label={`cut ${formatScore(test.cut)}`}
            kind="cut"
          />
        ) : null}
      </svg>
      <p className="att-legend" aria-hidden="true">
        <span className="pruned">pruned</span>
        <span className="kept">played in full</span>
        <span className="best">best final {formatScore(best.finalScore)}</span>
      </p>
    </div>
  );
}

/** Props for {@link Sparkline}. */
export interface SparklineProps {
  attempt: Attempt;
  /** The score the sparkline's top stands for, shared across a table so heights compare. */
  top: number;
}

/** A sparkline's size, in pixels. */
const SPARK = { width: 96, height: 24 } as const;

/**
 * A run's curve in miniature, for a table row: the full fight across, on a scale shared with
 * the other rows; green when the run made the bar.
 *
 * @param props - the run and the shared top score
 * @returns the sparkline, or a dash for a run without a curve
 */
export function Sparkline({ attempt, top }: SparklineProps) {
  if (attempt.curve.length < 2) return <span className="att-spark-none">–</span>;
  const x = linear(FIGHT_S, 0, 1, SPARK.width - 1);
  const y = linear(0, top || 1, SPARK.height - 1, 1);
  return (
    <svg
      className={`att-spark ${attempt.end === "kept-on-pace" ? "passed" : "missed"}`}
      width={SPARK.width}
      height={SPARK.height}
      viewBox={`0 0 ${SPARK.width} ${SPARK.height}`}
      aria-hidden="true"
    >
      <polyline
        points={attempt.curve.map(([t, s]) => `${x(t).toFixed(1)},${y(s).toFixed(1)}`).join(" ")}
      />
    </svg>
  );
}

/** Props for {@link RunCurve}. */
export interface RunCurveProps {
  attempt: Attempt;
  rule: PaceRule;
}

/**
 * One run's score against the seconds left: a dot per HUD reading, joined, with the pace bar
 * marked; green when the run made the bar.
 *
 * @param props - the run and the pace rule
 * @returns the chart, or an empty state for a run recorded without a curve
 */
export function RunCurve({ attempt, rule }: RunCurveProps) {
  const { curve } = attempt;
  if (!curve.length) return <EmptyState>This run was recorded without a curve.</EmptyState>;
  const top = Math.max(...curve.map(([, s]) => s), rule.minScore ?? 0);
  const yTicks = ticks(0, top, 5);
  const x = linear(FIGHT_S, 0, M.l, W - M.r);
  const y = linear(0, yTicks.at(-1)!, H - M.b, M.t);
  const tone = attempt.end === "kept-on-pace" ? "passed" : "missed";
  return (
    <div className="chart att-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Score curve of the run at ${attempt.time}: ${curve.length} readings, ${formatScore(curve.at(-1)![1])} at ${curve.at(-1)![0]} s left`}
      >
        <YAxis values={yTicks} y={y} />
        <g aria-hidden="true">
          {ticks(0, FIGHT_S, 6).map((t) => (
            <text key={t} x={x(t)} y={H - M.b + 18} textAnchor="middle">
              {t} s
            </text>
          ))}
          <text x={(M.l + W - M.r) / 2} y={H - 4} textAnchor="middle">
            seconds left
          </text>
        </g>
        {rule.minScore && rule.checkAtS !== null ? (
          <Marker
            x1={x(rule.checkAtS)}
            x2={x(rule.checkAtS)}
            y1={y(rule.minScore)}
            y2={H - M.b}
            label={`bar ${formatScore(rule.minScore)}`}
            kind="bar"
          />
        ) : null}
        <g className={`att-run ${tone}`}>
          <polyline
            points={curve.map(([t, s]) => `${x(t).toFixed(1)},${y(s).toFixed(1)}`).join(" ")}
          />
          {curve.map(([t, s]) => (
            <circle key={t} cx={x(t)} cy={y(s)} r={2.5}>
              <title>{`${formatScore(s)} at ${t.toFixed(1)} s left`}</title>
            </circle>
          ))}
        </g>
      </svg>
    </div>
  );
}

/** Props for {@link CutScatter}. */
export interface CutScatterProps {
  rule: PaceRule;
  test: CutTest;
}

/**
 * Each run's score at the checkpoint against its score when the pace was judged: green runs
 * met the bar, red ones fall below the suggested cut.
 *
 * @param props - the pace rule and the tested cut
 * @returns the chart, or an empty state before any run has a score at both moments
 */
export function CutScatter({ rule, test }: CutScatterProps) {
  const { pairs, cut, checkpoint } = test;
  if (!pairs.length) return <EmptyState>No run has a score at both moments yet.</EmptyState>;
  const xs = pairs.map((p) => p.early);
  const ys = pairs.map((p) => p.pace).concat(rule.minScore ?? []);
  const xTicks = ticks(Math.min(...xs), Math.max(...xs), 6);
  const yTicks = ticks(Math.min(...ys), Math.max(...ys), 5);
  const x = linear(xTicks[0]!, xTicks.at(-1)!, M.l, W - M.r);
  const y = linear(yTicks[0]!, yTicks.at(-1)!, H - M.b, M.t);
  const at = rule.checkAtS ?? 0;
  return (
    <div className="chart att-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Score at ${checkpoint} s left against score at ${at} s left, ${pairs.length} runs`}
      >
        <YAxis values={yTicks} y={y} />
        <g aria-hidden="true">
          {xTicks.map((v) => (
            <text key={v} x={x(v)} y={H - M.b + 18} textAnchor="middle">
              {formatScore(v)}
            </text>
          ))}
          <text x={(M.l + W - M.r) / 2} y={H - 4} textAnchor="middle">
            score at {checkpoint} s left → score at {at} s left
          </text>
        </g>
        {rule.minScore ? (
          <Marker
            x1={M.l}
            x2={W - M.r}
            y1={y(rule.minScore)}
            y2={y(rule.minScore)}
            label={`bar ${formatScore(rule.minScore)}`}
            kind="bar"
          />
        ) : null}
        {cut !== null ? (
          <Marker
            x1={x(cut)}
            x2={x(cut)}
            y1={M.t}
            y2={H - M.b}
            label={`cut ${formatScore(cut)}`}
            kind="cut"
          />
        ) : null}
        <g className="att-dots">
          {pairs.map((p) => (
            <circle
              key={p.attempt.time}
              className={p.passed ? "passed" : cut !== null && p.early < cut ? "cut" : "kept"}
              cx={x(p.early)}
              cy={y(p.pace)}
              r={p.passed ? 5 : 3.5}
            >
              <title>
                {`${p.attempt.time}: ${formatScore(p.early)} at ${checkpoint} s, ${formatScore(p.pace)} at ${at} s`}
              </title>
            </circle>
          ))}
        </g>
      </svg>
    </div>
  );
}

/** Props for {@link PaceHistogram}. */
export interface PaceHistogramProps {
  /** The runs' scores when the pace was judged. */
  paces: readonly number[];
  rule: PaceRule;
}

/**
 * How the runs' scores at the judging moment spread, with the bins at or above the bar green.
 *
 * @param props - the scores and the pace rule
 * @returns the chart, or an empty state without scores
 */
export function PaceHistogram({ paces, rule }: PaceHistogramProps) {
  const bins = histogram(paces);
  if (!bins.length) return <EmptyState>No run has been judged yet.</EmptyState>;
  const xTicks = ticks(bins[0]!.from, Math.max(bins.at(-1)!.to, rule.minScore ?? 0), 6);
  const most = Math.max(...bins.map((b) => b.count));
  const x = linear(xTicks[0]!, xTicks.at(-1)!, M.l, W - M.r);
  const yTicks = ticks(0, most, 4);
  const y = linear(0, yTicks.at(-1) ?? most, H - M.b, M.t);
  return (
    <div className="chart att-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Scores at ${rule.checkAtS ?? "?"} s left across ${paces.length} runs`}
      >
        <g className="grid" aria-hidden="true">
          {yTicks.map((v) => (
            <line key={v} x1={M.l} x2={W - M.r} y1={y(v)} y2={y(v)} />
          ))}
        </g>
        <g aria-hidden="true">
          {yTicks.map((v) => (
            <text key={v} x={M.l - 8} y={y(v) + 4} textAnchor="end">
              {v}
            </text>
          ))}
          {xTicks.map((v) => (
            <text key={v} x={x(v)} y={H - M.b + 18} textAnchor="middle">
              {formatScore(v)}
            </text>
          ))}
          <text x={(M.l + W - M.r) / 2} y={H - 4} textAnchor="middle">
            score at {rule.checkAtS ?? "?"} s left
          </text>
        </g>
        <g className="att-bars">
          {bins.map((b) => (
            <rect
              key={b.from}
              className={rule.minScore && b.from >= rule.minScore ? "passed" : undefined}
              x={x(b.from) + 1}
              width={Math.max(1, x(b.to) - x(b.from) - 2)}
              y={y(b.count)}
              height={H - M.b - y(b.count)}
            >
              <title>{`${formatScore(b.from)}–${formatScore(b.to)}: ${b.count} runs`}</title>
            </rect>
          ))}
        </g>
        {rule.minScore ? (
          <Marker
            x1={x(rule.minScore)}
            x2={x(rule.minScore)}
            y1={M.t}
            y2={H - M.b}
            label={`bar ${formatScore(rule.minScore)}`}
            kind="bar"
          />
        ) : null}
      </svg>
    </div>
  );
}
