---
name: feature-development
description: >-
  Use when starting non-trivial feature work in crumble-logbook that touches more than one file — "let's build", "add a feature", "implement", "start work on", "design", "new capability", "ship a", "we need to support" — when the user mentions a feature constitution or the README-as-spec pattern, or before firing superpowers:brainstorming, writing-plans, subagent-driven-development or finishing-a-development-branch standalone for feature work. Not for trivial single-file fixes, for a bounded defect (project-bugfixing), or for behaviour-preserving cleanup, moves, renames or dead-code removal (codebase-refactoring).
---

# Feature development

A feature's deliverable is **new behaviour, proven to work**: in Vitest, in
agent-browser on every screen it touches, and in a design record a later
session can trust. In this repo that record is a spec in
`docs/superpowers/specs/`, a plan in `docs/superpowers/plans/`, `README.md`
updated to describe the app as it now is, and a published explainer.

**Ground rules** bind every phase, **the journal** says where each artifact
lives, and **the phases** order the work.

## Ground rules

### When this skill applies

Use it for non-trivial new capability: a new `/api` resource and the view that
shows it, a new tab in a mode (`apps/web/src/app/modes/`), a new game mode's
section, a new content type in the registry, a new importer rule, a new
`pnpm capture` scraper, a new behaviour in the Conquest macro or HUD, or a
simulator.

Skip it for a typo, a one-line fix, a copy edit or a dependency bump: just do
the work, `pnpm verify`, commit and push.

Hand off by deliverable, not size:

- `codebase-refactoring` when the deliverable is behaviour-preserving
  (cleanup, consolidation, a module move or rename sweep, dead-code removal,
  duplicate-type collapse). This flow proves new behaviour works; that one
  proves nothing else moved.
- `project-bugfixing` when the deliverable is a bounded, already-identified
  defect restored to its intended behaviour.
- `deep-research` when the work is a new question about the game, and
  `refresh-meta` when it is a new round of an existing record. Captures,
  curated data and a record's README follow those skills, never this one.

Many features here are both: a record round that finds new data and the app
work that shows it (`docs/superpowers/specs/2026-10-03-rift-15-clears-design.md`
is one). One spec covers both; the research half runs to the research skill's
contract, the code half through these phases.

If unsure, ask: a small change costs an extra spec, a skipped big change costs
the design record entirely.

### Seats: who does what, on which model

Every review and implementation seat is a `rubber-duk-*` agent, never
`general-purpose`. Pass `model` explicitly on every dispatch: an omitted
`model` inherits the session's, never the intended choice. Read
`.ai/resources/skills/seats.md` before the first dispatch: the routing table,
test-authoring delegation, models and per-dispatch prompt requirements live
there.

Most phases run on the `superpowers:*` skill the phase table names. If one is
unavailable, say so and ask via `AskUserQuestion` instead of proceeding
silently.

### Every comment follows the comment policy

`AGENTS.md` sets the JSDoc rule (ESLint enforces it);
`docs/conventions/comment-policy.md` sets the rest. Read the policy before
writing code in any phase and again before reviewing a diff: a violation in the
diff is a review finding like any other. Displaced content has a home: _why
this approach_ → commit body; _behaviour that must keep working_ → test name;
_what the code used to be_ → git log; _work left undone_ → follow-up file.

### Reorganize toward the target structure — don't bolt on

When a feature changes a subsystem's _shape_ (a new abstraction, layer,
content type, data-access pattern, or a retired concept), the work isn't done
while the new code sits beside the old. Relocate code to its correct layer,
**rename** modules, exported symbols and types to match the new vocabulary,
delete the superseded module rather than leave it orphaned, and update every
importer. An old name kept "for compatibility" has no consumer in this
monorepo.

This is designed in, not bolted on after:

- **Spec:** a **"Refactoring & reorganization"** section: the target module
  tree, the rename list (old → new), and the ripple inventory. Here the ripple
  reaches past importers: the layering rules in
  `apps/server/test/architecture.test.ts`, the content-type registry
  (`apps/server/src/registry.ts`) and `apps/server/test/registry.test.ts`, the mode
  configs in `apps/web/src/app/modes/`, the generated
  `apps/web/src/routeTree.gen.ts`, the Vercel build
  (`apps/server/src/cli/build-vercel.ts`), the tables in `README.md`, and the
  tests bound to moved modules.
