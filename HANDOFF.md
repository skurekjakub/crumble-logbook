# Handoff: crumble-logbook

Written 2026-09-27 12:10 CEST, at the end of the session that did the research and the vault → repo migration. The next session starts in this repo. Read this file top to bottom before doing anything.

## 1. What this project is

The user plays Cookie Run: Crumble on a whale account (every cookie built) and wants the Korean tryhard tech behind **2–3T single-team scores in Guild Conquest (길드 토벌전)**. The boss is 지나치게 무거워진 피냐타 (Extra Stuffed Piñata; Dark, weak to Light).

There are two tracks:

1. **Research.** Record `research/001-guild-conquest-meta/`: forum and ranking captures, subagent extractions, findings. Its data was already shown in a vanilla-JS dashboard, now in `legacy/dashboard/`.
2. **App rewrite.** A pnpm workspace: `packages/schema` (Drizzle + drizzle-zod), `apps/server` (Hono + SQLite + scraper jobs + importers), `apps/web` (Vite + React + TS strict + TanStack Query/Router, Hono RPC client). The approved design is `docs/superpowers/specs/2026-09-27-crumble-logbook-design.md`. **Plan 1 (data core) is done:** `packages/schema` and `apps/server` exist, and record 001 loads into SQLite and is served at `/api`. `apps/web`, the scraper jobs and the ported Python scrapers don't exist yet.

## 2. Rules the user set (don't relitigate)

- **Rank by damage, never by 배.** 배 = damage ÷ team power, and it's only a normaliser for comparing setups. Pomegranate at Lv.1 only inflates 배.
- **Every deck cookie carries a level (or level rule) and a mechanism "why".**
- **Architecture matters.** Layered code with separation of concerns, no single huge files. It must stay extensible.
- **Local only.** No hosting, no auth.
- **All TypeScript.** The Python scrapers in `research/001-guild-conquest-meta/evidence/` get ported (`dc_scrape.py`, `nv_scrape.py`; `digest.py` and `build_sources.py` are helpers).
- **Schemas are well defined with Drizzle + Zod** (drizzle-zod).
- **Web access:** agent-browser, headed, with `AGENT_BROWSER_EXECUTABLE_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"` and `AGENT_BROWSER_SESSION=<name>`.
  - The bundled x64 Chrome never launches on this ARM64 machine.
  - Never use `agent-browser wait <ms>`; it resets the page to about:blank.
  - Never wrap it in `timeout`.
  - **No Playwright.**
  - Don't grind curl on client-rendered sites. curl is fine for JSON APIs and server-rendered pages.
- **Development is subagent-driven.** The main session orchestrates; subagents implement plan tasks.
- **The repo is public** under `github.com/skurekjakub`, and the user chose to publish everything, raw captures included.
- The user wants a proper **final research write-up at the end of the working session** (see §6.4), not midway.

## 3. State right now

### Done
- **Research sweep complete.** Every subagent finished; their extractions are in `research/001-guild-conquest-meta/evidence/08-extract/`. The ones added last are `crumbgg.json`, `global.json` and `top-players.json`.
- **Their findings are folded into `legacy/dashboard/data/*.json`** (scores, mechanics, timeline, takeaways, runes, meta, and `sources.json` regenerated). The dataset validates clean with the legacy validator (§7).
- **Migration from the Obsidian vault is done.**
  - `research/`, `legacy/dashboard/` and `.claude/` were copied. `settings.local.json` and a stray screenshot were left out.
  - The `deep-research` skill's "Repo specifics" section was rewritten for this repo.
  - The memory files are in `~/.claude/projects/C--Users-skure-repositories-crumble-logbook/memory/`.
  - The vault copy is no longer the source of truth.
