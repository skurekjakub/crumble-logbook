---
name: project-bugfixing
description: Use when fixing a bounded, already-identified defect in the skurekjakub-dev blog — an observed symptom, a regression, a wrong header / status / response, a page that renders wrong, working code no test reaches, or a parity gap where the upstream docs implementation this blog's routing was ported from does something the port does not. Triggers include "fix this bug", "this is broken", "X renders nothing", "the header is wrong", "why does curl get HTML", "this worked upstream", "add a regression test for". Not for new behaviour (`feature-development`) and not for behaviour-preserving cleanup (`codebase-refactoring`).
---

# Project bugfixing

## Is this a bugfix, a feature, or a refactor?

A bugfix restores behaviour the code already intends. The test: does closing it require a
**decision the code does not already contain**?

| Signal | Route |
|---|---|
| A JSDoc, `AGENTS.md`, a constitution README, or a post says X; the code does Y | bugfix |
| The upstream implementation at `~/repositories/kentico-docs-jekyll` does X; the port here does Y | bugfix (upstream parity) |
| Code that works but nothing under `tests/` reaches | bugfix (gap analysis) |
| Closing it needs a new frontmatter field, route, config key, or public surface | **feature** |
| Closing it needs picking between two defensible behaviours | **feature** |
| Same behaviour, better shape | **refactor** |
| "While I'm here I'll also…" | Neither. Separate item, separate branch. |

Escalating is not failure. A bugfix that quietly grows a design decision ships a decision nobody
reviewed; say so, stop, switch skills.

**Upstream-parity caution.** "Upstream does X" establishes intent, not a mandate. The port
deliberately drops things the docs site needs and this blog does not (collections, a mount
prefix, an admin surface). If restoring X changes a contract — a served header, a public URL
shape, what an agent receives — that is a decision, and it escalates.

## Prerequisite: superpowers

This file sets the repo specifics; superpowers holds the method:

| Step | Skill |
|---|---|
| Find the cause | `superpowers:systematic-debugging` |
| The fix | `superpowers:test-driven-development` |
| Done claims | `superpowers:verification-before-completion` |

If they are absent from the available-skills list, stop and tell the user rather than
improvising from this file alone.

## Read before touching Next.js internals

`AGENTS.md` mandate: read the relevant page under `node_modules/next/dist/docs/` first. The
symptoms that look like application bugs — a page rendering empty, a stale value surviving a
write, a header missing from a prerendered response — are usually Cache Components, PPR, or
Proxy semantics, and the installed docs are the source of truth, not memory.

## The artifacts

```
.ai/bugfixes/NNN-<bug-slug>/
  root-cause.md          # what breaks, where, why — written BEFORE the fix
  <surface>-before.*     # the captured defect, one pair per affected surface
  <surface>-after.*
  explainer.html         # published Artifact — when the fix changes what a reader
                         # or an agent receives (rendered output, header, status)
```

Plus one `CHANGELOG.md` entry under `Fixed` at the repo root — see § Finishing.

No `spec.md`, no `plan.md`: a bugfix that needs a plan is a feature.

**Picking the number:** `ls .ai/bugfixes/ 2>/dev/null` — no directory means `001` — else highest prefix plus one, zero-padded to three
digits. Never renumber, never reuse. The sequence is independent of `.ai/refactoring/`.

## The order

**Before step 1, create a todo per step** and move each through in-progress / completed.
An untracked run is how the reproduction or the docs check quietly goes missing. Add a todo per
affected surface for the capture steps.

1. **Reproduce it in the running app and capture the broken state.** Mandatory, before any
   diagnosis. A defect you have not seen is a defect you are guessing at, and the "after" proof
   is worthless without the "before". See "Capturing the surface" below.
   **If the capture shows the reported defect absent, stop.** Save the negative capture, name
   the guard that already covers it (`file:line`, the existing test), and report to the user.
   Do not write `root-cause.md` or a fix for a defect you could not see — a fix for a
   non-reproducing bypass is how a real bypass gets introduced.
2. **Find the cause.** `superpowers:systematic-debugging`. Read the code, then *prove* the
   mechanism — a failing test, a `curl` transcript, a `file:line` chain — not a hypothesis you
   find plausible. For upstream parity, the sibling repo is a real reference: read its file, and
   its `.ai/bugfixes/` and constitution for the *why*. If `~/repositories/kentico-docs-jekyll`
   is not checked out, say so and work from the behaviour the user described.
