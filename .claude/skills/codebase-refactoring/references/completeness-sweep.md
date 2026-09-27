# Completeness sweep

How to prove you found every reference to something you are moving, renaming, or deleting —
including the references that are invisible to the import graph.

## Why the import graph is not enough

`tsc` proves that everything the type system can see still resolves. It cannot see a path inside
a string, a glob in a config file, a markdown link, or a code fence in a blog post. Rename tooling
has the same blind spot by construction: IDEs exclude dynamic usages from rename by default.

So the compiler passing is necessary and not sufficient. The gap it leaves is exactly where a
partial refactor hides: the code compiles, the tests pass, and a config glob or a doc link now
points at nothing.

## Building the inventory (Phase 1)

Count first, then act — a number you can re-derive independently is what gives "did I get them
all" an answer.

### Importers, per module

Quote the closing delimiter so `foo` does not also match `foo-bar`:

```bash
git grep -l "@/lib/proxy/chain'" -- app lib mcp-server tests proxy.ts
```

Do this per module rather than per directory, then also take the union — a file may import two
modules from the same directory, so per-module counts sum to more than the file count. Report
both, and say which is which. Path aliases have two spellings: `@/lib/x` and a relative `../x`
resolve to the same module — grep both.

### Symbol occurrences vs files

`git grep -l` counts files; `git grep -c` counts lines; neither counts occurrences. When a
rename's blast radius matters, say which you measured. "12 sites" meaning "12 files, 37
occurrences" invites a reviewer to think a sweep was incomplete.

### Cycles

There is no cycle checker in the gate. When a move's argument rests on a cycle, run one ad hoc
rather than reasoning about imports — `npx madge --circular --extensions ts,tsx app lib
mcp-server proxy.ts` — and record the result as part of the baseline. A module cycle is a loop
between specific modules; `a/x → b/y → a/z` is a chain, and a directory-level back-edge is not a
cycle. "This would create a cycle" is a claim about named modules — find the loop or drop it.

## The sweep after the edit (Phase 5.5)

For every old path and old symbol, grep the whole repo as raw text. Expected result: zero hits.
Every hit is a missed site or a named exception.

```bash
# old module path, anywhere at all — docs, config, skills, posts, drafts
git grep -n "lib/proxy/agent-markdown-user-agents"

# old symbol name as raw text, not as an import
git grep -n "\bprefersMarkdownByUserAgent\b"

# markdown links pointing at source files that moved
git grep -nE "\]\([./]+.*lib/proxy" -- '*.md' '*.mdx'
```

Use `grep -E` for anything with `(`, `)`, `|`, `+`, or `?` in the pattern. In basic regex a bare
`(` is a literal and `\(` opens a group, so `"\](http"` matches a markdown link and `"\]\(http"`
is a hard error (`Unmatched ( or \(`) — the two spellings mean opposite things in the two modes.
Verify a pattern matches something you know exists before trusting that it matched nothing.

Then re-run `npm run verify` and compare every number against the Phase 0 baseline. Equal or
better. A test count that fell means tests stopped running.

## TypeScript-specific traps

**Barrel re-exports hide the real consumer.** Nothing may import a symbol from the module that
declares it while eight things import it from an `index.ts`. Check the barrel before arguing
from "consumed directly".

**Type-only imports are erased.** `import type` from a `server-only` module in a client
component is safe and does not pull the module into the client bundle. Don't report it as a leak,
and don't rely on its absence as proof that no client code depends on the shape.

**Test fixtures pin paths as data.** A fixture under `tests/fixtures/` keyed by module path, a
mock registered by path in `tests/mocks/`, or a `vi.mock('@/lib/…')` string does not appear in
the import graph and will not fail to compile. `git grep` the path under `tests/` explicitly.

**`z.infer` of an optional schema is not the non-null type.** With `.optional()` inside the
schema const, the inferred type is `{…} | undefined` and `keyof` over that union is `never`.
Probe type identity with a mutual-assignability check rather than reasoning about it.

## Repo-specific locator classes

Things in this repo that name source paths or symbols without importing them:

| Where | Why it bites |
|---|---|
| `AGENTS.md` | Loaded into every session. A stale path here misdirects every agent. |
| `.ai/feature-constitution/*/README.md` | Read as the spec of a subsystem before touching it. |
| `.claude/skills/*/SKILL.md`, `.claude/agents/*.md` | Skills and the reviewer cite paths and commands; a stale one is followed. |
| `.ai/shared/*.md`, `.ai/comment-policy.md` | Examples in the policy quote real symbols. |
| `content/blog/*.mdx`, `content/about.mdx` | **Published pages quote paths and symbols in code fences, and `<CodeLink source>` names files outright.** A rename makes a public claim false or fails the build. Surface these to the user; don't silently edit a post. |
| `content/drafts/*.mdx`, `content/drafts/*.md` | Tracked, unpublished, and they quote the same paths. Same rule as posts: surface, don't silently edit — the author decides whether the draft tracks the code. |
| `mdx-components.tsx` | The tag → component map; a moved component is reached by name from MDX. |
| `next.config.ts`, `vitest.config.mts`, `tsconfig.json` | Globs, aliases, and setup paths. |
| `package.json` scripts, `scripts/*.sh` | Scripts naming files directly. |
| `.github/workflows/ci.yml` | The CI gate names scripts; a renamed script breaks every PR. |

`.ai/feature-constitution/*/spec.md`, `plan*.md`, and `research*` are frozen journals — correctly
out of scope. The `README.md` beside them is not.