- **Secret review of everything committed:** no credentials. Scan hits in `14-global/yt*/` are base64 blobs in anonymously fetched YouTube HTML.
- **The initial migration commit is pushed** to `github.com/skurekjakub/crumble-logbook` (check with `git log` / `gh repo view`).
- **Plan 1, data core** (`docs/superpowers/plans/2026-09-27-data-core.md`), on branch `feat/data-core`:
  - `packages/schema`: Drizzle tables, migrations, Zod schemas.
  - `apps/server`: the Hono API over `node:sqlite` (resources listed in the root `README.md`), `pnpm import:record`, `pnpm db:export` / `db:restore`, `pnpm dev:server`.
  - Record 001's curated dataset is copied into `research/001-guild-conquest-meta/curated/` (blob-identical to `legacy/dashboard/data/`), and `import.json` next to it drives the import.
  - `data/snapshot.json` is the committed dump of a fresh import of record 001. `data/crumble.db` is local and gitignored; rebuild it with `pnpm import:record 001-guild-conquest-meta` or `pnpm db:restore`.
  - The import warns that the glossary keys 전투력 and 투력 are each claimed by two entries (Power, Power (team power)); both resolve to 투력's gloss. Fix the curated glossary if that matters.
- **Plan 3, web app** is written: `docs/superpowers/plans/2026-09-27-web-app.md`.

### Not done (in order)
1. The Opus review of plan 1's final batch (importer, snapshot, `main.ts`), then merging `feat/data-core`.
2. Plan 3, the web app, from its Batch B. It ends by deleting `legacy/`.
3. Plan 2, jobs and scrapers: not written yet. Scope is in §6.1 item 6.
4. The research record's final `README.md`.
5. Re-pulling crumb.gg after Season 5 closes.

## 4. Research findings (the load-bearing ones)

Source ids: `dc:NNNNN` = `m.dcinside.com/board/projectcc/NNNNN`; `nv:NNNNN` = Naver cafe 31688486 article; `web:*` = see `legacy/dashboard/data/sources.json`.

- **The meta deck is the Cherry deck (체리덱).** The user's own lineup already matches it.
  - ATK order (by 공격력): Milk › Brightseeker › Skating Queen › Macaron › Tea Knight › Cheesecake.
  - Lv.1 fillers: Pinot, Tiger Lily (정전), Dark Choco, Cherry. Cherry is there for placement only; manual control has been gone since 9/10.
  - Scorpion sits at Lv.10–45 as the stray-beam catcher.
  - Pets: Octo Wasabi, Hot Doggie, Candy Shade Pouch.
  - Sources: nv:43653, dc:71135, dc:76135, dc:75400.
- **Runes:**
  - Milk: all ATK%.
  - Pomegranate, Skating Queen, Macaron, Cheesecake, Tea Knight: all skill amp.
  - Brightseeker: haste to 40–50 total in battle. The 10★ variant runs 4 haste + 2 skill amp; the 1.62T run did exactly that (dc:75462).
  - Dark Choco: haste.
  - Details: `legacy/dashboard/data/runes.json`.
- **Raid gear:**
  - Weapons: skill amp + crit dmg. Crit rate instead if, after Macaron's buff, crit rate shows ≥30 in the last two digits (dc:76333, low confidence).
  - Top-right: haste + skill amp.
  - Armour: damage reduction + HP.
  - Bottom-right: haste + damage reduction.
- **Mechanics worth knowing:**
  - Tea Knight gives all allies +70% boss damage every 10 s, Guild Conquest only (web:crumbgg:patches).
  - Pomegranate's beams give +69% skill amp and target by ATK order.
  - The welfare perks go to the highest-ATK ally.
  - Skill amp scales Milk's buff (since 8/13).
  - The Octo Wasabi ATK bonus is hidden from the stat screen: 10% on the pet card, measured 8%.
  - Full list: `legacy/dashboard/data/mechanics.json`.
