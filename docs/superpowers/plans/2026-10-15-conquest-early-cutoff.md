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
- Reviews run on Opus.

## Task 1: `@crumble/schema/cutoff`

Files: `packages/schema/src/cutoff.ts` (new), `packages/schema/package.json` (export `./cutoff`), `packages/schema/test/cutoff.test.ts` (new).

The module's surface (names may be refined in review; behaviour per the spec § 2):

```ts
export const MAX_GAP_S = 2.5;      // readings further apart don't vouch for the score between
export const BAR_S = 30;           // the bar's moment, seconds left
export const STEP_S = 2.5;         // checkpoint grid
export const LAST_CHECKPOINT_S = 32.5;
export const DELTAS_S = [0.5, 1, 1.5, 2] as const;
export const REFERENCE_SHARE = 0.05;
export const MIN_REFERENCE = 10;
export const MAX_CYCLE_S = 300;

export function scoreAt(curve: readonly CurvePoint[], tLeft: number): number | null;
export function barScore(attempt: Attempt): number | null;          // paceScore, else scoreAt(curve, 30)
export function medianCycle(attempts: readonly Attempt[], include?: (a: Attempt) => boolean): number | null;
export function analyzeCutoff(attempts: readonly Attempt[], minScore: number): CutoffAnalysis;
export function checkpointsLine(rule: CutoffRule, minScore: number): string; // "47.5:61000000000|30:1950000000000"
```

`CutoffAnalysis` is `{ ok: false, reason }` or `{ ok: true, runs, leftOut, passes, reference, fits, best, baseline }`, where `fits` holds per `δ` per checkpoint `{ tLeft, threshold | null (unscorable), cuts, savedS, looLosses }`, `best` is the chosen `CutoffRule { delta, checkpoints: { tLeft, minScore }[], runsPerHour, passesPerHour, lossBound }` or null when no candidate qualifies, and `baseline` is runs and passes per hour under the 30 s bar alone.

- [ ] `rubber-duk-tests` (WRITE) writes `packages/schema/test/cutoff.test.ts` from the spec's Tests section, on synthetic attempts; seen failing (module missing).
- [ ] `rubber-duk-backend` (IMPLEMENT) writes `cutoff.ts` and the export until the tests pass: `pnpm exec vitest run packages/schema/test/cutoff.test.ts`.
- [ ] `rubber-duk-tests` (AUDIT) and `rubber-duk-review` over the task's diff; findings fixed.

## Task 2: `pnpm conquest:cutoff`

Files: `apps/server/src/cli/cutoff.ts` (new), `apps/server/package.json` (`"cutoff": "tsx src/cli/cutoff.ts"`), root `package.json` (`"conquest:cutoff": "pnpm --filter @crumble/server cutoff"`), `apps/server/test/cli/cutoff.test.ts` (new), `docs/conventions/stack-profile.md` (what `src/cli/` holds).

The CLI reads `createAttemptsRepo(macroDir).read()`, runs `analyzeCutoff(attempts, rule.minScore)` and prints: the runs read and left out, the passes, the reference set, per `δ` the best qualifying rule, the per-checkpoint table at the chosen `δ`, the chosen rule against the baseline with its loss bound, and the `Checkpoints=` line. A refusal prints its reason and exits 1 with no line. Its printing is a pure function the test calls on a staged fixture folder.

- [ ] `rubber-duk-tests` (WRITE) writes the CLI test on a staged fixture folder (`apps/server/test/importers/fixtures/` shows the shape); seen failing.
- [ ] `rubber-duk-backend` (IMPLEMENT) writes the CLI and scripts until it passes; `pnpm conquest:cutoff` runs against the live data.
- [ ] `rubber-duk-review` over the diff; findings fixed.

## Task 3: The Attempts tab on the shared analysis

Files: `apps/web/src/lib/attempts.ts`, `apps/web/src/views/AttemptsView.tsx`, `apps/web/src/views/AttemptRuns.tsx`, `apps/web/src/components/AttemptCharts.tsx`, `apps/web/src/app/modes/conquest.ts`, `apps/web/test/attempts-lib.test.ts`, `apps/web/test/attempts-view.test.tsx`.

- `lib/attempts.ts` loses `scoreAt`, `testCut`, `CutTest`, `CutPair`, `CutConfidence`, `CHECKPOINTS`, `Checkpoint`, `DEFAULT_CHECKPOINT`, `CUT_MARGIN`, `pearson` and its median; `summarize.perHour` uses `medianCycle`.
- "An earlier cut" shows `analyzeCutoff`: the verdict first (the chosen rule and its passes per hour against the bar, or why none qualifies), the loss bound, the checkpoint picker over the analysis's checkpoints (`?at=` any multiple of 2.5 between 30 and 60, validated before the data loads; a dropped checkpoint shows as unscorable), and the scatter of score at `c` against bar score with `T(c)` as its line.
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
