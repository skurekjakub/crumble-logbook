# crumble-logbook

A local research tool for Cookie Run: Crumble: what top Korean and global players run in **Guild Conquest (길드 토벌전)** against the Piñata raid boss, and in PvP (**Arena** and **Rumble Arena**, 와글와글 아레나). Every claim is traced to the forum post, video or ranking page it came from.

## What's here

| Path | What it holds |
|---|---|
| `research/` | Research records. Each has a `README.md` (question, verdict, sources) and `evidence/` with verbatim captures (DCInside and Naver cafe posts, comments, images, crumb.gg rankings, YouTube frames) and `evidence/captures.jsonl`, the capture ledger (see [Captures](#captures)). A record may also keep a `research-trail.md` (its web search rounds) and a `STATE.md` (working state between sessions); record 001 has both, its `STATE.md` now superseded by its README. A record the app can load also has `import.json` (what to import and from where) and `curated/` (the curated dataset). |
| `packages/schema` | Drizzle tables, migrations and every Zod schema, shared by the server and the web app. |
| `packages/capture` | The capture ledger and the scrapers (DCInside, Naver cafe, crumb.gg, YouTube, and `yt-dlp`/`ffmpeg` wrappers), run as `pnpm capture`. Pure I/O: nothing from `apps/`. |
| `apps/server` | The data API: Hono over SQLite, layered `routes → services → repos`, with one content-type registry, plus the record importer and the snapshot CLIs. |
| `apps/web` | The web app: React + TanStack Router/Query, typed against the API through `hc<AppType>`. One section per game mode (driven by `src/app/modes/`, a file per mode), plus Research, Sources and Glossary. |
| `data/` | `crumble.db` (local, gitignored) and `snapshot.json`, the committed, diffable dump of the database. |
| `tools/conquest-macro/` | An AutoHotkey v2 loop that retries the Guild Conquest fight; its README covers tuning. |
| `tools/eslint-config/` | The ESLint flat config (a workspace package). It carries its own TypeScript 6.0, because typescript-eslint needs the JS compiler API, which the native TypeScript 7 behind `tsc` doesn't ship yet (expected in 7.1). |
| `docs/superpowers/` | The design specs (`specs/`) and the implementation plans (`plans/`). |
| `OPEN-QUESTIONS.md` | Decisions waiting on the user. |
| `.claude/` | Claude Code skills, hooks and settings used to run the research. |

## Development

Requires Node 24.18+ and pnpm 12.6.

```sh
pnpm install
pnpm dev           # the API and the web app together: http://localhost:5173
pnpm verify        # typecheck → eslint → prettier check → vitest
pnpm lint          # eslint alone (type-aware, about 45 s); pnpm lint:fix applies the safe fixes
pnpm vitest run packages/schema   # one package's tests
pnpm dev:server    # API on http://localhost:8787/api
pnpm dev:web       # web app on http://localhost:5173, proxying /api (CRUMBLE_API overrides the target)
```

The server creates and seeds its database from `data/snapshot.json` when the file doesn't exist yet, so a fresh clone runs with `pnpm install && pnpm dev`. Delete `data/crumble.db` to start again from the snapshot.

ESLint runs typescript-eslint's strict type-checked rules, React's hook rules on the web app, and JSDoc on every function, method, class and interface method (see `AGENTS.md`). The config and the reason for each switched-off rule are in `tools/eslint-config/index.ts`.

### The database

The server reads `data/crumble.db`, or the file `CRUMBLE_DB` names (an absolute path; the scripts run from `apps/server`). `PORT` overrides the default port, 8787.

```sh
pnpm import:record 001-guild-conquest-meta             # load a research record next to any others
pnpm import:record 002-pvp-meta                        # records load side by side
pnpm import:record 001-guild-conquest-meta --replace   # clear that record's rows and load it again
pnpm dev:server                                        # serve the API on http://localhost:8787/api (watch mode)
pnpm db:export                                         # write data/snapshot.json from the database
pnpm db:restore [file]                                 # load a snapshot (default data/snapshot.json) into an empty database
```

`import:record` reads `research/<slug>/import.json`, validates every curated file and every reference (and, when the manifest has a `ledger` block, the capture ledger against the evidence on disk) before writing, and loads everything in one transaction. An error names the file and the row, and leaves the database untouched. Every row it writes belongs to the record (`recordSlug`). It refuses a record that is already loaded unless you pass `--replace`, which clears only that record's rows. Sources, glossary entries and buff values can be shared between records: the first record to load one keeps it, and a later record's differing version is reported as a warning (a differing buff value fails the import instead). It also warns about glossary names that more than one entry claims.

Multi-record gotchas:
- Import 001, then 002. Shared sources and glossary entries keep the first record's row, so the order decides which version the database holds. `data/snapshot.json` is always built from a fresh 001-then-002 import.
- After a scoped `--replace`, id counters restart past the highest id left, so ids no longer match a fresh import.
- Shared buff values belong to the record that loaded them first. Replacing that record clears them before it writes its own.

A row created through the API (`POST`) gets `recordSlug` null: no record owns it, so a `?record=` filter doesn't list it on its own account, its names are glossed without a record's preference, and `--replace` never clears it. To keep such a row with a record, add it to the record's `curated/` files and re-import.

After an import, the database is the source of truth. Commit `data/snapshot.json` after changing data, so the history stays diffable. To rebuild a database from it, point `CRUMBLE_DB` at a new file and run `pnpm db:restore`.

### API

Every resource is under `/api` and speaks JSON. Validation failures are 400 with every Zod issue and its path, unknown ids are 404, an unknown cited source or deck is 422 naming the ids, and conflicts are 409: deleting a source that rows still cite or a deck that a counter edge names, or a row whose `mode` isn't the mode of a deck it names. Content rows carry `sources`, the ids of the sources they cite; creating one needs at least one. Every list whose rows have a game mode takes `?mode=guild_conquest|arena|rumble_arena`. Names are glossed with the glossary entries of the row's own research record first.

| Resource | Verbs | Notes |
|---|---|---|
| `/api/decks` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | `:id` is a slug. Cookie and pet names come back with their glossary English (`en`, `null` if unresolved); cookies carry their formation `slot` when known. |
| `/api/counters` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Directed edges: `teamDeckId` is beaten by `beatenByDeckId`, under `conditions`, because of `why`. Both decks must be of the edge's `mode` (the import enforces the same rule). `?deck=` lists the edges on either side of a deck. |
| `/api/usage` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Usage figures, highest `usagePct` first, each with its sample and capture date. `?kind=cookie\|core\|pet\|team` filters. |
| `/api/rune-builds` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | `?deck=` filters by linked deck. |
| `/api/scores` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Sorted by damage. `ratio` (배, damage ÷ power) is computed on read, never stored. `?deck=` filters. |
| `/api/fight-events` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | A boss fight's timeline. `tElapsed` is seconds since the fight started (the HUD counts down; remaining = fight length − `tElapsed`), `null` for an event with no time in the fight. Sorted by `tElapsed`, untimed last. `?boss=` filters. |
| `/api/buff-values` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Buff (and debuff) values per cookie and skill grade, with `fromStar` and the cookie's glossary English (`en`). `?cookie=` takes the Korean name, a shorthand or the English name. |
| `/api/gear-recs`, `/api/mechanics`, `/api/rng-factors`, `/api/timeline`, `/api/takeaways`, `/api/recommendations` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Generic cited content. Mechanics take `?topic=` (a mode's rules are `rules`); recommendations take `?record=<slug>`. |
| `/api/sources` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | `?site=dc\|nv\|web`; `?record=<slug>` keeps the sources a record owns or cites. The site comes from the id prefix. Each listed source carries `records`: the record that loaded it and every record whose rows cite it. Each source also carries `capture` (`capturedAt`, `tool`, `approx`), its evidence capture's ledger line, or `null`. |
| `/api/captures` | `GET` | The loaded records' capture ledgers, by record then path. `?record=<slug>` and `?path=<record-relative path>` filter. Read-only: the ledger file is the source. |
| `/api/glossary` | `GET`, `GET /resolve?name=&mode=`, `POST` | `?kind=` filters. `POST` upserts by `kr`. `resolve` with a `mode` prefers the entries of the records covering that mode. |
| `/api/rankings` | `GET`, `GET /seasons` | `?season=` and `?board=players\|guilds\|power`. |
| `/api/records` | `GET`, `GET /:slug` | Research records: the mode each is filed under, and `modes`, the modes it covers with their own lede and caveat. |
| `/api/export` | `GET` | The full snapshot, the same shape as `data/snapshot.json`. |

**SQLite driver:** Node's built-in `node:sqlite`, through the `drizzle-orm/node-sqlite` driver in drizzle-orm 1.0 beta. It needs no native build, which matters on ARM64 Windows. Zod schemas come from `drizzle-orm/zod`, the 1.0 home of drizzle-zod. The fallbacks (`better-sqlite3`, `@libsql/client`) weren't needed. The spike, run 2026-09-27 on Node 24.18.0 ARM64, is kept as `packages/schema/test/driver.test.ts`.

## Working notes

- **Commits:** the `require-commit-format` hook blocks `git commit -m`. Write the message (subject, then a body with the problem, the justification and what was discarded) to a file and run `git commit -F <file>`.
- **Gates:** run `pnpm verify`. The `prefer-verify-script` hook blocks chained gates and unscoped test runs. The rtk hook masks prettier's output, so an agent runs `rtk proxy pnpm verify`.
- **Evidence scripts** (`research/*/evidence/*.py`): set `PYTHONIOENCODING=utf-8`. The Python scrapers are retired (see [Captures](#captures)); they stay, unedited, as the record of how records 001 and 002 were captured.
- **Names:** the KR↔EN glossary is `research/001-guild-conquest-meta/evidence/12-glossary.json` and each record's `curated/glossary.json`. Resolution is per record: 바궁 is Princess Bari in 001 and Wind Archer in 002.
- **Roadmap** (the user's, 2026-09-28): simulators for every game mode, starting with the Guild Conquest one specced in `docs/superpowers/specs/2026-09-27-conquest-simulator-design.md`; scrapers and easy ways to plug in more decks and research records; and more game modes, such as stage-pushing teams and the Golden Drop encounter, each with its own views, backend logic and simulator. The architecture audit against this roadmap is `docs/architecture/2026-09-28-audit.md`.
- **Next research steps:**
  - Re-pull crumb.gg's final Season 5 boards after 2026-09-28 12:00 KST, as new evidence files.
  - Open research questions: the exact survival build for the 17 s wipe (about 9M HP and 45% DR per survivor); whether top players run Herb or other survival fillers.

## Captures

Captures are taken by scripts and agent-browser sessions, never from the app. Every file under a record's `evidence/` has a line in that record's `evidence/captures.jsonl`: its path, URL (`null` for a derived file), capture time, tool and sha256. The design is `docs/superpowers/specs/2026-09-28-capture-ledger-design.md`.

```sh
pnpm capture dc list <record> <out.tsv> <pages> <query>...        # DCInside search listing (name:, subject:, memo:, comment:, @recommend)
pnpm capture dc fetch <record> <outdir> <no>...                   # posts, their images and comments
pnpm capture naver list <record> <out.tsv> <menuId> <pages>       # a Naver cafe board listing
pnpm capture naver fetch <record> <outdir> <articleId>...         # articles, their images and comments
pnpm capture crumbgg <endpoint> <record> <outdir> [args]          # crumb.gg's public JSON (live, rankings, data, api-* ...)
pnpm capture youtube watch|search|download <record> <outdir> ...  # watch pages and digests, searches, yt-dlp downloads
pnpm capture youtube frames|sheet|subs <record> ...               # ffmpeg frames, contact sheets, subtitle-band sheets
pnpm capture log <record> <path> --url <url|-> --tool <tool>      # a file captured any other way (agent-browser, curl, manual)
pnpm capture verify [record]                                      # check every ledger against the files on disk
pnpm capture backfill <record> [--from <dir>]                     # write the ledger of a record that predates it, once
```

`<record>` is the folder name under `research/`, and every path is record-relative under `evidence/`. A scraper appends each file's ledger line as it writes it and never overwrites a capture; `pnpm capture` with no arguments prints the full usage. Tools are named `capture:<scraper>`, `agent-browser`, `curl`, `yt-dlp`, `manual`, `python:<script>` (the retired scrapers) or `unknown` (backfill only).

- **The Python scrapers are retired.** `dc_scrape.py` became `pnpm capture dc`, `nv_scrape.py` `pnpm capture naver`, `ytv.py` and `ytall.py` `pnpm capture youtube watch` and `search`, and `frames.py`, `sheet.py` and `subs.py` the `youtube frames`, `sheet` and `subs` wrappers over `ffmpeg` (which needs `ffmpeg` and `yt-dlp` on `PATH`). The ports write the same TSV, Markdown and digests, byte for byte; the tests hold them to Python-made captures.
- **Media stays local.** Images, frames and video are gitignored under `research/` (the extensions are `MEDIA_EXTENSIONS` in `packages/capture/src/ledger.ts`, kept in step with `.gitignore`). Their ledger lines are committed; a clone without the files still verifies, and a present file's hash is checked.
- **Backfilled lines** say how their time was found in `approx`: `header` (the capture's `- captured:` line), `post` (an image takes its post's time) or `git` (the file's first commit). Records 001 and 002 were backfilled from the main checkout, media included.
- **Line endings.** Text under `research/` is stored with LF. A file written with CRLF before normalisation still matches its LF hash; anything else that changes a capture's bytes fails `pnpm verify`.

The `evidence/` folders hold publicly posted community content, captured for research and citation. Game content and names belong to Devsisters.