3. **Write `root-cause.md`.** Before the fix exists. Contract below.
4. **Fix it, TDD.** Failing test first — and it must fail *for the reason `root-cause.md`
   names*. Watch it fail. Minimal change. Watch it pass. Inline, in this session.
5. **Re-run the reproduction and prove the defect is gone.** Same route, same command, same
   observation, captured the same way. Restart the dev server first through `next-browser
   restart-server` — a stale one lies, and that command is the one that does not orphan the
   user's process.
6. **Update what the fix invalidated.** `AGENTS.md`, the owning
   `.ai/feature-constitution/<slug>/README.md`, and any **published post** that states the old
   behaviour — surface the post to the user rather than silently editing it. "None" is a real
   answer, but check before saying it.
7. **`npm run verify` exits 0.** Run it bare, read the output. Not "should pass".
8. **Review.** `superpowers:requesting-code-review` against the branch base; **`rubber-duk`
   over the full diff — mandatory, every bugfix**; `superpowers:receiving-code-review` to process
   with rigor. Ask for the findings listed under "What the review should hunt".

   **List every finding to the user before applying any**, each with a verdict — valid, or
   rebutted and why. **Each accepted finding is its own commit** on top of the bugfix commit,
   named for what it fixes; a reviewer reads their finding as one diff.
9. **Write and publish `explainer.html`** if the fix changes what a reader or an agent receives.
   After `verify`, from the fix.
10. **Commit.** One commit per bugfix: code, test, artifacts, doc updates together — revertable
    as one thing. Review-finding commits sit on top and are exempt.

Step 3 produces a file. A cause diagnosed only in conversation has not been written down.

## `root-cause.md` — the contract

Written before the fix, in this order. Scale each section to the bug; a one-line fix gets a
short file, not a padded one.

1. **Symptom** — what is observably wrong, stated so someone could check it. Measured where
   possible; marked *reasoned* where not.
2. **Location** — the `file:line` where the wrong thing happens. Quote the lines. All of them,
   if spread across call sites.
3. **Mechanism** — *why* the code does the wrong thing: the specific condition, branch, or
   missing case. If you cannot write this section you have not found the cause yet.
4. **Blast radius** — what is affected and what is not. Counts belong here (`git grep -l` over
   `content/`, the number of routes that share the step).
5. **The fix** — what changes, in behaviour terms, and what deliberately does **not**: the
   adjacent thing you noticed and are leaving alone.
6. **How it will be proven** — the behaviour the regression test pins and why it would have
   gone red before the fix. Name behaviours, never a number of tests.

Numbers are measurements — dated, sourced, re-runnable — never targets. **A missing-test bug
uses the same headings**: Symptom is "nothing under `tests/` reaches this", Mechanism is the
class of regression that lands unseen, the Fix is the test, and the proof is reintroducing the
regression and watching the new test catch it.

## Where the test goes

`tests/` (Vitest, Node env), mirroring the source path — `tests/lib/proxy/…` for
`lib/proxy/…`, `tests/app/…` for a route handler. Never beside the file it covers. Test the
layer that broke: a proxy decision through the composed `proxy()` with a `NextRequest`, a
projection through `projectMdxToMarkdown`, a route handler by calling its exported `GET`. A fix
whose symptom is a header or a status asserts on the `Response`, not on an internal helper.

## Verification

```bash
npm run verify
```

That is `typecheck → lint → vitest → next build` — the same stages CI runs on every PR (CI runs
the tests with the coverage reporter; no thresholds are set, so the verdict is the same).
Run it bare; never pipe it through `head`, `tail`, or `grep`. Single-file
`npx vitest run tests/<path>` is for the red-green loop, not for the claim.

**What `verify` does not cover.** Anything that only shows up on Vercel: CDN cache behaviour,
`Vary` handling, the OG image pipeline. If the fix touches a served header
or a cache directive, prove it on a **preview deployment** (`vercel:deploy`) with `curl -si`, and
name that in the explainer's residual-risk section — `next dev` does not run the CDN.

## Capturing the surface

**Both sides of the fix, one pair per affected surface.** A fix that touches two routes or two
representations (HTML and the `.md` twin) needs a pair for each; one pair proves one of them and
silently asserts the rest.

