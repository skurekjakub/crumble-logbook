---
name: project-bugfixing
description: >-
  Use when fixing a bounded, already-identified defect in crumble-logbook — an observed symptom, a filed ticket, a regression, or working code no test reaches. Triggers include "fix this bug", "this is broken", "X renders nothing", "Y prop is ignored", "spacing is wrong on Z", "add a regression test for". Not for new behaviour (use feature-development) and not for behaviour-preserving cleanup (use codebase-refactoring).
---

# Project bugfixing

The deliverable of a bugfix is **the defect closed**, with a regression test
seen failing before the fix, a root-cause record, and a user explainer.
**Ground rules** bind every phase, **the journal** defines the artifacts, and
**the phases** order the work.

## Ground rules

### Is this a bugfix, a feature, a refactor, or a research round?

A bugfix restores behaviour the code already intends. The test is whether
closing it requires a **decision the code does not already contain**.

| Signal | Route |
|---|---|
| A JSDoc, the `README.md` API table, an `AGENTS.md` rule or a `.ai/dod/` checklist says X; the code does Y | bugfix |
| A curated row says something its own evidence capture does not | bugfix (data): fix the row in `curated/`, never the capture |
| Code that works but no test reaches | bugfix (gap analysis) |
| Closing it needs a new table, curated field, `/api` resource, route or tab | **feature** — `feature-development` |
| Closing it needs picking between two defensible behaviours | **feature** |
| The game changed and a record's recommendation is out of date | **research round** — `refresh-meta` |
| Same behaviour, better shape | **refactor** — `codebase-refactoring` |
| "While I'm here I'll also…" | Neither. Separate item, separate commit. |

Escalating is not failure. A bugfix that quietly grows a design decision ships
a decision nobody reviewed. If it turns into a feature mid-flight, say so,
stop, and switch skills.

### Seats: who does what, on which model

This skill sets the repo specifics; the `superpowers:*` skills hold the
method: `superpowers:systematic-debugging` to find the cause,
`superpowers:test-driven-development` for the fix,
`superpowers:verification-before-completion` for every done claim, and
`superpowers:requesting-code-review` and `superpowers:receiving-code-review`
for the review. If they are absent from the available-skills list, stop and
tell the user rather than improvising from this file alone.

The orchestrator (the session running this skill) reproduces the defect,
finds the cause, writes both artifacts, makes the minimal fix inline (no plan
file, no dispatch), and watches the regression test fail. A subagent
reporting "test written and passing" has not established RED: ask for the
failing output, or run it against the reverted fix yourself.

Every dispatch goes to a `rubber-duk-*` agent per
`.ai/resources/skills/seats.md`, never `general-purpose`, with `model` passed
explicitly. Here that means: `rubber-duk-tests` (WRITE) writes the regression
test whenever it adds a test file or an `it()` block, and `rubber-duk-tests`
(AUDIT) audits it; the orchestrator writes the test inline only when changing
assertions inside an existing block. `rubber-duk-backend` /
`rubber-duk-frontend` (IMPLEMENT) only implement accepted Phase 8 findings
when delegated. `rubber-duk-review`, `rubber-duk-backend` (REVIEW),
`rubber-duk-frontend` (REVIEW) and `rubber-duk-auditor` review, by surface,
on `opus`. There is no end-to-end suite: a browser check is an agent-browser
session, run by the orchestrator in Phases 1 and 5 or delegated to
`rubber-duk-frontend`.

Every dispatched prompt names `AGENTS.md` and
`docs/conventions/comment-policy.md` and requires reading them first.

Tests live where `docs/conventions/test-layout.md` says: under each
package's `test/` folder (`apps/server/test/routes/`, `apps/web/test/`,
`packages/capture/test/`, …), named `*.test.ts` or `*.test.tsx`.

### Read the framework source before blaming the app

