# Commit messages

This repo has no pull requests yet: work lands on `main` and every commit is
pushed (`AGENTS.md` § Rules the user set). The commit message is the document a
reviewer reads, so it carries what a PR body would. The `require-commit-format`
hook (`.claude/hooks/require-commit-format`) blocks `git commit` with a single
`-m`.

## Shape

- **Subject:** `<type>(<scope>): <what the change does>`, lower case after the
  colon, no full stop, about 72 characters at most. Take the type and scope
  from the ones `git log --format=%s` already uses, for example
  `feat(web): chart the Conquest macro's attempts on an Attempts tab`,
  `fix(server): …`, `research(002): curate the 2026-10-10 PvP refresh`,
  `data: the snapshot with the 2026-10-10 PvP round`. A worktree lane's merge
  commit is `merge: <what the lane delivered>`.
- **Body:** prose paragraphs, wrapped near 72 columns, that let a reader judge
  the change without the diff:
  - **the problem** — what was wrong or missing, and for whom;
  - **the justification** — why this solution, with the measurement or
    constraint that decided it;
  - **what was discarded** — the alternatives tried or rejected and why, and
    what deliberately does not change.
- A data commit names what `pnpm db:scope` reported: the records whose rows
  changed, and any game fact.
- A commit that ships an explainer carries its URL in the body.
- **Trailer:** end with the `Co-Authored-By:` line the session's attribution
  reminder gives (currently
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`), after a blank
  line.

## How to commit

1. `pnpm verify` passes on the tree being committed.
2. Write the message with the Write tool to a file outside the tracked tree:
   the session scratchpad, or `.superpowers/<topic>/commit-msg.txt`
   (gitignored, and the same path works in a worktree lane).
3. `git add <paths>`, then `git commit -F <file>`. A lane merges with
   `git merge --no-ff -F <file> <branch>`.
4. `git fetch origin`, then `git push origin main` right away. If `main` is
   behind, `git pull --ff-only` first; if it has diverged, stop and ask.

## What stays out

- Findings this commit does not fix: they become follow-up files
  (`.ai/followups/README.md`), not a "known issues" paragraph.
- Anything `AGENTS.md` keeps out of the public repo, quoted or named: decompiled
  output, captured media, local paths.
- A narrative of the session ("first I tried…") beyond what the discarded
  alternatives need.
