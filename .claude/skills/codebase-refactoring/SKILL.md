---
name: codebase-refactoring
description: Use when the user wants existing code in the skurekjakub-dev blog improved rather than new behaviour added — "refactor", "clean up", "declutter", "dedupe", "collapse these types", "dissolve this module", "move this somewhere sensible", "delete the dead code", "why do we have two of these", "break this cycle", "this is scattered", "consolidate", "tidy", "reorganize", "unify" — or when a feature's leftovers need retiring, or the user names a module and asks whether it should still exist. Prefer this over `feature-development` whenever the deliverable is "same behaviour, better shape". Skip only for a single-file tidy nothing else imports.
---

# Codebase refactoring

The deliverable of a refactor is **the absence of a behaviour change**. That inverts the central
gate: `feature-development` proves new behaviour works, this proves nothing else moved.
Everything below exists to make that provable rather than asserted.

## Precondition — superpowers

Phases 3–7 are driven by `superpowers:*` skills. If they are not in the available-skills list,
say so, explain that the plan discipline and adversarial review are what keep a refactor from
half-landing, and ask via `AskUserQuestion` whether to continue without them.

## Right-size the ceremony

A refactor of one module with at most five importers is a conversation and a branch: run Phase
2 in conversation and skip only the `spec.md`/`plan.md` files. Every other phase still runs —
0, 1 and 5.5 are cheap and they are the point; 2.5, 5, 6 and 7 are the gates. The record is the
parent constitution's README. The full artifact set is for a sweep across a subsystem. Say which
mode you are in.

## The one rule that outranks the rest

**Verify every claim against the code, including claims made by this repo's own docs.**
`AGENTS.md`, constitution READMEs, and skill files go stale precisely where refactors happen,
and a stale locator reads as ground truth. A doc sentence is a hypothesis; `git grep`, `tsc`,
and a test run are evidence. When a doc and the code disagree, the code wins and **the doc is
part of the diff**.

## Where the artifacts go

`.ai/refactoring/NNN-<slug>/` — not `.ai/feature-constitution/`. A refactor ships no new
behaviour, so it has no feature to specify. `spec.md` and `plan.md` are the journal; `README.md`
describes the shape the code now has. Number by `ls .ai/refactoring/`, highest plus one,
zero-padded to three, independent of `.ai/bugfixes/`; the directory does not exist until the
first refactor creates it, and that one is `001`. Prefer appending to an existing folder when
a later sweep covers the same ground.

Read the constitutions of whatever you are moving (`ls .ai/feature-constitution/`), and update
the parent feature's `README.md` when the refactor changes a shape it describes. Refactor journal
artifacts never go there.

## The phases

| # | Phase | Skill / tool | Artifact | Skip when |
|---|---|---|---|---|
| 0 | Baseline | `npm run verify` | recorded numbers | never |
| 1 | Inventory | `git grep` / `Glob` | the inventory, as data | never |
| 2 | Spec | write it directly | `spec.md` | small work |
| 2.5 | Spec review | `rubber-duk` | findings folded in | never |
| 3 | Plan | `superpowers:writing-plans` | `plan.md` | small work |
| 4 | Isolate | `git switch -c refactor/<slug>` | — | already on a branch |
| 5 | Execute | `superpowers:subagent-driven-development` | commits | never |
| 5.5 | Completeness sweep | `git grep` | — | never |
| 6 | Review | `superpowers:requesting-`/`receiving-code-review` + `rubber-duk` | — | never |
| 7 | Finish | `superpowers:finishing-a-development-branch` | `README.md`; `CHANGELOG.md` entry only if something observable moved | never |

Phases 0, 1, and 5.5 are the ones `feature-development` lacks. They are where refactors are won
or lost.

### Phase 0 — Baseline