- **Plan:** moves and renames are tracked tasks with their own verification
  (`pnpm verify`, or the affected suites with `pnpm exec vitest run <path>`
  inside the loop), each move landing with its importer updates, never a
  half-migrated tree.
- **Review:** a new structure left standing beside the old one is an
  unaddressed finding: "bolted on, not integrated" fails the gate.

Bounded by intent: reorganize what the feature touches, not unrelated
subsystems. Test each module: _"does its location and name still make sense
after this change?"_ If not, move and rename it.

### Scope discipline and follow-ups

The rule against unrelated changes holds through every phase. The
orchestrator, never a subagent, writes deferred work to
`.ai/followups/<domain>/<slug>.md`, per `.ai/followups/README.md`; a decision
waiting on the user goes in `OPEN-QUESTIONS.md`, linked to the spec it blocks.
Future work never lands in the spec or the plan: a spec's "Out of scope"
section names non-goals only.

### UI surfaces

Read `references/ui-surface-rules.md` before landing a feature that adds UI: a
view, a component, a stylesheet, a chart, a tab. It holds the tokens, the
themes, the styling convention, the reference component, and how
`AGENTS.md` § UI applies to new surface.

### Data the feature ships

A feature that changes what the database holds (a table, a curated file's
shape, an importer rule) also ships its migration
(`pnpm --filter @crumble/schema db:generate`) and a rebuilt
`data/snapshot.json`, built from a fresh import of every record as
`README.md` § The database prescribes, with `pnpm db:scope` naming only the
records the feature meant to touch. A push to `main` deploys that snapshot to
production (`README.md` § Deployment).

## The journal

| Artifact | Where | Class |
| --- | --- | --- |
| Research (Phase 0) | `docs/superpowers/specs/<YYYY-MM-DD>-<slug>-research.md` | frozen |
| Unknowns (Phase 0.5) | `docs/superpowers/specs/<YYYY-MM-DD>-<slug>-unknowns.md` | frozen |
| Spec (Phase 1) | `docs/superpowers/specs/<YYYY-MM-DD>-<slug>-design.md` | frozen once built; corrections recorded, not silently rewritten |
| Plan (Phase 2) | `docs/superpowers/plans/<YYYY-MM-DD>-<slug>.md` | boxes ticked in the commit that does the work |
| The feature as it now is (Phase 7) | `README.md`, plus the README of the package or tool it lives in | evergreen |
| Explainer (Phase 7) | `.ai/feature-constitution/<YYYY-MM-DD>-<slug>/explainer.html` | frozen, published |

Read `references/constitution-folder.md` before naming a new spec or deciding
whether the change belongs to an existing one. Read
`references/readme-contract.md` before updating `README.md` in Phase 7. For
the explainer, read `.ai/resources/skills/explainer-contract.md` first: the
template, the sections, and the publishing and linking steps.

## The phases

| # | Phase | Skill / tool | Artifact | Skip when |
| --- | --- | --- | --- | --- |
| 0 | Research | `iterative-research` (a library or technique); `deep-research` / `refresh-meta` (the game) | `-research.md`, or a research record or round | the domain is familiar and the data is already curated |
| 0.5 | Map unknowns | `research-planning:mapping-unknowns` | `-unknowns.md` | the person waves it off in a sentence: record the skip, never argue |
| 1 | Brainstorm | `superpowers:brainstorming` | `-design.md` | never: chat is not a substitute |
| 1.5 | Spec review | `rubber-duk-*` + `superpowers:receiving-code-review` | findings folded into the spec | never |
| 2 | Plan | `superpowers:writing-plans` | the plan | never |
| 3 | Isolate | `Agent` with `isolation: "worktree"` | a lane per parallel track | work runs on `main` in one session |
| 4 | Execute | `superpowers:subagent-driven-development` (or `superpowers:executing-plans`) | commits on `main`, pushed | never |
| 5 | Smoke test | `pnpm dev` + `agent-browser` | route, observed behaviour, screenshots | no observable runtime surface |
| 6 | Review | `superpowers:requesting-code-review` + `superpowers:receiving-code-review` + `rubber-duk-*` | findings fixed or rebutted | never |
| 7 | Finish | `README.md` + `.ai/resources/skills/explainer-template.html` + `Artifact` | README updated, explainer published, final commit pushed | never |

