# 03-sites: capture sources

Structured stage data from community sites, plus the press coverage of the 2026-09-23 update. Every file is the response body exactly as fetched by `sites_capture.py` (plain GET, desktop Chrome User-Agent, no cookies); fetch times are in `../captures.jsonl`. The derived tables built from these files are in `../06-derived/` (`derive_stage_data.py`).

| File | What it holds |
|---|---|
| `crumblehub_stages_ko.html`, `crumblehub_stages_en.html` | crumblehub.co's stage page (KO, EN). Server-rendered; its embedded React payload carries, from game data 1.4.002: every main stage's recommended power (`initialPowerChapters`), each stage's accuracy and focus requirement (`initialStageStatChapters`), the daily dungeon and Implant Tower powers (`initialPvePowerIndex`, from `DungeonBattleSettings.bytes`), and the Dimensional Rift levels, groups and season dates (`initialDimensionPowerIndex`, from `DimensionStageBattleSettings.bytes`). The page text states the bracket rule, that it doesn't affect bosses' damage, and that PvP's correction is fixed at 100%. |
| `crumblehub_assets_StageBossIndex-C8_ZZo3q.js` | The stage tool's code: the bracket table (`var A=[{ratio:0,damage:1,…}]`), the "how far can I reach" presets (easy 75%/80%, normal 55%/60%, hard 35%/40%), and the page copy in five languages. |
| `crumblehub_assets_formulas-B0zZ21YN.js` | crumblehub's damage formula: `combatPowerPenalty` is a final multiplier on skill damage, after defence, element, boss damage and crit. |
| `crumblehub_data_stage-boss-index-v2.json` | Every main stage's boss (KO, EN, JA, ZH-Hant, TH), the boss count and the recommended power; `generatedAt` 2026-09-23T08:30:36Z. Its powers equal the stage page's for every stage (see `../06-derived/stage-table.json`). |
| `crumblehub_guides_stage_ko.html` | crumblehub's beginner stage guide (last edited 2026-08-20): park at the highest cleared stage; about 55% of recommended power is the realistic manual target, about 35% the point to stop and farm. |
| `crumblehub_api_clear-decks_stage_pNN.json` | All pages of crumblehub's user-shared stage clear decks (`mode=stage`, sorted by recommendations), following each page's `nextCursor`. Cookie and pet ids index crumblehub's CookieCodex and PetCodex arrays (the copies in record 001's `evidence/12-glossary-src/` are the same builds). |
| `sugarpocket_stages.html` | Sugar Pocket's stage page (data as of 2026-09-28 03:20 UTC): the same bracket table worked out for 1-1, 8-30 and 328-30, and offline rewards per stage. |
| `sugarpocket_api_decks.json` | Sugar Pocket's community deck list (all modes); its stage decks are few and low-stage. |
| `alkapa_stage-check_ko.html` | alkapa.gg's stage calculator shell (client 1.4.002): normal stages and the Rift, power, accuracy and focus checks. The data loads client-side and isn't in this file. |
| `press_pocketgamer_2026-09.html` | Pocket Gamer, 2026-09-23: the Dimensional Rift is a boss-only challenge for players who cleared every main stage, with stat levelling and season rewards; daily dungeons to 770. |
| `press_zdnet_20260923112635.html` | ZDNet Korea, 2026-09-23: the update opens 차원의 이면 as end content for players who cleared the final stage. It doesn't mention the stage difficulty easing; the patch note (nv:44477) does. |
| `press_inven_321382.html` | Inven, 2026-09-23: the same announcement (second attempt; the first timed out). |
| `cookieruncrumbles_gear-sugar-rune-guide.html` | An English SEO guide site's gear and rune guide; kept as the example of what global guides say (generic, no stage brackets). |

## Tried and not kept

- crumb.gg: `/pub/live?board=` with `stage`, `stages`, `dimension`, `dimension_rift`, `rift`, `daily_dungeon`, `implant_tower`, `tower` all return 404 `{"error":"not found"}` (2026-09-28). Its client code knows only the Rumble Arena and Guild Conquest boards and the combat-power leaderboard, so no public stage or Rift ranking exists there.
- crumblehub `/api/clear-decks` with `mode=` `stages`, `story`, `dimension`, `dimension_rift`, `rift`, `dimensional_rift`, `daily`, `dailyDungeon`, `tower`: `{"error":"Invalid mode"}`. `daily_dungeon` and `implant_tower` exist but are out of scope. No Rift mode.
