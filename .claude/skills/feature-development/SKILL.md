---
name: feature-development
description: Use when starting non-trivial CODE work on the skurekjakub-dev blog (Next.js 16 + MDX + TypeScript) that adds or changes behaviour and touches more than one file — "let's build", "add a system", "implement", "wire up", "port X over", "add a route / an MDX component / a feed / search / JSON-LD" — or whenever the user mentions a feature constitution, `.ai/feature-constitution`, or the README-as-spec pattern. Also use before invoking `superpowers:brainstorming` / `writing-plans` / `subagent-driven-development` / `finishing-a-development-branch` standalone; those are phases of this flow. NOT for authoring a blog post (`write-blog-post`), NOT for a bounded defect (`project-bugfixing`), NOT for behaviour-preserving cleanup (`codebase-refactoring`), NOT for a single-file tweak.
---

# Feature development

Orchestrates the per-feature CODE workflow for the `skurekjakub-dev` blog (Next.js 16 App
Router, Cache Components, React 19, TypeScript strict, Tailwind 4, MDX): research → brainstorm →
conventions grounding → spec review → plan → branch → execute → smoke → review → finish. The
deliverable is a `.ai/feature-constitution/<slug>/` folder holding two classes of artifact, and a
branch whose code matches what the folder's `README.md` says.

**Scope boundary.** Code features only (a route, a feed, a search index, a new MDX component, a
proxy step). Authoring a post is the `write-blog-post` skill; the two meet only when a post needs
new code to render.

## Which flow?

Pick by the deliverable, not the size. Escalating mid-flight is fine — say so and switch.

| The deliverable is… | Flow |
|---|---|
| New or changed behaviour | this skill |
| Same behaviour, better shape — move, rename, dedupe, dead code, cycle | `codebase-refactoring` |
| Restoring behaviour the code already intends — a symptom, a regression, an uncovered path | `project-bugfixing` |
| Porting from `~/repositories/kentico-docs-jekyll` — parity with something upstream already does | `project-bugfixing` (upstream parity) if it only closes a gap; this skill if it adds a public surface. Read the upstream-parity caution in `project-bugfixing/SKILL.md` either way — the upstream has collections, a mount prefix and an admin surface this blog deliberately does not. A port that mixes both runs as one feature branch; each parity piece still gets its own `root-cause.md` under `.ai/bugfixes/`. |
| A typo, a one-liner, a class tweak, a copy edit | none — just do it |

## Right-size the ceremony

The user wants the **design conversation**, not the spec files, on small changes. Use the whole
phase table for work that spans a subsystem (a new route subtree, a proxy chain, a projection
pipeline). For a small feature — at most two files, and no new route, config key, or served
header — run Phases 1, 1.25 and 1.5 **in conversation**, skip `spec.md` and `plan.md`, and still
land the `README.md` (new or updated). Phase 1.5 still dispatches `rubber-duk`: it cannot see
this conversation, so the dispatch prompt carries the full design as written here. State which
mode you are in before starting; if the predicate does not settle it, ask.

## Precondition — superpowers

Phases 1–7 are driven by `superpowers:*` skills. If they are not in the available-skills list,
say so, explain that the plan discipline and adversarial review are what keep a feature from
half-landing, and ask via `AskUserQuestion` whether to continue without them. Never silently
proceed.

## First — does this belong under an existing constitution?

`.ai/feature-constitution/` is flat: one `<slug>/` per feature, no domains, no registry. Before
minting a folder, `ls` it and decide whether this is a new feature or a change to one:

- A change to an existing subsystem — a new proxy step, a new projection tag, a new metadata
  field — goes under **that** feature's folder. Fold the resulting state into its `README.md`;
  keep any journal artifacts beside it.
- Mint a fresh `<slug>/` only for a self-contained capability that stands on its own.
- If unsure which folder is the parent, pick the feature whose files the change most touches.

`<slug>` is kebab-case and descriptive (`markdown-projection`, `post-tags`, `contact-form`).

## The two classes of artifact

| Class | Files | Audience | Lifecycle |
|---|---|---|---|
| **Implementation artifacts** | `research.md`, `spec.md`, `plan*.md` | Whoever is doing the build, during the build | Frozen — a journal |
| **Final spec** | `README.md` (mandatory) | Future agents/people reading the codebase | Evergreen — always the *current* state |
| **Record** | `CHANGELOG.md` entry (mandatory) | Anyone asking what changed, and when | Append-only — dated, never revised |

