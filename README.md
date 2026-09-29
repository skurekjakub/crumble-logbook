# crumble-logbook

A local research tool for Cookie Run: Crumble: what top Korean and global players run in **Guild Conquest (길드 토벌전)** against the Piñata raid boss, in PvP (**Arena** and **Rumble Arena**, 와글와글 아레나), to push **main stages and the Dimensional Rift** under-powered, and to score in **Crumble Dungeon** (크럼블 던전), the Golden Drop score attack; and what raises **team power** (팀투), free and paid, at what cost. Every claim is traced to the forum post, video or ranking page it came from.

## What's here

| Path | What it holds |
|---|---|
| `research/` | Research records. Each has a `README.md` (question, verdict, sources) and `evidence/` with verbatim captures (DCInside and Naver cafe posts, comments, images, crumb.gg rankings, YouTube frames) and `evidence/captures.jsonl`, the capture ledger (see [Captures](#captures)). A record may also keep a `research-trail.md` (its web search rounds) and a `STATE.md` (working state between sessions); record 001 has both, its `STATE.md` now superseded by its README. A record the app can load also has `import.json` (what to import and from where), `curated/` (the curated dataset) and, once a refresh round has run on it, `searches.json`, its saved searches (schema `packages/capture/src/searches.ts`), each dated by rounds the record ran: the day `import.json` says it started, or a `## Refresh <date>` section of its README. |
| `packages/schema` | Drizzle tables, migrations and every Zod schema, shared by the server and the web app. |
| `packages/capture` | The capture ledger and the scrapers (DCInside, Naver cafe, crumb.gg, YouTube, and `yt-dlp`/`ffmpeg` wrappers), run as `pnpm capture`. Pure I/O: nothing from `apps/`. |
| `apps/server` | The data API: Hono over SQLite, layered `routes → services → repos`, with one content-type registry, plus the record importer and the snapshot CLIs. |
| `apps/web` | The web app: React + TanStack Router/Query, typed against the API through `hc<AppType>`. One section per game mode (driven by `src/app/modes/`, a file per mode, and served by the shared routes under `src/routes/$mode/`), plus Research, Sources and Glossary. |
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

The server creates and seeds its database from `data/snapshot.json` when the file doesn't exist yet, so a fresh clone runs with `pnpm install && pnpm dev`. Delete `data/crumble.db` to start again from the snapshot. When the file exists, the server compares it with the snapshot on startup and logs a warning naming the records and tables that differ: after a pull that brought newer records, delete `data/crumble.db` to reseed; after changing a record's data, rebuild the snapshot from a fresh database (see [The database](#the-database)) rather than exporting this one. It only warns: it never reseeds or deletes the database itself.

ESLint runs typescript-eslint's strict type-checked rules, React's hook rules on the web app, and JSDoc on every function, method, class and interface method (see `AGENTS.md`). The config and the reason for each switched-off rule are in `tools/eslint-config/index.ts`.

### The database

The server reads `data/crumble.db`, or the file `CRUMBLE_DB` names (an absolute path; the scripts run from `apps/server`). `PORT` overrides the default port, 8787.

```sh
pnpm import:record 001-guild-conquest-meta             # load a research record next to any others
pnpm import:record 002-pvp-meta                        # records load side by side
pnpm import:record 003-stage-pushing-meta              # then the stage-pushing record
pnpm import:record 004-golden-drop-meta                # then the Crumble Dungeon record
pnpm import:record 005-team-power-growth               # then the team power record
pnpm import:record 001-guild-conquest-meta --replace   # clear that record's rows and load it again
pnpm dev:reseed                                        # delete data/crumble.db, then pnpm dev reseeds it from the snapshot
pnpm dev:server                                        # serve the API on http://localhost:8787/api (watch mode)
pnpm db:export                                         # write data/snapshot.json from the database
pnpm db:restore [file]                                 # load a snapshot (default data/snapshot.json) into an empty database
pnpm db:scope HEAD 001-guild-conquest-meta             # the records whose rows data/snapshot.json changed, against HEAD; fails on any other
```

`import:record` reads `research/<slug>/import.json`, validates every curated file and every reference (and, when the manifest has a `ledger` block, the capture ledger against the evidence on disk) before writing, and loads everything in one transaction. An error names the file and the row, and leaves the database untouched. Every row it writes belongs to the record (`recordSlug`). It refuses a record that is already loaded unless you pass `--replace`, which clears only that record's rows. Sources, glossary entries and buff values can be shared between records: the first record to load one keeps it, and a later record's differing version is reported as a warning (a differing buff value fails the import instead). It also warns about glossary names that more than one entry claims, and about a curated manifest that lists no decks for a record of a mode with lineups (every mode but team power). After writing, every slug a stored row names must still be a stored row's, so a `--replace` that drops a row another record's row names fails, naming both.

A recommendation (a row of a table whose entity `OBSOLETE_ENTITIES` in `packages/schema/src/obsolete.ts` names) is marked obsolete in its curated file, never deleted: `"obsolete": { "since": "YYYY-MM-DD", "reason": "…", "sources": ["dc:…"] }`, and on a deck also `"superseded_by": "<deck id>"`. `since` is the date of the patch that displaced it, or the round's. The import checks the date, that the reason's sources are curated sources, and that the successor is a curated deck of the same mode other than the deck itself; a counter edge that names an obsolete deck must be obsolete too, and a stage zone slot or a dungeon lineup that names one fails the import, naming the row and the deck, until the round points it at a current deck. It writes `obsoleteSince`, `obsoleteReason` and `supersededBy`, keeps the row's `status`, and cites the reason under the cited entity `obsolescence`, keyed `<entity>:<id>`. Removing the block and re-importing makes the row current again.

Game facts (the tables `packages/schema/src/tables/stage.ts` marks as such) are owned by no record: they have no `recordSlug`. Instead, each record that lists a fact claims it (`fact_claims`, one row per source the record cites for it), and the fact is cited to every source its claims cite. A record that loads a fact already stored must agree with it: an identical fact isn't written twice, only claimed; a differing one fails the import. `--replace` drops the record's claims before loading it again, so it refreshes the sources the record gives a fact, and a fact the record no longer lists is deleted once no other record claims it. A fact written through the API is claimed by no record, and an import leaves it alone unless a record claims it, which then sets its citations.

Multi-record gotchas:
- Import the records in number order, 001 first, one command each. Shared sources and glossary entries keep the first record's row, so the order decides which version the database holds. `data/snapshot.json` is always built from a fresh import of every record, in that order, into an empty database (point `CRUMBLE_DB` at a new file), followed by `pnpm db:export`.
- A record may name cookies only another record's glossary knows: the Crumble Dungeon record's lineups and exclusions must each name a cookie by a glossary entry's Korean name, loaded already or by the record itself, or its import fails. Record 004 relies on record 001's glossary.
- After a scoped `--replace`, id counters restart past the highest id left, so ids no longer match a fresh import.
- Shared buff values belong to the record that loaded them first. Replacing that record clears them before it writes its own.

A row created through the API (`POST`) gets `recordSlug` null: no record owns it, so a `?record=` filter doesn't list it on its own account, its names are glossed without a record's preference, and `--replace` never clears it. To keep such a row with a record, add it to the record's `curated/` files and re-import.

Commit `data/snapshot.json` after changing a record's data, so the history stays diffable, and build it as above, from a fresh import into an empty database: a database that `--replace` or the API changed holds ids and rows a fresh import wouldn't make, so exporting it would commit them. To rebuild a database from the snapshot, point `CRUMBLE_DB` at a new file and run `pnpm db:restore`.

`pnpm db:scope <rev> [<record slug> …]` checks which records a regenerated snapshot touches, against `data/snapshot.json` at a git revision. It compares each record's rows by content, integer ids aside, since import order assigns them; a row's child rows (a deck's cookies, pets and notes, a rune build's decks) and its citations, an obsolete reason's among them, count as part of the row. It prints each changed record with its tables and fails when a record it wasn't given changed. Game facts that changed get a line of their own and don't fail it; a record that claims a changed fact is named too.

### API

Every resource is under `/api` and speaks JSON. Validation failures are 400 with every Zod issue and its path, unknown ids are 404, an unknown cited source or deck is 422 naming the ids, and conflicts are 409: deleting a source that rows still cite or a deck that a counter edge names, or a row whose `mode` isn't the mode of a deck it names. Content rows carry `sources`, the ids of the sources they cite; creating one needs at least one. Every list whose rows have a game mode takes `?mode=guild_conquest|arena|rumble_arena|stage|crumble_dungeon|team_power`. Every list whose rows carry the obsolete lifecycle takes `?current=true|false` (`true` keeps the current rows, `false` the obsolete ones), and its rows carry `obsoleteSince`, `obsoleteReason` and `obsoleteSources` (the sources of the reason, empty while current); a deck also carries `supersededBy`. Only a record's import marks a row obsolete: `POST` and `PATCH` ignore those fields. The stage tables belong to the stage mode alone, the dungeon tables to Crumble Dungeon alone and the team-power tables to team power alone, so they have no `mode` column, and the decks their rows name must be of that mode (409 otherwise). The team-power rows name each other by `slug` (a power source, a data point, a package, a spending order): a slug that isn't stored is 422 naming it, and deleting a row, or changing its slug, while another row names it is 409, as is a change to a row that leaves a row naming it breaking its own rule. Sources a row names inside it (a posted gain's, a curve row's) must exist and are cited like its own, so the row's `sources` lists them too. Names are glossed with the glossary entries of the row's own research record first.

| Resource | Verbs | Notes |
|---|---|---|
| `/api/decks` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | `:id` is a slug. Cookie and pet names come back with their glossary English (`en`, `null` if unresolved); cookies carry their formation `slot` when known. A `PATCH` that changes a deck's `mode` while a counter edge, a stage row or a dungeon row names it under its old mode is 409, and so is one that would leave an obsolete deck and the deck that superseded it on different modes, from either side. A deck another deck names as `supersededBy` can't be deleted (409). |
| `/api/counters` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Directed edges: `teamDeckId` is beaten by `beatenByDeckId`, under `conditions`, because of `why`. Both decks must be of the edge's `mode` (the import enforces the same rule). `?deck=` lists the edges on either side of a deck. |
| `/api/usage` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Usage figures, highest `usagePct` first, each with its sample and capture date. `?kind=cookie\|core\|pet\|team` filters. |
| `/api/rune-builds` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | `?deck=` filters by linked deck. |
| `/api/scores` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Sorted by damage. `ratio` (배, damage ÷ power) is computed on read, never stored. `?deck=` filters. |
| `/api/fight-events` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | A boss fight's timeline. `tElapsed` is seconds since the fight started (the HUD counts down; remaining = fight length − `tElapsed`), `null` for an event with no time in the fight. Sorted by `tElapsed`, untimed last. `?boss=` filters. |
| `/api/buff-values` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Buff (and debuff) values per cookie and skill grade, with `fromStar` and the cookie's glossary English (`en`). `?cookie=` takes the Korean name, a shorthand or the English name. |
| `/api/gear-recs`, `/api/mechanics`, `/api/rng-factors`, `/api/timeline`, `/api/takeaways`, `/api/recommendations` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Generic cited content. Mechanics take `?topic=` (a mode's rules are `rules`), and carry `alsoTopics`, further topics a row bears on (a view showing a topic shows those rows too); recommendations take `?record=<slug>`. |
| `/api/power-brackets`, `/api/stage-chapters`, `/api/rift-levels`, `/api/rift-seasons`, `/api/rift-unlocks` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Stage game facts, owned by no record. The Rift's unlock is one row: the main stage whose clear opens the Rift. A power bracket says a team with `minRatioPct`% of a stage's recommended power keeps `damagePct`% of its damage. A bracket's entry power at a stage or Rift level is derived from the two, never stored. |
| `/api/stage-zone-slots` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | What to bring per boss slot of each zone layout, in zone then slot order, with the deck the plan starts from. `?deck=` filters. |
| `/api/stage-clears` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Documented stage attempts. The clears their record accepts (`standing`) come first, ranked by stage reached, then lowest power first, never by a ratio; accepted failures follow, then unverified and rejected attempts, each group in the same order. A row written through the API starts `unverified`. `teamPower` is as posted; `powerG` is its most precise figure in G, read from it by the server on every write (a request's `powerG` is ignored), with the parser the web app's power fields share (`@crumble/schema/power`). The boss comes back with its glossary English (`en`), and with `bossEn` when the record names it in English. `?result=clear\|fail` and `?deck=` filter. |
| `/api/rift-bosses` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | The boss players report per Rift level. |
| `/api/dungeon-runs` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Documented Crumble Dungeon scores. The scores a screenshot or video shows (`standing: verified`) come first, highest `scoreG` first, then the text-only claims (`claim`) in the same order; never by score ÷ power. `standing` is read from `evidence` and `board` by the server on every write (text-only evidence or a `claim` board makes a claim; a request's `standing` is ignored). `totalPowerG` is the whole collection's power the screen shows, not a team power. `atkOrder` is the ATK order from the top as Korean names, `atkOrderNote` what the post adds to it. `slug` is the run's curated id. `?board=run\|weekly-best\|claim`, `?evidence=screenshot\|video\|text` and `?deck=` filter. |
| `/api/dungeon-lineups` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Published Crumble Dungeon lineups, newest first: the first 40 in the author's order, the cookies left out, the ATK order and the level rule, as Korean names. The lists must agree (no cookie both in the first 40 and left out; every ATK-order cookie in the first 40): a `POST` that breaks this is 400, a `PATCH` 409. `?deck=` filters. |
| `/api/dungeon-exclusions` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Cookies kept out of Crumble Dungeon's first 40, with the kind of reason (`kind`: `charger`, `summoner`, `projectile-speed`, `buff-overwrite`), why, `status` (`excluded`, `disputed`, `patched`) and the cookie's glossary English (`en`). A record lists a cookie once, and so does the API among the rows no record owns: a repeat is 409. `?kind=` and `?status=` filter. |
| `/api/power-sources` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Every system that raises displayed team power: what it raises, where it counts (`appliesIn`), its materials and `costType` (`free`, `time_gated`, `paid`, `mixed`), cap, diminishing returns, the gains players posted (each with its own `sources`, which must exist), its `efficiency` note per account stage (`early`, `mid`, `late`, `at22g`), bracket effect, spend order and patch notes. `?cost=` and `?place=stage\|rift\|arena\|conquest` filter. |
| `/api/power-data-points` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Every team-power figure a record found, for a `powerSource`: `kind` (`posted`, `claimed`, `inferred`), `approximate` (the post gives the figure loosely: a range's midpoint, a question, an unclear kind of power), the power before and after in G, `deltaPct`, cost and note. `?kind=` and `?powerSource=` filter. |
| `/api/packages`, `/api/price-tiers` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | Shop packages: `priceKrw`, `priceUsd` as a store lists it or `usdTier` inferred from the price tiers (a KRW price and the USD price the stores pair it with), what each `feeds` (power-source slugs), its Crystal value (not team power), verdict and spender `tier`. Packages take `?tier=` and `?feeds=`. |
| `/api/spending-orders`, `/api/spending-steps` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | The orders to spend in: one per account stage (`kind: stage`) and ranked ones (`kind: ranked`, with the record's `note` on the order as a whole), in `position` order. A step belongs to an order (`orderSlug`) and a `route` (`free` first, then `paid`, each by `position`), names a power source or a package (one of them: 400 on create, 409 on a patch), and carries its `basis`: `posted`, `claimed`, `unmeasured` or `community` (the community's stated order), with the record's wording in `basisNote`. Orders take `?kind=`; steps `?order=`, `?route=` and `?basis=`. |
| `/api/growth-curves` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | A power source's cost or return curve as a table: `columns`, `rows` (a cell per column, else 400 on create and 409 on a patch) and, where the record cites rows apart, `rowSources`. `?powerSource=` filters. |
| `/api/planner-steps` | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | The steps the power planner weighs, in `position` order: the power source, the data point of its gain (`dataPoint`), its `basis`, and the gain and reach in the record's words. A `posted` step must name a posted data point that gives a `deltaPct`: a write that breaks this, on the step or on the data point it names, is 409. The planner multiplies team power only by those. `?basis=` filters. |
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

`<record>` is the folder name under `research/`, and every path is record-relative under `evidence/`. A scraper appends each file's ledger line as it writes it and never overwrites a capture; `pnpm capture` with no arguments prints the full usage. `dc fetch` and `naver fetch` write a post only once the whole post (page, images, comments) is fetched, so a rerun after an interrupted one is safe: a file already captured is kept, and a file that differs from its line, or sits on disk without one, stops the run with its name and is left untouched. Tools are named `capture:<scraper>`, `agent-browser`, `curl`, `yt-dlp`, `manual`, `python:<script>` (the retired scrapers) or `unknown` (backfill only).

- **The Python scrapers are retired.** `dc_scrape.py` became `pnpm capture dc`, `nv_scrape.py` `pnpm capture naver`, `ytv.py` and `ytall.py` `pnpm capture youtube watch` and `search`, and `frames.py`, `sheet.py` and `subs.py` the `youtube frames`, `sheet` and `subs` wrappers over `ffmpeg` (which needs `ffmpeg` and `yt-dlp` on `PATH`). `frames` and `subs` pass `-fps_mode`, so they need ffmpeg 5.1 or later. The ports write the same TSV, Markdown and digests, byte for byte; the tests hold them to Python-made captures.
- **Media stays local.** Images, frames and video are gitignored under `research/` (the extensions are `MEDIA_EXTENSIONS` in `packages/capture/src/ledger.ts`, kept in step with `.gitignore`). Their ledger lines are committed; a clone without the files still verifies, and a present file's hash is checked.
- **Backfilled lines** say how their time was found in `approx`: `header` (the capture's `- captured:` line), `post` (an image takes its post's time) or `git` (the file's first commit). Records 001 and 002 were backfilled from the main checkout, media included.
- **Hash cache.** Verification hashes every present evidence file, media included, and caches each hash in `node_modules/.cache/crumble-capture/hashes.json` by absolute path, size and mtime, so later runs (every test worker, import and `pnpm capture verify`) rehash only files that changed. Delete the file to force a full rehash.
- **Line endings.** Text under `research/` is stored with LF. A ledger line hashes the bytes git stores, so `pnpm capture log` on a file written with CRLF records its LF hash, unless a `.gitattributes` marks the path `-text` and git keeps its bytes. A file written with CRLF before normalisation still matches its LF hash; anything else that changes a capture's bytes fails `pnpm verify`.

The `evidence/` folders hold publicly posted community content, captured for research and citation. Game content and names belong to Devsisters.
