---
name: codebase-refactoring
description: >-
  Orchestrates the phased workflow for behavior-preserving change in crumble-logbook — decluttering, consolidation, module moves and renames, dead-code removal, dependency-cycle breaking. Use this skill whenever the user wants existing code improved rather than new behavior added: "refactor", "clean up", "declutter", "dedupe", "collapse these types", "dissolve this module", "move this somewhere sensible", "delete the dead code", "why do we have two of these", "knip says", "break this cycle", "this is scattered", "consolidate", "tidy", "reorganize", "unify". Also use when a feature's leftovers need retiring, or when the user names a module and asks whether it should still exist. Prefer this over `feature-development` whenever the deliverable is "same behavior, better shape" — the two flows differ in their central gate, and using the feature flow for a refactor skips the one check that matters most. Skip only for a single-file tidy no other file imports.
---

# Codebase refactoring

The deliverable of a refactor is **the absence of a behaviour change**.
`feature-development` proves new behaviour works; this proves nothing else
moved: the same API responses, the same import results, the same
`data/snapshot.json`, the same screens. Everything below makes that provable,
not asserted.

**Ground rules** bind every phase, **the journal** holds the artifacts, **the
phases** order the work. The phases `feature-development` lacks (baseline,
inventory, completeness sweep) are where refactors are won or lost.

## Ground rules

### Code outranks documentation

**Verify every claim against the code, including this repo's own docs.**
`README.md`, the specs under `docs/superpowers/`, `docs/conventions/`,
`.ai/diagrams/` and module comments go stale exactly where refactors happen;
treat a doc sentence as a hypothesis, and `git grep`, `pnpm typecheck` and the
layering test (`apps/server/test/architecture.test.ts`) as evidence.

The shape of the failure: a module comment saying a service "never touches
the database", while it imports a repo that runs the query. Plausible,
specific, wrong. When doc and code disagree, code wins: the doc is stale.

### The docs are part of the diff

A refactor that moves or renames code and leaves the prose behind ships a
codebase that lies about itself. `AGENTS.md`, `README.md` (its What's here
table, its API table, its command blocks), `docs/conventions/`, `.ai/dod/`,
`.ai/diagrams/` and the skills under `.claude/skills/` are what agents follow,
so a stale locator there causes wrong work later, not just confusion.

Every path, symbol and link the refactor invalidates gets updated in the same
change. Relative Markdown links to source files are the sharpest edge: they
404 silently and nothing checks them. Grep the old path across all Markdown,
not just the docs you remember. A rule in `AGENTS.md` that names a moved path
is surfaced to the user with the proposed edit; it is theirs.

A doc wrong before the refactor started still gets fixed, noted in the
commit body: inherited staleness is still staleness once seen.

### Scope discipline

Refactors die of scope: the instinct that makes someone good at this work
("and while I'm here") turns a reviewable diff into an unreviewable one and
lands a behaviour change nobody signed off on.

Test for each candidate change: **does the refactor's stated intent require
it?** If not, surface it and let the user decide. Record what you
deliberately leave broken in the spec's out-of-scope section (Phase 2), so a
reviewer can tell "missed" from "chose not to".

- **A convention violation you're relocating.** Moving a function that
  already breaks a convention doesn't oblige you to fix it: fixing it turns a
  path change into a semantic one. Move it as-is and file the violation as a
  follow-up, unless the user chooses otherwise.
- **A bug you found.** Report it and file it as a follow-up (or run it
  through `project-bugfixing` separately). Fixing a bug inside a
  behaviour-preserving refactor makes the "nothing changed" claim false and
  hides the fix in a diff nobody reviews for logic.
- **Research data is never in scope.** A refactor touches no record's
  `curated/` values and nothing under `evidence/`. A refactor of the importer
  proves itself by producing the same snapshot, not by editing the data.

Anything deferred, the orchestrator (never a subagent) writes to
`.ai/followups/<domain>/<slug>.md`, per `.ai/followups/README.md`; it never
hides as inline prose in the spec, the plan, the README or a doc.

### Seats: who does what, on which model

Every review and implementation seat is a `rubber-duk-*` agent, never
`general-purpose`, with `model` passed explicitly on every dispatch. Read
`.ai/resources/skills/seats.md` before the run's first dispatch: routing by
surface and the model per seat live there.

Execution depends on the `superpowers:*` skills the phase table names. If one
is unavailable, say so and ask via `AskUserQuestion` before continuing.

## The journal

`.ai/refactoring/NNN-<slug>/`, not `docs/superpowers/`. A refactor ships no
new behaviour, so it has no feature to specify, and filing it beside the
feature specs would make every reader check whether the design changed.

