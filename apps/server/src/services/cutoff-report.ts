/**
 * The Guild Conquest early-cutoff report: the shared analysis (`@crumble/schema/cutoff`) run on
 * the macro's recorded runs, written for the terminal, ending with the chosen rule as the INI's
 * `[Prune] Checkpoints` line.
 *
 * @module
 */
import type { Attempts, PaceRule } from "@crumble/schema";
import type {
  CheckpointFit,
  CutoffCheckpoint,
  CutoffFit,
  CutoffFitted,
  CutoffRefusal,
  CutoffRule,
} from "@crumble/schema/cutoff";
import { analyzeCutoff, BAR_S, BOUND_RISK, checkpointsLine } from "@crumble/schema/cutoff";

/**
 * The macro's `[Prune] MinScore` when its INI sets none: `DEFAULTS` in
 * `tools/conquest-macro/conquest-loop.ahk`.
 */
const DEFAULT_MIN_SCORE = 1_950_000_000_000;

/** The report and the exit code it calls for. */
export interface CutoffReport {
  /** Lines for the terminal; the last is the `Checkpoints=` line when a rule qualifies. */
  text: string;
  /** 0 when the analysis ran, a rule or none; 1 when it couldn't. */
  exitCode: number;
}

/**
 * Writes a score in full, grouped by thousands.
 *
 * @param score - a whole score
 * @returns e.g. `4,360,000,000,000`
 */
function fullScore(score: number): string {
  return score.toLocaleString("en-US");
}

/**
 * Writes a rate or a duration to three significant figures.
 *
 * @param value - a positive figure
 * @returns e.g. `1.23`, or a whole number from 100 up
 */
function figure(value: number): string {
  return value >= 100 ? value.toFixed(0) : value.toPrecision(3);
}

/**
 * Writes a count of seconds to a tenth, with no trailing zero.
 *
 * @param seconds - a duration in seconds
 * @returns e.g. `1575` or `577.5`
 */
function tenths(seconds: number): string {
  return String(Math.round(seconds * 10) / 10);
}

/**
 * Writes one check of a rule.
 *
 * @param check - the moment and the score a run must have then
 * @returns `<seconds left> s >= <min score>`
 */
function checkText(check: CutoffCheckpoint): string {
  return `${check.tLeft} s >= ${fullScore(check.minScore)}`;
}

/**
 * Writes a rule's checkpoints and what it yields.
 *
 * @param rule - a fitted rule
 * @returns each check, earliest first, then its top runs per hour
 */
function ruleText(rule: CutoffRule): string {
  return `${rule.checkpoints.map(checkText).join(" then ")}  (${figure(rule.topPerHour)} top runs/h)`;
}

/**
 * Writes one checkpoint's row of the table.
 *
 * @param fit - the checkpoint's fit
 * @param inRule - whether the chosen rule checks this checkpoint
 * @returns its threshold, cuts, seconds saved and leave-one-out losses, or that it is unscorable
 */
function checkpointRow(fit: CheckpointFit, inRule: boolean): string {
  if (fit.threshold === null) {
    return `  ${fit.tLeft} s  unscorable: a reference run has no score that early`;
  }
  return [
    `  ${fit.tLeft} s`,
    `min ${fullScore(fit.threshold)}`,
    `cuts ${fit.cuts}`,
    `saves ${tenths(fit.savedS)} s`,
    `losses ${fit.looLosses}`,
    ...(inRule ? ["in rule"] : []),
  ].join("  ");
}

/**
 * Writes the table of one leniency's checkpoints.
 *
 * @param fit - the leniency's fits
 * @param heading - what the table shows, ahead of its column names
 * @param rule - the chosen rule, whose checkpoints the table marks; null when none is chosen
 * @returns the heading line, then a row per checkpoint
 */
function checkpointTable(fit: CutoffFit, heading: string, rule: CutoffRule | null): string[] {
  const checked = new Set(rule?.checkpoints.map((c) => c.tLeft));
  return [
    `${heading}: min score, cuts, seconds saved, leave-one-out losses`,
    ...fit.checkpoints.map((c) => checkpointRow(c, checked.has(c.tLeft))),
  ];
}

/**
 * Writes the line on the baseline: the macro's own pace check at {@link BAR_S}.
 *
 * @param analysis - the fitted analysis
 * @param rule - the INI's pace rule, for its `CheckAtS`
 * @param minScore - the baseline's score at {@link BAR_S}
 * @returns the line, noting when the INI checks at another moment
 */
