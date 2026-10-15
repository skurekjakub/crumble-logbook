import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Attempt, AttemptEnd, CurvePoint } from "@crumble/schema";
import {
  analyzeCutoff,
  BOUND_RISK,
  type CheckpointFit,
  type CutoffFitted,
} from "@crumble/schema/cutoff";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createAttemptsRepo, runsPath } from "../../src/repos/attempts";
import { reportCutoff, type CutoffReport } from "../../src/services/cutoff-report";

/** Score gained per second of fight on the reference pace, which reaches 2.1T at 30 s left. */
const R = 70_000_000_000;

/** The INI's `MinScore` in these fixtures: under the reference pace at 30 s left. */
const INI_MIN = 1_800_000_000_000;

/** The macro's `MinScore` when its INI sets none. */
const DEFAULT_MIN = 1_950_000_000_000;

/** Seconds from a pruned run's ENTER to the next. */
const CUT_S = 40;

/** Seconds from a played-out run's ENTER to the next. */
const KEPT_S = 70;

/** A final far from the top. */
const FIELD_FINAL = 3_500_000_000_000;

/** The best sample finals, best first: with 101 sample runs the bar is the second of them. */
const LEADER_FINALS = [4_400, 4_360, 4_300, 4_250, 4_200, 4_150].map((g) => g * 1_000_000_000);

/** A run to stage, as the macro records it. */
interface RunSpec {
  sample: boolean;
  end: AttemptEnd;
  final: number | null;
  curve: CurvePoint[];
  pace?: number;
  /** Seconds to the next run's ENTER; the end's cycle unless given. */
  gap?: number;
}

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "crumble-cutoff-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

/**
 * Samples a run's score every half second from 54 s left to 30 s left.
 *
 * @param lag - how many seconds the run trails the reference pace, by seconds left
 * @returns the curve, most seconds left first
 */
function curve(lag: (tLeft: number) => number = () => 0): CurvePoint[] {
  const points: CurvePoint[] = [];
  for (let t = 54; t >= 30; t -= 0.5) points.push([t, Math.round(R * (60 - t - lag(t)))]);
  return points;
}

/**
 * A sample run that played out.
 *
 * @param final - its final
 * @param points - its curve
 * @param pace - the macro's own reading at 30 s left, if it took one
 * @returns the run
 */
function sampled(final: number, points: CurvePoint[], pace?: number): RunSpec {
  return { sample: true, end: "kept-played-out", final, curve: points, pace };
}

/**
 * Sample runs that finished far from the top.
 *
 * @param count - how many
 * @param lag - how many seconds each trails the reference pace, by seconds left
 * @returns the runs
 */
function field(count: number, lag: (tLeft: number) => number): RunSpec[] {
  return Array.from({ length: count }, () => sampled(FIELD_FINAL, curve(lag)));
}

/**
 * The reference runs, best final first, on the reference pace. The second, a top run, carries a
 * macro reading at 30 s left between {@link INI_MIN} and {@link DEFAULT_MIN}; the fourth has no
 * readings between 43.5 s and 40.5 s left.
 *
 * @param lagging - the position of a run that trails the pace by 3 s throughout, if any
 * @returns the runs
 */
function leaders(lagging?: number): RunSpec[] {
  return LEADER_FINALS.map((final, i) =>
    sampled(
      final,
      i === 3
        ? curve().filter(([t]) => t >= 43.5 || t <= 40.5)
        : curve(() => (i === lagging ? 3 : 0)),
      i === 1 ? 1_900_000_000_000 : undefined,
    ),
  );
}

/**
 * The sample runs: the leaders spread among field runs that trail the pace by 5 s, some before
 * 46 s left, some between 44 s and 41 s left, some throughout, and the rest never.
 *
 * @param lagging - a leader that trails the pace by 3 s throughout, if any
 * @returns the runs, oldest first
 */