### Phase 0 — Research (conditional)

Research comes from one of these homes, never mixed:

- **The game** (what players run, a mechanic, a number the feature will
  show): the data comes from a research record. A new question is
  `deep-research`; newer data for an existing record is `refresh-meta`. The
  feature consumes the record's `curated/` files; it never invents data or
  captures evidence outside those skills.
- **A library or technique** the feature leans on and nobody here has used
  (a TanStack Router API, a drizzle 1.0 beta behaviour, a Hono middleware):
  invoke `iterative-research` and save its rounds and final takeaways, citing
  primary sources, to `docs/superpowers/specs/<YYYY-MM-DD>-<slug>-research.md`.

Skip when the domain is familiar and the data is already curated: its absence
is the signal.

### Phase 0.5 — Map unknowns

Invoke `research-planning:mapping-unknowns` before brainstorming. The research
(when Phase 0 ran), `README.md` and `OPEN-QUESTIONS.md` are the light territory
the pass reads. It maps what the person knows, knows they lack, would
recognise on sight, and has never considered about this feature, one question
per message, closing with the decisions they now own. Save the final map and
brief to `docs/superpowers/specs/<YYYY-MM-DD>-<slug>-unknowns.md`.

The gate is soft: offer the pass every time, never argue for it. When the
person waves it off in a sentence, write `Unknowns pass: skipped by the
person` as the first line of the spec's open-questions section and write no
unknowns file.

### Phase 1 — Brainstorm

Invoke `superpowers:brainstorming`. Its default path,
`docs/superpowers/specs/<YYYY-MM-DD>-<topic>-design.md`, is this repo's spec
home; keep it. Match the existing specs' shape: a dated header with the
user's request quoted, then:

- **Why** — the problem, for the reader of the app or the user at the game.
- **Design** — the approach, the decisions, the alternatives and why this one;
  for data, the curated file shape with an example row and every field's rule.
- **Refactoring & reorganization** — the section the reorganize rule
  requires.
- **Open questions** — from the unknowns file, or the one-line skip record.
  Those still open when the spec is approved move to `OPEN-QUESTIONS.md`.

Hold the design to `AGENTS.md`: ranking by damage (never 배), a level and a
mechanism "why" on every deck cookie, `routes → services → repos → db`,
Drizzle + Zod schemas, and the UI rules.

### Phase 1.5 — Spec review (mandatory)

The moment the spec exists, before any planning, put it in front of the
`rubber-duk-*` reviewers the seats rule names: this gate catches design flaws
in words before Phase 6 catches them in shipped code, and both run.

Dispatch the relevant reviewers in parallel (one message, several `Agent`
calls, `model: "opus"`), each pointed at the spec with an adversarial,
domain-scoped mandate. `rubber-duk-review` hunts false premises, unjustified
sizing and divergence from `AGENTS.md`; `rubber-duk-backend` and
`rubber-duk-frontend` evaluate the server layers, the registry, the importer
and the views; `rubber-duk-auditor` assesses exposure when the spec touches
the read-only Vercel function, a write route, or files read off disk;
`rubber-duk-tests` (AUDIT) evaluates the test strategy when the spec has one.
Skip a reviewer only when its domain is absent from the spec, and state which
and why ("frontend skipped: importer rule only, no view").

Each reviewer verifies the spec's load-bearing claims against the code, not
its say-so, and returns findings as `file:line` + severity (BLOCKER /
IMPORTANT / MINOR), citing primary sources for any framework claim.

