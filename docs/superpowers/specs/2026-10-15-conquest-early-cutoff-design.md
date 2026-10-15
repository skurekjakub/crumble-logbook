# Guild Conquest early cutoff

Date: 2026-10-15. Asked by the user: "improving the conquest macro for early cutoff. we will spend the next 500 ish runs gathering data so that we can early kill runs that are not in the top 1 percent of possible outcomes as soon as possible. ideally within the first 15 secs, so we get the most best attempts in over the conquest duration".

## Why

The Conquest macro (`tools/conquest-macro/`) retries the Piñata fight and ends a run with End Battle when its score is under 1.95T at 30 s left. A run's score is a lottery, and the season is the time the user has to draw a top run. A run cut at 30 s left still spends half the fight; a run judged 15 s into the fight costs a quarter of it. The rate that matters over a season is **top runs per hour**, and an earlier cutoff raises it if the early score separates the top runs from the rest. Whether it does is unmeasured.

## What "top 1%" means here

The top 1% means the top 1% of **finals**. The 30 s bar is not a stand-in for it: on 2026-10-15, runs at 1.28T, 1.33T and 1.38T at 30 s left, far under the 1.95T bar, played out to 3.90T, 3.99T and 3.91T, against 4.36T for a run that passed at 1.96T. Most of a final is earned after 30 s left, so the score at 30 s says little about it.

Runs the macro cuts have no final, so their outcome is unknown, and the runs that play out because they passed are a filtered sample. The macro therefore plays out **every 2nd run whatever its pace** (`[Prune] PlayOutEvery`; every 4th from 2026-10-15 22:18, every 2nd from that evening at the user's call; the runs file's `sample` column marks them). The sample runs' finals are an unbiased draw of the fight's outcomes, and they alone define the target. About 500 runs give about 250 sample runs: a top 1% of about three runs and a top 5% of about thirteen.

## Design

### 1. Gathering (running since 2026-10-15 21:48)

