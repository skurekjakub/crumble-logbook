# Completeness sweep

How to prove you found every reference to something you are moving, renaming
or deleting, including the references the import graph can't see.

## Contents

- Why the import graph is not enough
- Building the inventory (Phase 1)
- The sweep after the edit (Phase 5.5)
- TypeScript-specific traps
- Locator classes

## Why the import graph is not enough

`pnpm typecheck` proves that everything the type system can see still
resolves. It cannot see a path inside a string, a directory named in the
architecture test, a glob in a config file, or a Markdown link. Rename tooling
has the same blind spot by construction: string literals and comments are
opt-in.

So the compiler passing is necessary and not sufficient. The gap it leaves is
exactly where a partial refactor hides: the code compiles, the tests pass, and
a rule in `architecture.test.ts` or a README row now points at nothing.

## Building the inventory (Phase 1)

Count first, then act. The point is a number you can re-derive independently,
so "did I get them all" has an answer.

### Importers, per module

Imports are relative inside a package, without an extension (`"../repos"`,
`"./deck-modes"`), and by package name across packages (`@crumble/schema`,
`@crumble/schema/power`, `@crumble/capture/ledger`, `@crumble/server` for
types). A folder import (`"../repos"`) goes through its `index.ts`, so grep
both the file and its folder. Quote the closing delimiter so `deck-modes`
does not also match `deck-modes-x`:

```bash
git grep -lE "from \"(\.\./)+services/deck-modes\"" -- apps/server
git grep -l "from \"./deck-modes\"" -- apps/server/src/services
git grep -l "from \"@crumble/schema/power\"" -- apps packages tools
```

Do this per module rather than per directory, then also take the union: a
file may import two modules from the same directory, so per-module counts sum
to more than the file count. Report both, and say which is which.

### Symbol occurrences vs files

`git grep -l` counts files; `git grep -c` counts lines; neither counts
occurrences. When a rename's blast radius matters, say which you measured. A
plan that says "12 sites" and means "12 files, 37 occurrences" invites a
reviewer to think a sweep was incomplete.

### The dependency rules

There is no dependency-graph tool. The layering is enforced by
`apps/server/test/architecture.test.ts`: it parses every source file's
imports under `apps/server/src`, `apps/web/src`, `packages/schema/src` and
`packages/capture/src` and fails on a forbidden edge. Run it alone inside the
loop:

```bash
pnpm exec vitest run apps/server/test/architecture.test.ts
```

What people get wrong here:

- **A module cycle is not a directory back-edge.** `a/x.ts → b/y.ts → a/z.ts`
  is a chain, not a cycle. "Moving this would create a cycle" is a claim
  about specific modules; verify it by finding the actual loop, or drop the
  argument.
- **The test covers what its rules name.** A move into a new directory the
  rules don't mention is unchecked until a rule names it. Read the rules for
  the destination before claiming the move is gated.

## The sweep after the edit (Phase 5.5)

For every old path and old symbol, grep the whole repo as raw text. Expected
result: zero hits. Every hit is a missed site or a named exception.

```bash
# old module path, anywhere: docs, skills, config, fixtures
git grep -n "services/deck-modes"

# old symbol name as raw text, not as an import
git grep -nw "deckModeMismatch"

# Markdown links pointing at source files that moved
git grep -nE "\]\([./]*[^)]*services/deck-modes" -- '*.md'
```

Use `-E` for anything with `(`, `)`, `|`, `+` or `?` in the pattern. In basic
regex those are literals, so `']\(http'` silently matches nothing and the
absence of output reads as a clean result. Verify a pattern matches something
you know exists before trusting that it matched nothing.

Hits under `docs/superpowers/specs/`, `docs/superpowers/plans/`,
`docs/architecture/` and a research record's history are frozen journal:
name them as deliberate exceptions, don't edit them.

Then re-run the Phase 0 measurements and compare every number. A test count
that fell means tests stopped running.

## TypeScript-specific traps

**`z.infer` of an optional schema is not the non-null type.** When
`.optional()` is applied inside the schema const, the inferred type is
`{…} | undefined`, and `keyof` over that union is `never`. A
`Partial<Record<keyof T, string>>` built on it collapses to `{}` and any
indexed write stops compiling. Move `.optional()` to the field's use site and
infer off the bare object, or wrap in `NonNullable`. The same holds for the
schemas `drizzle-orm/zod` derives from a table. Probe type identity with a
mutual-assignability check rather than reasoning about it.

**Barrels hide the real consumer.** `packages/schema/src/index.ts`,
`apps/server/src/repos/index.ts` and `apps/server/src/services/index.ts`
re-export what their folders declare; most consumers import from
`@crumble/schema` or the folder, not from the declaring file. A "consumed
directly" argument needs the barrel checked first.

**Type-only imports are erased.** The web app imports `@crumble/server` for
types only, and the architecture test allows exactly that. Don't report an
`import type` as a leak, and don't let a move turn one into a value import:
the rule fails, and the server would land in the client bundle.

**Package subpaths are an API.** `@crumble/schema/power` and
`@crumble/schema/migrations` exist because a package's `exports` map names
them. Moving the file behind one means editing the map, and grepping for the
subpath, not the file name.

**Generated files pin paths.** `apps/web/src/routeTree.gen.ts` lists every
route file; a moved or renamed route regenerates it on the next Vite build or
`pnpm dev`, and the regenerated file is committed with the move.

**Test fixtures and rules pin paths as data.** The architecture test's
directory constants, a fixture record under
`apps/server/test/importers/fixtures/`, and the ledger's record-relative
paths don't appear in the import graph and won't fail to compile.

## Locator classes

Things that name source paths without importing them; check every one the
move could touch:

| Where | Why it bites |
|---|---|
| `apps/server/test/architecture.test.ts` | Its rules name directories and files; a stale one stops guarding anything. |
| `apps/server/src/registry.ts` | Every server layer, the snapshot and the importer's order derive from it. |
| `apps/web/src/app/modes/` | Tabs and their routes, as data. |
| `README.md` | The What's here table, the API table and the command blocks are read as the map. |
| `AGENTS.md`, `CLAUDE.md`, `.ai/agent-working-rules.md` | Loaded every session; a stale path misdirects every agent. Changes to `AGENTS.md` go to the user. |
| `.claude/skills/**`, `.claude/agents/*.md` | Workflows naming helpers and paths. |
| `docs/conventions/*.md`, `docs/gotchas.md` | Rules agents follow; a stale path makes the convention wrong. |
| `.ai/dod/*.md`, `.ai/diagrams/*.md`, `.ai/regression/*.md` | Checklists, orientation maps and click-throughs naming paths and routes. |
| Relative Markdown links | `[label](../apps/server/src/x.ts)` 404s silently; nothing validates them. |
| `vitest.config.ts`, `pnpm-workspace.yaml`, packages' `exports` | Projects, workspace members and subpaths by path. |
| `apps/server/src/cli/build-vercel.ts`, `.vercelignore` | What the deployment bundles and uploads. |
| `package.json` scripts | Scripts naming files directly (`tsx src/cli/import-record.ts`). |
| `.gitignore` | Paths kept local; a moved tool's run files must stay ignored. |

The specs and plans under `docs/superpowers/` are frozen journals, correctly
out of scope. `README.md` is not.
