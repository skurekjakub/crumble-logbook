# Follow-ups

Deferred work: a finding, a found bug or an improvement a run chose not to do,
written down so it survives the session. The orchestrator writes these, never a
subagent. A decision that waits on the user is not a follow-up: it goes in
`OPEN-QUESTIONS.md`, linked to the design it blocks.

- **Location:** `.ai/followups/<domain>/<slug>.md`, in the primary checkout
  (`C:\repositories\crumble-logbook`), never a worktree lane: a lane is removed
  when it merges into `main` and takes untracked files with it.
- **Slug:** states the problem, not the fix, and carries no number: two lanes
  would both take the next free one. A sweep with a lens prefixes it
  (`perf-<slug>.md`).
- **Untracked:** `.gitignore` covers everything here except this README. A
  follow-up never enters a commit, a spec, a plan, a research record or
  another file's "out of scope" list: a finding hidden in prose is a finding
  lost.

## Domains

Pick the domain by where the fix lands. A finding that fits none is evidence
for a new domain, added here in the same change; never a `misc/`.

| Domain | Pick it when the fix lands in |
| --- | --- |
| `server/` | `apps/server`: routes, services, repos, the registry, importers, CLIs, the Vercel function |
| `web/` | `apps/web`: views, components, routes, modes, styles |
| `schema/` | `packages/schema`: tables, migrations, Zod schemas, the power parser |
| `capture/` | `packages/capture`: scrapers, the capture ledger, saved searches |
| `research/` | a record's curated data, import manifest or README under `research/` (never its `evidence/`) |
| `tools/` | `tools/`: the Conquest macro and HUD, the ESLint config |
| `cross-cutting/` | more than one of the above, genuinely |

## File shape

The first line under the title is the provenance line: what surfaced the
finding, and when. Then, in order:

1. **Problem** — what is wrong, verified, with locators that resolve.
2. **Cost** — measured, with the method.
3. **Callers / surface** — every place that pays it.
4. **Resolution options** — each with trade-offs, one recommended. Replaced by
   `## Resolution (user-directed, <date>)` once the user decides.
5. **Solution** — enough that an implementer can start without re-research:
   code, tests to add, verification steps, the commit message's points, and
   which workflow to run (`feature-development`, `project-bugfixing` or
   `codebase-refactoring`).

`.claude/skills/codebase-analysis/references/followup-template.md` has the
full section-by-section contract.

## What is not a follow-up

- A task already in the current plan (`docs/superpowers/plans/`).
- A decision waiting on the user: `OPEN-QUESTIONS.md`.
- A research question about the game: that is a new record (`deep-research`)
  or a round of an existing one (`refresh-meta`).
- "Would be nicer" with no cost and no failure scenario.
- A GitHub issue someone already filed: link it from the work instead.