The macro runs with the 30 s / 1.95T check, and every 2nd run plays out (every 4th from 22:18 until the evening's change). Each run's curve has about 2.4 readings a second from about 55 s left (`[Timing] AfterEnterMs=6000` holds the first read until then) to its cut at 30 s, or to 0 for a run that plays out. The earliest moment the analysis can judge is where every run has readings on both sides; the analysis computes it from the data rather than assuming one. Before 55 s left the score is under 0.2G and grows about twentyfold in two seconds, so those moments measure the fight's start time more than the run.

### 2. One analysis, shared: `@crumble/schema/cutoff`

The web's Attempts tab already ships an early-cut test (`testCut`, `scoreAt`, `CHECKPOINTS` and `CUT_MARGIN` in `apps/web/src/lib/attempts.ts`, shown as "An earlier cut"). The analysis lives in one pure module, `packages/schema/src/cutoff.ts`, exported as `@crumble/schema/cutoff` beside `@crumble/schema/power`, and both the tab and a CLI use it. `scoreAt` moves there unchanged (interpolation between the readings either side, null when they are more than 2.5 s apart). `testCut`, `CHECKPOINTS` and `CUT_MARGIN` are replaced by it.

**Inputs.** The **sample runs**: `sample` true, with a final and a curve. A sample run plays out under any rule (§ 3: no checkpoint cuts it), so the sample stays unbiased after early checkpoints run. Every other run is left out of the fit, and the report says how many runs of each kind it read. A run's **bar score** (its score at 30 s left: `paceScore` when judged at 30 s, else `scoreAt(curve, 30)`) stays as a helper for the tab's bar surfaces; the analysis doesn't target it.

**The target.** With `m` sample runs, `k = max(1, ceil(0.01 m))`; the bar `B` is the k-th best sample final, and a sample run is **top** when its final is at least `B`.

**Reference set.** The top `max(k, ceil(0.05 m))` sample runs by final, ties broken by time. It holds every top run. Five percent rather than the top runs alone because one or two runs can't set a threshold.

**Leniency as a time shift.** The score climbs about twentyfold in the first two seconds and about twofold in two seconds at 45 s left, so a percentage margin means nothing early. The threshold at checkpoint `c` is `T(c) = min over the reference set of scoreAt(curve, c + δ)`: the lowest score a reference run had `δ` seconds earlier. `δ` is chosen with the rule, from 0.5, 1, 1.5 and 2 s.

**Checkpoints.** The multiples of 2.5 s from the earliest one at which every reference run has a score at `c + δ`, down to 30 s left. The 30 s checkpoint is fitted like the rest: the data may show the 1.95T bar cutting runs that would have reached the top. A checkpoint where any reference run lacks a score is dropped and reported as unscorable, never given a threshold.

**Cost of a run.** One helper measures cycles from the runs file's consecutive `time` values, median over gaps under 300 s, for a given set of runs: `cycleCut` over pruned runs (once § 3 ships, only those cut at 30 s), `cycleKept` over runs that played out, and the tab's runs-per-hour tile over all runs, as `summarize` does today. Under a rule, a sample run cut at checkpoint `c` costs `cycleCut − (c − 30)` seconds, and one not cut costs `cycleKept`.

**Choosing the rule.** The rule is `δ` and one or two checkpoints. Each candidate is applied to the sample runs, which stand for every run. It is judged by **leave-one-out over the reference set**: each reference run is judged by thresholds fitted without it, and the candidate's losses are the reference runs it would have cut. In-sample thresholds never cut a reference run, so only the leave-one-out count says anything. A candidate qualifies only with **zero losses**; among those the analysis picks the one whose sample runs cost the fewest hours (so the most top runs per hour, since every qualifying rule keeps them all), ties going to fewer checkpoints, then the larger `δ`, then the later checkpoints. Zero losses out of a reference set of `r` bounds the true rate at which the rule cuts a reference-like run at `1 − 0.05^(1/r)` (95%): about 39% at `r = 6`, 11% at `r = 25`. The report prints that bound beside the rule, and it is the number that says whether the data is enough.

**Baseline.** The INI's current rule (the 30 s check at `MinScore`), applied to the same sample runs: its hours, the top runs it would have cut, and top runs per hour.

**Report.** The runs read (sample and other), `B` and the top and reference runs; per checkpoint at the chosen `δ`: `T(c)`, how many sample runs it would cut, the seconds those cuts save, and the leave-one-out losses; per `δ`, the best qualifying rule. For the chosen rule: top runs per hour against the baseline, the loss bound, and the INI line (§ 3). With no runs file, a reference set under 5 sample runs, no measurable cycle for a pruned or a played-out run, or no qualifying rule, it reports why and no line.

### 3. The macro: `[Prune] Checkpoints`, once the data earns it

This part ships after the analysis shows a qualifying rule (zero leave-one-out losses over the reference set) that saves time, with a loss bound the user accepts. `MinScore` and `CheckAtS` become `[Prune] Checkpoints=<seconds left>:<min score>|…`, e.g. `47.5:61000000000|30:1950000000000`; the default is today's `30:1950000000000`, and an empty value turns the cutoff off. A malformed entry, or entries out of descending order, fail the loop's start (F8) with a message naming the entry. Sample runs (`PlayOutEvery`) are judged at every checkpoint, for the record, and never cut.

`TrackFight` judges every checkpoint with the same rule as `scoreAt`: the score at `c` is interpolated between the last reading above `c` and the first at or below it, when they are at most 2.5 s apart; each reading is tested against every checkpoint it has crossed, in order, and becomes the "above" reading for the next. A checkpoint with no bracketing pair once the countdown is `LateS` below it is skipped without consuming the reading. The run is ended at the first checkpoint it falls under.

The run record keeps the deciding checkpoint: the one that cut it, or the last one judged. `end` values: `pruned` (cut at a checkpoint), `kept-on-pace` (judged at the 30 s checkpoint and passed it, and every earlier checkpoint it was judged at), `kept-played-out` (a sample run behind at a checkpoint), `kept-unjudged` (not judged at the 30 s checkpoint), `kept-end-failed` (behind, but End Battle never showed). `conquest-runs.csv` gains a last column after `sample`: `checkpoint_s`, with `pace_score` the score at that checkpoint. The existing file keeps its older header (the macro writes the header only when it creates the file); the server parses by position. A row with no `checkpoint_s` and a `pace_score` was judged at 30 s; one with neither wasn't judged.

### 4. The Attempts tab

The tab reads the rule as `checkpoints: { tLeft, minScore }[] | null` (null when the INI doesn't set the key, so the macro runs its default).

- **"An earlier cut"** shows the shared analysis: the chosen rule, its top runs per hour against the baseline, the loss bound, and per checkpoint the threshold, the cuts and the leave-one-out losses, with the scatter (score at `c` against final, sample runs only, top runs marked) and `T(c)` as its vertical line. The `?at=` search param accepts any multiple of 2.5 between 30 and 60 (it is validated before the data loads); a value the analysis dropped shows as unscorable.
- **`RunDetail`** (first step) lists the run's score at each of the analysis's checkpoints, from the shared `scoreAt`.
- **The bar surfaces** (the "Best at 30 s" tile, the histogram of scores at 30 s left, the runs table's "At 30 s" column) read the bar score, over the runs that reached 30 s.
- **A run's End pill** shows where an early cut happened ("cut 47.5 s"), and `RunDetail` lists the rule's checkpoints, each score against its threshold with a pass or fail pill.
- **The curve charts** draw the rule as one stepped floor line with a dot at each checkpoint, labelled once at the 30 s end and named in the legend.
- "Best final" ranks kept runs by their final. A pruned run's `final_score` is the score when End Battle was tapped, not a final: pruned runs rank below every kept run, by bar score, then by how late they were cut.

### Alternatives considered

- **A CLI-only analysis on the server** (`services/cutoff.ts`): would sit beside the tab's `testCut` with a different margin, grid and interpolation, two answers on one data set. One shared module instead.
- **The pass at the 30 s bar as the target**: measurable on every run, but runs far under the bar finished within 10% of a run that passed it, so it predicts the final poorly. The sample runs measure the real target.
- **Playing every run out**: the cleanest data, at about twice the time per run. Every 2nd run (the user's call, after every 4th at first) gives an unbiased sample twice as fast, at about half the extra time per run.
- **A percentage leniency**: 5% is 0.03 s of fight at 55 s left and 0.13 s at 45 s, smallest where runs differ most. A time shift means the same thing at every moment.
- **Applying every checkpoint**: each extra checkpoint adds its own out-of-sample risk (a new reference-like run falls under the minimum of 25 about one time in 26), so the rule takes at most two, chosen by leave-one-out.

## Refactoring & reorganization

| Old | New |
|---|---|
| `scoreAt`, `testCut`, `CutTest`, `CutPair`, `CutConfidence`, `CHECKPOINTS`, `Checkpoint`, `DEFAULT_CHECKPOINT`, `CUT_MARGIN`, `pearson` in `apps/web/src/lib/attempts.ts` | `scoreAt` and the analysis in `packages/schema/src/cutoff.ts` (`@crumble/schema/cutoff`); the rest deleted |
| `summarize`'s median cycle | the shared cycle helper in `cutoff.ts`, over all runs for `summarize.perHour` |
| `[Prune] MinScore`, `CheckAtS` (INI, DEFAULTS, `EndOf`, `RecordRun`) | `[Prune] Checkpoints` (§ 3, second step) |
| `PaceRule { minScore, checkAtS }` | `PaceRule { checkpoints: { tLeft, minScore }[] \| null }` (second step) |
| `Attempt` | plus `sample: boolean \| null` (first step: the runs file's sixth column, empty on older rows) and `checkpointS: number \| null` (second step) |

Ripple, first step: `packages/schema/src/attempts.ts` (`sample`), `apps/server/src/repos/attempts.ts` (parses `sample`), `apps/server/test/routes/attempts.test.ts`, `packages/schema/package.json` (export), `packages/schema/src/cutoff.ts` and its test, `apps/web/src/lib/attempts.ts`, `apps/web/src/views/AttemptsView.tsx`, `apps/web/src/views/AttemptRuns.tsx` (`RunDetail`, `listRuns`), `apps/web/src/components/AttemptCharts.tsx` (the scatter), `apps/web/src/lib/search.ts` or the view's search validation, `apps/web/src/app/modes/conquest.ts` (the lede), their tests; a CLI `apps/server/src/cli/cutoff.ts` (reads `createAttemptsRepo(macroDir)`, prints the report) with `cutoff` in `apps/server/package.json` and `conquest:cutoff` in the root `package.json`; `docs/conventions/stack-profile.md` (what `src/cli/` holds); the root `README.md` (commands).

Ripple, second step: `tools/conquest-macro/conquest-loop.ahk` and `.ini`, `tools/conquest-macro/README.md` (What the loop does, Runs file, Tuning), `packages/schema/src/attempts.ts`, `apps/server/src/repos/attempts.ts` (a number parser for `checkpoint_s`, the rule's null case), `apps/server/test/routes/attempts.test.ts`, `apps/web/src/components/AttemptCharts.tsx`, `apps/web/src/views/AttemptRuns.tsx`, `apps/web/src/views/AttemptsView.tsx` and their tests.

## Tests

- `cutoff.ts`: `scoreAt`'s gap guard; the bar score from `paceScore` or the curve; only sample runs define the target; `B` and the top runs; the reference set's size and tie-break; `T(c)` with `δ`; checkpoints snapped to 2.5 s, down to 30; a checkpoint dropped when a reference run lacks a score; leave-one-out cutting a reference run whose early score is the unique minimum, which disqualifies that candidate; the choice among qualifying candidates; the baseline; the cycle medians; the refusals (a reference set under 5, no qualifying rule).
- The repo (first step): the `sample` column parsed, empty on older rows.
- The CLI: the report on a staged fixture folder; the refusal with no runs file.
- The repo (second step): `Checkpoints` parsed, missing key → null, empty → `[]`, malformed → error; a row without `checkpoint_s`.
- The view: the earlier-cut section on fixture attempts; a run cut at an early checkpoint shows it in its pill and row; an old row reads as judged at 30 s; an empty rule reads as no cutoff.
- The macro has no test harness: `/Validate`, then a live run with a two-entry list, checked in the log.

## Out of scope

- Writing the INI from the CLI or the tab.

## Open questions

Unknowns pass: skipped by the person.

- About 250 sample runs out of 500 give a reference set of about thirteen, so the loss bound stays wide (about 21%). Whether to gather longer once the first numbers are in is the user's call.
- The printed bound is optimistic: it treats the chosen rule as fixed in advance, but the analysis picks the cheapest of every zero-loss candidate, and the leave-one-out trials share runs. The report says so; whether a stricter bound is worth building is the user's call.
