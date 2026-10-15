# Guild Conquest early cutoff: step 1 plan

> **For agentic workers:** steps use checkbox (`- [ ]`) syntax; tick a box in the same commit as the work it names.

**Goal:** One early-cut analysis, `@crumble/schema/cutoff`, that the Attempts tab and a `pnpm conquest:cutoff` command both use, built to `docs/superpowers/specs/2026-10-15-conquest-early-cutoff-design.md` § 2 and § 4's first-step parts. The macro's checkpoint list (§ 3) and the second-step schema and chart changes are a later plan, once the data shows a qualifying rule.

## Global Constraints

- `AGENTS.md`: layered `routes → services → repos → db`; JSDoc on every function; no counting or enumerating in prose; the UI rules (verdict first, scannable, phone width, both themes).
- `docs/conventions/comment-policy.md`: no archaeology; the code reads as if it had always been this way.
- `.ai/agent-working-rules.md` § 3: the web's `scoreAt`, `testCut` and median cycle are folded into the shared module, not kept beside it.
- Tests never hard-code a record's curated values; fixtures are staged.
- `pnpm verify` passes before every commit; every commit is pushed (fetch first, fast-forward only).
- The Conquest macro is gathering data: test runs slow captures and gap the curves of runs meanwhile (the user accepted this). Don't touch `tools/conquest-macro/` or its CSVs.
- The target is the top 1% of the **sample runs'** finals (spec § What "top 1%" means); the runs file's `sample` column marks them.

## Task 0: The `sample` column (orchestrator, inline)

- [x] The macro plays out every `PlayOutEvery`-th run and writes `sample` (`tools/conquest-macro/`), with the `kept-played-out` end in the schema and the tab's badge.
- [x] `Attempt.sample: boolean | null` in `packages/schema/src/attempts.ts`, parsed by `apps/server/src/repos/attempts.ts` from the sixth column; the route test covers a row with and without it.
- Reviews run on Opus.

## Task 1: `@crumble/schema/cutoff`

Files: `packages/schema/src/cutoff.ts` (new), `packages/schema/package.json` (export `./cutoff`), `packages/schema/test/cutoff.test.ts` (new).

The module's surface (names may be refined in review; behaviour per the spec § 2):

```ts
export const MAX_GAP_S = 2.5;      // readings further apart don't vouch for the score between
export const BAR_S = 30;           // the bar's moment, seconds left
export const STEP_S = 2.5;         // checkpoint grid
export const LAST_CHECKPOINT_S = 30;
export const DELTAS_S = [0.5, 1, 1.5, 2] as const;
export const TOP_SHARE = 0.01;
export const REFERENCE_SHARE = 0.05;
export const MIN_REFERENCE = 5;
export const MAX_CYCLE_S = 300;

export function scoreAt(curve: readonly CurvePoint[], tLeft: number): number | null;
export function barScore(attempt: Attempt): number | null;          // paceScore, else scoreAt(curve, 30)
export function medianCycle(attempts: readonly Attempt[], include?: (a: Attempt) => boolean): number | null;
export function analyzeCutoff(attempts: readonly Attempt[], minScore: number): CutoffAnalysis;
export function checkpointsLine(rule: CutoffRule): string; // "47.5:61000000000|30:1950000000000"
```

`CutoffAnalysis` is `{ ok: false, reason: "small-reference" | "no-cut-cycle" | "no-kept-cycle" }` or `{ ok: true, samples, others, bar, top, reference, fits, best, baseline }`:

- `fits` holds per `δ` per checkpoint either `{ tLeft, threshold: null }` (unscorable) or `{ tLeft, threshold, cuts, savedS, looLosses }`. `savedS` is the seconds the checkpoint's cuts save against playing those runs out (`cycleKept − (cycleCut − (c − 30))` each).
- `best` is the chosen `CutoffRule { delta, checkpoints: { tLeft, minScore }[], hours, topPerHour, lossBound }`, or null when no candidate qualifies. Equal hours prefer fewer checkpoints, then the larger `δ`, then the later checkpoints.
- `baseline` is the INI's 30 s rule on the same sample runs: `{ hours, topCut, topPerHour }`. `analyzeCutoff(attempts, minScore)` takes the INI's `MinScore` for the baseline only.

Settled while writing the tests: a run's cycle is the gap forward to the next run's ENTER, counted when under 300 s; ties by time go to the earlier run; a run is cut when its score is strictly under `T(c)`; the reference set holds every top run, ties at the bar included. The module also exports `isKept`, so the web's copy goes in Task 3.

