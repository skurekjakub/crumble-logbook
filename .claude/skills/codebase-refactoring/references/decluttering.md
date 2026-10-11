# Decluttering — ordering and judgement

This repo has no dead-code tool configured (no `knip.json`) and no dependency
graph checker; ESLint's `@typescript-eslint/no-unused-vars` and the layering
rules in `apps/server/test/architecture.test.ts` are what `pnpm verify` runs.
This file covers the order to work in and the judgement calls around "dead".

## Contents

- Finding candidates
- Safe ordering, and why
- What "dead" does not mean here
- Sweep-specific scope traps

## Finding candidates

- **An ad hoc knip run** (`pnpm dlx knip`) is a lead generator, not a gate:
  without a config it doesn't know the workspace's entry points (the CLIs in
  `apps/server/src/cli/`, `apps/server/src/vercel.ts`, the route files, the
  scripts in `apps/web/scripts/`, `packages/capture/src/cli.ts`,
  `tools/conquest-hud/src/cli.ts`), so expect false positives there. Don't
  commit a config as part of a declutter; adopting the tool is its own
  decision for the user.
- **An export with no importer:** `git grep -nw <symbol>` across `apps`,
  `packages` and `tools`; one hit (its declaration) is a candidate.
- **A test that is the only consumer** (see below).

## Safe ordering, and why

Work outward from the coarsest unit. Risk is uneven, and this order
front-loads the value while deferring the part that needs the most
verification:

1. **Whole unused files.** Highest value, lowest risk: nothing imports the
   file, so nothing breaks in a way the compiler misses. Delete, re-run the
   gate.
2. **Unused dependencies** in a package's `package.json`. Check consumers
   outside the import graph before removing: a Vite or ESLint plugin, a CLI
   run by name in a script (`tsx`, `drizzle-kit`), a type package.
3. **Unused exports, last, in small batches.** Where false positives cluster.
   Batch them small enough that a gate failure points at an obvious culprit.

Exports go last because static analysis cannot see a dynamically reached
consumer, so a wrong deletion there fails at runtime rather than at compile
time. Files and dependencies fail loudly; exports can fail quietly.

Removing an `export` keyword first (keeping the declaration) is the reversible
step: the compiler and `no-unused-vars` then surface what became genuinely
unused. Deleting in bulk on a tool's say-so is not reversible in review.

## What "dead" does not mean here

Things that look dead to static analysis and are not:

- A route file under `apps/web/src/routes/`: TanStack Router mounts it by its
  location, through the generated `routeTree.gen.ts`.
- A table, schema or entity named only in `apps/server/src/registry.ts` or in
  `packages/schema`'s `CITED_ENTITY` / `OBSOLETE_ENTITIES`: the server layers,
  the snapshot and the importer derive from those declarations.
- A migration under `packages/schema/migrations/`: applied by folder, never
  imported.
- A CLI entry (`apps/server/src/cli/*.ts`, `packages/capture/src/cli.ts`)
  reached from a `package.json` script, and `apps/server/src/vercel.ts`,
  reached from the Vercel build.
- A research record's evidence scripts (`research/*/evidence/*.py`): retired
  but kept, unedited, as the record of how a record was captured
  (`README.md` § Captures). Never delete them.
- A curated field the importer reads by name from JSON.

One thing that looks alive and is not: an export whose only consumer is a
test that exists solely to exercise it. That is a closed loop and both halves
are removable, but check first whether the behaviour has coverage through a
real caller, because sometimes the closed loop is the only test a live path
has.

## Sweep-specific scope traps

- **A barrel whose re-exports all turn out dead** gets deleted, not left as an
  empty husk. Repoint its consumers at the concrete module.
- **Deleting dead code is not licence to fix the code around it.** The diff
  should be removals. A logic change smuggled into a sweep is invisible to
  review.
- **A finding you cannot explain is not a finding you may delete.** Verify the
  reason it is unreachable. "The tool said so" is a lead, not a
  justification.
