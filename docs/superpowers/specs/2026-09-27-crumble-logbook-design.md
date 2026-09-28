# Crumble Logbook: design

Date: 2026-09-27 · Status: approved in conversation, awaiting written-spec review

> **Partly replaced (2026-09-28).** Scraping moved out of the server: the [capture-ledger design](2026-09-28-capture-ledger-design.md) replaces everything here about scraper jobs. Each replaced passage below is marked *Replaced* and kept as the record of the original design.

## Intent

A local tool for researching the Cookie Run: Crumble **Guild Conquest (길드 토벌전)** meta. It replaces the vanilla-JS "Piñata Raid Logbook" dashboard (`Games/crumble/dashboard` in the Obsidian vault), which doesn't scale as research records and data sources grow.

**What the user said:**
- React + TypeScript front end.
- A real backend.
- Drizzle + Zod for well-defined schemas.
- Local only.
- The backend owns a data API and scraper jobs. *(Replaced: scrapers run as `pnpm capture` scripts, never from the server or the UI; see the capture-ledger design.)*
- All TypeScript, with the Python scrapers ported.
- Its own repo under `C:\Users\skure\repositories`, public on GitHub under `skurekjakub`.
- Everything migrates, including raw evidence captures and the vault's `.claude` folder (skills, hooks, settings).

**Assumptions:**
- Single user and single process.
- SQLite is enough.
- Research agents (Claude subagents) are the main writers of new data, through the API or through importable research records.

**Success means:**
1. Everything the current dashboard shows is served from the database and rendered by the React app.
2. Record `001-guild-conquest-meta` imports end to end without anything being re-typed.
3. A DC, Naver or crumb.gg scrape can be triggered from the UI and its captures land in a record. *(Replaced: every file under a record's `evidence/` has a line in its capture ledger giving its URL, capture time, tool and hash, and a test fails when one is missing or a file's bytes changed; see the capture-ledger design.)*
4. Every content row is traceable to at least one cited source.
5. Adding a new content type means a table, a schema, a route and a view, with no cross-cutting edits.

## Repository

`C:\Users\skure\repositories\crumble-logbook`, a pnpm workspace (Node 24, ARM64 Windows).

```
crumble-logbook/
  packages/schema/     Drizzle tables → drizzle-zod schemas → exported TS types (single source of truth)
  apps/server/         Hono API · Drizzle over SQLite · job runner · scrapers · importers   (job runner and scrapers: replaced, see the capture-ledger design)
  apps/web/            Vite + React + TanStack Query + TanStack Router
  research/            research records moved from the vault (README, research-trail, evidence/, STATE.md)
  .claude/             migrated from the vault: skills, hooks, settings (secret-reviewed before first push)
  docs/superpowers/    specs and plans
```

Dependencies only point downward: `web → schema`, `server → schema`. The web app imports only the server's exported `AppType` *type*, for Hono's typed RPC client; there's no runtime import of server code.

### Migration from the vault

- `Games/crumble/research/**` moves to `research/`, including every evidence capture (post text, images, comments). The user chose to publish raw captures.
- `Games/crumble/dashboard/` is copied to `legacy/dashboard/` as the reference for the port and is replaced by `apps/web`. Its `data/*.json` becomes the first import seed, and its tokens and CSS carry over. `legacy/` is deleted once `apps/web` covers every view.
- The vault's `.claude/` (skills, hooks, settings) is copied into the repo. Before the first push, every file is checked for secrets, tokens, and absolute paths that shouldn't be public; findings go to the user.
- The session memory (`agent-browser-arm64-windows`, `prefer-browser-over-curl`) is copied into the new repo's Claude project memory folder.
- The vault keeps `conquest.md`, `Build for guild conquest.md` and `_media/`. Only the research and dashboard move.

## Server (`apps/server`)

Layered. Each layer only calls the one below it.

