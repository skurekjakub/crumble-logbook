---
name: codebase-analysis
description: >-
  Use when the user wants an area of crumble-logbook analyzed and written up without changing code — "analyze", "audit X for improvements", "look for perf wins in", "what's wrong with …", "find tech debt / smells / dead weight in", "sweep this area", "poke around X and write up what you find", "turn findings into followups", "health check" — or when a review or feature run surfaced side findings that should become follow-up files. Not for reviewing a pending diff (rubber-duk-review), executing a refactor (codebase-refactoring) or building a feature (feature-development).
---

# Codebase analysis

The deliverable is a set of follow-up files, not a conversation. Each file
must let someone who was not here implement the fix without opening this
transcript: the defect, its measured cost, the facts the fix depends on (with
locators that resolve), every caller, the options, the recommended one, and a
solution section with code, tests, verification steps and expected numbers.
This skill never edits code or data. It ends when the files are written and
recapped.

**Ground rules** bind every phase, **the journal** defines the follow-up file
and where it lives, and **the phases** order the work.

A question about the game (is this deck still the best, what does this
mechanic do) is not an analysis: it is `deep-research` or `refresh-meta`. This
skill analyses the code, the schema, the importers and the app.

## Ground rules

### Seats: who does what, on which model

The orchestrator (the session running this skill) writes every finding, takes
every measurement and makes every judgement call; subagents only perform
mechanical inventory or refute a claim.

Every dispatch goes to a `rubber-duk-*` agent per
`.ai/resources/skills/seats.md`, never `general-purpose`:
`rubber-duk-backend` (REVIEW) or `rubber-duk-frontend` (REVIEW) for inventory
over a large area (caller tables, grep sweeps) and for refuting a framework
claim the orchestrator is about to build a solution on; `rubber-duk-tests`
(AUDIT) when the question is whether an existing test would catch a
regression. Pass `model` explicitly: `sonnet` for mechanical inventory,
`opus` for refuting a claim and for `rubber-duk-tests` (AUDIT). Never call the
Workflow tool or spawn a multi-agent sweep unless the user asked for that
scale.

### Code outranks documentation

Order of evidence, highest first:

1. installed library source (`node_modules/drizzle-orm/…`,
   `node_modules/@tanstack/react-router/…`, `node_modules/hono/…`); cite
   `file:line`;
2. the version-matched docs `docs/conventions/stack-profile.md` points at;
   cite `path:line`; they match the installed version, training data does
   not;
3. repo code, and what it does when run (a test, a `curl`, an import);
4. vendor pages via WebFetch, URL and date;
5. repo docs (`README.md`, the specs under `docs/superpowers/`,
   `docs/conventions/`, `.ai/`), comments: hypotheses only. A doc that
   contradicts the code is itself a finding.

A claim the solution depends on gets a locator from levels 1–4 or it is
removed from the file.

### Nothing in the tree changes

The sweep produces files under `.ai/followups/` and nothing else. `git diff
--stat` at the end shows no change, and `git status --short` does not list the
follow-up files because `.gitignore` covers them. No record is imported into
`data/crumble.db` (measure in a scratch database, `CRUMBLE_DB=<scratchpad>/…`),
and `data/snapshot.json` is never rewritten. Any fix the orchestrator is
tempted to make on the way is written up as a finding instead.

## The journal

Each finding is one file at `.ai/followups/<domain>/<slug>.md`. The domains,
the naming rule, the file shape and what is not a follow-up are in
`.ai/followups/README.md`. `ls .ai/followups/<domain>/` shows earlier files in
the area under sweep.

The files stay **untracked** (never `git add` them) and are written into the
primary checkout, never a worktree lane, which is removed when it merges and
takes untracked files with it. A finding is never folded into a spec, a plan,
a README or another finding's "out of scope" list: a finding hidden in prose is
a finding lost. A decision only the user can make goes in `OPEN-QUESTIONS.md`
as well, linking the follow-up.

`references/followup-template.md` is the file shape, section by section, with
the done-criteria. Read it before writing the first file. The parts that take
the longest are the parts that make the file usable:

- **Solution code** is full replacement code for the changed parts, with
  JSDoc per `AGENTS.md` and `docs/conventions/comment-policy.md`, no
  archaeology comments, no narrative. Include the "looks wrong but isn't"
  list: every question a reviewer will ask, answered with a precedent in the
  repo or a locator.
