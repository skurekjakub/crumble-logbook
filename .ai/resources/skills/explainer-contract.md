# Explainer contract

Shared by `feature-development`, `codebase-refactoring` and
`codebase-analysis`. `project-bugfixing` keeps its own template in its skill
folder (`references/explainer-template.html`).

The explainer is the page the user reads instead of the diff. It is written
last, from the finished work, and published so its URL can go in the commit
body and, when the work has one, a comment on its GitHub issue.

## Template

Copy `.ai/resources/skills/explainer-template.html`, fill every `FILL:` slot,
delete unused slots and the instruction comments. Don't restyle it: every
explainer is one page of a series.

## The sections, in order

1. **Summary** — what now exists, what moved, what was deleted (for an
   analysis sweep: a findings table with the headline number and
   recommendation per finding).
2. **In plain terms** — the simplified explainer, in the game's and the app's
   vocabulary (a deck, a tab, a record, a capture), no file paths.
3. **Walkthrough** — the thorough version: one step per change or finding, in
   order, with `file:line` references, measurements with their methods, and
   what was deliberately left alone.
4. **Check yourself** — six to ten questions on the mechanism for the user to
   test their understanding, each answer naming the file or measurement that
   holds it.

## Title and numbers

- The title is a two-to-four-word name. The one-sentence description goes in
  the standfirst and in the `description` passed to `Artifact`.
- Every number carries its command, commit and date.
- The page is for the user, so it follows the spirit of `AGENTS.md` § UI:
  verdict first, short bullets, long passages folded behind a disclosure.

## Publishing and linking

1. Write the file into the work's journal folder (the path the workflow
   names). Keep the path stable across redeploys so the URL stays stable.
2. Publish only after `pnpm verify` exits 0 on the final tree.
3. Publish it with the `Artifact` tool and hand the user the URL.
4. Put the URL in the body of the commit that lands the work. If the work has
   a GitHub issue, comment on it with the commit link and the explainer link
   once the commit is pushed.