| Layer | Folder | Responsibility |
|---|---|---|
| routes | `src/routes/` | Hono routers; `zValidator` on every param, query and body; typed responses |
| services | `src/services/` | Domain rules: damage ÷ power, name resolution via glossary, citation requirement, ATK-order helpers |
| repos | `src/repos/` | One module per aggregate; the only layer that touches Drizzle |
| db | `src/db/` | Drizzle client, drizzle-kit migrations, in-memory factory for tests |
| jobs | `src/jobs/` | Runner plus one module per job kind. *Replaced: no job runner; see the capture-ledger design.* |
| scrapers | `src/scrapers/` | DC (mobile), Naver (public JSON API), crumb.gg (agent-browser CLI). *Replaced: the scrapers live in `packages/capture`.* |
| importers | `src/importers/` | Research-record and dashboard-JSON importers |

**SQLite driver.** Prefer Node's built-in `node:sqlite` through Drizzle, to avoid native builds on Windows ARM64. The first plan task is a spike that proves the Drizzle adapter works on this machine. Fallbacks in order: `better-sqlite3` (if an ARM64 prebuild installs), then `@libsql/client`. Whichever passes gets recorded in the README.

### Data model

Drizzle tables in `packages/schema`. `drizzle-zod` derives the select and insert Zod schemas, and enums are Drizzle enums so Zod inherits them.

| Table | Holds | Key fields |
|---|---|---|
| `sources` | every cited post/page | `id` (`dc:76135`, `nv:43653`, `web:crumbgg-s5`), `site`, `url`, `title_kr`, `title_en`, `date`, `relevance`, `capture_path` |
| `research_records` | a research run | `slug`, `question`, `status`, `started_at`, `updated_at` |
| `glossary` | KR ↔ EN names | `kr`, `shorthand` (JSON string[]), `en`, `kind` enum (cookie, pet, stat, gear_slot, term), `element`, `class`, `rarity` |
| `decks` | a named lineup | `id`, `name_en`, `name_kr`, `status` enum (meta, alt, niche, legacy), `ceiling_text`, `summary`, `formation`, `perks`, `rng`, `atk_order` (JSON), `atk_order_note` |
| `deck_cookies` | a cookie in a deck | `deck_id`, `cookie_kr`, `level`, `level_rule`, `stars`, `why`, `position` |
| `deck_pets` | pets per deck | `deck_id`, `pet_kr`, `position` |
| `deck_notes` | swaps, unorthodox choices | `deck_id`, `kind` enum (substitution, unorthodox), `text` |
| `rune_builds` | rune lines per cookie | `cookie_kr`, `lines`, `why`, `disputed` |
| `rune_build_decks` | m:n | `rune_build_id`, `deck_id` |
| `gear_recs` | substats per slot | `slot` enum (top_left, top_right, bottom_left, bottom_right, general), `substats`, `context` enum (raid, arena, stage), `why` |
| `scores` | one posted score | `damage_g`, `power_g?`, `deck_id?`, `verified`, `date`, `season?`, `player?`, `note` |
| `rankings` | crumb.gg rows | `season`, `board` enum (players, guilds, power), `rank`, `name`, `guild?`, `value_g`, `captured_at` |
| `mechanics` | measured/datamined rules | `title`, `body`, `confidence` enum (high, medium, low) |
| `rng_factors` | sources of variance | `factor`, `effect`, `mitigation` |
| `timeline` | dated events | `date`, `event` |
| `takeaways` | headline findings | `text`, `detail`, `position` |
| `citations` | any row ↔ source | `entity` enum (one per content table), `entity_id`, `source_id` |
| `jobs` | scraper and import runs. *Replaced: a migration drops it and adds `captures`, the loaded capture ledgers; see the capture-ledger design.* | `kind`, `params` (JSON), `status` enum (queued, running, done, failed, cancelled), `log` (JSON lines), `error`, `created_at`, `started_at`, `finished_at` |

Rules:
- Every content row has ≥1 citation. Services enforce this on write, and the importer enforces it on import.
- Damage ÷ power (배) is computed, never stored. Rankings sort by damage.
- Cookie and pet names are stored in Korean as written. The glossary resolves them to English at read time, and an unresolved name is returned as-is with `en: null`.

### API (`/api`)