- **Tests** name the files to touch (per `docs/conventions/test-layout.md`)
  and the behaviour each new test pins, and say which harness to copy, with
  its `file:line`: the in-memory store for the server, `renderRoute` and
  `stubApi` for a view. Never assert a record's curated values; stage
  fixtures.
- **Verification** is ordered, baseline first, with an expected number per
  step and the exact command (`pnpm exec vitest run <path>`, a `curl` against
  `pnpm dev`, a fresh import into a scratch database, `pnpm db:scope`).
- **Commit**: the why goes in the commit body, never in comments, per
  `.ai/resources/pr-guidelines.md`; rollback cost in one line.
- **Workflow**: say whether the implementer runs `feature-development`,
  `project-bugfixing` or `codebase-refactoring`, by deliverable.

Voice: plain language first, then the term. Numbers with methods. No
"consider", no "might want to": an option is listed or it isn't, and one is
recommended. The files are written in full sentences because they outlive the
session, whatever the chat style is. No gratuitous counting (`AGENTS.md`):
numbers are measurements.

If the user intervenes during the run or responds to the recap with a
decision, the orchestrator replaces the file's `## Resolution options`
section with `## Resolution (user-directed, <date>)`, recording their decision
and every stated constraint. Do not re-argue a decided point in the file or in
chat.

### The explainer

The sweep also publishes one page the user reads instead of the findings
files: `.ai/followups/<domain>/<YYYYMMDD>-<sweep-slug>-explainer.html`
(`cross-cutting/` when the sweep spans domains), untracked like the findings,
built from `.ai/resources/skills/explainer-template.html`. Read
`.ai/resources/skills/explainer-contract.md` before writing it.

Its sections, in order: **Summary** (the findings at a glance, each with its
headline number and recommendation, as a findings table); **In plain terms**
(what the area does, what the sweep found and why it costs something, in the
app's vocabulary, no paths); **Walkthrough** (one step per finding, in the
order the files were written, with the measurement, its method, the evidence
locators, and the options with the recommendation); **Check yourself** (six
to ten questions on the mechanism behind the findings, each naming the file
or measurement that holds the answer). The title is a two-to-four-word name
for the sweep; every number carries its command, commit and date. The URL
goes in the chat recap, and in a comment on the GitHub issue if one exists.

## The phases

| # | Phase | Tool | Output | Skip when |
|---|---|---|---|---|
| 0 | Scope | conversation | one-line restatement with the lenses, repeated in each file's provenance line | never |
| 1 | Map | `Grep` / `Glob` / `rubber-duk-*` inventory | caller and boundary tables, carried into each file's callers section | never |
| 2 | Measure | `references/measurement-recipes.md` | a number with its method per candidate finding | never |
| 3 | Verify | evidence order above / `rubber-duk-*` (REVIEW) | a resolving locator per load-bearing claim | never |
| 4 | Split | judgement | the list of findings, one defect each | never |
| 5 | Write | `references/followup-template.md` | `.ai/followups/<domain>/<slug>.md` per finding | never |
| 6 | Self-check | `ls` / `grep` / `git status` | every locator resolves, tree clean | never |
| 7 | Explain and recap | `.ai/resources/skills/explainer-template.html` + `Artifact` | the explainer, published; one chat line per file | never |

### Phase 0 — Scope

`git fetch origin && git status -sb` first: a sweep of a stale clone finds
what was already fixed (`AGENTS.md`).

