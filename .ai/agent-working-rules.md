# Agent working rules

Standing rulings for agents working in this checkout, on top of `AGENTS.md`.
`AGENTS.md` wins any conflict, and nothing here restates it: where a topic is
already ruled there, this file points at the section. `git log` on this file is
the only date a ruling carries, so read it when a rule looks stale.

Every section is bullets. A bullet is one rule, its reason when the reason is
not obvious, and how to apply it.

---

## 1. Talking to the user

- **Bullets, never paragraphs, in the terminal reply.** Lead with the outcome
  on one line, then one fact per bullet. Anything that needs several sentences
  belongs in a file (a spec, a research README, a follow-up, a commit body),
  where prose is still correct.
- **Plain language first.** Say what breaks, what it means and why it matters
  before any `file:line` chain or type name. Say "throws" or "fails the
  import"; never "loud-fail" or "eager-fail".
- **Counting:** `AGENTS.md` § Key directives. It covers replies, plans, audits
  and comments alike.
- **Answer at the end of the turn.** Do the tool work first, then reply in one
  text block.

## 2. Subagents, handoffs and scratch files

- **Before compaction, write a handoff** into the work's own folder as
  `<date>-handoff.md` (gitignored by `.ai/**/*-handoff.md`): where the run is,
  what is running and where its output lands, next steps in order, decisions
  made, accumulated user instructions, scratchpad paths. The folder is
  `.ai/feature-constitution/<YYYY-MM-DD>-<slug>/` for a feature,
  `.ai/bugfixes/NNN-<slug>/` for a fix, `.ai/refactoring/NNN-<slug>/` for a
  refactor. A research record keeps its working state in its own `STATE.md`
  (`README.md` § What's here).
- **The `superpowers:*` defaults are this repo's homes.** Specs go to
  `docs/superpowers/specs/`, plans to `docs/superpowers/plans/`, as the skills
  write them; only a refactor's spec and plan go elsewhere
  (`.ai/refactoring/NNN-<slug>/`, which its skill names).
- **Transient scratch** (lane reports, TSVs, command output, commit-message
  files) goes in the session scratchpad or under `.superpowers/<topic>/`
  (gitignored; `refresh-meta` uses `.superpowers/refresh/<date>/`). Never the
  tracked tree.
- **Lanes:** `AGENTS.md` § Rules the user set (worktree lanes merge into
  `main`). Only the orchestrator merges a lane, commits `data/snapshot.json`
  and pushes.

## 3. Design rulings

- **Fold duplication in the area you touch.** Before adding code, scan the
  files the task touches for an equivalent and fold it into a shared helper as
  part of the task. Outside them, report it instead (the unrelated-code rule
  in `.ai/reminders.md`).
- **Audit dedup against the whole tree.** For every hand-rolled helper a diff
  introduces (a regex, a walker, a formatter, a parser, a power-figure reader),
  search every workspace package for an existing equivalent, not just the
  feature's siblings; `@crumble/schema/power` is the one power parser. Report
  "checked, legitimately new" beside the misses.
- **Dead is dead, whatever the doc says.** An unreachable branch kept "for
  extensibility" goes, even when a doc says "dormant, do not delete". Record
  the doc's scenarios in the commit body, then delete the code, the guard and
  the doc.
- **Content types go through the registry.** A new cited table is declared
  once in `apps/server/src/registry.ts` and derived everywhere else; the
  steps are in its module comment.

## 4. Comments and docblocks

`AGENTS.md` sets the JSDoc rule and `docs/conventions/comment-policy.md` the
rest; these corrections are enforced on top of both:

- **No archaeology, including comparative framing.** Not only "X removed" but
  "replaces X", "mirrors the old contract", "now uses…". No absence
  annotations marking where something was deleted. When ripping out X, delete
  every comment mentioning X and describe the current state as if the code had
  always been this way.
- **Comment audits fix comments only.** Naming, fixture and structure
  findings are reported and filed in one batch; the audit never fixes them.

## 5. Tests

- **Never hard-code a record's curated values.** A refresh round changes them.
  A test may read a real record to prove it imports whole, as
  `apps/server/test/importers/import-record.test.ts` reads record 001,
  deriving every expectation from the curated files; anything else stages its
  own fixture (`apps/server/test/importers/fixtures/` shows the shape).
- **Scoped runs during a red-green loop:** `pnpm exec vitest run <path>`. The
  claim that the repo is green is `pnpm verify` alone.

## 6. Finishing work and deferred work

- **Work finishes on:** `pnpm verify` green, the explainer published (when
  the workflow has one), the commit pushed to `origin/main`, and, if the work
  has a GitHub issue, a comment on it linking the commit and the explainer.
  Publish the explainer first so the commit body can carry its URL. Commit
  messages: `.ai/resources/pr-guidelines.md`.
- **Explainer shape:** `.ai/resources/skills/explainer-contract.md`.
- **Deferred work is a follow-up file**, never folded into a spec, plan,
  README or commit: `.ai/followups/<domain>/<slug>.md` in the primary
  checkout (`.ai/followups/README.md`). A decision waiting on the user goes in
  `OPEN-QUESTIONS.md` instead.
- **Follow-ups from a move wait for the new paths**, so their locators
  resolve.
- **When a run ends with a deferred-work list, ask which shape the user
  wants:** follow-up files or GitHub issues (the `file-github-issue` skill).

## 7. Tooling notes

### agent-browser

- Setup and the forbidden commands: `AGENTS.md` § Rules the user set.
- `press Alt+r` delivers a proper keydown with the modifier set. `keydown Alt`
  followed by `keydown t` does not: `altKey` and `repeat` are always false.
  For a modifier-hold check, dispatch a synthetic `KeyboardEvent` via
  `eval --stdin` with the flags set.
- Both themes: the app follows `prefers-color-scheme` unless `data-theme` on
  the root element says `light` or `dark` (`apps/web/src/styles/tokens.css`,
  set by `apps/web/src/components/ThemeToggle.tsx`), so a theme check sets
  the attribute or clicks the toggle.

### Worktree lanes on Windows

- `git worktree remove --force <path>` can leave long paths behind; remove the
  leftovers with PowerShell `Remove-Item -LiteralPath "\\?\<absolute path>"
  -Recurse -Force`, then `git branch -D <branch>`
  (`.claude/skills/refresh-meta/SKILL.md` § The orchestrator, step 4).
- Gitignored media under `research/` does not travel with a merge: copy it out
  of the lane before removing it, as the same step does.