**Picking the number:** `ls .ai/refactoring/` (no directory means `001`), take
the highest prefix and add one. Zero-padded to three digits, creation order:
the scheme `.ai/bugfixes/` uses too, with its own sequence. Never renumber,
never reuse an abandoned number.

Artifacts: `unknowns.md` (Phase 1.5, absent when the pass was skipped),
`spec.md` (Phase 2), `plan.md` (Phase 3), a `README.md` describing the code's
current shape (Phase 7), and `explainer.html`, the published page the user
reads instead of the diff (Phase 7). Prefer appending to an existing
`.ai/refactoring/NNN-<slug>/` when a later sweep covers the same ground:
repeated one-off folders drift into near-duplicates.

### `explainer.html` — the contract

Write it to `.ai/refactoring/NNN-<slug>/explainer.html`. Read
`.ai/resources/skills/explainer-contract.md` before drafting it: the template,
the sections in their required order, and the title and publishing rules.

For design context on whatever you're moving, read the feature's spec under
`docs/superpowers/specs/` (`ls` it; specs are named by date and feature) and
the part of `README.md` that describes it. The spec is frozen journal: don't
edit it. `README.md` is updated in Phase 7 when the refactor changed a shape
it describes.

## The phases

| # | Phase | Skill / tool | Artifact | Skip when |
|---|---|---|---|---|
| 0 | Baseline | `pnpm verify`, a fresh import, the screens | recorded numbers | never |
| 1 | Inventory | `git grep` / `Glob` / the layering test | recorded in `spec.md` (Phase 2) | never |
| 1.5 | Map unknowns | `research-planning:mapping-unknowns` | `unknowns.md` | the person waves it off in a sentence: record the skip, never argue |
| 2 | Spec | write it directly | `spec.md` | never |
| 2.5 | Spec review | `rubber-duk-*` + `superpowers:receiving-code-review` | findings folded into the spec | never |
| 3 | Plan | `superpowers:writing-plans` | `plan.md` | never |
| 4 | Isolate | `Agent` with `isolation: "worktree"` | a lane per parallel track | the work runs on `main` in one session |
| 5 | Execute | `superpowers:subagent-driven-development` | commits on `main`, pushed | never |
| 5.5 | Completeness sweep | `git grep` | — | never |
| 6 | Review | `superpowers:requesting-code-review` + `superpowers:receiving-code-review` + `rubber-duk-*` | — | never |
| 7 | Finish | `.ai/resources/skills/explainer-template.html` + `Artifact` | `README.md` (journal) + repo `README.md` (if affected) + `.ai/diagrams/*` + touched `.ai/dod/` walked + `explainer.html`, published | never |

### Phase 0 — Baseline

Record what green looks like **before touching anything**: numbers to compare
against, not just "it still passes".

`git fetch origin && git status -sb` first (`AGENTS.md`). Then the
orchestrator runs `pnpm verify` and records the actual figures in the session,
committed into `spec.md` under Verification in Phase 2: Vitest's test-file and
test counts and any skipped tests. Read `package.json` scripts to learn the
gate rather than assume it.

What `verify` doesn't measure, the baseline captures directly when the
refactor's surface reaches it:

- **Server or importer:** a fresh import of every record into a scratch
  database (`CRUMBLE_DB=<scratchpad>/before.db`, records in number order,
  then the account, as `README.md` § The database builds the snapshot),
  `pnpm db:export`, then `pnpm db:scope HEAD` with no slug: it exits 0 when
  the committed snapshot matches a fresh import. After the refactor the same
  sequence must still exit 0, and `git diff data/snapshot.json` must be
  empty. Also saved `curl` responses of the `/api` resources the code serves.
- **Web:** a screenshot or DOM read of every screen the code renders, light
  and dark, at phone width.
- **The Vercel build:** `pnpm build:vercel` succeeds, when the refactor
  touches what it bundles.

There is no cycle checker and no dead-code tool configured: the layering rules
in `apps/server/test/architecture.test.ts` are the dependency gate. Record
that as part of the baseline, not as a gap to fill.

Also establish:

- **Pre-existing failures.** A red baseline is not a blocker, but it must be
  known and named or it gets blamed on the refactor later.
- **Coverage over what you're about to move.** Where no test would fail if
  you broke it, the refactor is blind. Dispatch `rubber-duk-tests` (WRITE) to
  write a characterization test first, pinning current behaviour, quirks
  included, or record in the spec why moving unguarded is acceptable. A pure
  type- or path-level move can go unguarded because the compiler is the test;
  a logic move can't.

### Phase 1 — Inventory as data, not prose

