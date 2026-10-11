import type { Attempts } from "@crumble/schema";
import { useQuery } from "@tanstack/react-query";
import { attemptsQuery } from "../api/queries";
import type { ModeSection, ViewCopy } from "../app/modes";
import { CurveChart, CutScatter, PaceHistogram } from "../components/AttemptCharts";
import { EmptyState } from "../components/EmptyState";
import { Pill } from "../components/Pill";
import { QueryResult } from "../components/QueryResult";
import type { Checkpoint, CutTest } from "../lib/attempts";
import {
  CHECKPOINTS,
  DEFAULT_CHECKPOINT,
  formatScore,
  paceOf,
  summarize,
  testCut,
} from "../lib/attempts";
import { optionalInt, optionalText } from "../lib/search";
import { AttemptRuns, END_BADGE } from "./AttemptRuns";
import { CopyHeader } from "./ModeViewHeader";
import { Switch } from "./TeamPowerParts";

/**
 * The attempts page's search params: the moment an earlier cut is tested at, and the run whose
 * curve is shown, by its ENTER time.
 */
export interface AttemptsSearch {
  at?: Checkpoint;
  run?: string;
}

/**
 * Reads the attempts page's search params.
 *
 * @param search - the decoded query values
 * @returns the checkpoint, dropped when it isn't one the page offers, and the run
 */
export function validateAttemptsSearch(search: Record<string, unknown>): AttemptsSearch {
  const at = optionalInt(search.at);
  return { at: CHECKPOINTS.find((c) => c === at), run: optionalText(search.run) };
}

/** Props for {@link AttemptsView}. */
export interface AttemptsViewProps {
  /** The mode the macro plays. */
  mode: ModeSection;
  /** The page's heading and lede. */
  copy: ViewCopy;
  /** The current search params. */
  search: AttemptsSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: AttemptsSearch) => void;
}

/**
 * The Guild Conquest macro's attempts: the runs at a glance, every score curve, one run's curve,
 * an earlier cut tested against the runs that made the bar, how the scores at the judging moment
 * spread, and the best and latest runs.
 *
 * @param props - the mode, the page's copy and the search params
 * @returns the view
 */
export function AttemptsView({ mode, copy, search, onSearch }: AttemptsViewProps) {
  const query = useQuery(attemptsQuery());
  return (
    <>
      <CopyHeader scope={mode.scope} copy={copy} fallbackTitle="Attempts" />
      <QueryResult query={query} resource="attempts">
        {(data) =>
          data.available ? (
            <Board
              data={data}
              checkpoint={search.at ?? DEFAULT_CHECKPOINT}
              onCheckpoint={(at) => onSearch({ at })}
              run={search.run}
              onRun={(run) => onSearch({ run })}
            />
          ) : (
            <EmptyState>
              No attempts recorded here. The macro's files stay on the machine it runs on: open this
              page from <code>pnpm dev</code> there.
            </EmptyState>
          )
        }
      </QueryResult>
    </>
  );
}

/** Props for {@link Board}. */
interface BoardProps {
  data: Attempts;
  checkpoint: Checkpoint;
  /** Picks the checkpoint an earlier cut is tested at. */
  onCheckpoint: (at: Checkpoint) => void;
  /** The ENTER time of the run whose row is expanded; none when undefined. */
  run: string | undefined;
  /** Expands a run's row, or collapses it with undefined. */
  onRun: (time: string | undefined) => void;
}

/**
 * The page under its header, once the attempts are loaded.
 *
 * @param props - the attempts, the tested checkpoint, the shown run and their setters
 * @returns the tiles, the charts and the runs tables
 */
function Board({ data, checkpoint, onCheckpoint, run, onRun }: BoardProps) {
  const { attempts, rule } = data;
  if (!attempts.length) return <EmptyState>The macro hasn't recorded a run yet.</EmptyState>;
  const summary = summarize(attempts, rule);
  const test = testCut(attempts, rule, checkpoint);
  const paces = attempts.flatMap((a) => paceOf(a, rule) ?? []);
  const latest = attempts.at(-1)!;
  return (
    <>
      <dl className="att-tiles">
        <div>
          <dt>Attempts</dt>
          <dd>{summary.total}</dd>
        </div>
        <div className={summary.onPace ? "good" : undefined}>
          <dt>Made the bar</dt>
          <dd>
            {summary.onPace}
            {summary.judged ? (
              <span className="sub">{percent(summary.onPace / summary.judged)} of judged</span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>Best final</dt>
          <dd>
            {formatScore(summary.bestFinal?.finalScore)}
            {summary.bestFinal ? <span className="sub">{summary.bestFinal.time}</span> : null}
          </dd>
        </div>
        <div>
          <dt>Best at {rule.checkAtS ?? "?"} s</dt>
          <dd>{formatScore(summary.bestPace)}</dd>
        </div>
        <div>
          <dt>Runs an hour</dt>
          <dd>{summary.perHour === null ? "–" : Math.round(summary.perHour)}</dd>
        </div>
        <div>
          <dt>Latest</dt>
          <dd>
            <Pill kind={END_BADGE[latest.end][0]}>{END_BADGE[latest.end][1]}</Pill>
            <span className="sub">{latest.time}</span>
          </dd>
        </div>
      </dl>

      <section className="att-section" aria-labelledby="att-curves">
        <h3 id="att-curves">Score curves</h3>
        <CurveChart attempts={attempts} rule={rule} test={test} />
      </section>

      <section className="att-section" aria-labelledby="att-runs">
        <h3 id="att-runs">Runs</h3>
        <AttemptRuns attempts={attempts} rule={rule} open={run} onOpen={onRun} />
      </section>

      <section className="att-section" aria-labelledby="att-cut">
        <h3 id="att-cut">An earlier cut</h3>
        <Switch
          label="Moment to cut at"
          options={CHECKPOINTS.map((c) => [String(c), `${c} s left`] as const)}
          value={String(checkpoint)}
          onChange={(v) => onCheckpoint(Number(v) as Checkpoint)}
        />
        <CutVerdict test={test} />
        <CutScatter rule={rule} test={test} />
      </section>

      <section className="att-section" aria-labelledby="att-pace">
        <h3 id="att-pace">Scores at {rule.checkAtS ?? "?"} s left</h3>
        <PaceHistogram paces={paces} rule={rule} />
      </section>
    </>
  );
}

/**
 * Formats a share as a percentage.
 *
 * @param share - the share, 0 to 1
 * @returns e.g. "1.3%"
 */
function percent(share: number): string {
  return `${(share * 100).toFixed(share < 0.1 ? 1 : 0)}%`;
}

/**
 * What the tested cut would have done, verdict first: the cut, the share of runs it prunes
 * sooner, and how many passing runs it stands on.
 *
 * @param props - the tested cut
 * @returns the verdict line
 */
function CutVerdict({ test }: { test: CutTest }) {
  if (test.cut === null || test.prunedShare === null)
    return (
      <p className="att-verdict">
        <Pill kind="low">no cut yet</Pill> No run with a score at {test.checkpoint} s left has made
        the bar.
      </p>
    );
  return (
    <p className="att-verdict">
      <Pill kind={test.confidence}>{`${test.confidence}: ${test.passing} passing runs`}</Pill>{" "}
      <b>Cut at {formatScore(test.cut)}</b> prunes {percent(test.prunedShare)} of runs {test.savedS}{" "}
      s sooner and keeps every run that made the bar.
      {test.r === null ? null : <span className="sub"> r = {test.r.toFixed(2)}</span>}
    </p>
  );
}