They rot in opposite directions, so they never share a document. The README that starts
narrating what *used* to be there has become a changelog and stopped being a spec — and the
place for that narration already exists, one entry per merged PR, at the repo root.

## The phases

Each phase invokes a separate skill; this one sequences them and makes each artifact land in
`.ai/feature-constitution/<slug>/` (override the `superpowers:*` default save paths in
conversation).

| # | Phase | Skill / tool | Artifact | Skip when |
|---|---|---|---|---|
| 0 | Research | `iterative-research` | `research.md` | domain familiar / bundled Next docs settle it |
| 1 | Brainstorm | `superpowers:brainstorming` | `spec.md` | never (in chat for small work) |
| 1.25 | Conventions grounding | bundled Next docs + constitution READMEs | "Conventions lineage" in `spec.md` | no framework surface |
| 1.5 | Spec adversarial review | `rubber-duk` | findings folded into `spec.md` | never |
| 2 | Plan | `superpowers:writing-plans` | `plan.md` / `plan-track-*.md` | small work |
| 3 | Branch | `git switch -c feat/<slug>` | — | already on a feature branch |
| 4 | Execute | `superpowers:subagent-driven-development` | commits | never |
| 5 | Smoke | `npm run build` + `next-browser` on the dev server | evidence in chat | no runtime surface |
| 6 | Review | `superpowers:requesting-code-review` → `rubber-duk` → `superpowers:receiving-code-review` | — | never |
| 7 | Finish | `superpowers:finishing-a-development-branch` | `README.md` + `CHANGELOG.md` entry (both mandatory) | never |

### Phase 0 — Research (conditional)

**Check `node_modules/next/dist/docs/` first.** It is the documentation for the installed
version — a tree, not a file: `Glob` for the topic (`**/docs/**/*use-cache*`,
`**/docs/**/proxy.md`), App Router pages under `01-app/`. Only when the bundled docs and primary
sources (`react.dev`, the library's own docs) leave it open, invoke `iterative-research` and save
to `research.md`. Its absence is the signal that the domain was familiar.

When the feature is a port, the primary source is the upstream code itself: read its constitution
and tests in `~/repositories/kentico-docs-jekyll` before its implementation, and note in the spec
what you are deliberately not porting. If that checkout is absent, say so and work from the
description the user gave.

### Phase 1 — Brainstorm

Invoke `superpowers:brainstorming`, saving to `.ai/feature-constitution/<slug>/spec.md`. The spec
captures **Intent** (the problem), **Design** (route/component/lib structure, Server vs Client
split, `'use cache'` boundaries and `cacheTag` invalidation, alternatives and why this one),
**Refactoring & reorganization** (see the standing requirement), and **Open questions**.

Small work: same questions, answered in conversation, no file.

### Phase 1.25 — Conventions grounding (mandatory where a framework surface exists)

Training data lies about Next 16 / React 19 specifics; "I know how `'use cache'` works" is not
grounding. Two halves:

- **Framework** — read the 1–3 bundled Next doc pages the design touches, for the blessed pattern
  *and* the page's named caveats.
- **Repo** — read the `README.md` of every constitution the design touches
  (`ls .ai/feature-constitution/`). A new MDX component is not designed until you have read
  `markdown-projection/README.md` and decided what its projection emits — twins prerender, so an
  unregistered capitalised tag fails `next build`.

Add a **"Conventions lineage"** section to `spec.md`: each source, what it confirmed, and every
deliberate deviation with its reason. A source consulted and *rejected* still gets a line. Cite
paths that resolve — check each before writing it.

### Phase 1.5 — Spec adversarial review (mandatory)

Before any planning, dispatch **`rubber-duk`** (`.claude/agents/rubber-duk.md`) on `spec.md`
with an adversarial mandate: verify the spec's load-bearing claims against the code and the
bundled docs, not the spec's say-so; hunt false premises about Next 16 / React 19, designs that
fight the framework (client components that should be server, dynamic reads with no
Suspense/`'use cache'` boundary under `cacheComponents`), premature abstraction, missing
eager-fail, divergence from `AGENTS.md` or the touched constitution. A missing "Conventions
lineage" where a framework surface is designed is itself an IMPORTANT finding.

Process findings through `superpowers:receiving-code-review` — verify each, rebut the wrong ones
with evidence, fold the accepted ones into `spec.md` as a recorded correction (it is a journal;
the reasoning is the value). **No BLOCKER or IMPORTANT survives into Phase 2 unaddressed.**

### Phase 2 — Plan

Invoke `superpowers:writing-plans`, saving to `.ai/feature-constitution/<slug>/plan.md`;
independent tracks become `plan-track-a.md`, etc. Every task carries file paths, complete code,
and its exact verification (`npm run typecheck`, the affected `tests/` suite, render the route).
No "Step N: Commit" tasks — commits are a consequence of work. Moves and renames from the
spec's reorganization section are tracked tasks, sequenced with their importer updates.

### Phase 3 — Branch

`git switch -c feat/<slug>` off `main`. Skip if already on a dedicated feature branch. When the
work folds into an existing constitution, `<slug>` names the change (`feat/proxy-scrub-headers`),
not the constitution.

### Phase 4 — Execute

**On entering:** mirror the plan into the harness's task tracker, one task per plan task, marked
in-progress and completed as each verification passes — never batch-completed. The plan file's
checkboxes are the durable record; the task list is what the user watches.

Invoke `superpowers:subagent-driven-development`; review after each task, not at the end.

**Every dispatched prompt names `.ai/comment-policy.md` and requires reading it before writing
code.** A subagent that has not read it writes narrative comments by default, and the
orchestrator pays for that in Phase 6.

**Model per task.** Every dispatch names its model; none inherits (`AGENTS.md` § Subagents).
A fully-specified or mechanical task (the plan carries the code; a rename sweep; a glob edit)
→ `model: "sonnet"`. Design latitude, an unenumerated importer set, a UX call, and every
review gate → `model: "opus"`. When unsure, `opus`.

**Parallelize by file ownership.** Tasks that touch disjoint files can run as concurrent agents
with `isolation: "worktree"`; two agents never write the same file (a barrel, `mdx-components.tsx`,
`proxy.ts`). Merge each worktree branch into the feature branch as it reports, then
`git worktree remove` it and delete its branch. Re-derive the dependency graph from file
ownership, not from the plan's track order. When every task touches the same files (a proxy
chain where each step also edits `proxy.ts`), there is nothing to parallelize — run them serially
on the feature branch and skip worktrees.