The dominant failure mode is the **partial** refactor: the definition changes
but some call sites don't, so the contract at the changed site diverges
silently from the unchanged ones.

Defend against it by making completeness checkable before any edit. The
orchestrator compiles the inventory as a concrete, counted list (every
importer, call site, locator) in `spec.md` under Refactoring & reorganization,
then validates it before executing: paths resolve, symbols exist, the count
matches a second independent query.

Cast wider than the import graph. In this repo, things that reference code
without importing it:

- the registry (`apps/server/src/registry.ts`), which every server layer, the
  snapshot and the importer's clear order derive from
- the rules in `apps/server/test/architecture.test.ts`, which name
  directories and files by path
- the mode configs (`apps/web/src/app/modes/`) and the generated
  `apps/web/src/routeTree.gen.ts`
- `vitest.config.ts`'s project list, `pnpm-workspace.yaml`, the packages'
  `exports` maps, `packages/schema/drizzle.config.ts`
- `apps/server/src/cli/build-vercel.ts` and `.vercelignore`
- `README.md`, `AGENTS.md`, the skills and the docs naming paths or symbols

`references/completeness-sweep.md` has the query patterns and the
TypeScript-specific traps.

### Phase 1.5 — Map unknowns

Invoke `research-planning:mapping-unknowns` once the inventory exists: the
baseline and inventory already cover the territory the pass reads. For a
refactor the map's rows track the person's knowledge of the current shape and
its consumers: which quirks they mean to preserve, which regressions they'd
recognise only on sight, which consumers outside the import graph they never
considered. One question per message; close with the decisions they now own.
Save the final map and brief to `.ai/refactoring/NNN-<slug>/unknowns.md`; the
spec's "what must not change" and out-of-scope lists start from it.

The gate is soft. Offer the pass every time and never argue for it: when the
person waves it off in a sentence, write `Unknowns pass: skipped by the
person` as the first line of `spec.md` and write no `unknowns.md`.

### Phase 2 — Spec

The spec's job differs from a feature spec: it records **what must not
change** and **why the current shape is wrong**, then the target shape.

Include:

- **Intent** — the concrete defect in the current shape: "duplicated", "two
  declaration sites", "a layer reaching past the one below it", "dead". Name
  it by what it costs someone editing this code, not aesthetics.
- **What is actually there** — an honest classification of the code in
  scope. A module often holds several unrelated kinds of thing, each wanting a
  different destination. Classify before deciding.
- **Design** — the target shape, and the evidence for each destination. Every
  "X belongs in Y" claim carries a code-verified reason; a destination in
  `apps/server` names the layer and the architecture rule that allows it.
- **Refactoring & reorganization** — the target tree, the rename list
  (old → new), and the ripple inventory from Phase 1.
- **Verification** — the gate and baseline from Phase 0, plus the specific
  check that proves *this* refactor complete (a `git grep` that must return
  nothing, a snapshot `pnpm db:scope` reports unchanged).
- **Out of scope** — what stays broken on purpose. A refactor that fixes
  everything it touches never lands.
- **Corrections** — when the spec review falsifies a claim, record the
  correction and the reasoning. A spec that quietly deletes wrong claims
  teaches nobody.

### Phase 2.5 — Spec review (mandatory)

A wrong premise caught here costs a spec edit; caught in Phase 6 it costs a
rewrite of shipped code.

Dispatch the `rubber-duk-*` reviewers `.ai/resources/skills/seats.md` names,
in parallel, on `opus`, each pointed at the spec with an adversarial mandate.
State which you skipped and why.

Read `references/spec-review-claims.md` before writing the mandates: it lists
the load-bearing claim types a spec review must enumerate and falsify with
`file:line` evidence.

Then process findings through `superpowers:receiving-code-review` with real
rigor: verify each against the code yourself; reviewers are wrong too, and a
confidently cited doc sentence is a common way to be wrong. Refute bad
findings with evidence, fold good ones in. A spec does not advance with an
unaddressed BLOCKER or IMPORTANT.

### Phase 3 — Plan

Invoke `superpowers:writing-plans`, overriding its save path to
`.ai/refactoring/NNN-<slug>/plan.md`.

Sequence so **every commit leaves the tree consistent**, `pnpm verify` green,
because every commit is pushed to `main` and deployed. The tree never holds
two parallel structures: a half-migrated state is the partial-refactor
failure with a commit boundary through the middle. Each task pairs its move
with its importer updates and its own verification.

Order by dependency, not convenience: a rename many files consume lands
before the moves that would multiply its call sites.

### Phase 4 — Isolate (parallel lanes only)