Take the target literally: a path (`apps/server/src/importers/`), a route
(`/conquest/attempts`, `/api/decks`), a theme over an area ("load time of
the Decks tab"), or "since you're in there, look for X". Restate it in one line
with the lenses you will apply, then start. If two readings would produce
materially different work, ask; otherwise pick the reasonable one, say so, and
record it in each file's provenance line.

Lenses — pick the ones the target implies, not all of them:

| lens | the question | typical evidence |
|---|---|---|
| request cost | what a list route does per request: queries, glossing, citation joins | timed `curl`, the SQL drizzle builds, row counts of a fresh import |
| cold start | what the Vercel function pays seeding from `data/snapshot.json` | `pnpm build:vercel`, a timed seed in a script, snapshot size |
| payload | what each visit downloads that it doesn't use | the built bundle sizes, JSON response bytes, gzip |
| import | what `pnpm import:record` pays per record, and what it fails to check | a timed import into a scratch database, its warnings |
| layering | does code reach past the layer below, or duplicate a registry declaration | `architecture.test.ts` rules vs imports, `registry.ts` vs hand-written lists |
| coherence | do the API, the README table, the curated shapes and the views agree | the README row vs the route's behaviour, `curl` vs the view |
| UI rules | does a screen answer "what's good, what's not" at a glance | agent-browser, light and dark, phone width, against `AGENTS.md` § UI |
| contract drift | does a comment, convention or test pin something no longer true | grep the claim, read the code |

### Phase 1 — Map before measuring

Inventory the area as data, not impressions:

- every entry point and every caller of the symbols in scope: a table with
  `file:line`, the layer it sits in (route, service, repo, importer, CLI,
  view), and what it pays today. This is how "only the decks route glosses
  twice" becomes checkable.
- the boundaries: the server layers and their rules, the registry
  declarations, request-time vs import-time vs build-time, the local server
  vs the read-only Vercel function, the web's query cache.
- what touches it from outside the import graph: scripts, tests, fixtures,
  config, the README's tables, the skills.

`git grep -n` the symbol across the repository (root config included); it
skips `node_modules/`, `.claude/worktrees/` and other untracked trees. List
every hit. A large area is inventoried by a `rubber-duk-*` agent on `sonnet`;
the orchestrator reads the table it returns.

### Phase 2 — Measure, don't estimate

A finding without a number is an opinion. Get the number the cheapest honest
way (`references/measurement-recipes.md` has the commands) and write the
method beside it. Minimum bar per finding:

- for performance, payload or resource findings: the unit cost (ms per
  request, bytes per visit, ms per import) with mean and tail (p50 / p90 /
  max), how often it is paid (per request, per cold start, per import, per
  visit), and the outliers by name (the record, the route, the mode);
- for coherence or contract-drift findings: the exact discrepancy, the
  affected sites, and the failure scenario.

Prefer the repo's own data over a synthetic proxy: a fresh import of every
record into a scratch database is the real data set.

### Phase 3 — Verify every load-bearing claim

Walk each claim a solution depends on down the evidence order and attach the
locator. When a first version of a claim turns out wrong (drizzle's beta
behaviour, TanStack Query's cache keys and the registry's derived filters
routinely fool a first pass), update the notes and record that the earlier
claim was refuted, so the final file explains the correction rather than
silently rewriting.

Adversarial check for expensive claims: before authoring a solution that
depends on inferred library behaviour, read the implementing function end to
end. If it is still unclear, dispatch one `rubber-duk-backend` (REVIEW) or
`rubber-duk-frontend` (REVIEW) on `opus` with the claim and the locator,
asking it to refute.

### Phase 4 — Split into findings

One file per defect. A defect qualifies when its cost is quantified, a bounded
fix exists, and the fix can be described to completion. Merge two
observations that share a fix; split one observation that needs two unrelated
fixes. Anything smaller than a solution (a stale README row, a misnamed
helper) is still its own file with a short solution section, never a bullet
at the bottom of a bigger one.

Drop what has no cost and no failure scenario. "Would be nicer" is not a
finding.

### Phase 5 — Write each file

Write each finding to `.ai/followups/<domain>/<slug>.md` following
`references/followup-template.md`, in the voice and with the sections the
journal sets out. Siblings from the same sweep cross-reference each other by
file name.

### Phase 6 — Self-check

Before handing over, for every file:

- `ls` / `git grep` every locator it cites: each resolves today;
- each number has a method next to it;
- no inline out-of-scope lists; siblings are linked by file name;
- the tree is clean (`git status --short` and `git diff --stat` show nothing);
- the title names the defect, not the fix.

### Phase 7 — Explain, then recap

Write and publish the explainer to the contract in the journal section, from
the finished findings files, and hand the user the URL.

Then recap in chat: one line per file (file name, headline number, the
recommendation) plus the explainer URL, and stop. The user decides what gets
implemented; offer to start any of them, or to file them as GitHub issues
(`file-github-issue`), don't start.

## Reference files

- `references/followup-template.md` — the file shape, section by section, and
  the done-criteria.
- `references/measurement-recipes.md` — commands for timing the API, imports
  and the build, payload byte counts, and the shell traps that cost a round
  trip.
- `AGENTS.md`, `docs/conventions/`, `.ai/resources/pr-guidelines.md` — the
  conventions a solution section must already satisfy.
- `.ai/followups/README.md` — the domains, the naming rule, the file shape,
  and what is not a follow-up.