Before any framework work, read the version-matched docs and source
`docs/conventions/stack-profile.md` points at; training data is behind the
installed versions (drizzle-orm 1.0 beta, TanStack Router and Query, Hono,
React 19, Vitest 4, TypeScript 7). Symptoms that look like application bugs
are often framework semantics: a stale list after a write (a TanStack Query
cache key), a route that 404s in the app but has a file (the generated
`routeTree.gen.ts` not regenerated), a row missing from a filtered list (a
registry filter that doesn't narrow). `docs/gotchas.md` carries the traps
already paid for.

Repo facts a bugfix runs into:

- **Registers.** `.ai/bugfixes/` is this flow's; `.ai/refactoring/` the
  refactor trail; `.ai/regression/` the manual click-through suites;
  `.ai/dod/` the per-surface definition of done; `.ai/followups/` deferred
  work; `docs/superpowers/` feature specs and plans; `OPEN-QUESTIONS.md`
  decisions waiting on the user. Don't create another.
- **Deployment-only bugs.** The Vercel function seeds an in-memory database
  from `data/snapshot.json` on every cold start, answers anything but `GET`
  and `HEAD` with 405, and `/api/attempts` answers `available: false` there
  (`README.md` § Deployment, § API). A bug seen only on
  https://crumble-logbook.vercel.app is usually a stale committed snapshot or
  a gap in what `apps/server/src/cli/build-vercel.ts` bundles; reproduce it
  with `pnpm build:vercel` before reading application code.
- **Database drift.** A local `data/crumble.db` older than the snapshot shows
  old rows; the server logs which records differ on startup. Reseed
  (`pnpm dev:reseed`) before calling a data symptom a bug.
- **Evidence is immutable.** A wrong capture is never edited: a corrected
  measurement is a new capture with its ledger line (`AGENTS.md`).
- **Everything in `AGENTS.md` still applies to a two-line fix.**

### How the repo is verified

```bash
pnpm verify
```

The one command that runs every gate: typecheck, ESLint, the Prettier check,
then Vitest across every workspace project, which includes the layering rules
(`apps/server/test/architecture.test.ts`) and every record's capture ledger.

Do not run the stages individually; `verify` is a superset, and the
`prefer-verify-script` hook blocks chained gates. Never pipe its output
through `head`, `tail` or `grep`: run it bare and read it. One carve-out: a
single-file run during the red-green loop is a test invocation, not a
verification: `pnpm exec vitest run <path>`.

**What `verify` does not cover.** There is no CI; a push to `main` deploys
straight to production. `verify` says nothing about the Vercel build
(`pnpm build:vercel`), whether `data/snapshot.json` matches a fresh import
(`pnpm db:scope HEAD <slug>…`), what the page looks like (agent-browser), or
the Conquest macro (AutoHotkey, untested). If the fix touches one of these,
run the check that covers it, or name it in the explainer's residual-risk
section rather than implying `verify` cleared it.

**Check that a gate actually gates.** Before citing any test or script as the
gate on a risk you are accepting, open it and check that it runs in `verify`
**and** that it checks the thing. An ungated risk named as gated is worse
than an ungated risk named as ungated.

### Scope discipline

Bugfixes die of scope the same way refactors do. The test for each candidate
change: **does closing this defect require it?** If not, surface it and let
the user decide.

- **A second bug you found while in here.** Report it; do not fix it. Two
  bugs in one commit cannot be reverted separately, and the second lands in a
  diff nobody reviewed for it. New directory, new commit.
- **A convention violation next to the defect.** Fixing it turns a bugfix
  into a refactor. File it as a follow-up.
- **A missing test for adjacent working code.** That is its own
  gap-analysis bugfix.

Record what you deliberately left alone in the root-cause record's "The fix"
section, so a reviewer can tell "missed" from "chose not to". Deferred items
become `.ai/followups/<domain>/<slug>.md` (`.ai/followups/README.md`), written
by the orchestrator.

### Comments the fix leaves behind

The comment policy (`AGENTS.md` for JSDoc, `docs/conventions/comment-policy.md`
for the rest) applies to a two-line fix. Two shapes only: JSDoc on every
function, and an inline comment at the gotcha, directly above the line where
correct-looking code is wrong. That inline comment is often the most valuable
line in a bugfix diff.

What must not ship: the old behaviour ("previously this sorted by ratio"),
the rationale for the approach, or a fix narrative. Those belong in the
commit body, the root-cause record and the explainer. A comment describing a
state the code is no longer in is worse than no comment.

## The journal

Every bugfix leaves a written trail under `.ai/bugfixes/NNN-<slug>/`:

```
.ai/bugfixes/NNN-<slug>/
  root-cause.md          # what breaks, where, why — written BEFORE the fix
  explainer.html         # published artifact: the shipped fix, for the user
  <surface>-before.png   # a capture pair per affected surface
  <surface>-after.png
  <surface>-before.txt   # the measured DOM or JSON value, when the defect is textual
  <surface>-after.txt
```

No design file and no plan: a bugfix that needs a plan is a feature.

**Picking the number:** `ls .ai/bugfixes/` (no directory means `001`), take
the highest prefix and add one. Zero-padded to three digits, creation order.
Never renumber, never reuse an abandoned number. The sequence is independent
of `.ai/refactoring/` and of the research records' `NNN`.

### `root-cause.md` — the contract

Written before the fix, for whoever maintains the code, in this order. Scale
each section to the bug; a one-line fix gets a short file, not a padded one.

1. **Symptom** — what is observably wrong, stated so someone could check it:
   the route, the API call, the import command and what it printed. Measured
   where possible; marked as reasoned where not.
2. **Location** — the `file:line` where the wrong thing happens. Quote the
   lines. If the cause is spread across call sites, list them all.
3. **Mechanism** — *why* the code does the wrong thing: the specific
   condition, branch, or missing case. This is the section that makes the fix
   obvious; if you cannot write it, you have not found the cause yet.
4. **Blast radius** — what is affected and, equally, what is not: which
   modes, which records, which routes, the deployment or only local. Repo-wide
   measurements belong here (a `git grep -l` over the affected tree, the rows
   of a fresh import), because they are why the bug did or did not wait.
5. **The fix** — what changes, in behaviour terms. And what deliberately does
   **not** change: the adjacent thing you noticed and are leaving alone.
6. **How it will be proven** — the behaviour the regression test pins, and
   why that test would have gone red before the fix. Where the defect is
   textual (an ordering, a label, a status), the measured value goes here too.

Numbers in this file are measurement, dated and with a command someone could
re-run. Name the behaviour that must hold and the edge that must be refused,
then write however many tests that takes; never specify a number of tests.

A missing-test bug uses the same headings. Symptom is "nothing under the test
suite reaches this code"; Mechanism is the class of regression that can
therefore land unseen; the Fix is the test; How it will be proven is *how you
demonstrate the new test catches it*: write the regression, watch the test go
red, revert the regression. A test you never saw fail proves nothing.

### The captures

A before/after pair per affected surface, not one pair per bugfix. A fix that
touches the conquest and the arena decks views, or a view and the API row
behind it, needs a pair for each: a single pair proves one of them and
silently asserts the rest. Name them for the surface
(`conquest-decks-before.png`, `api-decks-before.txt`). Both shots of a pair are
the same route, the same theme, the same viewport and scroll position. They
live in the bugfix directory next to `root-cause.md`; a screenshot in the
scratchpad is gone by the next session.

### `explainer.html` — the contract

The explainer is for the user, who should not have to read a diff to know what
changed and why it was wrong. Start from `references/explainer-template.html`
in this skill directory: tokens, both themes, the fixed sections as `FILL:`
slots, and figure components as commented blocks. Copy it, fill every slot,
delete the ones you did not use and the instruction comments. Don't restyle
it: every bugfix explainer is one page of a series. Load `artifact-design`
for the reasoning behind the choices, not to redo them.

Write it to `.ai/bugfixes/NNN-<slug>/explainer.html`, publish with the
`Artifact` tool, and hand the user the URL. Keep the path stable across
redeploys so the URL is stable.

**The title is a bug-report title.** `<title>`, the page's `h1`, and the
`description` passed to `Artifact` read as a ticket subject line: 4–8 words
naming the component and the defect, with no commas, conjunctions ("so") or
metaphors.

| | |
|---|---|
| ✅ | `Rift clears ranked by ratio` |
| ✅ | `Cookie icon missing on Lineup slots` |
| ✅ | `?current=false ignored on /api/decks` |
| ❌ | `The stage clears service sorted by power ÷ recommended power, so every 15% clear ranked above a deeper 35% one` |
| ❌ | `The Teams tab got its icons back` |
| ❌ | `A sort that forgot what mattered` |

The first reject is a whole sentence with the mechanism in it: that belongs
in the standfirst, the very next line on the page. The other two are
headlines: they read nicely and name nothing.

**Required content, in this order:**

1. **What the code did** — the prior behaviour, with real `file:line`
   references and real numbers from this repo.
2. **Why it was wrong** — the specific failure. If a reference says otherwise
   (`AGENTS.md`, the README's API table, a framework doc), quote it with its
   locator.
3. **What changed** — the diff in prose, short enough to follow without
   opening the code. Include what you deliberately left alone.
4. **What could still break** — the honest residual risk: contracts touched,
   the checks `verify` doesn't run and whether they ran, the test that is now
   the safety net.

No quiz: a bugfix explainer is published after `verify` is green, so a quiz
would be grading a decision already made. A figure only when it shows what
prose cannot (a before/after ordering, a repo-wide measurement), carrying
what was measured and how.

## The phases

Before Phase 1, create a task per phase in the harness's task tool, plus a
capture subtask per affected surface, and move each through in progress and
completed. An untracked run is how the reproduction, the docs check, or the
definition-of-done walk quietly go missing.

| # | Phase | Skill / tool | Artifact | Skip when |
|---|---|---|---|---|
| 1 | Reproduce | `pnpm dev` + `agent-browser`, `curl` the API, or the failing `pnpm` command | `<surface>-before.*` per surface | never: a defect with no page is reproduced by its command or request |
| 2 | Find the cause | `superpowers:systematic-debugging` | a proven mechanism (`file:line` chain, failing test, observation) | never |
| 3 | Write the cause | — | `root-cause.md` | never |
| 4 | Fix, TDD | `superpowers:test-driven-development` + `rubber-duk-tests` (WRITE) | the fix and a regression test seen failing | never |
| 5 | Prove it | restart `pnpm dev`, then capture | `<surface>-after.*` per surface; `.ai/regression/` box tightened or added | regression box: the defect has no page surface |
| 6 | Update the docs | `grep` | `README.md`, `AGENTS.md` (surfaced to the user), `docs/gotchas.md`, `.ai/dod/`, `.ai/diagrams/` edits, or "none" | never |
| 7 | Verify | `pnpm verify`, plus the checks it doesn't run that the fix touches | exit 0, read | never |
| 8 | Review | `superpowers:requesting-code-review` + `superpowers:receiving-code-review` + `rubber-duk-*` | findings listed with verdicts; a commit per accepted finding | never |
| 9 | Explain | `references/explainer-template.html` + `Artifact` | `explainer.html`, published | never |
| 10 | Tick | — | touched `.ai/dod/` checklists walked | never (record "no checklist" when none covers it) |
| 11 | Commit and push | `.ai/resources/pr-guidelines.md` | one commit on `main`, pushed | never |

### Phase 1 — Reproduce

Mandatory before any diagnosis. A defect you have not seen with your own eyes
is a defect you are guessing at, and the "after" proof is worthless without
the "before".

`git fetch origin && git status -sb` first: a stale clone reproduces bugs
already fixed (`AGENTS.md`).

For a page: get the dev server up. Check first, start only if absent:

```bash
curl -sf -o /dev/null http://localhost:5173 && echo up
```

If it is down, start `pnpm dev` as a background task, never in the
foreground. If a server is already running, use it without killing it or
starting a second one.

Load the `agent-browser` skill and run `agent-browser skills get core` for the
installed command surface; drive it as `AGENTS.md` sets up the browser
(headed, native Chrome, a named `AGENT_BROWSER_SESSION`, `open` launched in
the background, never `wait <ms>`). Capture the screen, read console errors,
and where the defect is textual, read the DOM with `eval`: a measured value is
stronger evidence than a picture of it, and diffable. Check the defect in the
theme and width the report names, and in the other theme too.

For the API: `curl -s http://localhost:8787/api/<resource>?<filters>`, saved
as `<surface>-before.txt`. For an import, an export or a capture command: the
command and its output, saved the same way.

A surface that turns out not to be affected is a finding, not a gap. If the
"before" capture shows the defect absent, stop: save the negative capture,
name the guard that already covers it (`file:line`, the existing test), and
report to the user. Don't write a root cause or a fix for a defect you could
not see.

### Phase 2 — Find the cause

Invoke `superpowers:systematic-debugging`. Read the code, then prove the
mechanism: a failing test, a browser observation, a `curl` transcript, a
`file:line` chain. Not a hypothesis you find plausible. Follow the layers in
order (route → service → repo → the SQL drizzle builds, or the importer's
validation) rather than guessing which one lies.

### Phase 3 — Write `root-cause.md`

Before the fix exists, to the contract in the journal section. A cause
diagnosed only in conversation has not been written down, and the next
session cannot read the conversation.

### Phase 4 — Fix it, TDD

Failing test first, and it must fail *for the reason `root-cause.md` names*.
Watch it fail (`pnpm exec vitest run <path>`). Implement the minimal change
inline. Watch it pass. The test is written by the seat Ground rules names;
the orchestrator still watches it fail.

Where the test goes:

| Kind | Home | Convention |
|---|---|---|
| Server route, service, repo or importer | `apps/server/test/<layer>/` (`importers/fixtures/` for a staged record) | `docs/conventions/test-quality.md` |
| Web view, component or `src/lib/` module | `apps/web/test/` | `docs/conventions/test-quality.md` |
| Schema, capture, HUD | `<package>/test/` | `docs/conventions/test-quality.md` |
| Manual click-through | `.ai/regression/<domain>.md` | `.ai/regression/README.md` |

Test the layer that broke: a wrong ordering or status through the real app
over an in-memory store (`createApp(createServices(testStore()))`, then
`app.request()`), asserting on the response; a view through `renderRoute`
(`apps/web/test/view-harness.tsx`) with `stubApi`, querying by role or text.
`docs/conventions/test-layout.md` names the file. A test never hard-codes
a record's curated values (`.ai/agent-working-rules.md` § Tests). A defect
reachable only through the page is pinned by the unit test plus the Phase 5
capture of the DOM contract the defect broke, and a box in
`.ai/regression/`; the repo has no end-to-end suite to add a browser test to.

### Phase 5 — Prove the defect is gone

Same route, same command, same observation as Phase 1, captured the same way
into the bugfix directory. Restart `pnpm dev` first (stop the background task,
start it again) and confirm it rebuilt cleanly before you read anything off
the page.

A stale server lies. `tsx watch` restarts the API on a source change, but a
database seeded before your change keeps its old rows, and the browser's
query cache keeps the last response until it refetches. If the page disagrees
with what the code plainly does, prove the unit in isolation
(`pnpm exec vitest run <path>`), then restart, reseed if the fix touches
seeding or import (`pnpm dev:reseed`), reload, and re-measure. Rewriting a
correct fix to satisfy a stale render is the failure this paragraph exists to
prevent.

Then check whether `.ai/regression/<domain>.md` has a box covering the
behaviour. If it does and the box passed while the bug was live, the box is
too weak: tighten it. If there is none, add one.

### Phase 6 — Update the docs the fix invalidated

Check the diff against `README.md` (the API table, the database rules, the
working notes), `docs/conventions/` for the surface you touched,
`docs/gotchas.md` (add an entry if the trap generalises), and `.ai/dod/` if a
checklist item was wrong. An `AGENTS.md` rule that turns out wrong is
surfaced to the user, never edited by you. "None" is a valid finding: record
"Doc updates: none" in the task and the commit body.

A fix that changes which module owns a behaviour, adds a module, or changes a
data path affects the orientation docs: open every `.ai/diagrams/` file whose
subsystem the fix touched and verify each path, module, function and route it
names still resolves (`grep` or `ls`, don't trust the diagram). Current-state
prose only.

### Phase 7 — Verify

`pnpm verify` exits 0. Run it, read the output; not "should pass". Then the
checks it doesn't run that the fix touches: `pnpm build:vercel` for the
function or the build, a fresh import plus `pnpm db:scope` for data
(`README.md` § The database), with the snapshot rebuilt and committed when
curated data changed.

### Phase 8 — Review

In order, on `opus`: `superpowers:requesting-code-review` over the fix's
commit; `rubber-duk-review` over the same diff, mandatory for every bugfix,
with the domain passes the seats name (`rubber-duk-backend`,
`rubber-duk-frontend`, `rubber-duk-auditor`) by surface;
`rubber-duk-tests` (AUDIT) over the regression test;
`superpowers:receiving-code-review` to process with rigor rather than
performed agreement. A bugfix does not pass with an unaddressed finding: fix
it or explicitly rebut it.

Findings specific to this flow, to ask the reviewer for by name:

- **A behaviour change riding along with the fix** — the diff should close
  the defect and nothing else. A rename, a signature change, or an extra
  guard inside the fixed function needs naming and justifying.
- **A fix at the symptom rather than the cause** — a CSS override that hides
  a wrong DOM contract, a `?? fallback` that swallows the condition
  `root-cause.md` named, a curated value edited to match a buggy importer.
- **A regression test that pins the implementation, not the behaviour** —
  one that would go green against a wrong fix, or red against a correct
  refactor.
- **The adjacent instance left unfixed** — the same defect in another mode,
  another list route, or another record. Fix it here or name it under "what
  deliberately does not change".
- **Archaeology comments** introduced by the fix.

List every finding to the user before applying any of them, with a verdict on
each: valid, or rebutted and why. A finding silently folded into the diff is a
finding nobody chose to accept. Each accepted finding is its own commit on top
of the bugfix commit, named for what it fixes; rebutted findings produce no
commit and go in the reply.

### Phase 9 — Write and publish `explainer.html`

After the fix, from the fix, to the contract in the journal section. Publish
with the `Artifact` tool and hand the user the URL.

### Phase 10 — Satisfy the definition of done

Open every `.ai/dod/` checklist whose surface the fix touched and walk it item
by item against the diff, with `AGENTS.md`'s rules. A **must** item is met or
the fix is not done; an **if relevant** item is met or you state why it does
not apply. Fix the code to earn the tick: editing the checklist so the work
passes is the one move that is never allowed. "No checklist covers this
surface" is a valid outcome; record it in the commit body.

### Phase 11 — Commit and push

Bundle the fix, the test, the artifacts, the captures and the doc updates
into one commit on `main`, so the change reverts as one unit. The message
follows `.ai/resources/pr-guidelines.md`, and for a bugfix its body maps onto
`root-cause.md`: the problem is the Symptom and Mechanism compressed to prose,
the justification is § The fix, and what deliberately does not change is
already written there. Summarise them; a body that only cites the file fails
the "judge it without the diff" bar. The explainer URL goes in the body. Then
`git fetch origin` and push. Review-finding commits from Phase 8 sit on top
and are pushed the same way. If the work has a GitHub issue, comment on it
with the commit and explainer links.

## Reference material

- `references/explainer-template.html` — the explainer's tokens, both themes,
  the fixed sections as `FILL:` slots, and the figure components.

### Red flags — stop

- A fix in the working tree and no `.ai/bugfixes/NNN-<slug>/root-cause.md`
- `root-cause.md` with a Location but no Mechanism: the cause is not found yet
- A regression test that was never observed failing
- A missing-test bugfix where the reintroduce-the-regression step was skipped
- A bugfix directory with no `NNN-` prefix, a reused number, or a number
  copied from a research record
- `root-cause.md` or a task brief naming how many tests to write
- A fix that adds a table, a curated field, an `/api` resource or a route:
  that is a feature
- An edited file under a record's `evidence/`
- Two bugs in one commit, or a bugfix split across commits
- Review findings applied without listing them and their verdicts first, or
  several findings squashed into one commit
- `explainer.html` missing, or published before `pnpm verify` exited 0
- An artifact title that is a metaphor, a pun, or a sentence that would fit
  some other bug
- A fix claimed done without the page (or the request, or the command) having
  been checked, before **and** after
- An "after" capture taken without restarting the dev server
- A data fix pushed without the snapshot rebuilt and `pnpm db:scope` read
- "Verified" claimed while a check `verify` doesn't run, covering the touched
  surface, was never named
- Any verification stage run alone (lint, typecheck, the whole test suite)
  instead of `pnpm verify`

Any of these: stop, write the missing file, then continue.

### Rationalizations

| Excuse | Reality |
|--------|---------|
| "The fix is one line, the artifacts are overhead" | The one line is the cheap part. Why it was wrong is the part that gets lost. |
| "I'll write `root-cause.md` after — I'll know more then" | You will know the fix. After it, you can no longer tell which parts you actually proved. |
| "I found the line that's wrong, that's the cause" | That is the Location. The cause is why that line does the wrong thing under the triggering condition. Write the Mechanism. |
| "It's obvious once you see it" | Then the Mechanism section is two sentences. Write them. |
| "The ticket has a full description, that IS the root cause doc" | A ticket is a statement of deferred work. It has no mechanism. |
| "The symptom is intermittent, I can't measure it" | Then write "reasoned, not measured" in the Symptom section. An unmarked guess reads as evidence later. |
| "I'll write the test after the fix — same test either way" | You never watched it fail, so you never proved it can catch anything. |
| "The test passes, so the fix works" | Did it fail before? For the right reason? |
| "The capture is wrong, I'll just correct it" | Evidence is never edited. Fix the curated row; a new measurement is a new capture. |
| "The curated row is wrong because the game changed" | Then it is a `refresh-meta` round with an obsolete marking, not a bugfix. |
| "This missing-test bug has no cause to analyse" | It has a class of regression it lets through. Name it, then prove the new test catches it by reintroducing it. |
| "While fixing this I noticed another bug, I'll fix it too" | Two bugs, two directories, two commits. |
| "The bug is visual, a unit test on the component is enough" | The unit test renders the component. The bug may be that a route never renders it. Assert the DOM contract in the capture too. |
| "`verify` is green, so the fix is verified" | `verify` doesn't build for Vercel, check the snapshot, or look at the page. Name what did not run. |
| "`verify` is slow, I'll run the one test file and call it done" | Single-file runs are for the red-green loop. Only `verify` claims the repo is green. |
| "A dev server is in the way, I'll kill it" | It's the user's. Use it. Restart it only for the Phase 5 capture or on evidence it is stale. |
| "The unit test is green, I don't need to open the page" | The unit test proves your function. It does not prove the route calls it. Open the page. |
| "I'll capture the 'after' — the 'before' is obvious from the report" | Then you have one picture and no comparison. Capture the broken state first. |
| "The page still looks wrong, my fix must be incomplete" | Or the server, the database or the query cache is stale. Prove the unit, restart, reseed, re-measure. |
| "This needs a new curated field, but it's still fundamentally a bug" | A new field changes the import contract. That is `feature-development`. Escalate. |
| "The explainer repeats `root-cause.md`, it's redundant" | Different readers. One is the maintainer's record, one is the user's. |
| "The title is catchy, the body has the detail" | The title is what appears in a list of artifacts. Name the defect. |
| "I'll design the explainer from scratch, this one deserves it" | It is one page of a series. Fill the template. |
| "I explained the fix in chat, the artifact is redundant" | Chat scrolls away. The URL does not. |
| "I'll fix all three, then commit once" | Then none can be reverted alone, and `git log` stops recording which fix caused what. |
| "A comment explaining what it used to do helps the next reader" | It describes a state the code is not in. Commit body, `root-cause.md`, explainer: pick one. |