New test suites and bulk test changes go through the test standing requirement below.

### Phase 5 — Smoke (mandatory where there is a runtime surface)

`tsc` ≠ build, and a build ≠ a rendered page. Under `cacheComponents` a prerender bailout, a
missing Suspense boundary, a server component importing client-only code, or a hydration mismatch
all pass typecheck. So:

```bash
npm run verify   # typecheck → lint → Vitest → next build; the exit status is the verdict
```

Run it bare and read the whole output; a `next build` that exits 0 can still print a bailout or a
`◐` route you did not intend, and the route table is the only place that shows. Then load the feature in the running app through the **`next-browser`** skill: `npm run dev`
(port 3000 unless one is already up — use it, never kill it), open the route, confirm **zero
console / hydration / RSC errors**, and exercise the behaviour. For a header or negotiation
feature the evidence is `curl -si` against the dev server, and — because Vercel's CDN rewrites
`Cache-Control` and strips or adds `Vary` — against a **preview deployment** (`vercel:deploy`)
before the claim "it works" is made — deploy the feature branch as-is during this phase, before
review; the review should see the transcript. For UI, check dark mode and a narrow viewport.

`superpowers:verification-before-completion` applies: record what was checked (route, command,
observed result). No smoke failure advances to review.

### Phase 6 — Review

1. `superpowers:requesting-code-review` against the branch base.
2. **`rubber-duk` over the full branch diff — mandatory, every feature.** Hunt: comment-policy
   violations, `'use cache'` / Suspense / `cacheTag` placement, Server-first, no bolted-on
   superseded files, tests that would stay green against a broken implementation.
3. `superpowers:receiving-code-review` — rigor, not performed agreement.

**List every finding to the user with a verdict before applying any.** Each accepted finding is
its own commit on top of the feature commits, named for what it fixes; rebutted findings get a
reply and no commit. No BLOCKER / IMPORTANT survives the gate unaddressed.

### Phase 7 — Finish

Write `README.md` **from scratch against the current code** — skim the journal as source
material, never transplant it. Update `AGENTS.md` § "Where things live" if the feature adds a
place things live.

**Add the `CHANGELOG.md` entry — mandatory for a feature.** A feature changes what the site
or its contracts do, which is the whole test for an entry. Write it against the merged
result, in the format `CHANGELOG.md` § Format prescribes, and leave the PR number to fill in
at the moment the PR exists. The entry is not the README and not the commit body: the README
says what the feature *is*, the commit body says why it is shaped that way, the entry says
what changed for whoever reads the site or builds against it.

