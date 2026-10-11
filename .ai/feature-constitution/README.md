# Feature explainers

A feature's design record does not live here. In this repo:

| What | Where |
| --- | --- |
| The spec (and, when the phase ran, its research and unknowns) | `docs/superpowers/specs/<YYYY-MM-DD>-<slug>-design.md`, with `-research.md` and `-unknowns.md` siblings |
| The plan | `docs/superpowers/plans/<YYYY-MM-DD>-<slug>.md` |
| The feature as it exists now | `README.md` (and the README of the package or tool it lives in) |
| A rule the user set | `AGENTS.md` |
| A decision waiting on the user | `OPEN-QUESTIONS.md` |

This folder holds only what has no other home: each feature's published
explainer, at `.ai/feature-constitution/<YYYY-MM-DD>-<slug>/explainer.html`,
named with the spec's stem so the two pair by name, plus an untracked
`<date>-handoff.md` when a session hands the feature off.
`.claude/skills/feature-development/SKILL.md` writes them;
`.ai/resources/skills/explainer-contract.md` is the page's contract.

## Roster

Add a row in the commit that adds a folder: an index that misses a folder is
worse than no index, because it is read as complete.

| Folder | Explainer URL |
| --- | --- |
