# Decluttering — ordering, graph checks, and what "dead" means here

## Tooling

Nothing in the gate hunts dead code. Run the tools ad hoc (installing is fine — report it):

```bash
npx knip                              # unused files, exports, dependencies
npx madge --circular --extensions ts,tsx app lib mcp-server proxy.ts
```

Every finding is a **lead to verify**, not a fact to act on. "knip said so" is not a
justification; the reason it is unreachable is.

## Safe ordering, and why

Work outward from the coarsest unit. Risk is concentrated unevenly, and this order front-loads
the value while deferring the part that needs the most verification:

1. **Whole unused files.** Highest value, lowest risk — nothing imports the file, so nothing
   breaks in a way the compiler misses. Delete, re-run the gate.
2. **Unused / unlisted dependencies.** `package.json` hygiene. Check consumers outside the
   import graph first: a remark/rehype plugin named in `next.config.ts`, a CLI referenced from
   `scripts/`, `@vercel/analytics` mounted in the layout — none appears as a bare import you'd
   grep for by package name.
3. **Unused exports, last, in small batches.** Where false positives cluster. Batch them small
   enough that a gate failure points at an obvious culprit.

Exports go last because static analysis cannot see a dynamically-reached consumer, so a wrong
deletion there fails at runtime rather than at compile time. Files and dependencies fail loudly;
exports can fail quietly. Prefer removing the `export` keyword over deleting the symbol — the
compiler and `no-unused-vars` then surface what became genuinely unused, and the operation is
reversible.

## Cycles and coupling

Ask the checker rather than reasoning about the imports. Record the module and dependency totals
as part of the Phase 0 baseline; a total that moves unexpectedly means the change pulled
something new into the graph. A clean baseline is a proof of absence: if the graph is cycle-free
before a path-only move, the move cannot introduce a cycle, and two modules in it demonstrably do
not reach each other today.

## What "dead" does not mean

Things that look dead to static analysis and are not:

- **A component reached only from MDX.** `mdx-components.tsx` maps tag names to components, and
  posts under `content/blog/` use them by name. The component's only importer is the map.
- **A route, layout, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, `proxy.ts`** — mounted
  by file location, never imported.
- **An MCP tool under `mcp-server/`** — registered by name on the server, reached over HTTP.
- **A projection under `lib/projection/tags.ts`** — reached through the registry, keyed by tag
  name; twins prerender, so deleting one fails `next build`, not `tsc`.
- **A helper whose only consumer is `scripts/`** or a `package.json` script.
- **Anything named by a string** in config or reached by a computed dynamic import.

One thing that looks alive and is not: an export whose only consumer is a test that exists solely
to exercise it. That is a closed loop and both halves are removable — but check first whether the
behaviour has coverage through a real caller, because sometimes the closed loop is the only test
a live path has.

## Sweep-specific scope traps

- **A barrel whose re-exports all turn out dead** gets deleted, not left as an empty husk.
  Repoint its consumers at the concrete module.
- **Deleting dead code is not licence to fix the code around it.** The diff should be removals.
  A logic change smuggled into a sweep is invisible to review.
- **A finding you cannot explain is not a finding you may delete.** Verify the reason it is
  unreachable.