- `GET` list and detail for every content type. `GET /decks/:id` returns cookies, pets, notes and citations. `GET /rankings?season=&board=`.
- `POST` / `PATCH` / `DELETE` for content types. The body is the drizzle-zod insert schema plus `sources: string[]` (min 1). This is how research agents add findings.
- `POST /jobs {kind, params}`, where params is validated by that kind's schema. Also `GET /jobs`, `GET /jobs/:id` (with its log), and `POST /jobs/:id/cancel`. *(Replaced: no `/jobs` routes; the read-only `GET /api/captures` serves the capture ledgers. See the capture-ledger design.)*
- `GET /export` returns the full dataset as JSON, which is also committed as `data/snapshot.json` for diffable history.

### Jobs

> **Replaced** by the [capture-ledger design](2026-09-28-capture-ledger-design.md): scrapers are `pnpm capture` scripts in `packages/capture`, and the record importer is the `pnpm import:record` CLI. The section is kept as the original design.

- An in-process runner with concurrency 1, since the scrapers share one browser and the forums rate-limit. Jobs are persisted in `jobs`, so a restart marks orphaned `running` jobs as `failed`.
- A job kind is a module `{ kind, params: ZodSchema, run(ctx) }`, where `ctx` = `{ log, repos, signal, recordDir }`.
- Initial kinds:
  - `scrape:dc`: search and fetch posts, images and comments from the `projectcc` gallery.
  - `scrape:naver`: board list and article fetch from the cafe `31688486` API.
  - `scrape:crumbgg`: rankings per season and board from crumb.gg's public JSON API (`/pub/rankings?kind=`, `/pub/live?board=`, `/pub/live-history`, `/pub/leaderboard`; player lookup at `api.crumb.gg/api/lookup/*`; examples in `research/001-guild-conquest-meta/evidence/15-crumbgg/api/`). Past seasons are public to the top 50 only. The agent-browser CLI (native Chrome via `AGENT_BROWSER_EXECUTABLE_PATH`, never `wait <ms>`, closes its own session) is the fallback for pages the API doesn't cover.
  - `import:record`: load a research record's extraction JSON and the dashboard seed.
- Scrapers write raw captures into `research/<record>/evidence/` in the existing layout. Importers read, validate with Zod, and upsert.

### Errors

- A validation failure returns 400 with every Zod issue and its path.
- An unknown id returns 404.
- A citation to an unknown source returns 422 naming the ids.
- A job failure stores the error and log and sets status `failed`. The server stays up. *(Replaced with the jobs.)*
- The importer is all-or-nothing per record: one transaction, and the error names the file and row.

## Web (`apps/web`)

- Vite + React + TypeScript (strict), TanStack Query for server state, and TanStack Router for typed routes. Routes mirror today's tabs (`/`, `/decks`, `/runes`, `/gear`, `/scores`, `/mechanics`, `/timeline`, `/sources`, `/glossary`) plus `/jobs`. *(Replaced: no `/jobs` view; Research has a Captures page per record. See the capture-ledger design.)*
- Components ported from the current dashboard as typed React components: source chips, pill, lineup grid with the "Levels and why" table, ATK-order chain, filterable table, gear board, and the log-log score scatter with 배 reference lines.
- The current `tokens.css`, `base.css` and `components.css` carry over: light and dark themes, and the validated chart palette.
- The API is called only through the Hono RPC client (`hc<AppType>`), so request and response types come from the server.

## Testing

Vitest across the workspace, written test-first.

- **schema:** insert → select → Zod parse round trips; enum coverage.
- **services:** the 배 calculation, the citation requirement, name resolution.
- **routes:** `app.request()` against an in-memory SQLite database; 400/404/422 paths.
- **scrapers:** parsers tested against HTML/JSON fixtures copied from existing captures. No network in tests.
- **importers:** record 001 imports end to end, and the row counts match the source files.
- **web:** component tests for the lineup, table filter and scatter scale. One agent-browser pass over the running app before calling a milestone done.

## Out of scope

Hosting, auth, multi-user, scheduled/cron scrapes, and editing forms in the UI (the API supports writes; forms come later).
