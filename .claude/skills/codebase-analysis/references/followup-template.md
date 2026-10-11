# Follow-up file template

One file per finding, at `.ai/followups/<domain>/<slug>.md`. The domain is one
of those `.ai/followups/README.md` lists (`cross-cutting/` for a finding that
genuinely spans them); the slug states the problem and carries no number,
because two lanes would both take the next free one. Prefix the slug with a
lens when the sweep has one (`perf-<slug>.md`), so a listing groups them.

The file is **untracked** and stays untracked (`.gitignore` covers the tree),
and it is written into the primary checkout, not a worktree lane. It never
enters a commit, a spec, a plan or a README. Full rules:
`.ai/followups/README.md`.

The reader is an implementer who was not in the conversation and will not
re-research. Every section below exists so they don't have to.

```markdown
# Follow-up: <one sentence naming the defect, not the fix>

Found while <what you were doing>, <YYYY-MM-DD>; verified on `main` at
`<sha>`. Resolves against: `<file>` (`<symbol>`, `<symbol>`),
`<file>:<line-range>`, <…>. Versions: <library versions the facts depend on,
from the lockfile: drizzle-orm, @tanstack/react-router, hono, …>.

## The problem

What is wrong, in plain language, then the cost with a number and the method
that produced it. Tables for measurements: | phase | mean | p50 | p90 | max |.
Say where the cost is paid (every request, every cold start of the Vercel
function, every import, every visit): it decides the priority.

## What is verified (<date>)

One bullet per load-bearing fact, each with a locator that resolves:
`node_modules/<pkg>/<file>.js:<line>`, `<repo file>:<line>`, a test, or a URL
fetched today. Include the facts that *limit* the fix (a layering rule in
`apps/server/test/architecture.test.ts`, the read-only deployment, what the
importer validates, what jsdom can't do): those are the ones an implementer
discovers the hard way.

## Every caller / every emitter

A table when the finding is about a shared thing: | site | layer | what it
pays today |. This is what makes "only X pays twice" checkable.

## Resolution options

Numbered. Each says what it changes, what it keeps, and what it costs. The
last one is "leave it" with its honest price. Then **Recommendation:** with a
one-sentence reason. When the user has decided, replace this with
`## Resolution (user-directed, <date>)` and record their decision, including
the constraints they stated.

## Solution — ready to implement

Which workflow to run it through (`feature-development`, `project-bugfixing`
or `codebase-refactoring`) and why. Then:

### 1. <file>
Full replacement code for the parts that change, with JSDoc per `AGENTS.md`,
not fragments the implementer has to stitch. Then "Points that look wrong but
are not": the reviewer questions you already answered, each with its
precedent or locator.

### 2. Tests
Exact files to touch (per `docs/conventions/test-layout.md`) and what changes
in each; new tests named by the behaviour they pin; fixtures staged by the
test, never a record's curated values.

### 3. Verification
Numbered, in order, baseline first. Every step has an expected result with a
number ("`curl …/api/decks?mode=arena` returns the same rows, in the same
order"; "≈ −40 ms per request"; "`pnpm db:scope HEAD` still exits 0"). Name
the exact command.

### 4. Commit
Subject and the points the body must carry (the problem, the justification,
what was discarded), per `.ai/resources/pr-guidelines.md`; rollback cost.

## Expected effect

The numbers again, after: per request, per import, per visit, per cold start.
And what does not change.
```

## Rules that decide whether a file is done

- Every locator resolves today: `ls` or `git grep` each one before handing
  over.
- Every number names its method; "roughly", "probably" and "should" appear
  only with a reason the number could not be measured.
- Plain language first. No jargon labels for behaviour ("throws", "fails the
  import", "returns 409": never "loud-fail" or "hot path" without saying what
  happens).
- Sibling findings are separate files cross-referenced by file name. A file
  never carries an "out of scope" or "also noticed" list: that is the next
  file.
- Decisions the user already made in the session are restated where they
  constrain the solution, so the file survives the conversation.
- The file never says what to do about another finding; it links it.