Work happens on `main` (`AGENTS.md`). A single session working task by task
skips this phase. To run disjoint tracks in parallel, dispatch each as an
`Agent` with `isolation: "worktree"`; the orchestrator merges each lane with
`git merge --no-ff -F <message file> <branch>` and pushes.

### Phase 5 — Execute

Mirror the plan into the task tool before touching code, one tracked task per
plan task, marked in progress and completed as they land, never
batch-completed.

Invoke `superpowers:subagent-driven-development`. Refactor tasks suit it: the
plan carries the exact moves, so most tasks are mechanical (`sonnet`). The
orchestrator dispatches a review after each task rather than batching,
following `.ai/resources/skills/seats.md`.

New tests are delegated to `rubber-duk-tests` (WRITE), not hand-authored by
the orchestrator. Each task lands as its own commit, written to
`.ai/resources/pr-guidelines.md` (`refactor(<scope>): …`), after
`pnpm verify`, pushed right away.

### Phase 5.5 — Completeness sweep (mandatory)

Rename and move tooling doesn't touch string literals, comments, Markdown or
the path lists in the architecture test. The sweep is required, not paranoia.

For every symbol and path that moved or was renamed, grep the **old** name as
raw text across the whole repo, docs, skills, config and fixtures included.
Expected result: zero hits; every hit is a site the refactor missed or a
deliberate exception you can name (a frozen spec, a research record's
history).

Then re-run the Phase 0 measurements and compare: equal or better on every
number, the same snapshot from a fresh import, the same API responses, the
same screens. A dropped test count means tests stopped running, not that they
stopped being needed.

See `references/completeness-sweep.md` for query patterns.

### Phase 6 — Review

1. `superpowers:requesting-code-review` over the refactor's commits.
2. `rubber-duk-review` over the same range: mandatory, every refactor, on
   `opus`. In parallel, the domain passes `.ai/resources/skills/seats.md`
   names: `rubber-duk-backend` (REVIEW) for the server, schema, capture and
   tools, `rubber-duk-frontend` (REVIEW) for the web app (with the agent-browser
   comparison against the Phase 0 screens), `rubber-duk-auditor` when a
   security surface is touched.
3. `superpowers:receiving-code-review` to process, with rigor rather than
   performed agreement.
4. `rubber-duk-tests` (AUDIT) whenever test files are modified or added.

Findings specific to this flow, which a reviewer should be asked to hunt:

- a behaviour change smuggled into a move: the diff should be relocations and
  renames; logic edits inside a moved block need naming and justifying
- an old structure left standing beside the new one
- a compatibility alias or re-export shim kept for an old name: this monorepo
  has no external consumers, so the alias is the hop the refactor exists to
  remove
- an archaeology comment (`// moved from`, `// was X`, `// kept for
  compatibility`) naming the old location: the diff and git log already
  record the move
- a layering rule loosened in `architecture.test.ts` to let the move pass
- doc locators the move broke

### Phase 7 — Finish

The orchestrator writes `.ai/refactoring/NNN-<slug>/README.md` describing the
current shape against the code, not edited from the spec: no changelog, no
"was previously" framing. Update the repo's `README.md` too if the refactor
changed a shape it describes.

Then bring `.ai/diagrams/` back in line: open every diagram whose subsystem
the refactor touched and verify each path, module, function and route it
names still resolves (`grep` or `ls` each one, don't trust the diagram).

Then walk the definition of done, the last gate: open every `.ai/dod/`
checklist whose surface the refactor touched and check it item by item
against the diff, with `AGENTS.md`'s rules. A **must** item is met or the
refactor isn't done; an **if relevant** item is met or you state why not. A
move onto a new surface inherits that surface's checklist. Fix the code to
earn a tick; editing the checklist so the work passes is never the answer.

Then write and publish `explainer.html` per the journal section's contract,
once the final review is clean and `pnpm verify` has exited 0 on the final
tree: the figures it cites are the figures that ship. Hand the user the URL.

Then commit the journal README, the doc updates and the explainer, the body
carrying the explainer URL, and push. If the work has a GitHub issue, comment
on it with the commit and explainer links.

## Reference files

- `references/completeness-sweep.md` — query patterns for finding every
  reference, including the ones outside the import graph, and the
  TypeScript-specific traps.
- `references/decluttering.md` — dead-code judgement, safe ordering, and
  telling real unused exports from false positives.
- `references/spec-review-claims.md` — the claim types a Phase 2.5 spec
  review must enumerate and falsify.
- `.ai/resources/skills/seats.md` — routing by surface and the model per seat.
- `.ai/resources/skills/explainer-template.html` — the explainer's tokens,
  both themes, the fixed sections as `FILL:` slots, and the quiz component.
  Shared with `feature-development` and `codebase-analysis`.
