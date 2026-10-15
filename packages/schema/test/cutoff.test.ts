import { describe, expect, it } from "vitest";
import type { Attempt, AttemptEnd, CurvePoint } from "../src/attempts";
import {
  analyzeCutoff,
  barScore,
  checkpointsLine,
  DELTAS_S,
  medianCycle,
  scoreAt,
  type CheckpointFit,
  type CutoffAnalysis,
  type CutoffRule,
} from "../src/cutoff";

/** A billion: the curves climb one of these a second on the reference pace. */
const U = 1_000_000_000;

/** The macro's 30 s bar in these fixtures: the reference pace's score at 30 s left. */
const MIN = 30 * U;

/** Seconds from a run cut at 30 s left to the next ENTER. */
const CUT_S = 40;

/** Seconds from a run that played out to the next ENTER. */
const KEPT_S = 70;

/** A final far from the top. */
const FIELD_FINAL = 100 * U;

/** A run to stage: who it is in the sample, how it ended, and what it read. */
interface RunSpec {
  sample: boolean | null;
  end: AttemptEnd;
  final: number | null;
  curve: CurvePoint[];
  paceScore?: number;
}

type Fitted = Extract<CutoffAnalysis, { ok: true }>;

/**
 * Samples a growth function every half second, most seconds left first.
 *
 * @param score - the score at a moment, by seconds left
 * @param from - the first reading's seconds left
 * @param to - the last reading's seconds left
 * @returns the curve
 */
function curve(score: (tLeft: number) => number, from = 55, to = 30): CurvePoint[] {
  const points: CurvePoint[] = [];
  for (let t = from; t >= to; t -= 0.5) points.push([t, Math.round(score(t))]);
  return points;
}

/**
 * A score that trails the reference pace (0 at 60 s left, one {@link U} a second after) by
 * `lag` seconds.
 *
 * @param lag - seconds behind, fixed or by seconds left
 * @returns the score by seconds left
 */
function paced(lag: number | ((tLeft: number) => number) = 0): (tLeft: number) => number {
  const lagAt = typeof lag === "number" ? () => lag : lag;
  return (t) => U * (60 - t - lagAt(t));
}

/**
 * A lag of 5 s while the countdown is between two moments, none outside them.
 *
 * @param lo - the window's lowest seconds left, inclusive
 * @param hi - its highest, inclusive
 * @returns the lag by seconds left
 */