Process the findings through `superpowers:receiving-code-review` with real
rigor: verify each against the code, rebut the wrong ones with evidence,
don't perform agreement. Fold accepted findings into the spec with the
correction and why. A spec does not advance to Phase 2 with an unaddressed
BLOCKER or IMPORTANT.

### Phase 2 — Plan

Invoke `superpowers:writing-plans`. Its default path,
`docs/superpowers/plans/<YYYY-MM-DD>-<feature-name>.md`, is this repo's plan
home. Match the existing plans: a **Global Constraints** section carrying the
`AGENTS.md` rules the work could break, then tasks as checkboxes, ticked in
the same commit as the work they name.

Each task carries its file paths, complete code and exact verification
command. Don't add "Step N: Commit" tasks: commits follow the work.

Lead with the decisions the person is most likely to change (the curated
shape, the API row, the schema, anything on screen) so review lands where
changes are likely; mechanical wiring goes at the bottom.

The moves and renames the spec's "Refactoring & reorganization" section lists
are tracked tasks. A plan that adds new structure without relocating the code
it supersedes is incomplete.

### Phase 3 — Isolate (parallel lanes only)

Work happens on `main` (`AGENTS.md`); there are no feature branches. Isolate
only to run independent tracks in parallel: each lane is an `Agent` dispatch
with `isolation: "worktree"` (its checkout lands under `.claude/worktrees/`,
gitignored). A single session working task by task skips this phase.

### Phase 4 — Execute

`git fetch origin && git status -sb` first: `main` level with `origin/main`,
or stop and ask (`AGENTS.md`).

On entering this phase, mirror the plan into the harness's task tool, one
tracked task per plan task, before touching code. Mark each in progress when
started and completed once its verification passes; never batch-complete at
the end.

Invoke `superpowers:subagent-driven-development` to dispatch an implementer
per plan task (`rubber-duk-backend` or `rubber-duk-frontend` in IMPLEMENT
mode, per seats), each prompt carrying the seats prompt requirements, and the
matching `rubber-duk-*` reviewer after each task, never batched to the end.
Inline execution via `superpowers:executing-plans` follows the same mandate.

Each finished task is a commit on `main`, written to
`.ai/resources/pr-guidelines.md` after `pnpm verify` passes, and pushed right
away.

Adding a route file under `apps/web/src/routes/` changes the generated route
tree: run `pnpm --filter @crumble/web build` (or keep `pnpm dev` running) so
`routeTree.gen.ts` is regenerated before the typecheck, and commit it.

Parallelism: the default loop is one implementer at a time. Run tracks
concurrently only when their files are disjoint; re-derive that from file
ownership, not the plan's track order. Never run two lanes writing the same
file (a mode's config, `registry.ts`, `app.ts`, `README.md`, a shared
stylesheet): combine those tasks into one lane. When a lane reports, the
orchestrator merges it into `main` with `git merge --no-ff -F <message file>
<branch>` (subject `merge: …`), copies out any gitignored media first, runs
`pnpm verify`, pushes, then removes the worktree and its branch
(`.ai/agent-working-rules.md` § Worktree lanes on Windows). The review gate
fires again over the merged diff.

### Phase 5 — Smoke test (mandatory)

Once the tasks are committed and `pnpm verify` passes, load the feature in the
running app to catch what Vitest misses: a route missing from the generated
tree, an unimported stylesheet, a query the typed client gets wrong, an icon
that falls back to its badge, a layout that scrolls sideways on a phone.

The orchestrator runs it, or delegates the browser session to
`rubber-duk-frontend`, which owns agent-browser checks; there is no
end-to-end suite. Reuse the running `pnpm dev` (web on
http://localhost:5173, API on http://localhost:8787/api) or start it in the
background. Load the
`agent-browser` skill and drive it as `AGENTS.md` sets up the browser
(headed, the named session, `open` launched in the background while Vite
runs, never `wait <ms>`). Open every screen the feature touches, exercise it,
and confirm zero console errors; read the dev server's output for server-side
errors the page never shows. `curl` the new or changed `/api` resources and
check their JSON against the README's API table.

For every UI surface: light and dark themes, phone width, and the UI rules of
`AGENTS.md` (verdict first, icons, clamped long text, sources as chips at the
end of a row, visible active tab). A Vercel-specific change (the function,
the build, a dependency) also runs `pnpm build:vercel` locally.

`superpowers:verification-before-completion` applies: no "it works" claim
without having loaded it. Report what you checked (route, behaviour,
screenshots) as the phase's evidence. A feature does not advance to review
with an open smoke-test failure.

Skip only when the change has no runtime surface (a type-only change, lint
config).

### Phase 6 — Review

In order, every reviewer on `model: "opus"`:

1. `superpowers:requesting-code-review` over the feature's commits (from the
   commit before the first one to `HEAD`).