Record what green looks like **before touching anything** — "it still passes" is meaningless
without a number. Run `npm run verify` and write down: the Vitest file and test counts, any
pre-existing warnings, and the route table `next build` prints (route count, which are static
`○` vs `◐`/`ƒ`). A red baseline is not a blocker but must be named, or it gets attributed to the
refactor later.

**Coverage over what you are moving.** Where the code has no test that would fail if you broke
it, that is the gap the refactor is blind in. Write a characterization test first — pinning
current behaviour, quirks included — or record explicitly that the area moves unguarded and why
that is acceptable. A path-only or type-only move can go unguarded because the compiler is the
test; a logic move cannot.

### Phase 1 — Inventory as data, not prose

The dominant failure of agent-driven refactoring is the **partial** one: the definition changes
and some call sites don't. Nothing fails loudly, and the contract now diverges site by site.

Make completeness checkable before any edit: list every importer, every call site, every
locator — and count it. Validate the list before executing against it (each path resolves, each
symbol exists, the count matches a second independent query). Cast wider than the import graph:
string literals, dynamic `import()`, config (`next.config.ts`, `vitest.config.mts`,
`tsconfig.json` paths), `mdx-components.tsx`, markdown that names paths — `AGENTS.md`,
constitution READMEs, skill files, and **posts and drafts under
`content/`** that quote a path or a symbol. `references/completeness-sweep.md` has the
query patterns.

### Phase 2 — Spec

Records **what must not change** and **why the current shape is wrong**, then the target:

- **Intent** — the concrete defect in the current shape ("duplicated", "two declaration sites",
  "a cycle", "dead"), in terms of what it costs someone editing the code.
- **What is actually there** — an honest classification. Modules routinely hold several unrelated
  kinds of thing, each wanting a different destination. Classify before deciding.
- **Design** — the target shape, with code-verified evidence for each destination.
- **Refactoring & reorganization** — target tree, rename list (old → new), the Phase 1 inventory.
- **Verification** — the gate, plus the specific check proving *this* refactor complete (a
  `git grep` that must return nothing, a test count that must not fall).
- **Out of scope** — what stays broken on purpose.
- **Corrections** — when the review falsifies a claim, record the correction and the reasoning.

### Phase 2.5 — Spec review (mandatory)

Dispatch **`rubber-duk`** on the spec (or, in the light mode, with the design written out in
full in the dispatch prompt — the agent cannot see this conversation) with the mandate to **enumerate the load-bearing claims and confirm or refute each
with `file:line` evidence** — not to opine on the design. Claims worth naming: that two types
derived differently are identical; that a destination matches an existing convention; that a
cycle exists or would be created (module cycles, not directory back-edges); that the inventory
counts are right; that no client-reachable module takes a value import of something moving.

Process through `superpowers:receiving-code-review`. Verify each finding yourself — a
confidently cited doc sentence is a common way for a reviewer to be wrong. No BLOCKER /
IMPORTANT advances unaddressed.

### Phase 3 — Plan

`superpowers:writing-plans`, saved to `.ai/refactoring/NNN-<slug>/plan.md`. Sequence so
**every commit leaves the tree consistent** — never two parallel structures with a commit
boundary through the middle. Each task pairs its move with its importer updates and its own
verification. Order by dependency: a rename many files consume lands before the moves that
would multiply its call sites.

### Phase 4 — Isolate

`git switch -c refactor/<slug>`, or confirm the current branch is fine.

### Phase 5 — Execute

Mirror the plan into the task tracker before touching code; mark tasks as they land, never
batch-complete. Invoke `superpowers:subagent-driven-development` — refactor tasks are mostly
mechanical and take `model: "sonnet"`; review after each.

Every dispatched prompt must: name `.ai/comment-policy.md` and require reading it first; forbid
archaeology comments explicitly (`// moved from`, `// was X`, `// kept for compatibility` —
moves attract them and the diff already records the move); state that **no old name survives
"for compatibility"** — single-repo code has no external consumers, and a compatibility alias is
the hop the refactor exists to remove.

