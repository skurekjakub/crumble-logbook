# Spec review: the claims to falsify

Read this in Phase 2.5, when writing the reviewer mandates. Refactor specs lean
on structural claims that feel obvious and are cheap to get wrong: a wrong
premise caught here costs a spec edit, caught in Phase 6 it costs a rewrite of
shipped code. Ask each reviewer to **enumerate the spec's load-bearing claims
and confirm or refute each with `file:line` evidence**, not to opine on the
design.

The claims worth naming explicitly:

- **That a type derived one way is identical to the type derived the other
  way.** `z.infer` of an optional field is not `NonNullable<X['field']>`, and
  a schema `drizzle-orm/zod` derives from a table is not the hand-written one
  beside it. This class of bug surfaces only when the move is half done.
- **That a destination is allowed.** A move into a server layer must pass the
  rules in `apps/server/test/architecture.test.ts`; the reviewer reads the
  rule for the destination rather than trusting the spec's summary of it.
- **That a destination matches an existing convention.** The convention doc
  may be stale; verify against the code it describes, not the prose.
- **That a cycle exists, or would be created.** A module cycle is a loop
  between specific modules (`a/x → b/y → a/z`); a directory-level back-edge is
  not a cycle. "This would create a cycle" is a claim about named modules:
  find the loop or drop the claim.
- **That the inventory counts are right.** Re-derive at least one count
  independently rather than trusting the spec's arithmetic.
- **That the web app still takes only types from the server.** A value import
  of anything under `apps/server` from `apps/web` breaks the layering rule and
  pulls the server into the client bundle; an `import type` is erased and
  allowed.
- **That nothing the snapshot, the API or the deployment shows will change.**
  The spec names how that is proven (a fresh import that `pnpm db:scope
  HEAD` passes, saved API responses, `pnpm build:vercel`); a reviewer checks
  that the proof covers every surface the moved code reaches.
- **That a research record is untouched.** No `curated/` value and nothing
  under `evidence/` changes in a refactor.
