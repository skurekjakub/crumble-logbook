# STATE: 001 Guild Conquest meta + crumble-logbook app

> **Superseded** by this record's [`README.md`](README.md), the final write-up (2026-09-28). Kept as history; the vault paths below are pre-migration.

Written 2026-09-27 (~13:30 CEST) before a context compaction. This is the working state for picking the job back up; it is not the final handoff. The user wants a proper "current state + timestamp" handoff at the **end** of the session, not now.

## Where things are

| What | Path |
|---|---|
| Research record (vault) | `G:\My Drive\Obsidian\Jakub\Games\crumble\research\001-guild-conquest-meta\` |
| README (still only the question; verdict, reasoning, sources and file index are unwritten) | `README.md` |
| Web search rounds | `research-trail.md` |
| Evidence | `evidence/`: `01-access-probe.tsv`, `02-dc-index.tsv`, `03-dc-posts/` (116 DC posts + img), `04-arca-search-tobeol.txt`, `05/06-nv-*-index.tsv`, `07-nv-posts/` (Naver guides + img), `08-extract/*.json` (subagent extractions + `BRIEF.md`), `10-dc-index-extra.tsv`, `11-dc-posts-extra/`, `12-glossary.json` (+ `12-glossary-src/`), `13-sites/`, `14-global/` (pending), `15-crumbgg/`, `16-top-players/` (pending) |
| Scripts | `evidence/dc_scrape.py` (DC mobile list/fetch; a subagent may have added a name-search mode), `nv_scrape.py` (Naver cafe 31688486 public API), `digest.py` (condense extractions per facet: `python digest.py scores 1`, `sugar_runes`, `gear`, `rng`, `mechanics`, `disagreements`, `teams 3`, `timeline`), `build_sources.py` (→ dashboard `data/sources.json`, merging `15-crumbgg/sources-extra.json`) |
| Old dashboard (vanilla ES modules, layered) | `G:\My Drive\Obsidian\Jakub\Games\crumble\dashboard\`. `data/*.json` is complete and validates clean. Serve it with `python -m http.server 8765` (a background server may still be running). |
| New app repo | `C:\Users\skure\repositories\crumble-logbook\`. Git initialised; spec committed `fbfd568`: `docs/superpowers/specs/2026-09-27-crumble-logbook-design.md` |
| Vault notes (stay in the vault) | `Games/crumble/conquest.md`, `Games/crumble/Build for guild conquest.md` (Google Slides pull), `_media/conquest-build-01..09.png` |

## Subagents still running when this was written

Check `evidence/08-extract/` for the file before assuming a result. Agent ids are for SendMessage.

- crumb.gg rankings, all seasons, joined to the Power tab (score ÷ power). Output: `evidence/15-crumbgg/` (`10-players-s*.txt`, `11-players.tsv`, `12-guilds.tsv`, `api/`) and `08-extract/crumbgg.json`. id `a62f3990ab2359be2`.
- Top-player hunt: posts by or about the S5 top 20 (날씨의아이, 현이, 검은반장, 타미 …) and their guilds (카페, Carpediem, 바삭젤리단, 각성, 품격). Output: `evidence/16-top-players/`, `08-extract/top-players.json` (with `deltas`). id `ae885ecc68e7b9987`.
- Global/EN sources and patch notes. Output: `evidence/14-global/`, `08-extract/global.json` (with `patches`). id `a3d69fa8dc0946a36`.

Finished: `dc-1..4.json`, `naver.json`, `dc-extra.json`, `sites.json`, `12-glossary.json`.

## Findings so far (load-bearing, with sources)

- **The meta deck is the Cherry deck (체리덱), and the user's own lineup matches it.**
  - ATK order (by 공격력, not power): Milk › Brightseeker › Skating Queen › Macaron › Tea Knight › Cheesecake.
  - Lv.1 fillers: Pinot, Tiger Lily (정전), Dark Choco, Cherry.
  - Scorpion sits at Lv.10–45 as the stray-beam catcher, ≥10% below the 6th cookie after Octo Wasabi's +8% ATK.
  - Pomegranate's level is irrelevant (Lv.1 only inflates 배).
  - Sources: nv:43653, dc:71135, dc:76135, dc:75400.
- **The Melon Soda deck (메소정전)** aligns the team with move speed on sugar runes, tuned to 0.01. Sources: dc:69368, dc:71105.
- **Runes:**
  - Milk: all ATK%.
  - Pomegranate, Skating Queen, Macaron, Cheesecake, Tea Knight: all skill amp.
  - Brightseeker: haste, 40–50 total in battle (nv:44761 breakpoint ≈40; haste is negative if the team dies at 30 s).
  - Dark Choco: haste (skill amp doesn't boost debuffs since 8/27).
- **Raid gear:**
  - Weapons: skill amp + crit dmg.
  - Top-right: haste + skill amp.
  - Armour: damage reduction + HP.
  - Bottom-right: haste + damage reduction.
  - No move speed, accuracy, focus or crit resistance.
  - Sources: dc:75854, dc:76218, nv:43653.
- **Scores:**
  - Documented forum best: 1T 312G at 1.8G (dc:76135), 1T 116G at 1.74G (dc:75400).
  - A 2.8T claim at 3.6G (780×, text only, dc:76317). A cropped 1T 999G (dc:76583).
  - crumb.gg S5 live: #1 날씨의아이 (카페) 3T 226G; #2 2T 892G; many above 2T. #1's history is 208G → 477G → 1.1T → 1.8T → 3.2T across S1–S5.
  - "2T+" also appears as guild totals (e.g. Carpediem 2T 528G on 9/3; Lancers 14T 660G).
- **More power alone doesn't close the gap:** 2.38G → 1.07T (dc:75176); ~2.7G stayed under 1T. The unexplained part is what the S5 leaders do differently; teams aren't public on crumb.gg.
  - Leads: survival past the 17 s wipe (nv:46283, dc:76583 at 21G account power), 10★ Brightseeker/Milk.
- **RNG:** at ~1.7G, 500× in 1 of 5 runs and 1T in 1–2 of 10; records come from hours of retries and overnight macros.
- **Name corrections** (from `12-glossary.json`): 정전 = Tiger Lily Cookie, 실론 = Tea Knight, 피겨 = Skating Queen, 체리 = Cherry Cookie (R, not Cherry Cola), 와사비문어 = Octo Wasabi, 색동주머니 = Candy Shade Pouch, 판다 = Panda Dumpling, 우유 = Milk Cookie's Crunchy Strong Pediatrician.

## Decisions made with the user

- **Rank by damage, never by 배.** 배 (damage ÷ power) is only a normaliser for comparing setups.
- **Deck data carries a level (or level rule) and a mechanism "why" for every cookie.**
- **Web access:** use agent-browser, headed, with `AGENT_BROWSER_EXECUTABLE_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"`. The bundled x64 Chrome doesn't launch on this ARM64 machine. Don't use `agent-browser wait <ms>` (it resets the page) and don't wrap it in `timeout`. No Playwright. Don't grind curl on client-rendered sites. (Also saved in memory.)
- **App rewrite: spec approved, "lets go".**
  - Stack: pnpm workspace; `packages/schema` (Drizzle + drizzle-zod), `apps/server` (Hono + zValidator + Drizzle/SQLite + jobs + TS-ported scrapers), `apps/web` (Vite + React + TS + TanStack Query/Router, Hono RPC client).
  - SQLite driver: `node:sqlite` first, proven by a spike; fallbacks better-sqlite3, then libsql.
  - Local only; public GitHub repo under `skurekjakub`.
  - Migrate **everything**, raw evidence included, plus the vault `.claude/` folder (skills, hooks, settings); secret-review before the first push.
  - Copy memory files to the new repo's Claude project memory folder.
- **Tooling installed:** pnpm 12.6.0 (global), agent-browser 0.38.1 (global, skill in vault `.claude/skills/agent-browser`). Node 24.18 ARM64 with `node:sqlite`.

## Next steps, in order

1. Wait for the running subagents above; read their final reports and output files. Fold the new scores, deltas and patches into the dashboard `data/*.json` and rerun the validator. (Validator one-liner: from the dashboard folder, run `node --input-type=module -e "…import { validate } from './src/data/schema.js'…"`, which loads `manifest.json` collections.)
2. **Main session does the migration:**
   - Copy `Games/crumble/research/**` → `crumble-logbook/research/`.
   - Copy `Games/crumble/dashboard/` (data as import seed, styles to carry over) → a staging location in the repo.
   - Copy the vault `.claude/` → repo `.claude/`, then secret-review every file and report findings to the user.
   - Copy the memory files from `C:\Users\skure\.claude\projects\G--My-Drive-Obsidian-Jakub\memory\` to the new repo's project memory dir.
   - Create the public GitHub repo `skurekjakub/crumble-logbook` with `gh` and push. This is outward-facing; the user explicitly asked for public, but re-confirm if the secrets review finds anything.
3. Run the `superpowers:writing-plans` skill on the spec, then `superpowers:subagent-driven-development` to implement.
4. At the end of the session: write the final research README (verdict, reasoning, steelman, sources, file index per the deep-research contract) and a timestamped handoff for a future agent.