Pick the capture by what the defect is:

- **A header, a status, a representation** — a `curl -si` transcript, saved to
  `<surface>-before.txt` / `-after.txt`. Send the exact `Accept` / `User-Agent` the report names.
- **Rendered output** — the **`next-browser`** skill: `open` the route, `screenshot`, and
  `errors`; read the DOM with `eval` where the defect is textual (whitespace, an attribute, an
  ordering) — a measured value is stronger than a picture of it. Load the skill rather than
  driving the CLI from memory; its surface moves.
- **Build-time behaviour** — the relevant lines of `npm run build` output.

Get a server first: `npm run dev` on port 3000, unless one is already up — use that one; never
kill the user's server, never start a second. Both captures of a pair use the same route, the
same flags, the same viewport.

**A surface that turns out unaffected is a finding, not a gap.** If one "before" of several
shows the defect absent, the reproduction is wrong or the cause is elsewhere — back to step 2.
If *no* surface shows it, it is the step-1 stop: report, don't fix.

**A stale dev server will lie to you.** `'use cache'` with `cacheLife('max')` keeps a rendered
projection or highlighted block alive across the edit that changed it. If the page disagrees
with what the code plainly does, prove the unit in isolation (`npx vitest run`), then restart the
server (through `next-browser restart-server`) and re-measure. Rewriting a correct fix to
satisfy a cached render is the failure this paragraph exists to prevent.

## `explainer.html` — the contract

`root-cause.md` is for whoever maintains the code. The explainer is for the user, who should not
have to read a diff to know what changed and why it was wrong.

**Start from `references/explainer-template.html`** in this skill directory — tokens, both
themes, the four fixed sections as `FILL:` slots, three figure components as commented blocks.
Fill every slot, delete the unused ones and the instruction comments. Don't restyle it; every
explainer is one page of a series. Write it to `.ai/bugfixes/NNN-<slug>/explainer.html`,
publish with `Artifact`, hand the user the URL, keep the path stable. If the `Artifact` tool is
not in your toolset, the file on disk is the deliverable — say it is unpublished.

**The title is a bug-report title** — `<title>`, the `h1`, and the Artifact `description` name
the defect the way a tracker entry would: 4–8 words, the thing and what is wrong with it.
`Accept: text/markdown on a tag page returns HTML` yes; `The door that would not open` no. If it needs a
comma or the word "so", it belongs in the standfirst.

Required content, in order: **what the code did** (real `file:line`, real numbers) → **why it
was wrong** (quote the RFC, the bundled Next doc, or the upstream file that says otherwise, with
locator) → **what changed** (the diff in prose, plus what was deliberately left alone) → **what
could still break** (contracts touched, Vercel-only behaviour unverified locally, the test that is
now the net). No quiz. A figure only when it shows what prose cannot, and it carries its
measurement.

## Comments the fix leaves behind

`.ai/comment-policy.md` applies to a two-line fix. JSDoc on every function; an **inline comment
at the gotcha**, directly above the line where correct-looking code is wrong, as long as the
point needs — often the most valuable lines in the diff. What must not ship: the old behaviour, the upstream comparison,
the rationale, a fix narrative. Those go in the commit body, `root-cause.md`, and the explainer.

## What the review should hunt

- **A behaviour change riding along** — a rename, a signature change, an extra guard the defect
  did not require.
- **A fix at the symptom** — a fallback that swallows the condition `root-cause.md` named.
- **A regression test that pins the implementation** — green against a wrong fix, red against a
  correct refactor.
- **The adjacent instance left unfixed** — the same defect at a second call site. Fix it here or
  name it under "what deliberately does not change".
- **Archaeology comments.**

## Rationalizations