function behindBetween(lo: number, hi: number): (tLeft: number) => number {
  return (t) => (t >= lo && t <= hi ? 5 : 0);
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
 * Stages runs ENTERed back to back: a cut run's cycle is {@link CUT_S}, any other's {@link KEPT_S}.
 *
 * @param specs - the runs, oldest first
 * @returns the attempts
 */
function session(specs: readonly RunSpec[]): Attempt[] {
  let s = 0;
  return specs.map((spec, i) => {
    const attempt = {
      time: clock(s),
      run: i + 1,
      end: spec.end,
      paceScore: spec.paceScore ?? null,
      finalScore: spec.final,
      curve: spec.curve,
      sample: spec.sample,
    };
    s += spec.end === "pruned" ? CUT_S : KEPT_S;
    return attempt;
  });
}

/**
 * A sample run that played out.
 *
 * @param final - its final
 * @param points - its curve; the reference pace from 55 s left unless given
 * @returns the run
 */
function sampled(final: number, points: CurvePoint[] = curve(paced())): RunSpec {
  return { sample: true, end: "kept-played-out", final, curve: points };
}

/**
 * Sample runs that finished far from the top.
 *
 * @param count - how many
 * @param make - builds each run's curve; 5 s behind the reference pace unless given
 * @returns the runs
 */
function field(count: number, make: () => CurvePoint[] = () => curve(paced(5))): RunSpec[] {
  return Array.from({ length: count }, () => sampled(FIELD_FINAL, make()));
}

/**
 * The best sample runs by final, best first, on the reference pace unless given.
 *
 * @param make - builds the curve of the run at each position
 * @returns the runs
 */
function leaders(make: (i: number) => CurvePoint[] = () => curve(paced())): RunSpec[] {
  return [500, 490, 480, 470, 460].map((final, i) => sampled(final * U, make(i)));
}

/**
 * Runs outside the sample cut at the bar, which set the cut-run cycle. There are as many as the
 * gaps after 100 sample runs, so the median gap over all runs (55 s) matches neither cycle.
 */
const CUT_RUNS: RunSpec[] = Array.from({ length: 99 }, () => ({
  sample: false,
  end: "pruned",
  final: 12 * U,
  curve: [],
}));

/**
 * Analyses a session that opens with {@link CUT_RUNS}, at {@link MIN}.
 *
 * @param specs - the runs after them
 * @returns the analysis
 * @throws if the analysis refuses
 */
function analyze(specs: readonly RunSpec[]): Fitted {
  const analysis = analyzeCutoff(session([...CUT_RUNS, ...specs]), MIN);
  if (!analysis.ok) throw new Error(`refused: ${analysis.reason}`);
  return analysis;
}

/**
 * One checkpoint's fit at one leniency.
 *
 * @param analysis - the analysis
 * @param delta - the leniency, in seconds
 * @param tLeft - the checkpoint, in seconds left
 * @returns the fit; undefined when the analysis has none
 */
function fitAt(analysis: Fitted, delta: number, tLeft: number) {
  return analysis.fits.find((f) => f.delta === delta)?.checkpoints.find((c) => c.tLeft === tLeft);
}

/**
 * One scorable checkpoint's fit at one leniency.
 *
 * @param analysis - the analysis
 * @param delta - the leniency, in seconds
 * @param tLeft - the checkpoint, in seconds left
 * @returns the fit
 * @throws if the analysis has no fit there, or reports it unscorable
 */
function scoredAt(
  analysis: Fitted,
  delta: number,
  tLeft: number,
): Extract<CheckpointFit, { threshold: number }> {
  const fit = fitAt(analysis, delta, tLeft);
  if (!fit || fit.threshold === null) throw new Error(`no scored fit at δ ${delta}, ${tLeft} s`);
  return fit;
}

/**
 * The checkpoints given a threshold at one leniency.
 *
 * @param analysis - the analysis
 * @param delta - the leniency, in seconds
 * @returns their seconds left, in the analysis's order
 */
function scorable(analysis: Fitted, delta: number): number[] {
  const fit = analysis.fits.find((f) => f.delta === delta);
  return (fit?.checkpoints ?? []).filter((c) => c.threshold !== null).map((c) => c.tLeft);
}

/**
 * Seconds left of the rule's checkpoints.
 *
 * @param rule - the chosen rule, or null
 * @returns them in the rule's order; undefined with no rule
 */
function moments(rule: CutoffRule | null) {
  return rule?.checkpoints.map((c) => c.tLeft);
}

describe("scoreAt", () => {
  const points: CurvePoint[] = [
    [40, 1_000],
    [39, 1_100],
    [35, 1_500],
  ];

  it("interpolates between the readings either side", () => {
    expect(scoreAt(points, 39.75)).toBe(1_025);
  });

  it("reads a reading at its own moment, even after a wide gap", () => {
    expect(scoreAt(points, 40)).toBe(1_000);
    expect(scoreAt(points, 35)).toBe(1_500);
  });

  it("vouches for readings exactly 2.5 s apart", () => {
    expect(
      scoreAt(
        [
          [40, 1_000],
          [37.5, 1_500],
        ],
        38.5,
      ),
    ).toBe(1_300);
  });

  it.for([37, 41, 30])(
    "won't vouch for %s s left, between readings over 2.5 s apart or with none on one side",
    (tLeft) => {
      expect(scoreAt(points, tLeft)).toBeNull();
    },
  );
});

describe("barScore", () => {
  const base: Attempt = session([sampled(FIELD_FINAL, curve(paced(), 55, 29))])[0]!;

  it("takes the macro's own reading over the curve's", () => {
    expect(barScore({ ...base, paceScore: 1_234 })).toBe(1_234);
  });

  it("reads the curve at 30 s left when the macro judged none", () => {
    expect(
      barScore({
        ...base,
        curve: [
          [31, 1_000],
          [29, 1_200],
        ],
      }),
    ).toBe(1_100);
  });

  it("is null when neither has a score at 30 s left", () => {
    expect(barScore({ ...base, curve: curve(paced(), 55, 35) })).toBeNull();
  });
});

describe("medianCycle", () => {
  /**
   * A run with nothing read, for its time and end alone.
   *
   * @param time - its ENTER time
   * @param end - how it ended
   * @returns the run
   */
  function bare(time: string, end: AttemptEnd): Attempt {
    return { time, run: 1, end, paceScore: null, finalScore: null, curve: [], sample: false };
  }

  const day = [
    bare("2026-10-15 22:00:00", "pruned"),
    bare("2026-10-15 22:00:40", "pruned"),
    bare("2026-10-15 22:01:24", "kept-played-out"),
    bare("2026-10-15 22:02:34", "pruned"),
    bare("2026-10-15 22:10:54", "pruned"),
    bare("2026-10-15 22:11:40", "pruned"),
  ];

  it("takes the median gap between consecutive runs, ignoring breaks over 300 s", () => {
    expect(medianCycle(day)).toBe(45);
  });

  it("measures each included run from its own ENTER to the next run's in the file", () => {
    expect(medianCycle(day, (a) => a.end === "pruned")).toBe(44);
    expect(medianCycle(day, (a) => a.end === "kept-played-out")).toBe(70);
  });

  it("is null with no gap to measure", () => {
    expect(medianCycle(day.slice(0, 1))).toBeNull();
    expect(medianCycle(day, (a) => a.end === "stopped")).toBeNull();
  });

  it("counts a gap just under 300 s and leaves out a gap of exactly 300 s", () => {
    const start = bare("2026-10-15 22:00:00", "pruned");

    expect(medianCycle([start, bare("2026-10-15 22:04:59", "pruned")])).toBe(299);
    expect(medianCycle([start, bare("2026-10-15 22:05:00", "pruned")])).toBeNull();
  });
});

describe("analyzeCutoff", () => {
  it("fits only sample runs with a final and a curve, and counts the runs it left out", () => {
    const analysis = analyze([
      ...leaders(),
      ...field(95),
      { sample: true, end: "stopped", final: null, curve: curve(paced()) },
      { sample: true, end: "kept-played-out", final: 800 * U, curve: [] },
      { sample: null, end: "kept-on-pace", final: 900 * U, curve: curve(paced()) },
    ]);

    expect(analysis).toMatchObject({ samples: 100, others: CUT_RUNS.length + 3, bar: 500 * U });
  });

  it("sets the bar at the k-th best final, k being 1% of the sample runs rounded up, and lists every run at or over it as top, oldest first", () => {
    const analysis = analyze([
      ...[480, 450, 500, 470, 480, 460].map((final) => sampled(final * U)),
      ...field(95),
    ]);

    expect(analysis.bar).toBe(480 * U);
    expect(analysis.top.map((a) => a.finalScore)).toEqual([480 * U, 500 * U, 480 * U]);
  });

  describe("on 101 sample runs with a tie at the edge of the top 5%", () => {
    const tied = () => sampled(460 * U);
    const runs = [
      tied(),
      ...field(20),
      sampled(500 * U),
      tied(),
      ...field(20),
      sampled(490 * U),
      sampled(480 * U),
      tied(),
      ...field(53),
      sampled(470 * U),
      tied(),
    ];

    it("takes the top 5% by final as the reference set, best first, the earlier runs winning a tie", () => {
      const attempts = session([...CUT_RUNS, ...runs]);
      const ties = attempts.filter((a) => a.finalScore === 460 * U);
      const ahead = [500, 490, 480, 470].map((f) => attempts.find((a) => a.finalScore === f * U)!);
      const expected = [...ahead, ties[0]!, ties[1]!];

      const analysis = analyzeCutoff(attempts, MIN);

      expect(analysis.ok && analysis.reference.map((a) => a.run)).toEqual(
        expected.map((a) => a.run),
      );
    });

    it("bounds the chosen rule's loss rate by the reference set's size", () => {
      expect(analyze(runs).best?.lossBound).toBeCloseTo(1 - 0.05 ** (1 / 6), 10);
    });
  });

  it("holds every top run in the reference set when more runs tie at the bar than 5% would take", () => {
    const analysis = analyze([...Array.from({ length: 6 }, () => sampled(500 * U)), ...field(94)]);

    expect(analysis.top).toHaveLength(6);
    expect(analysis.reference.map((a) => a.run)).toEqual(analysis.top.map((a) => a.run));
  });

  it("refuses a reference set under 5 sample runs", () => {
    expect(analyzeCutoff(session(CUT_RUNS), MIN)).toMatchObject({
      ok: false,
      reason: "small-reference",
    });
    expect(analyzeCutoff(session([...CUT_RUNS, ...leaders(), ...field(75)]), MIN)).toMatchObject({
      ok: false,
      reason: "small-reference",
    });
    expect(analyzeCutoff(session([...CUT_RUNS, ...leaders(), ...field(76)]), MIN)).toMatchObject({
      ok: true,
    });
  });

  it("refuses a file with no pruned run to measure the cut-run cycle on", () => {
    expect(analyzeCutoff(session([...leaders(), ...field(95)]), MIN)).toEqual({
      ok: false,
      reason: "no-cut-cycle",
    });
  });

  it("refuses a file with no played-out run followed by another within 300 s", () => {
    const start = CUT_RUNS.length * CUT_S;
    const played = session([...leaders(), ...field(95)]).map((run, i) => ({
      ...run,
      time: clock(start + i * 400),
    }));

    expect(analyzeCutoff([...session(CUT_RUNS), ...played], MIN)).toEqual({
      ok: false,
      reason: "no-kept-cycle",
    });
  });

  describe("with a reference run trailing the pace by 0.8 s", () => {
    const runs: RunSpec[] = [
      ...leaders((i) => curve(paced(i === 2 ? 0.8 : 0))),
      ...field(94),
      sampled(FIELD_FINAL, curve(paced(1.3))),
      { sample: false, end: "kept-played-out", final: FIELD_FINAL, curve: curve(paced(5)) },
    ];

    it("sets T(c) to the lowest score a reference run had δ seconds earlier", () => {
      const analysis = analyze(runs);

      expect(fitAt(analysis, 0.5, 40)?.threshold).toBe(18_700_000_000);
      expect(fitAt(analysis, 2, 40)?.threshold).toBe(17_200_000_000);
    });

    it("cuts only the sample runs strictly under T(c)", () => {
      expect(scoredAt(analyze(runs), 0.5, 40).cuts).toBe(94);
    });
  });

  it("judges from the earliest checkpoint every reference run has a score δ earlier, down to 30", () => {
    const analysis = analyze([
      ...leaders(() => curve(paced(), 49)),
      ...field(95, () => curve(paced(5), 49)),
    ]);

    expect(scorable(analysis, 0.5)).toEqual([47.5, 45, 42.5, 40, 37.5, 35, 32.5, 30]);
    expect(scorable(analysis, 2)).toEqual([45, 42.5, 40, 37.5, 35, 32.5, 30]);
  });

  it("lists no checkpoint before the earliest scorable one, past a gap early in a reference curve", () => {
    const late = curve(paced()).filter(([t]) => t >= 53.5 || t <= 49);
    const analysis = analyze([...leaders((i) => (i === 2 ? late : curve(paced()))), ...field(95)]);

    expect(analysis.fits[0]).toMatchObject({ delta: 0.5 });
    expect(analysis.fits[0]!.checkpoints.map((c) => c.tLeft)).toEqual([
      47.5, 45, 42.5, 40, 37.5, 35, 32.5, 30,
    ]);
  });

  it("reports a checkpoint where a reference run has no score δ earlier as unscorable", () => {
    const gapped = curve(paced()).filter(([t]) => t >= 41.5 || t <= 38.5);
    const analysis = analyze([
      ...leaders((i) => (i === 2 ? gapped : curve(paced()))),
      ...field(95),
    ]);

    expect(fitAt(analysis, 0.5, 40)).toEqual({ tLeft: 40, threshold: null });
    expect(scorable(analysis, 0.5)).toEqual([52.5, 50, 47.5, 45, 42.5, 37.5, 35, 32.5, 30]);
  });

  describe("with a reference run that stalls until 45 s left", () => {
    const stall = curve((t) => (t >= 45 ? 12.5 * U : U * (60 - t)), 47);
    const runs = [
      ...leaders((i) => (i === 3 ? stall : curve(paced(), 47))),
      ...field(95, () => curve(paced(5), 47)),
    ];

    it("counts it as lost at 45 s left, where thresholds fitted without it cut it", () => {
      const analysis = analyze(runs);

      expect(DELTAS_S.map((delta) => scoredAt(analysis, delta, 45).looLosses)).toEqual(
        DELTAS_S.map(() => 1),
      );
      expect(DELTAS_S.map((delta) => scoredAt(analysis, delta, 42.5).looLosses)).toEqual(
        DELTAS_S.map(() => 0),
      );
    });

    it("never picks a rule with that checkpoint, though it would cut the field earliest", () => {
      const checkpoints = moments(analyze(runs).best);

      expect(checkpoints?.[0]).toBe(42.5);
      expect(checkpoints).not.toContain(45);
    });
  });

  describe("with field runs that fall behind at different moments", () => {
    const runs = [
      ...leaders(),
      ...field(20, () => curve(paced(behindBetween(46, 60)))),
      ...field(10),
      ...field(40, () => curve(paced(behindBetween(41, 44)))),
      ...field(25, () => curve(paced(behindBetween(0, 36)))),
    ];

    it("picks the rule whose sample runs cost the fewest hours, with at most two checkpoints", () => {
      expect(moments(analyze(runs).best)).toEqual([52.5, 42.5]);
    });

    it("breaks a tie between leniencies toward the larger δ", () => {
      const { best } = analyze(runs);

      expect(best?.delta).toBe(2);
      expect(best?.checkpoints.map((c) => c.minScore)).toEqual([5_500_000_000, 15_500_000_000]);
    });

    it("reports the seconds a checkpoint's cuts save as cycleKept − (cycleCut − (c − 30)) each", () => {
      expect(fitAt(analyze(runs), 2, 52.5)).toMatchObject({
        cuts: 30,
        savedS: 30 * (KEPT_S - (CUT_S - (52.5 - 30))),
      });
    });

    it("costs a sample run cut at its first failed checkpoint c as cycleCut − (c − 30) s and one played out as cycleKept", () => {
      const hours =
        (100 * KEPT_S - 30 * (KEPT_S - CUT_S + 22.5) - 40 * (KEPT_S - CUT_S + 12.5)) / 3600;

      expect(analyze(runs).best).toMatchObject({
        hours: expect.closeTo(hours, 9),
        topPerHour: expect.closeTo(1 / hours, 9),
      });
    });

    it("judges the baseline as the 30 s check at minScore on the same sample runs", () => {
      const underBar = [{ ...runs[0]!, paceScore: 29 * U }, ...runs.slice(1)];
      const hours = (36 * CUT_S + 64 * KEPT_S) / 3600;

      expect(analyze(underBar).baseline).toMatchObject({
        hours: expect.closeTo(hours, 9),
        topCut: 1,
        topPerHour: 0,
      });
    });
  });

  it("breaks a tie in hours toward the later checkpoints", () => {
    const analysis = analyze([
      ...leaders(),
      ...field(10, () => curve(paced(behindBetween(44, 46)))),
      ...field(12, () => curve(paced(behindBetween(36.5, 38.5)))),
      ...field(15, () => curve(paced(behindBetween(0, 31)))),
      ...field(58, () => curve(paced())),
    ]);

    expect(moments(analysis.best)).toEqual([37.5, 30]);
  });

  it("breaks a tie in hours toward fewer checkpoints", () => {
    expect(moments(analyze([...leaders(), ...field(95)]).best)).toEqual([52.5]);
  });

  it("chooses no rule when every scorable checkpoint loses a reference run", () => {
    const gapped = curve(paced()).filter(([t]) => t >= 41.5 || t <= 38.5);
    const analysis = analyze([
      ...leaders((i) => (i === 2 ? gapped : curve(paced(i === 4 ? 3 : 0)))),
      ...field(95),
    ]);

    expect(fitAt(analysis, 0.5, 40)?.threshold).toBeNull();
    expect(analysis.best).toBeNull();
  });
});

describe("checkpointsLine", () => {
  it("writes the rule as the INI's Checkpoints value, earliest first", () => {
    const rule: CutoffRule = {
      delta: 1.5,
      checkpoints: [
        { tLeft: 47.5, minScore: 61_000_000_000 },
        { tLeft: 30, minScore: 1_950_000_000_000 },
      ],
      hours: 1,
      topPerHour: 1,
      lossBound: 0.4,
    };

    expect(checkpointsLine(rule)).toBe("47.5:61000000000|30:1950000000000");
  });
});