function sampleRuns(lagging?: number): RunSpec[] {
  const [first, second, third, fourth, fifth, sixth] = leaders(lagging);
  return [
    first!,
    ...field(30, (t) => (t >= 46 ? 5 : 0)),
    second!,
    ...field(20, (t) => (t >= 41 && t <= 44 ? 5 : 0)),
    third!,
    fourth!,
    ...field(10, () => 5),
    fifth!,
    ...field(35, () => 0),
    sixth!,
  ];
}

/**
 * Runs outside the sample that the macro cut at 30 s left, with no curve recorded.
 *
 * @param count - how many
 * @returns the runs
 */
function pruned(count: number): RunSpec[] {
  return Array.from({ length: count }, () => ({
    sample: false,
    end: "pruned",
    final: 1_900_000_000_000,
    pace: 1_700_000_000_000,
    curve: [],
  }));
}

/**
 * Formats seconds after 08:00:00 on the fixture day as a runs-file time.
 *
 * @param s - seconds after 08:00:00
 * @returns `YYYY-MM-DD HH:mm:ss`
 */
function clock(s: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `2026-10-15 ${pad(8 + Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
}

/**
 * Writes runs into the macro folder as its INI, runs file and curves file.
 *
 * @param specs - the runs, oldest first, ENTERed back to back
 * @param minScore - the INI's `[Prune] MinScore`; null leaves the key out
 * @param checkAtS - the INI's `[Prune] CheckAtS`
 * @returns the attempts the files hold
 */
function stage(specs: readonly RunSpec[], minScore: number | null, checkAtS = 30): Attempt[] {
  let s = 0;
  const attempts = specs.map((spec, i): Attempt => {
    const attempt = {
      time: clock(s),
      run: i + 1,
      end: spec.end,
      paceScore: spec.pace ?? null,
      finalScore: spec.final,
      sample: spec.sample,
      curve: spec.curve,
    };
    s += spec.gap ?? (spec.end === "pruned" ? CUT_S : KEPT_S);
    return attempt;
  });
  const ini = [
    "[Prune]",
    ...(minScore === null ? [] : [`MinScore=${minScore}`]),
    `CheckAtS=${checkAtS}`,
  ];
  const runs = attempts.map((a) =>
    [a.time, a.run, a.end, a.paceScore ?? "", a.finalScore ?? "", a.sample ? 1 : 0].join(","),
  );
  const curves = attempts.flatMap((a) => a.curve.map(([t, score]) => `${a.time},${t},${score}`));
  writeFileSync(join(dir, "conquest-loop.ini"), ini.join("\n") + "\n");
  writeFileSync(
    join(dir, "conquest-runs.csv"),
    ["time,run,end,pace_score,final_score,sample", ...runs].join("\n") + "\n",
  );
  writeFileSync(
    join(dir, "conquest-curves.csv"),
    ["time,t_left,score", ...curves].join("\n") + "\n",
  );
  return attempts;
}

/**
 * Runs the shared analysis on staged attempts, as the report's expected values.
 *
 * @param attempts - the staged attempts
 * @param minScore - the baseline's bar
 * @returns the analysis
 * @throws if the analysis refuses
 */
function fitted(attempts: readonly Attempt[], minScore: number): CutoffFitted {
  const analysis = analyzeCutoff(attempts, minScore);
  if (!analysis.ok) throw new Error(`refused: ${analysis.reason}`);
  return analysis;
}

/**
 * Reports on the staged macro folder, composed as the CLI composes it.
 *
 * @returns the report
 */
function runReport(): CutoffReport {
  return reportCutoff(createAttemptsRepo(dir).read(), runsPath(dir));
}

/**
 * Lists the scorable checkpoints no line of a report tables with its threshold, cuts, seconds
 * saved and leave-one-out losses.
 *
 * @param rows - the report's lines
 * @param checkpoints - one leniency's checkpoint fits
 * @returns the scorable fits missing from the table
 */
function untabled(rows: readonly string[], checkpoints: readonly CheckpointFit[]): CheckpointFit[] {
  return checkpoints.filter(
    (fit) =>
      fit.threshold !== null &&
      !rows.some(
        (line) =>
          num(fit.tLeft).test(line) &&
          score(fit.threshold).test(line) &&
          num(fit.cuts).test(line) &&
          num(fit.savedS).test(line) &&
          num(fit.looLosses).test(line),
      ),
  );
}

/**
 * A pattern for a number standing on its own, trailing zeros after the point allowed.
 *
 * @param n - the number
 * @returns the regular expression source
 */
function numberSource(n: number): string {
  const tail = Number.isInteger(n) ? String.raw`(?:\.0+)?` : "0*";
  return String.raw`(?<![\d.])${String(n).replace(".", String.raw`\.`)}${tail}(?!\.?\d)`;
}

/**
 * Matches a number standing on its own.
 *
 * @param n - the number
 * @returns the pattern
 */
function num(n: number): RegExp {
  return new RegExp(numberSource(n));
}

/**
 * Matches a score written in full, with or without thousands separators, or exactly in
 * trillions with a `T` suffix.
 *
 * @param n - the score
 * @returns the pattern
 */
function score(n: number): RegExp {
  const grouped = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "[,_ ]");
  const trillions = numberSource(n / 1e12).replace(String.raw`(?!\.?\d)`, "");
  return new RegExp(String.raw`(?<![\d.,])(?:${n}|${grouped}|${trillions}\s*T)(?![\d,])`);
}

/**
 * Tells whether a line shows a value to at least two significant figures, rounded to the
 * decimals it is printed with.
 *
 * @param line - the line
 * @param value - the value
 * @returns true when one of the line's numbers is the value
 */
function shows(line: string, value: number): boolean {
  return (line.match(/\d+(?:\.\d+)?/g) ?? []).some((token) => {
    const decimals = token.split(".")[1]?.length ?? 0;
    const significant = token.replace(".", "").replace(/^0+/, "").length;
    return significant >= 2 && Math.abs(Number(token) - value) <= 0.5 * 10 ** -decimals;
  });
}

/**
 * Splits a report into lines.
 *
 * @param text - the report
 * @returns its lines
 */
function lines(text: string): string[] {
  return text.split(/\r?\n/);
}

/**
 * The report's `Checkpoints=` lines.
 *
 * @param text - the report
 * @returns them, in order
 */
function checkpointLines(text: string): string[] {
  return lines(text).filter((line) => line.includes("Checkpoints="));
}

describe("reportCutoff", () => {
  describe("on runs where a rule keeps every reference run", () => {
    let attempts: Attempt[];
    let analysis: CutoffFitted;
    let report: CutoffReport;

    beforeEach(() => {
      attempts = stage([...pruned(37), ...sampleRuns()], INI_MIN);
      analysis = fitted(attempts, INI_MIN);
      report = runReport();
    });

    it("exits 0 and ends with the chosen rule as the INI's Checkpoints line", () => {
      expect(report.exitCode).toBe(0);
      expect(checkpointLines(report.text)).toEqual([
        "Checkpoints=52.5:420000000000|42.5:1120000000000",
      ]);
    });

    it("counts the sample runs and the other runs it read", () => {
      const rows = lines(report.text);

      expect(rows.some((line) => /sample/i.test(line) && num(101).test(line))).toBe(true);
      expect(rows.some((line) => /other/i.test(line) && num(37).test(line))).toBe(true);
    });

    it("names the lowest top final, marks the top runs, and lists the reference runs and no other sample run", () => {
      const rows = lines(report.text);
      const listed = (time: string) => rows.filter((line) => line.includes(time));
      const referenceTimes = new Set(analysis.reference.map((run) => run.time));
      const fieldTimes = attempts
        .filter((a) => a.sample && !referenceTimes.has(a.time))
        .map((a) => a.time);

      expect(
        rows.some(
          (line) => /^Top run: final >= /.test(line) && score(4_360_000_000_000).test(line),
        ),
      ).toBe(true);
      expect(analysis.top.map((run) => listed(run.time).some((line) => /top/i.test(line)))).toEqual(
        analysis.top.map(() => true),
      );
      expect(analysis.reference.filter((run) => listed(run.time).length === 0)).toEqual([]);
      expect(fieldTimes.filter((time) => report.text.includes(time))).toEqual([]);
    });

    it.for<[number, number[], number[]]>([
      [0.5, [52.5], [50, 42.5]],
      [1, [52.5, 42.5], [50]],
      [1.5, [52.5, 42.5], [50]],
      [2, [50, 42.5], [52.5]],
    ])("names the best qualifying rule at δ %s by its checkpoints", ([delta, inRule, outside]) => {
      const rows = lines(report.text).filter((line) =>
        new RegExp(String.raw`(?:δ|delta)\s*=?\s*${numberSource(delta)}`, "i").test(line),
      );

      expect(rows.some((line) => inRule.every((t) => num(t).test(line)))).toBe(true);
      expect(rows.some((line) => outside.some((t) => num(t).test(line)))).toBe(false);
    });

    it("names the chosen rule by its δ and its checkpoints", () => {
      const best = analysis.best!;
      const chosen = lines(report.text).find((line) => /^Chosen rule/.test(line)) ?? "";

      expect(chosen).toMatch(new RegExp(String.raw`delta ${numberSource(best.delta)} s`));
      expect(
        best.checkpoints.filter(
          (c) => !num(c.tLeft).test(chosen) || !score(c.minScore).test(chosen),
        ),
      ).toEqual([]);
    });

    it("tables each checkpoint at the chosen δ with its threshold, cuts, seconds saved and leave-one-out losses", () => {
      const rows = lines(report.text);
      const { checkpoints } = analysis.fits.find((fit) => fit.delta === analysis.best?.delta)!;

      expect(untabled(rows, checkpoints)).toEqual([]);
    });

    it("heads the table's leave-one-out losses in words and marks the rows in the chosen rule", () => {
      const rows = lines(report.text);
      const marked = rows
        .filter((line) => /in rule/.test(line))
        .map((line) => Number(/^\s*([\d.]+) s/.exec(line)?.[1]));

      expect(marked).toEqual(analysis.best!.checkpoints.map((c) => c.tLeft));
      expect(rows.some((line) => /leave-one-out losses/.test(line))).toBe(true);
      expect(rows.filter((line) => /\bloo\b/i.test(line))).toEqual([]);
    });

    it("marks a checkpoint where a reference run has no score δ earlier as unscorable", () => {
      expect(
        lines(report.text).some((line) => num(40).test(line) && /unscorable/i.test(line)),
      ).toBe(true);
    });

    it("sets the chosen rule's top runs per hour against the baseline at the INI's MinScore", () => {
      const rows = lines(report.text);

      expect(
        rows.some(
          (line) => /per hour|\/\s*h\b/i.test(line) && shows(line, analysis.best!.topPerHour),
        ),
      ).toBe(true);
      expect(
        rows.some((line) => /baseline/i.test(line) && shows(line, analysis.baseline.topPerHour)),
      ).toBe(true);
    });

    it("writes the baseline as its check at the INI's MinScore, saying nothing of CheckAtS when it is 30", () => {
      const baseline = lines(report.text).find((line) => /^Baseline/.test(line)) ?? "";

      expect(baseline).toMatch(/^Baseline \(30 s >= /);
      expect(score(INI_MIN).test(baseline)).toBe(true);
      expect(baseline).not.toMatch(/CheckAtS|INI checks/);
    });

    it("prints the chosen rule's loss bound as an upper bound at the analysis's confidence, marked as optimistic", () => {
      const bound = analysis.best!.lossBound;
      const line = lines(report.text).find((row) => /optimistic/i.test(row)) ?? "";

      expect(shows(line, bound * 100)).toBe(true);
      expect(line).toMatch(/up to/);
      expect(line).toContain(`${Math.round((1 - BOUND_RISK) * 100)}% upper bound`);
    });
  });

  it("judges the baseline at the macro's default MinScore when the INI sets none", () => {
    const attempts = stage([...pruned(37), ...sampleRuns()], null);
    const { baseline } = fitted(attempts, DEFAULT_MIN);

    const { text } = runReport();

    expect(
      lines(text).some(
        (line) =>
          /^Baseline/.test(line) &&
          score(DEFAULT_MIN).test(line) &&
          shows(line, baseline.topPerHour),
      ),
    ).toBe(true);
  });

  it("says the baseline judges at 30 s when the INI's CheckAtS is another moment", () => {
    stage([...pruned(37), ...sampleRuns()], INI_MIN, 35);

    const baseline = lines(runReport().text).find((line) => /^Baseline/.test(line)) ?? "";

    expect(baseline).toMatch(/INI checks at 35 s/);
    expect(baseline).toMatch(/judges at 30 s/);
  });

  it("says no rule qualifies, tables the most lenient δ, and exits 0 with no Checkpoints line when every scorable checkpoint loses a reference run", () => {
    const attempts = stage([...pruned(37), ...sampleRuns(5)], INI_MIN);
    const lenient = fitted(attempts, INI_MIN).fits.reduce((a, b) => (b.delta > a.delta ? b : a));

    const { text, exitCode } = runReport();
    const rows = lines(text);

    expect(exitCode).toBe(0);
    expect(text).toMatch(/no rule qualifies: every scorable checkpoint loses a reference run/i);
    expect(
      rows.some(
        (line) =>
          /most lenient/.test(line) &&
          /no rule chosen/.test(line) &&
          new RegExp(String.raw`delta ${numberSource(lenient.delta)} s`).test(line),
      ),
    ).toBe(true);
    expect(lenient.checkpoints.some((fit) => fit.threshold !== null)).toBe(true);
    expect(untabled(rows, lenient.checkpoints)).toEqual([]);
    expect(checkpointLines(text)).toEqual([]);
  });

  it("says no checkpoint is scorable when a reference run has no reading before the last checkpoint", () => {
    const attempts = stage(
      [
        ...pruned(37),
        ...sampleRuns().map((run) =>
          run.final === LEADER_FINALS[0]
            ? { ...run, curve: run.curve.filter(([t]) => t <= 30) }
            : run,
        ),
      ],
      INI_MIN,
    );

    const { text, exitCode } = runReport();

    expect(fitted(attempts, INI_MIN).fits.flatMap((fit) => fit.checkpoints)).toEqual([]);
    expect(exitCode).toBe(0);
    expect(text).toMatch(/no rule qualifies: no checkpoint is scorable/i);
    expect(text).not.toMatch(/loses a reference run/);
    expect(checkpointLines(text)).toEqual([]);
  });

  it.for([
    {
      reason: "small-reference",
      specs: () => [...pruned(37), ...sampleRuns().slice(0, 20)],
      says: /Not enough sample runs yet: 20 of the 81 needed \(37 other runs read\)/,
    },
    {
      reason: "no-cut-cycle",
      specs: () => sampleRuns(),
      says: /pruned[^\n]*\b101 sample\b[^\n]*\b0 other\b/,
    },
    {
      reason: "no-kept-cycle",
      specs: () => [...pruned(37), ...sampleRuns().map((run) => ({ ...run, gap: 400 }))],
      says: /played[ -]out[^\n]*\b101 sample\b[^\n]*\b37 other\b/,
    },
  ])(
    "refuses $reason in plain words with the runs it read, and exits 1 with no Checkpoints line",
    ({ reason, specs, says }) => {
      stage(specs(), INI_MIN);

      const { text, exitCode } = runReport();

      expect(exitCode).toBe(1);
      expect(text).toMatch(says);
      expect(text).not.toContain(reason);
      expect(checkpointLines(text)).toEqual([]);
    },
  );

  it("names the runs file it looked for, as the INI's RunsFile names it, and exits 1 with no Checkpoints line when it is missing", () => {
    writeFileSync(
      join(dir, "conquest-loop.ini"),
      "[Prune]\nMinScore=1800000000000\n[Run]\nRunsFile=renamed.csv\n",
    );

    const { text, exitCode } = runReport();

    expect(exitCode).toBe(1);
    expect(text).toContain(join(dir, "renamed.csv"));
    expect(checkpointLines(text)).toEqual([]);
  });
});