| Excuse | Reality |
|---|---|
| "The fix is one line, the artifacts are overhead" | The line is the cheap part. Why it was wrong is what gets lost. |
| "I'll write `root-cause.md` after, I'll know more then" | You will know the fix. You will no longer know which parts you proved. |
| "I found the wrong line, that's the cause" | That is the Location. Write the Mechanism. |
| "I'll write the test after the fix — same test" | You never watched it fail, so it never proved it can catch anything. |
| "`curl` against dev shows the right header, done" | Vercel's CDN rewrites cache headers. Prove it on a preview if the header is the fix. |
| "The unit test is green, I don't need to open the page" | It proves your function. It does not prove the route calls it. |
| "The page still looks wrong, my fix is incomplete" | Or the server is stale. Prove the unit, restart, re-measure. |
| "Upstream does it this way, so restoring it is obviously a bugfix" | Only if it changes no contract. A header, a URL shape, an agent-facing body — decisions escalate. |
| "While fixing this I noticed another bug" | Two bugs, two directories, two commits, two branches. |
| "The explainer repeats `root-cause.md`" | Different readers, different language. |
| "I explained the fix in chat" | Chat scrolls away. The file does not. |
| "I'll fix them all, then commit once" | Then none reverts alone and `git log` stops saying which fix caused what. |
| "A comment on what it used to do helps the next reader" | It describes a state the code is not in. Commit body. |

## Red flags — stop

- A fix in the working tree and no `.ai/bugfixes/NNN-<slug>/root-cause.md`
- A `root-cause.md` with a Location but no Mechanism
- A regression test never observed failing; a missing-test fix where the regression was never
  reintroduced
- No before/after capture for a defect reachable through a page or a request
- An "after" capture taken without restarting the dev server
- A served-header fix "verified" only against `next dev`
- A fix that adds a route, a config key, or a frontmatter field — that is a feature
- Two bugs in one commit; a bugfix split across commits
- Findings applied without listing verdicts first
- Claiming done without `npm run verify` having exited 0, or with a stage run alone in its place

Any of these: stop, produce the missing thing, then continue.

## Standing requirement: scope discipline

Does closing this defect require it? If not, surface it and let the user decide. A second bug →
report, don't fix. A convention violation next to the defect → a refactor, file it. A missing
test for adjacent working code → its own gap-analysis bugfix. Record what you deliberately left
alone in `root-cause.md` § The fix, so a reviewer can tell "missed" from "chose not to". Deferred
items become `.ai/followups/<slug>.md` (see `.ai/followups/README.md`), untracked, written by
you — never as README or spec prose.

## Finishing

**Add the `CHANGELOG.md` entry under `Fixed` — mandatory for a bugfix**, in the format
`CHANGELOG.md` § Format prescribes. This holds whether or not anyone reported the bug: a
latent defect found and fixed before it was hit is still worth a line, because the next
person wondering when the behaviour changed will look here. Write what was wrong from the
reader's or the agent's side, not from the stack trace's — `root-cause.md` owns the mechanism
and the explainer owns the walkthrough. A fix whose only effect is on a test or an internal
helper that never misbehaved in production is the one case that needs no entry.

The commit message and the PR body follow `.ai/shared/commit-and-pr-format.md` — read it before
writing either. For a bugfix the body's obligations map onto `root-cause.md`: the problem is the
Symptom and Mechanism compressed to prose, the justification is § The fix, and what deliberately
does not change is already written there. Summarise them; a commit that only cites the file
fails the "judge it without the diff" bar. The PR's § What the review should challenge is where
the `rubber-duk` dispatch's contested decision goes.

Then `superpowers:finishing-a-development-branch` after the commit, so fix, test, artifacts,
changelog and doc updates land together. One bugfix, one branch, one PR — the explainer URL
goes in the PR body; `root-cause.md` does not get pasted into it.

## Repo specifics

- **Dev server** `npm run dev` on 3000. No e2e harness; the `next-browser` skill is the browser.
- **Vercel** is production. `next start` is fine locally, but only a preview deployment shows
  CDN-level behaviour (cache headers, `Vary`).
- **Routing in** is `proxy.ts` + `lib/proxy/` (a `chain()` of steps; the first to return a
  response wins; the `/md/*` projection route is internal-only). Content is MDX under
  `content/blog/`, read at build; the `.md` twin and `/llms.txt` come from `lib/projection/`.
  Design records: `.ai/feature-constitution/<slug>/README.md`.
- **`cacheComponents: true`.** Stale-value and empty-render bugs start at the cache boundary,
  not the component.
- **Registers.** `ls .ai/` — one per kind of work: this flow's is `.ai/bugfixes/`, and
  `.ai/followups/` plus its tracked companion `.ai/plans/` hold deferred work. Don't add another
  kind; put the artifact in the register that already owns it.
- **Everything in `AGENTS.md` still applies to a two-line fix.**
