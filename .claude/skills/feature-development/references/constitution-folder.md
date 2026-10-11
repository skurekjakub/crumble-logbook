# Where a feature's records live

Read this before naming a new spec or choosing which existing one a change
belongs under.

A feature's records sit in homes the repo already has. They rot in opposite
ways, so they never share a document:

| Class | Files | Audience | Lifecycle |
| --- | --- | --- | --- |
| **Journal** | `docs/superpowers/specs/<YYYY-MM-DD>-<slug>-design.md` (with `-research.md`, `-unknowns.md`), `docs/superpowers/plans/<YYYY-MM-DD>-<slug>.md` | The agents and people doing the build, during the build | Frozen once built: how the work was thought through |
| **Current state** | `README.md`, a package's or tool's README (`tools/conquest-macro/README.md`, `account/README.md`) | Later sessions and the user reading the repo | Evergreen: always describes the app as it is |
| **Rules** | `AGENTS.md` | Every session | Changed only when the user sets or changes a rule |
| **Explainer** | `.ai/feature-constitution/<YYYY-MM-DD>-<slug>/explainer.html` | The user, once the feature ships | Frozen, published |

The spec, the README update and the explainer are mandatory. The research and
unknowns files exist only when their phase ran.

`<slug>` is kebab-case and descriptive (`rift-15-clears`, `capture-ledger`,
`conquest-simulator`). The date is the day the spec was written. No other
numbering: `NNN-` belongs to research records, bugfixes and refactors.

## First — does this belong under an existing spec?

Before writing a new spec, `ls docs/superpowers/specs/` and read the
candidates, and ask whether the work is really a _new_ feature or a change to
an existing one.

- A change that finishes, extends or corrects a feature whose spec is still
  being built (its plan has open boxes) belongs in that spec: add a section
  and record the correction, never a near-duplicate spec.
- A change to a feature that shipped long ago gets its own dated spec that
  names the earlier one in its header ("extends
  `2026-09-27-crumble-logbook-design.md` §4"). The shipped spec stays frozen;
  `README.md` carries the merged current state.
- If unsure which spec is the parent, pick the feature whose code the change
  most touches; if nothing fits, it is a new feature.

## Cross-referencing

Name another spec or plan by its file name (`2026-09-28-capture-ledger-design.md`),
a research record by its folder (`research/003-stage-pushing-meta/`), and code
by its path. All of these are stable: specs are never renamed or moved.

## The journal — what it may contain

Allowed and expected in a spec, a plan, and their research and unknowns
siblings:

- Commit SHAs, dates, task lists, checkboxes, `[x]` status.
- References to past discussions, audits, alternatives considered, dead ends.
- "Pre-correction the review thought X": context for the agent doing the
  work, and why a decision was made.
- Self-references like "see Task 4 below".

A spec does not describe the current app once the feature ships: that is
`README.md`'s job. A spec still in progress is corrected in place with the
correction recorded; a shipped one is left alone.
