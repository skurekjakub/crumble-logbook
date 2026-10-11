import type { Attempt, AttemptEnd, PaceRule } from "@crumble/schema";
import { Fragment, useState } from "react";
import { RunCurve, Sparkline } from "../components/AttemptCharts";
import { EmptyState } from "../components/EmptyState";
import type { PillKind } from "../components/Pill";
import { Pill } from "../components/Pill";
import { CHECKPOINTS, formatScore, paceOf, scoreAt } from "../lib/attempts";
import { Switch } from "./TeamPowerParts";

/** Each end's badge: its verdict colour and its label. */
export const END_BADGE: Readonly<Record<AttemptEnd, readonly [PillKind, string]>> = {
  "kept-on-pace": ["good", "made the bar"],
  pruned: ["obsolete", "pruned"],
  "kept-unjudged": ["medium", "not judged"],
  "kept-end-failed": ["medium", "end failed"],
  stopped: ["low", "stopped"],
  error: ["low", "error"],
  "no-results": ["low", "no results"],
};

/** Which runs the table lists, and in what order. */
type RunsList = "latest" | "best" | "bar";

/** The list switch's options, the default first. */
const LISTS: ReadonlyArray<readonly [RunsList, string]> = [
  ["latest", "Latest"],
  ["best", "Best final"],
  ["bar", "Made the bar"],
];

/** Rows shown at first, and added by each "Show more". */
const PAGE = 25;

/**
 * Orders and filters the runs for a list.
 *
 * @param attempts - every run, oldest first
 * @param list - which list
 * @param rule - the macro's pace rule, to rank a run without a final score by its pace
 * @returns the runs to list, in order
 */
function listRuns(attempts: readonly Attempt[], list: RunsList, rule: PaceRule): Attempt[] {
  if (list === "latest") return [...attempts].reverse();
  const ranked = (list === "bar" ? attempts.filter((a) => a.end === "kept-on-pace") : attempts)
    .map((a) => ({ a, rank: a.finalScore ?? paceOf(a, rule) ?? 0 }))
    .sort((x, y) => y.rank - x.rank);
  return ranked.map(({ a }) => a);
}

/** Props for {@link AttemptRuns}. */
export interface AttemptRunsProps {
  /** Every run, oldest first. */
  attempts: readonly Attempt[];
  rule: PaceRule;
  /** The ENTER time of the expanded run; none when undefined. */
  open: string | undefined;
  /** Expands a run's row, or collapses it with undefined. */
  onOpen: (time: string | undefined) => void;
}

/**
 * The recorded runs as a table: latest, best final or those that made the bar, each row with
 * its curve in miniature, and expandable in place to the full curve and its scores at the
 * checkpoints.
 *
 * @param props - the runs, the pace rule, the expanded run and its setter
 * @returns the list switch, the table and its "Show more"
 */
export function AttemptRuns({ attempts, rule, open, onOpen }: AttemptRunsProps) {
  const [list, setList] = useState<RunsList>("latest");
  const [shown, setShown] = useState(PAGE);
  const runs = listRuns(attempts, list, rule);
  // A run opened from a link stays in view, however far down the list it sits.
  const page = runs.slice(0, Math.max(shown, runs.findIndex((a) => a.time === open) + 1));
  const top = Math.max(1, ...page.flatMap((a) => a.curve.map(([, s]) => s)));
  return (
    <>
      <Switch
        label="Runs to list"
        options={LISTS}
        value={list}
        onChange={(v) => {
          setList(v);
          setShown(PAGE);
        }}
      />
      {page.length ? (
        <div className="tablewrap">
          <table className="att-runs">
            <thead>
              <tr>
                <th scope="col" aria-label="Expand" />
                <th scope="col">Final</th>
                <th scope="col">At {rule.checkAtS ?? "?"} s</th>
                <th scope="col">Curve</th>
                <th scope="col">End</th>
                <th scope="col">When</th>
              </tr>
            </thead>
            <tbody>
              {page.map((a) => {
                const expanded = a.time === open;
                const detailId = `att-run-${a.time.replace(/\D/g, "")}`;
                return (
                  <Fragment key={a.time}>
                    <tr className={expanded ? "open" : undefined}>
                      <td className="toggle">
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={expanded ? detailId : undefined}
                          aria-label={`${expanded ? "Collapse" : "Expand"} the run at ${a.time}`}
                          onClick={() => onOpen(expanded ? undefined : a.time)}
                        >
                          <span aria-hidden="true">›</span>
                        </button>
                      </td>
                      <td className="num">{formatScore(a.finalScore)}</td>
                      <td className="num">{formatScore(paceOf(a, rule))}</td>
                      <td>
                        <Sparkline attempt={a} top={top} />
                      </td>
                      <td>
                        <Pill kind={END_BADGE[a.end][0]}>{END_BADGE[a.end][1]}</Pill>
                      </td>
                      <td className="when">{a.time}</td>
                    </tr>
                    {expanded ? (
                      <tr className="att-detail" id={detailId}>
                        <td colSpan={6}>
                          <RunDetail attempt={a} rule={rule} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>No run has made the bar yet.</EmptyState>
      )}
      {runs.length > page.length ? (
        <button type="button" className="att-more" onClick={() => setShown(shown + PAGE)}>
          Show more ({runs.length - page.length} left)
        </button>
      ) : null}
    </>
  );
}

/**
 * An expanded run: its scores at the checkpoints and the judging moment, then its full curve.
 *
 * @param props - the run and the pace rule
 * @returns the detail
 */
function RunDetail({ attempt, rule }: { attempt: Attempt; rule: PaceRule }) {
  const moments = [...CHECKPOINTS, ...(rule.checkAtS === null ? [] : [rule.checkAtS])];
  return (
    <div className="att-detail-body">
      <p className="att-detail-when">Run at {attempt.time}</p>
      <dl className="att-moments">
        {moments.map((t) => (
          <div key={t}>
            <dt>{t} s left</dt>
            <dd>
              {formatScore(t === rule.checkAtS ? paceOf(attempt, rule) : scoreAt(attempt.curve, t))}
            </dd>
          </div>
        ))}
        <div>
          <dt>Final</dt>
          <dd>{formatScore(attempt.finalScore)}</dd>
        </div>
        <div>
          <dt>Readings</dt>
          <dd>{attempt.curve.length}</dd>
        </div>
      </dl>
      <RunCurve attempt={attempt} rule={rule} />
    </div>
  );
}
