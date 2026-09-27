# crumble-logbook

A local research tool for the Cookie Run: Crumble **Guild Conquest (길드 토벌전)** meta: what the top Korean and global players run against the Piñata raid boss, with every claim traced to the forum post, video or ranking page it came from.

## What's here

| Path | What it holds |
|---|---|
| `research/` | Research records. Each has a `README.md` (question, verdict, sources), a `research-trail.md`, a `STATE.md` for picking the work back up, and `evidence/` with verbatim captures (DCInside and Naver cafe posts, comments, images, crumb.gg rankings, YouTube frames). |
| `legacy/dashboard/` | The original vanilla-JS dashboard. Its `data/*.json` is the seed the new app imports. Serve it with `python -m http.server` from that folder. |
| `docs/superpowers/specs/` | The design for the React + Hono rewrite. |
| `.claude/` | Claude Code skills, hooks and settings used to run the research. |

The app itself (`packages/schema`, `apps/server`, `apps/web`) is being built from the spec in `docs/superpowers/specs/`.

## Development

Requires Node 24.18+ and pnpm 12.6.

```sh
pnpm install
pnpm verify        # typecheck → prettier check → vitest
pnpm vitest run packages/schema   # one package's tests
```

**SQLite driver:** Node's built-in `node:sqlite`, through the `drizzle-orm/node-sqlite` driver in drizzle-orm 1.0 beta. It needs no native build, which matters on ARM64 Windows. Zod schemas come from `drizzle-orm/zod`, the 1.0 home of drizzle-zod. The fallbacks (`better-sqlite3`, `@libsql/client`) weren't needed. The spike, run 2026-09-27 on Node 24.18.0 ARM64, is kept as `packages/schema/test/driver.test.ts`.

## Sources and captures

The `evidence/` folders hold publicly posted community content, captured for research and citation. Each capture records its URL and capture time. Game content and names belong to Devsisters.
