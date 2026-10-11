# Seats — who does what, on which model

Shared by `feature-development`, `project-bugfixing`, `codebase-refactoring`
and `codebase-analysis`. Read before the first dispatch of a run. Research
records are not these workflows' work: `deep-research` and `refresh-meta` set
their own dispatch rules.

## Routing

Every review and implementation seat is a `rubber-duk-*` agent from
`.claude/agents/`, never `general-purpose`: a generic agent carries none of the
repo's conventions and re-litigates what the agents already know. If a seat's
agent isn't installed, say so and do that seat's work inline.

| Seat | Agent | Mode |
|---|---|---|
| General code review (every run) | `rubber-duk-review` | read-only |
| Security surface touched (the Vercel function, a write route, the importers' file reads, `/api/attempts`'s local files) | `rubber-duk-auditor` | read-only |
| `apps/server`, `packages/schema`, `packages/capture`, `tools/` | `rubber-duk-backend` | IMPLEMENT / REVIEW |
| `apps/web` | `rubber-duk-frontend` | IMPLEMENT / REVIEW |
| New or changed Vitest tests | `rubber-duk-tests` | WRITE / AUDIT |

There is no end-to-end suite. A behaviour only a browser shows is checked in
an agent-browser session, which `rubber-duk-frontend` owns when the check is
delegated (the orchestrator runs it inline otherwise), and, when it should
stay checked, gets a box in `.ai/regression/`. No seat uses Playwright
(`AGENTS.md`).

## Test authoring

A new test file or a new `it()` block is written by `rubber-duk-tests` (WRITE)
and audited by the same agent in AUDIT mode. The orchestrator writes a test
inline only when changing assertions inside an existing block. Whoever writes
it, the orchestrator watches it fail before the fix and pass after, with
`pnpm exec vitest run <path>`.

## Models

Pass `model` explicitly on every dispatch: an omitted `model` inherits the
session's, never the intended choice.

| Work | Model |
|---|---|
| Mechanical inventory, fix commits from an accepted finding | `sonnet` |
| Every review seat, the security audit, negative-proof regression tests, refuting a framework claim | `opus` (`AGENTS.md`: reviews run on Opus) |
| Whole-change final review | `opus` |

## Every dispatch prompt

- Names `AGENTS.md`, `docs/conventions/comment-policy.md` and
  `docs/conventions/stack-profile.md`, and requires reading them first.
- Names the files in scope and the files explicitly out of scope.
- Names where the output goes (a report path, or "reply only").
- States the verification command to run (`pnpm verify`, or
  `pnpm exec vitest run <path>` inside a red-green loop) and that its output
  is part of the report.
- For parallel implementers: `isolation: "worktree"`, disjoint file ownership,
  and that the orchestrator, not the lane, merges into `main` and pushes.