Then `superpowers:finishing-a-development-branch`, so constitution, changelog and code land in
one PR. Design rationale goes in the commit body, shaped by
`.ai/shared/commit-and-pr-format.md` — read it before writing the commit or the PR. For a
feature the discarded alternatives the body owes are the ones `spec.md` ruled out; name them
rather than pointing at the file.

## The README — tone and structure

Present-tense spec of the feature *as it exists*. A reader who joined yesterday cannot tell it
shipped in two passes.

**Always:** what it does · why it exists (present-tense problem) · design (route/component/lib
structure, Server vs Client split, cache boundaries, data flow) · file map · consumer pattern ·
constraints / decisions · how to verify.

**Never:** status lines, branch names, SHAs, dates, tracks, task numbers, references to
`plan*.md` in prose, "previously" / "used to", a future-work section (that is a follow-up file —
below), anything that rots when the next change lands. Later work **edits** the README to the
new state; git log is the changelog.

```markdown
# <Feature name>

One paragraph: what this does. Present tense, active voice.

## Why this exists
## Design
## File map
| Path | Role |
|---|---|
## Consumer pattern
## Constraints / decisions
## How to verify
\`\`\`bash
npm run verify          # typecheck → lint → tests → build, same as CI
npm run dev             # open <route>, no console errors
\`\`\`
```

## Standing requirement: deferred work is a follow-up file, written by the orchestrator

Anything a phase surfaces and defers — an out-of-scope improvement, a review finding parked by
ruling, a future-work idea — the **orchestrator** writes as `.ai/followups/<slug>.md` in the
shape `.ai/followups/README.md` sets out. It stays **untracked** and goes into the **primary
checkout**, never a worktree (a merged worktree is deleted with its untracked files). A spec's
"Out of scope" still defines what the feature does not do; the moment an item carries intent to
do it later, it is a follow-up file, not README or spec prose.

## Standing requirement: reorganize toward the target structure — don't bolt on

When a feature changes the *shape* of a subsystem, it is not done while the new code sits beside
the old. Relocate to the correct folder, **rename** modules/symbols/types to the new vocabulary,
delete the superseded file, update every importer. No `// moved from X` archaeology — the diff
records the move. This is designed in, not bolted on: the spec carries a "Refactoring &
reorganization" section (target tree, rename list old → new, ripple inventory: imports, dynamic
`import()`, `mdx-components.tsx`, `next.config.ts`,
`tests/`, and **pages that quote a path** — `git grep` the old path under `content/`), the
plan tracks the moves, and "bolted on, not integrated" fails Phase 6. Bounded by intent: reorganize
what the feature touches, nothing else.

## Standing requirement: tests fail when the code breaks

Unit logic lives in **`tests/`** (Vitest, Node env, mirrors `lib/` and `app/`; `npm test`). One
bar: *a test must fail when the code it covers breaks* — prove it by watching it fail first
(`superpowers:test-driven-development`). Route/runtime behaviour is proven by `next build` plus
the smoke, not by manufactured tests; a logic-free component needs none. A new suite or a bulk
sweep is dispatched as its own task with the bar stated in the prompt; a one-line assertion tweak
is done inline.

## Standing requirement: comments follow `.ai/comment-policy.md`

Read it before Phase 4; do not work from memory. JSDoc on every function in API voice (`@param
name - text`, `@returns`, `@throws {Type} When …`, plus the repo's `@cached self` / `@module`);
inline comments only at gotchas, as long as the point needs; no narrative, no archaeology, no section banners;
every external claim carries a locator that resolves. Rationale → commit body; a behaviour that
must hold → a test name. A violation in the diff is a Phase 6 finding.

## Standing requirement: TS / React / Next conventions

Settle disputes against `node_modules/next/dist/docs/` or `react.dev`, never memory. TypeScript
strict — no `any`, no unjustified `as`/`!`; route props from `next typegen`, `params` /
`searchParams` are awaited. Server-first — `'use client'` at the leaves. Cache Components —
`'use cache'` + `cacheLife` on cached reads, dynamic reads inside Suspense, coherent `cacheTag`.
Metadata via `generateMetadata`. Tailwind 4 CSS-first (`@theme` tokens, `light-dark()` follows
the site theme — no hex literals). British spelling in user-facing copy.

## Reference shapes

`.ai/feature-constitution/markdown-projection/README.md` — a subsystem README with a pipeline,
file map, and constraints. `contact-form/` — README + `spec.md` journal side by side.
`llm-assisted-authoring/` — README + a `research/` journal.