function baselineLine(analysis: CutoffFitted, rule: PaceRule, minScore: number): string {
  const { baseline } = analysis;
  const line = `Baseline (${checkText({ tLeft: BAR_S, minScore })}): ${figure(baseline.topPerHour)} top runs per hour over ${figure(baseline.hours)} h, ${baseline.topCut} top runs cut`;
  return rule.checkAtS === null || rule.checkAtS === BAR_S
    ? line
    : `${line}; the INI checks at ${rule.checkAtS} s; this baseline judges at ${BAR_S} s`;
}

/**
 * Writes the fitted analysis.
 *
 * @param analysis - the fitted analysis
 * @param runsFile - the runs file it read
 * @param rule - the INI's pace rule
 * @param minScore - the baseline's score at {@link BAR_S}
 * @returns the report's lines
 */
function describeFit(
  analysis: CutoffFitted,
  runsFile: string,
  rule: PaceRule,
  minScore: number,
): string[] {
  const { best } = analysis;
  const top = new Set(analysis.top);
  const lines = [
    `Runs in ${runsFile}: ${analysis.samples} sample, ${analysis.others} other`,
    `Top run: final >= ${fullScore(analysis.bar)}`,
    "Reference runs, best final first:",
    ...analysis.reference.map(
      (run) =>
        `  ${run.time}  run ${run.run}  ${fullScore(run.finalScore)}${top.has(run) ? "  top" : ""}`,
    ),
    "Best rule per delta:",
    ...analysis.fits.map(
      (fit) => `  delta ${fit.delta} s: ${fit.best ? ruleText(fit.best) : "no qualifying rule"}`,
    ),
  ];
  if (best) {
    const chosen = analysis.fits.find((fit) => fit.delta === best.delta)!;
    lines.push(
      ...checkpointTable(chosen, `Per checkpoint at the chosen delta ${best.delta} s`, best),
      `Chosen rule (delta ${best.delta} s): ${ruleText(best)}, over ${figure(best.hours)} h of sample runs`,
    );
  } else if (analysis.fits.some((fit) => fit.checkpoints.some((c) => c.threshold !== null))) {
    const lenient = analysis.fits.reduce((a, b) => (b.delta > a.delta ? b : a));
    lines.push(
      "No rule qualifies: every scorable checkpoint loses a reference run.",
      ...checkpointTable(
        lenient,
        `Per checkpoint at the most lenient delta ${lenient.delta} s, no rule chosen`,
        null,
      ),
    );
  } else {
    lines.push("No rule qualifies: no checkpoint is scorable.");
  }
  lines.push(baselineLine(analysis, rule, minScore));
  if (best) {
    lines.push(
      `Loss bound: up to ${figure(best.lossBound * 100)}% of reference-like runs cut (${Math.round((1 - BOUND_RISK) * 100)}% upper bound); optimistic, as the rule is the cheapest of every candidate tried`,
      `Checkpoints=${checkpointsLine(best)}`,
    );
  }
  return lines;
}

/**
 * Says why the analysis refused, in plain words, with the runs it read.
 *
 * @param refusal - the analysis's refusal
 * @returns the line
 */
function refusalText(refusal: CutoffRefusal): string {
  const read = `${refusal.samples} sample and ${refusal.others} other runs read`;
  switch (refusal.reason) {
    case "small-reference":
      return `Not enough sample runs yet: ${refusal.samples} of the ${refusal.samplesNeeded} needed (${refusal.others} other runs read).`;
    case "no-cut-cycle":
      return `No pruned run is followed by another without a break, so the time a cut run takes can't be measured (${read}).`;
    case "no-kept-cycle":
      return `No played-out run is followed by another without a break, so the time a played-out run takes can't be measured (${read}).`;
  }
}

/**
 * Runs the early-cutoff analysis on the Guild Conquest macro's recorded runs and writes the
 * report. The baseline is judged at the INI's `[Prune] MinScore`, or the macro's default when
 * the INI sets none.
 *
 * @param data - the macro's runs, curves and pace rule, as the attempts repo reads them
 * @param runsFile - the runs file the repo read, or looked for when `data.available` is false
 * @returns the report, exit code 0 when the analysis ran (a rule or none); exit code 1, with why
 *   and no `Checkpoints=` line, when there is no runs file or the runs can't support a fit
 */
export function reportCutoff(data: Attempts, runsFile: string): CutoffReport {
  const { available, rule, attempts } = data;
  if (!available) return { text: `No runs file at ${runsFile}.`, exitCode: 1 };
  const minScore = rule.minScore ?? DEFAULT_MIN_SCORE;
  const analysis = analyzeCutoff(attempts, minScore);
  if (!analysis.ok) return { text: refusalText(analysis), exitCode: 1 };
  return { text: describeFit(analysis, runsFile, rule, minScore).join("\n"), exitCode: 0 };
}