### Phase 5.5 — Completeness sweep (mandatory)

Rename tooling does not touch string literals, comments, or dynamic references. For every
symbol and path that moved or was renamed, `git grep` the **old** name as raw text across the
whole repo — docs, config, skills, posts included. Expected result: zero hits; every hit is a
missed site or a deliberate exception you can name (a published post that describes the old
shape is one — surface it, don't silently edit it).

Then re-run `npm run verify` and compare every number against Phase 0. Equal or better. A test
count that dropped means tests stopped running, not that they stopped being needed.

### Phase 6 — Review

1. `superpowers:requesting-code-review` against the branch base.
2. **`rubber-duk` over the full diff — mandatory.** Ask it to hunt: a behaviour change
   smuggled into a move (the diff should be relocations and renames; logic edits inside a moved
   block need naming); an old structure left standing beside the new; a compatibility alias or
   re-export shim; archaeology comments; doc locators the move broke.
3. `superpowers:receiving-code-review`, with rigor. List findings with verdicts before
   applying; one commit per accepted finding.

### Phase 7 — Finish

Write `README.md` against the code, not edited from the spec — it states the shape as it is
now, with no history and no "was previously". Update the parent constitution's README where
the shape it describes changed, and `AGENTS.md` § "Where things live" if a location moved.

**`CHANGELOG.md` entry — conditional, and usually not.** A refactor that preserves behaviour
exactly has nothing to tell a reader of the site, and the git history is the record. Add an
entry only where the refactor crossed into something observable: a moved or removed public
export, a renamed URL, a changed contract another file or an agent builds against, a build
gate that now rejects input it used to accept. When in doubt, ask whether someone who never
reads this repo's diffs could notice — if not, no entry. The README is still not a changelog;
`CHANGELOG.md` is.

The commit message and the PR body follow `.ai/shared/commit-and-pr-format.md` — read it before
writing either. A refactor's body has the hardest version of the problem obligation: nothing was
broken, so it must say what the old shape cost and who was paying it, or the reader cannot judge
whether the move was worth making.

Then `superpowers:finishing-a-development-branch`.

## Decluttering specifics

`references/decluttering.md` — the order to work in (files → dependencies → exports, last and in
small batches), the graph checks, and what "dead" does not mean in a repo where MDX, routes,
and the MCP tools are reached without a static import.

## Standing requirement: the docs are part of the diff

A refactor that moves code and leaves the prose behind ships a codebase that lies about itself.
Every path, symbol, and relative link the refactor invalidates — in `AGENTS.md`,
`.ai/feature-constitution/*/README.md`, `.claude/skills/*/SKILL.md`, `.claude/agents/*.md`,
`.ai/shared/*` — is updated in the same branch. Relative markdown links 404 silently and nothing
checks them; grep the old path across all markdown. A doc that was already wrong before you
started is fixed too, and the commit message says so.

## Standing requirement: scope discipline

The test for each candidate change: **does the refactor's stated intent require it?** If not,
surface it and let the user decide; record what you deliberately leave broken in the spec's
out-of-scope section, so a reviewer can tell "missed" from "chose not to". Two traps:

- **A convention violation you are relocating.** Move it as-is; fixing it turns a path change
  into a semantic one. File it.
- **A bug you found.** Report it; fixing it inside a behaviour-preserving refactor makes the
  "nothing changed" claim false and hides the fix in a diff nobody reviews for logic.

Deferred items become `.ai/followups/<slug>.md` (shape in `.ai/followups/README.md`), written
by the orchestrator, **untracked**, into the **primary checkout** — never a worktree, which is
deleted with its untracked files when its branch merges.

## Reference files

- `references/completeness-sweep.md` — query patterns for every reference including those
  outside the import graph, and the TypeScript-specific traps.
- `references/decluttering.md` — dead-code ordering, graph checks, false positives in this repo.