- [x] `rubber-duk-tests` (WRITE) writes `packages/schema/test/cutoff.test.ts` from the spec's Tests section, on synthetic attempts; seen failing (module missing).
- [x] `rubber-duk-backend` (IMPLEMENT) writes `cutoff.ts` and the export until the tests pass: `pnpm exec vitest run packages/schema/test/cutoff.test.ts`.
- [x] `rubber-duk-tests` (AUDIT) and `rubber-duk-review` over the task's diff; findings fixed.

## Task 2: `pnpm conquest:cutoff`

Files: `apps/server/src/services/cutoff-report.ts` (new: the report, a pure function of the read attempts), `apps/server/src/cli/cutoff.ts` (new: reads the macro folder, prints, sets the exit code), `apps/server/package.json` (`"cutoff": "tsx src/cli/cutoff.ts"`), root `package.json` (`"conquest:cutoff": "pnpm --filter @crumble/server cutoff"`), `apps/server/test/services/cutoff-report.test.ts` (new), `packages/schema/src/cutoff.ts` (each fit's best rule, refusal counts), `docs/conventions/stack-profile.md` (what `src/cli/` holds).

The CLI reads `createAttemptsRepo(macroDir).read()`, runs `analyzeCutoff(attempts, rule.minScore)` (with no `MinScore` in the INI, the baseline is the macro's default, `1950000000000`) and prints, per spec § 2 Report: the runs read (sample and other), the bar and the top runs, the reference set, per `δ` the best qualifying rule, the per-checkpoint table at the chosen `δ`, the chosen rule's top runs per hour against the baseline with its loss bound (marked optimistic), and the `Checkpoints=` line. A refusal prints its reason and exits 1 with no line. Its printing is a pure function the test calls on a staged fixture folder.

- [x] `rubber-duk-tests` (WRITE) writes the CLI test on a staged fixture folder (`apps/server/test/importers/fixtures/` shows the shape); seen failing.
- [x] `rubber-duk-backend` (IMPLEMENT) writes the CLI and scripts until it passes; `pnpm conquest:cutoff` runs against the live data.
- [x] `rubber-duk-review` over the diff; findings fixed.

## Task 3: The Attempts tab on the shared analysis

Files: `apps/web/src/lib/attempts.ts`, `apps/web/src/views/AttemptsView.tsx`, `apps/web/src/views/AttemptRuns.tsx`, `apps/web/src/components/AttemptCharts.tsx`, `apps/web/src/app/modes/conquest.ts`, `apps/web/test/attempts-lib.test.ts`, `apps/web/test/attempts-view.test.tsx`.

- `lib/attempts.ts` loses `scoreAt`, `testCut`, `CutTest`, `CutPair`, `CutConfidence`, `CHECKPOINTS`, `Checkpoint`, `DEFAULT_CHECKPOINT`, `CUT_MARGIN`, `pearson`, `isKept`, `timeOf`, `MAX_GAP_S`, `MAX_CYCLE_S` and its median; `paceOf` becomes the shared `barScore`; `summarize.perHour` uses `medianCycle`.
- "An earlier cut" shows `analyzeCutoff`: the verdict first (the chosen rule and its top runs per hour against the baseline, or why none qualifies), the loss bound, the checkpoint picker over the analysis's checkpoints (`?at=` any multiple of 2.5 between 30 and 60, validated before the data loads; a dropped checkpoint shows as unscorable), and the scatter of score at `c` against final (sample runs only, top runs marked) with `T(c)` as its line.
- `RunDetail` lists the run's score at the analysis's checkpoints from the shared `scoreAt`.
- "Best final" ranks kept runs by final; pruned runs below them by bar score.
- The lede in `conquest.ts` matches the section.

- [ ] `rubber-duk-tests` (WRITE) updates the lib and view tests for the new behaviour; seen failing.
- [ ] `rubber-duk-frontend` (IMPLEMENT) rewires the tab until they pass, and checks the tab in agent-browser, light and dark, phone width.
- [ ] `rubber-duk-frontend` (REVIEW) and `rubber-duk-review` over the diff; findings fixed.

## Task 4: Finish

- [ ] Whole-change review: `rubber-duk-review` plus `rubber-duk-tests` (AUDIT) over every commit of the plan.
- [ ] `README.md` (commands, the Attempts tab) and `tools/conquest-macro/README.md` (where the analysis lives), per `.claude/skills/feature-development/references/readme-contract.md`.
- [ ] The explainer, published, with its row in `.ai/feature-constitution/README.md`; the last commit carries its URL.
