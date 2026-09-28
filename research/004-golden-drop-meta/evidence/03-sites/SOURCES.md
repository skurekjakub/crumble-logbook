# Site captures (2026-09-28)

| File | What it holds |
|---|---|
| `eoggg_cookierun-crumble.html` | EOG's CookieRun: Crumble hub (eog.gg, a global guild's site), fetched with curl. Its "Crumble Dungeon: the Cookies to take out" section (updated 2026-08-14) describes the top-40-by-power deployment, the level-lowering tech, and a controlled test on 2026-08-13 (403,708,109 with a 10-star Oven Wanderer and Cool Mint deployed, 574,531,356 with both benched). Its "Crumble Dungeon simulator" section describes the fight as modelled by EOG: no controls, a shockwave that throws the team back four times, the boss raising its own damage reduction three times, adds whose damage scores nothing. Byte-identical to record 001's copy of 2026-09-27. |
| `crumbleguides_cookie-run-crumble-dungeon.html` | Crumble Guides' mode page (updated 2026-07-25, before launch): "your entire squad against the giant Holy Golden Drop", score attack; states that scoring, rewards and mechanics are not yet documented there. |
| `cookieruncrumble_app_api_catalog_database.json` | The Sugar Pocket catalog endpoint answered 403 `{"error":"Catalog access denied."}` to curl on 2026-09-28. Record 001's copy of 2026-09-23 (client 1.4.002) is cited instead: `research/001-guild-conquest-meta/evidence/12-glossary-src/cookieruncrumble_app_api_catalog_database.json`. |
| `crumbgg/data-patches.json` | crumb.gg's patch digest (`/data/patches.json`), via `pnpm capture crumbgg data`: the Crumble Dungeon lines of 2026-08-13 (daily rank rewards at 12:00 KST) and 2026-09-10 (manual control removed). |
| `crumbgg/api-meta.json` | crumb.gg's API meta (client 1.4.002): every cookie's role, element, rarity and attack range. |

## Probes that found nothing (not captured as files)

- crumb.gg live boards, 2026-09-28: `pnpm capture crumbgg live 004-golden-drop-meta evidence/03-sites/crumbgg <board>` with `crumble_dungeon`, `dungeon` and `golden_drop` all failed without writing a file (no 200). crumb.gg publishes no Crumble Dungeon ranking; record 003 found its client code knows only the Rumble Arena and Guild Conquest boards and the power leaderboard.
- crumblehub clear-deck API, 2026-09-28: `https://crumblehub.co/api/clear-decks?mode=` with `crumble_dungeon`, `crumbleDungeon`, `crumble`, `golden_drop` and `dungeon` each answered 400 `{"error":"Invalid mode"}`. No shared Crumble Dungeon decks there.
- Naver cafe free board: needs a login. Its Crumble Dungeon posts listed in record 001 (`research/001-guild-conquest-meta/evidence/16-top-players/06-nv-free-board.tsv`) came back as login refusals (errorCode 0004), which `pnpm capture naver fetch` saved as short `evidence/04-naver/nv/nv-<id>.md` stubs; they hold no post text.