- **Scores:**
  - **Best documented run: 1T 999G**, plain Cherry deck, ~3.07G team power, ~650× (dc:76235, the same run as dc:76583, verified from the result screen).
  - 1.62T at ~600× (dc:75462, verified).
  - 1.3T at 3G, and a 1.5T at 2.6G commenter claim (dc:76333).
  - Videos top out at 827.6G (the #1 guild's Short, web:yt-IkY9i5s7SOA). English sources top out at 72G.
- **crumb.gg Season 5** (live until 2026-09-28 12:00 KST): #1 날씨의아이 (guild 카페) 3T 226G; #2 2T 892G; #50 1T 916G; #100 1T 562G.
  - Season #1s: 248G → 882G → 1T 111G → 1T 786G → 3T 226G.
  - crumb.gg "power" is **account-wide** (17–26G for the top 20), not team power. Score ÷ account power in the top 50 is 75–143× (median ~100). The top account by power (30G) placed #24.
  - crumb.gg shows **no raid teams**, only Rumble Arena defense teams.
- **How the leaders likely reach 2–3T:**
  - The arithmetic: ~3G+ team power × 650–780× ≈ 2–2.3T+. A poster at 21G account power reports 780× and expects 3T (dc:76583).
  - Plus **surviving the 17 s wipe.** That takes ~9M HP and 45% damage reduction per survivor (dc:74801, dc:69856). At 21G, Macaron, Brightseeker, Pomegranate and Skating Queen survive and keep dealing damage to 8 s left.
  - The Season 5 jump coincides with the first survival reports (9/24). That is **a timing match, not a shown build.** Every public run up to 1.6T dies at the wipe.
- **RNG:** at ~1.7G, 500× lands in ~1 of 5 runs and 1T in 1–2 of 10. Records come from hours of retries or overnight macros.
- **Couldn't be read:** Reddit (blocked), mrguider (Cloudflare), TikTok (JS shell), X (login), Naver free-board articles and Naver search (login). There's a claimed "~1T video" from guild 카페 that was never found.

## 5. Where things are

| Path | What |
|---|---|
| `research/001-guild-conquest-meta/README.md` | Only the question so far; the final write-up is still owed (§6.4) |
| `research/001-guild-conquest-meta/research-trail.md` | Web search rounds with syntheses |
| `research/001-guild-conquest-meta/STATE.md` | Superseded by this file; kept as history |
| `…/evidence/` | Numbered captures. `03-dc-posts/`, `11-dc-posts-extra/` and `16-top-players/dc/` hold DC posts + comments + images. `07-nv-posts/` holds Naver articles. `12-glossary.json` has KR↔EN names. `13-sites/` holds other sites. `14-global/` has patch notes, YouTube and EN sites. `15-crumbgg/` has rankings TSVs and raw `api/` JSON. |
| `…/evidence/08-extract/` | Subagent extractions (schema in `BRIEF.md`). `import:record` takes each source's English summary from here. |
| `research/001-guild-conquest-meta/curated/`, `import.json` | The curated dataset `import:record` loads, and the manifest saying where the record's extractions, captures and ranking TSVs are |
| `apps/server/`, `packages/schema/` | The data API and its schemas; the root `README.md` lists the commands and resources |
| `data/snapshot.json` | Committed dump of the database; `data/crumble.db` is local |
| `…/evidence/*.py` | `dc_scrape.py` (list/fetch; queries take a `name:`/`subject:`/`memo:`/`comment:` prefix), `nv_scrape.py` (public cafe API), `digest.py` (per-facet digest), `build_sources.py` (→ `sources.json`) |
| `legacy/dashboard/` | Old SPA: `src/` is split into data, domain, ui and views layers; `styles/` has the tokens and a validated palette; `data/` is the import seed. Serve it with `python -m http.server 8765` from that folder. |
| `docs/superpowers/specs/` | The approved design spec |
| `.claude/` | Hooks, settings and skills copied from the vault. Most skills are for the user's blog; `agent-browser`, `deep-research` and `iterative-research` are the relevant ones. |

## 6. What to do next

### 6.1 The plans
Plans live in `docs/superpowers/plans/`. Plan 1 (data core) is done and plan 3 (web app) is written. Plan 2 (jobs + scrapers) still has to be written with `superpowers:writing-plans`, and the user reviews it and picks the execution method before any of its code is written.

The original task list, which the plans split up (items 1–5 are done):
1. **Spike:** `node:sqlite` via Drizzle on Node 24.18 ARM64. Fallbacks, in order: `better-sqlite3` (only if an ARM64 prebuild installs), then `@libsql/client`. Record the winner in the README.
2. Workspace scaffold: pnpm 12.6.0 is installed globally, TS strict, Vitest.
3. `packages/schema`: tables per the spec's data model, drizzle-zod schemas, round-trip tests.
4. `apps/server`: db → repos → services → routes, the layers from the spec. Citations are required (422 on unknown ids). The 배 ratio is computed, never stored.
5. Importers: record 001 and the legacy seed, end to end, with row counts matching the source files.
6. Jobs + scrapers:
   - DC mobile (curl-style fetch + cheerio; comments via the `/ajax/response-comment` POST with the csrf token).
   - Naver (`apis.naver.com/cafe-web/cafe2/ArticleListV2dot1.json`, `cafe-articleapi/v2.1/cafes/31688486/articles/{id}`).
   - crumb.gg via its **public JSON API** (`crumb.gg/pub/rankings?kind=`, `/pub/live?board=guild_conquest_players|guild_conquest_guilds`, `/pub/live-history`, `/pub/leaderboard`, `api.crumb.gg/api/lookup/suggest?q=` → `/api/lookup/player?ref=`). Past seasons are public for the top 50 only.
   - Parsers are tested on fixtures copied from `evidence/`.
7. `apps/web`: port every legacy view and component (source chips, lineup with the "Levels and why" table, ATK-order chain, filterable table, gear board, log–log scatter with 배 reference lines) plus `/jobs`. Reuse `legacy/dashboard/styles/*.css`.
8. An agent-browser pass over the running app. Then delete `legacy/`.

### 6.2 Execute
`superpowers:subagent-driven-development`: one subagent per task, test-first, with review between tasks. Name `model` on every dispatch.

### 6.3 Refresh the data once Season 5 closes (after 2026-09-28 12:00 KST)
Re-pull the Season 5 final boards from the crumb.gg API and add them as new evidence files (captures are never edited; a new capture is a new numbered file). If the app's `scrape:crumbgg` job exists by then, use it.

### 6.4 At the end of the working session: finish the research record
Write `research/001-guild-conquest-meta/README.md` to the deep-research contract (`.claude/skills/deep-research/SKILL.md`), in this order:
1. Header
2. Question (as asked + falsifiable)
3. Verdict
4. Reasoning, with evidence pointers
5. Steelman ("more power is all you need")
6. Recommendation for the user's account
7. What would change
8. Side findings
9. Sources
10. File index

Then add a dated "current state" section for the next agent. §4 above is the draft of the reasoning.

Open research questions worth a future record:
- The exact survival build at 9M HP / 45% DR: which pets, which cookies at full level.
- Whether the top players run Herb or other survival fillers.
- A retry for the 카페 guild's ~1T video.

## 7. Practical notes

- **Legacy validator.** From `legacy/dashboard`:
  `node --input-type=module -e "import {readFileSync} from 'node:fs'; import {validate} from './src/data/schema.js'; const m=JSON.parse(readFileSync('data/manifest.json','utf8')); const d={}; for (const [k,f] of Object.entries(m.collections)) d[k]=JSON.parse(readFileSync('data/'+f,'utf8')); const p=validate(d); console.log(p.length?p.join('\n'):'dataset clean')"`
- **Commits:** the `require-commit-format` hook blocks `git commit` with a single `-m`. Write the message to a file and use `git commit -F <file>`: a subject, then a body with the problem, the justification, and what was discarded.
- **Other hooks** (`.claude/hooks/`): `prefer-verify-script` blocks chained quality gates (it expects an `npm run verify`-style script, which is worth adding as `pnpm verify`). `remind-rules` injects rules from the blog repo. Adapt them if they get in the way, and tell the user.
- **Python:** set `PYTHONIOENCODING=utf-8` when running the evidence scripts. bs4 is installed.
- **Evidence files are never edited after capture.** A later measurement is a new numbered file.
- **Glossary gotchas:**
  - 정전 = Tiger Lily Cookie
  - 실론 = Tea Knight
  - 피겨 = Skating Queen
  - 체리 = Cherry Cookie (not Cherry Cola)
  - 와사비문어 = Octo Wasabi
  - 색동주머니 = Candy Shade Pouch
  - 우유 = Milk Cookie's Crunchy Strong Pediatrician
  - 브시커 = Brightseeker
  - The full table is `evidence/12-glossary.json`.
