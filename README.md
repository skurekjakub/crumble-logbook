# crumble-logbook

A local research tool for the Cookie Run: Crumble **Guild Conquest (길드 토벌전)** meta: what the top Korean and global players run against the Piñata raid boss, with every claim traced to the forum post, video or ranking page it came from.

## What's here

| Path | What it holds |
|---|---|
| `research/` | Research records. Each has a `README.md` (question, verdict, sources), a `research-trail.md`, a `STATE.md` for picking the work back up, and `evidence/` with verbatim captures (DCInside and Naver cafe posts, comments, images, crumb.gg rankings, YouTube frames). A record the app can load also has `import.json` (what to import and from where) and `curated/` (the curated dataset). |
| `packages/schema` | Drizzle tables, migrations and every Zod schema, shared by the server and the web app. |
| `apps/server` | The data API: Hono over SQLite, layered `routes → services → repos`, plus the record importer and the snapshot CLIs. |
| `data/` | `crumble.db` (local, gitignored) and `snapshot.json`, the committed, diffable dump of the database. |
| `legacy/dashboard/` | The original vanilla-JS dashboard, kept until the web app replaces it. Serve it with `python -m http.server` from that folder. |
| `docs/superpowers/` | The design spec (`specs/`) and the implementation plans (`plans/`). |
| `.claude/` | Claude Code skills, hooks and settings used to run the research. |

The web app (`apps/web`) is still to be built; see `docs/superpowers/plans/`.

## Development

Requires Node 24.18+ and pnpm 12.6.

```sh
pnpm install
pnpm verify        # typecheck → prettier check → vitest
pnpm vitest run packages/schema   # one package's tests
```

### The database

The server reads `data/crumble.db`, or the file `CRUMBLE_DB` names (an absolute path; the scripts run from `apps/server`). `PORT` overrides the default port, 8787.

```sh
pnpm import:record 001-guild-conquest-meta             # load a research record into an empty database
pnpm import:record 001-guild-conquest-meta --replace   # clear the content tables and load it again
pnpm dev:server                                        # serve the API on http://localhost:8787/api (watch mode)
pnpm db:export                                         # write data/snapshot.json from the database
pnpm db:restore [file]                                 # load a snapshot (default data/snapshot.json) into an empty database
```

`import:record` reads `research/<slug>/import.json`, validates every curated file and every reference before writing, and loads everything in one transaction. An error names the file and the row, and leaves the database untouched. It refuses a database that already has content unless you pass `--replace`, and it prints warnings, such as glossary names that more than one entry claims.

After an import, the database is the source of truth. Commit `data/snapshot.json` after changing data, so the history stays diffable. To rebuild a database from it, point `CRUMBLE_DB` at a new file and run `pnpm db:restore`.

### API

Every resource is under `/api` and speaks JSON. Validation failures are 400 with every Zod issue and its path, unknown ids are 404, an unknown cited source or deck is 422 naming the ids, and conflicts (such as deleting a source that rows still cite) are 409. Content rows carry `sources`, the ids of the sources they cite; creating one needs at least one. Every list whose rows have a game mode takes `?mode=guild_conquest|arena|rumble_arena`. Names are glossed with the glossary entries of the row's own research record first.

| Resource | Verbs | Notes |
|---|---|---|
| `/api/decks` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | `:id` is a slug. Cookie and pet names come back with their glossary English (`en`, `null` if unresolved); cookies carry their formation `slot` when known. |
| `/api/counters` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Directed edges: `teamDeckId` is beaten by `beatenByDeckId`, under `conditions`, because of `why`. `?deck=` lists the edges on either side of a deck. |
| `/api/usage` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Usage figures, highest `usagePct` first, each with its sample and capture date. `?kind=cookie\|core\|pet\|team` filters. |
| `/api/rune-builds` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | `?deck=` filters by linked deck. |
| `/api/scores` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Sorted by damage. `ratio` (배, damage ÷ power) is computed on read, never stored. `?deck=` filters. |
| `/api/fight-events` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | A boss fight's timeline. `tElapsed` is seconds since the fight started (the HUD counts down; remaining = fight length − `tElapsed`), `null` for an event with no time in the fight. Sorted by `tElapsed`, untimed last. `?boss=` filters. |
| `/api/buff-values` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Buff (and debuff) values per cookie and skill grade, with `fromStar` and the cookie's glossary English (`en`). `?cookie=` takes the Korean name, a shorthand or the English name. |
| `/api/gear-recs`, `/api/mechanics`, `/api/rng-factors`, `/api/timeline`, `/api/takeaways`, `/api/recommendations` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Generic cited content. Mechanics take `?topic=` (a mode's rules are `rules`); recommendations take `?record=<slug>`. |
| `/api/sources` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | `?site=dc\|nv\|web`. The site comes from the id prefix. |
| `/api/glossary` | `GET`, `GET /resolve?name=&mode=`, `POST` | `?kind=` filters. `POST` upserts by `kr`. `resolve` with a `mode` prefers the entries of the records covering that mode. |
| `/api/rankings` | `GET`, `GET /seasons` | `?season=` and `?board=players\|guilds\|power`. |
| `/api/records` | `GET`, `GET /:slug` | Research records: the mode each is filed under, and `modes`, the modes it covers with their own lede and caveat. |
| `/api/export` | `GET` | The full snapshot, the same shape as `data/snapshot.json`. |

**SQLite driver:** Node's built-in `node:sqlite`, through the `drizzle-orm/node-sqlite` driver in drizzle-orm 1.0 beta. It needs no native build, which matters on ARM64 Windows. Zod schemas come from `drizzle-orm/zod`, the 1.0 home of drizzle-zod. The fallbacks (`better-sqlite3`, `@libsql/client`) weren't needed. The spike, run 2026-09-27 on Node 24.18.0 ARM64, is kept as `packages/schema/test/driver.test.ts`.

## Sources and captures

The `evidence/` folders hold publicly posted community content, captured for research and citation. Each capture records its URL and capture time. Game content and names belong to Devsisters.