2. `rubber-duk-review` over the same range: mandatory for every feature,
   whatever its size. In parallel, the domain passes seats names:
   `rubber-duk-backend` (REVIEW) for the server, schema, capture and tools,
   `rubber-duk-frontend` (REVIEW) for the web app, `rubber-duk-auditor` when
   the diff touches a security-sensitive surface.
3. `rubber-duk-tests` (AUDIT) whenever test files change: a separate gate
   from the general review.
4. `superpowers:receiving-code-review`: process every finding with technical
   rigor, not performative agreement.

Findings specific to this flow a reviewer should be asked to hunt:

- a new structure left standing beside the old one: "bolted on, not
  integrated"
- a compatibility alias or re-export shim
- an archaeology comment, an undocumented function or a narrative comment
- a layering break the architecture test does not yet catch
- a ranking by 배, a deck cookie without a level or a "why", a view that
  leads with prose

A feature does not pass Phase 6 with an unaddressed finding or an open
BLOCKER/IMPORTANT from the test audit: dispatch implementers (or fix inline
if trivial), each fix its own commit, and rebut rejected findings explicitly.

### Phase 7 — Finish

**README.** Update `README.md` (and the package's or tool's README) to
describe the app as it now is, per `references/readme-contract.md`: new paths
in What's here, new resources in the API table, new commands in their
blocks, new working practice in Working notes. Not an edit of the spec: the
spec is source material to skim, not text to transplant.

**Diagrams.** Read the table in `.ai/diagrams/README.md` and open each diagram
whose subsystem the feature touched. Verify every path, module, function and
route a touched diagram names still exists (`grep` or `ls` them, don't trust
the diagram). A new layer, engine or data-access pattern gets a diagram and
its row. Current-state prose only.

**Definition of done,** the last gate: open every `.ai/dod/` checklist whose
surface the feature touched and walk it item by item against the diff; walk
`AGENTS.md`'s rules with it. A **must** item is met or the feature isn't
done; an **if relevant** item is met or you state why it doesn't apply.
Never edit a checklist to pass the work. Report the walk, and say plainly
when no checklist covers the surface.

**Open questions.** Every question the spec left open is answered in it or
moved to `OPEN-QUESTIONS.md`; every entry the feature settled is deleted from
there.

**Explainer.** Once the final review is clean and `pnpm verify` exits 0 on
the final tree, write `explainer.html` into
`.ai/feature-constitution/<YYYY-MM-DD>-<slug>/`, publish it per the contract,
add its row to `.ai/feature-constitution/README.md`, and hand the user the
URL.

**Commit and push.** The README, the explainer and the roster row land in one
last commit, its body carrying the explainer URL
(`.ai/resources/pr-guidelines.md`), pushed to `origin/main`. If the work has
a GitHub issue, comment on it with the commit and explainer links; file any
new issues with the `file-github-issue` skill.

## Reference files

- `references/constitution-folder.md` — naming a spec, whether a change
  belongs to an existing one, and what the frozen journal may contain.
- `references/readme-contract.md` — how Phase 7 updates `README.md`.
- `references/ui-surface-rules.md` — tokens, themes, the styling convention
  and the reference component for new UI.
- `.ai/resources/skills/seats.md` — reviewer and implementer routing, test
  authoring, models.
- `.ai/resources/skills/explainer-contract.md` — the explainer template, its
  sections, and publishing.
- `.ai/resources/pr-guidelines.md` — commit messages.
